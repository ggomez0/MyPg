import { Hono } from "hono";
import { adminAuth } from "../middleware/auth";
import { db, getDataDb } from "../db";
import { config } from "../config";
import { requestLogs } from "../db/schema";
import { eq, desc, and, gte } from "drizzle-orm";
import { z } from "zod";
import * as fs from "fs";
import * as readline from "readline";

const logsRouter = new Hono();

logsRouter.use("*", adminAuth);

logsRouter.get("/", async (c) => {
  const projectId = c.req.query("project_id");
  const statusCode = c.req.query("status_code");
  const method = c.req.query("method");
  const page = parseInt(c.req.query("page") || "1");
  const perPage = parseInt(c.req.query("perPage") || "20");

  const conditions = [];
  if (projectId) conditions.push(eq(requestLogs.projectId, projectId));
  if (statusCode) conditions.push(eq(requestLogs.statusCode, parseInt(statusCode)));
  if (method) conditions.push(eq(requestLogs.method, method));

  const offset = (page - 1) * perPage;
  const whereClause = conditions.length > 0 ? and(...conditions) : undefined;
  
  const records = await db.select().from(requestLogs).where(whereClause).limit(perPage).offset(offset).orderBy(desc(requestLogs.createdAt));
  const [{ count }] = await db.select({ count: db.$count(requestLogs) }).from(requestLogs).where(whereClause);
  const total = count as unknown as number;

  return c.json({ data: records, meta: { total, page, perPage, totalPages: Math.ceil(total / perPage) } });
});

logsRouter.get("/stats", async (c) => {
  const projectId = c.req.query("project_id");
  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
  
  const conditions = [gte(requestLogs.createdAt, sevenDaysAgo)];
  if (projectId) conditions.push(eq(requestLogs.projectId, projectId));
  const whereClause = and(...conditions);
  
  const records = await db.select({ statusCode: requestLogs.statusCode, durationMs: requestLogs.durationMs }).from(requestLogs).where(whereClause);
  
  const total = records.length;
  const errors = records.filter(r => r.statusCode >= 400).length;
  const avgLatency = total > 0 ? records.reduce((acc, curr) => acc + curr.durationMs, 0) / total : 0;
  
  return c.json({
    data: {
      totalRequests: total,
      errorRate: total > 0 ? errors / total : 0,
      avgLatency,
    }
  });
});

logsRouter.get("/postgres", async (c) => {
  const dbName = c.req.query("db");
  const actionFilter = c.req.query("action");
  const limit = parseInt(c.req.query("limit") || "200");

  const logFilePath = config.POSTGRES_LOG_FILE;
  if (fs.existsSync(logFilePath)) {
    try {
      const stats = fs.statSync(logFilePath);
      const readSize = Math.min(stats.size, 2 * 1024 * 1024);
      const buffer = Buffer.alloc(readSize);
      const fd = fs.openSync(logFilePath, "r");
      fs.readSync(fd, buffer, 0, readSize, Math.max(0, stats.size - readSize));
      fs.closeSync(fd);

      const content = buffer.toString("utf-8");
      const rawLines = content.split("\n");

      interface RawLogItem {
        timestamp: string;
        timeMs: number;
        pid: number;
        datname: string;
        usename: string;
        app: string;
        text: string;
        isError: boolean;
      }

      const rawEntries: RawLogItem[] = [];
      let curEntry: RawLogItem | null = null;

      for (const line of rawLines) {
        if (!line.trim()) continue;
        try {
          const jsonLog = JSON.parse(line);
          const msg = jsonLog.log || "";
          const timeMatch = msg.match(/^(\d{4}-\d{2}-\d{2}\s\d{2}:\d{2}:\d{2}(?:\.\d{3})?)\sUTC/);
          if (timeMatch) {
            if (curEntry) rawEntries.push(curEntry);
            const dbMatch = msg.match(/db=([^,\s]+)/);
            const userMatch = msg.match(/user=([^,\s]+)/);
            const appMatch = msg.match(/app=([^,\s]+)/);
            const pidMatch = msg.match(/\[(\d+)\]/);
            curEntry = {
              timestamp: timeMatch[1],
              timeMs: new Date(timeMatch[1].replace(" ", "T") + "Z").getTime(),
              pid: pidMatch ? parseInt(pidMatch[1]) : 0,
              datname: dbMatch ? dbMatch[1] : "postgres",
              usename: userMatch ? userMatch[1] : "postgres",
              app: appMatch ? appMatch[1] : "client",
              text: msg,
              isError: msg.includes("ERROR:") || msg.includes("FATAL:"),
            };
          } else if (curEntry) {
            curEntry.text += " " + msg.trim();
            if (msg.includes("ERROR:") || msg.includes("FATAL:")) curEntry.isError = true;
          }
        } catch {}
      }
      if (curEntry) rawEntries.push(curEntry);

      interface ConsolidatedQuery {
        pid: number;
        datname: string;
        usename: string;
        app: string;
        timestamp: string;
        timeMs: number;
        action: string;
        query: string;
        parameters?: string;
        duration_ms: number | null;
        isError: boolean;
        errorText?: string;
      }

      const consolidated: ConsolidatedQuery[] = [];
      const pidActiveQuery = new Map<number, ConsolidatedQuery>();

      for (const item of rawEntries) {
        if (item.datname === "mypg_internal" || item.datname === "mypg_data") continue;
        if (item.datname === "[unknown]") continue;

        const text = item.text;
        const durMatch = text.match(/duration:\s+([\d\.]+)\s+ms/);
        const duration = durMatch ? parseFloat(durMatch[1]) : null;

        const detailParamMatch = text.match(/DETAIL:\s+parameters:\s+(.*)/);
        if (detailParamMatch && item.pid) {
          const active = pidActiveQuery.get(item.pid);
          if (active) {
            active.parameters = detailParamMatch[1].trim();
            continue;
          }
        }

        if (text.includes("ERROR:") || text.includes("FATAL:")) {
          const errMatch = text.match(/(?:ERROR|FATAL):\s+(.*)/);
          const errText = errMatch ? errMatch[1].trim() : text;
          const active = pidActiveQuery.get(item.pid);
          if (active) {
            active.isError = true;
            active.errorText = errText;
          } else {
            consolidated.push({
              pid: item.pid,
              datname: item.datname,
              usename: item.usename,
              app: item.app,
              timestamp: item.timestamp,
              timeMs: item.timeMs,
              action: "ERROR",
              query: errText,
              duration_ms: null,
              isError: true,
              errorText: errText,
            });
          }
          continue;
        }

        const isStatement = text.includes("statement:") || text.includes("execute ") || text.includes("bind ");
        if (isStatement) {
          let sqlPayload = "";
          let statementLabel = "";

          const stmtIdx = text.indexOf("statement:");
          const execIdx = text.indexOf("execute ");
          const bindIdx = text.indexOf("bind ");

          if (stmtIdx !== -1) {
            sqlPayload = text.substring(stmtIdx + 10).trim();
          } else if (execIdx !== -1) {
            const after = text.substring(execIdx + 8).trim();
            const colon = after.indexOf(":");
            if (colon !== -1) {
              statementLabel = after.substring(0, colon).trim();
              sqlPayload = after.substring(colon + 1).trim();
            } else {
              sqlPayload = after;
            }
          } else if (bindIdx !== -1) {
            const after = text.substring(bindIdx + 5).trim();
            const colon = after.indexOf(":");
            if (colon !== -1) {
              statementLabel = after.substring(0, colon).trim();
              sqlPayload = after.substring(colon + 1).trim();
            } else {
              sqlPayload = after;
            }
          }

          if (sqlPayload) {
            const isInternal =
              sqlPayload.includes("information_schema") ||
              sqlPayload.includes("pg_catalog") ||
              sqlPayload.includes("pg_stat_") ||
              sqlPayload.includes("pg_type") ||
              sqlPayload.includes("mypg_");
            if (isInternal) continue;

            const active = pidActiveQuery.get(item.pid);
            if (active && (active.query === sqlPayload || !active.query || active.query === statementLabel)) {
              active.query = sqlPayload;
              if (duration !== null) active.duration_ms = duration;
              continue;
            }

            let action = "QUERY";
            const upper = sqlPayload.toUpperCase();
            if (upper.includes("SELECT")) action = "SELECT";
            else if (upper.includes("INSERT")) action = "INSERT";
            else if (upper.includes("UPDATE")) action = "UPDATE";
            else if (upper.includes("DELETE")) action = "DELETE";
            else if (upper.includes("CREATE")) action = "CREATE";
            else if (upper.includes("ALTER")) action = "ALTER";
            else if (upper.includes("DROP")) action = "DROP";

            const qObj: ConsolidatedQuery = {
              pid: item.pid,
              datname: item.datname,
              usename: item.usename,
              app: item.app,
              timestamp: item.timestamp,
              timeMs: item.timeMs,
              action,
              query: sqlPayload,
              duration_ms: duration,
              isError: false,
            };
            pidActiveQuery.set(item.pid, qObj);
            consolidated.push(qObj);
            continue;
          }
        }

        if (durMatch && duration !== null && !isStatement) {
          const active = pidActiveQuery.get(item.pid);
          if (active && active.duration_ms === null) {
            active.duration_ms = duration;
            continue;
          }
        }
      }

      consolidated.sort((a, b) => b.timeMs - a.timeMs);

      let filtered = consolidated;
      if (dbName && dbName !== "ALL" && dbName !== "undefined" && dbName !== "null") {
        filtered = filtered.filter((a) => a.datname === dbName);
      }
      if (actionFilter && actionFilter !== "ALL" && actionFilter !== "undefined" && actionFilter !== "null") {
        filtered = filtered.filter((a) => a.action === actionFilter.toUpperCase());
      }

      return c.json({ data: filtered.slice(0, limit) });
    } catch {}
  }

  const rawSql = getDataDb();
  try {
    const activities = await rawSql`
      SELECT 
        pid,
        datname,
        usename,
        client_addr::text as client_ip,
        backend_start,
        query_start,
        state_change,
        wait_event_type,
        wait_event,
        state,
        query,
        backend_type,
        ROUND(EXTRACT(EPOCH FROM (NOW() - query_start)) * 1000)::int as duration_ms
      FROM pg_stat_activity
      WHERE datname IS NOT NULL
        AND datname NOT IN ('postgres', 'mypg_internal', 'mypg_data')
        AND query NOT LIKE '%pg_stat_activity%'
        AND query NOT LIKE '%information_schema%'
        AND query NOT LIKE '%pg_catalog%'
        AND query NOT LIKE '%pg_stat_%'
        AND query NOT LIKE '%mypg_%'
      ORDER BY query_start DESC NULLS LAST
      LIMIT 100;
    `;

    let filtered = activities.map((a: any) => {
      let action = "QUERY";
      const q = (a.query || "").trim().toUpperCase();
      if (q.startsWith("SELECT")) action = "SELECT";
      else if (q.startsWith("INSERT")) action = "INSERT";
      else if (q.startsWith("UPDATE")) action = "UPDATE";
      else if (q.startsWith("DELETE")) action = "DELETE";
      else if (q.startsWith("CREATE")) action = "CREATE";
      else if (q.startsWith("ALTER")) action = "ALTER";
      else if (q.startsWith("DROP")) action = "DROP";

      return {
        ...a,
        action,
        timestamp: a.query_start || new Date().toISOString(),
      };
    });

    if (dbName && dbName !== "ALL" && dbName !== "undefined" && dbName !== "null") {
      filtered = filtered.filter((a: any) => a.datname === dbName);
    }
    if (actionFilter && actionFilter !== "ALL" && actionFilter !== "undefined" && actionFilter !== "null") {
      filtered = filtered.filter((a: any) => a.action === actionFilter.toUpperCase());
    }

    return c.json({ data: filtered });
  } catch (err: any) {
    return c.json({ error: err.message }, 500);
  }
});

export { logsRouter };
