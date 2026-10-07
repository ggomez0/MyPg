import { Hono } from "hono";
import { db, getDataDb } from "../db";
import { config } from "../config";
import { projects, apiKeys } from "../db/schema";
import { eq } from "drizzle-orm";
import { adminAuth } from "../middleware/auth";
import { z } from "zod";
import { generateApiKey, hashPassword } from "../utils/crypto";
import { sanitizeIdentifier } from "../utils/query-builder";
import * as fs from "fs";

const adminRouter = new Hono();
adminRouter.use("*", adminAuth);

adminRouter.get("/projects", async (c) => {
  const data = await db.select().from(projects);
  return c.json({ data });
});

adminRouter.get("/databases", async (c) => {
  try {
    const rawSql = getDataDb();
    const dbs = await rawSql`
      SELECT datname as name 
      FROM pg_database 
      WHERE datistemplate = false 
        AND datname NOT IN ('postgres', 'mypg_internal')
      ORDER BY datname;
    `;

    const dbsWithTables = await Promise.all(
      dbs.map(async (dbItem) => {
        try {
          const dbUrl = new URL(config.DATA_DATABASE_URL);
          dbUrl.pathname = `/${dbItem.name}`;
          const specificDb = getDataDb(dbUrl.toString());
          const tables = await specificDb`
            SELECT table_name as name
            FROM information_schema.tables
            WHERE table_schema = 'public' AND table_type = 'BASE TABLE'
            ORDER BY table_name;
          `;
          return {
            name: dbItem.name,
            tables: tables.map((t: any) => t.name),
          };
        } catch {
          return {
            name: dbItem.name,
            tables: [],
          };
        }
      })
    );

    return c.json({ data: dbsWithTables });
  } catch (err: any) {
    return c.json({ error: err.message }, 500);
  }
});

adminRouter.post("/projects", async (c) => {
  const schema = z.object({
    name: z.string(),
    slug: z.string(),
    dbConnectionString: z.string().optional(),
    databaseName: z.string().optional(),
  });
  const body = schema.parse(await c.req.json());
  let connStr = body.dbConnectionString;
  if (body.databaseName) {
    const base = new URL(config.DATA_DATABASE_URL);
    base.pathname = `/${body.databaseName}`;
    connStr = base.toString();
  }
  const [data] = await db.insert(projects).values({
    name: body.name,
    slug: body.slug,
    dbConnectionString: connStr,
  }).returning();
  return c.json({ data });
});

adminRouter.get("/projects/:id", async (c) => {
  const id = c.req.param("id");
  const [data] = await db.select().from(projects).where(eq(projects.id, id));
  if (!data) return c.json({ error: "Not found" }, 404);
  return c.json({ data });
});

adminRouter.patch("/projects/:id", async (c) => {
  const id = c.req.param("id");
  const schema = z.object({ name: z.string().optional(), slug: z.string().optional(), dbConnectionString: z.string().optional() });
  const body = schema.parse(await c.req.json());
  const [data] = await db.update(projects).set(body).where(eq(projects.id, id)).returning();
  return c.json({ data });
});

adminRouter.delete("/projects/:id", async (c) => {
  const id = c.req.param("id");
  await db.delete(projects).where(eq(projects.id, id));
  return c.json({ data: { success: true } });
});

adminRouter.get("/projects/:projectId/keys", async (c) => {
  const projectId = c.req.param("projectId");
  const data = await db.select().from(apiKeys).where(eq(apiKeys.projectId, projectId));
  return c.json({ data });
});

adminRouter.post("/projects/:projectId/keys", async (c) => {
  const projectId = c.req.param("projectId");
  const schema = z.object({ name: z.string(), permissions: z.any().optional() });
  const body = schema.parse(await c.req.json());
  const { prefix, secret, key } = generateApiKey();
  const keyHash = await hashPassword(key);
  const [data] = await db.insert(apiKeys).values({ projectId, name: body.name, keyHash, keyPrefix: prefix, permissions: body.permissions }).returning();
  return c.json({ data: { ...data, key } });
});

adminRouter.delete("/projects/:projectId/keys/:keyId", async (c) => {
  const keyId = c.req.param("keyId");
  await db.delete(apiKeys).where(eq(apiKeys.id, keyId));
  return c.json({ data: { success: true } });
});

adminRouter.get("/projects/:projectId/schema/tables", async (c) => {
  const projectId = c.req.param("projectId");
  const [project] = await db.select().from(projects).where(eq(projects.id, projectId));
  const sql = getDataDb(project?.dbConnectionString);
  const tables = await sql`
    SELECT table_name as name 
    FROM information_schema.tables 
    WHERE table_schema = 'public' AND table_type = 'BASE TABLE'
    ORDER BY table_name;
  `;
  const columns = await sql`
    SELECT table_name, column_name as name, data_type as type, is_nullable = 'YES' as nullable
    FROM information_schema.columns
    WHERE table_schema = 'public'
    ORDER BY ordinal_position;
  `;
  const result = tables.map(t => ({
    name: t.name,
    columns: columns.filter(col => col.table_name === t.name).map(c => ({
      name: c.name,
      type: c.type,
      nullable: c.nullable
    }))
  }));
  return c.json({ data: result });
});

adminRouter.post("/projects/:projectId/schema/tables", async (c) => {
  const projectId = c.req.param("projectId");
  const [project] = await db.select().from(projects).where(eq(projects.id, projectId));
  const sql = getDataDb(project?.dbConnectionString);
  const schema = z.object({
    name: z.string(),
    columns: z.array(z.object({ name: z.string(), type: z.string(), nullable: z.boolean().optional(), default: z.string().optional(), primaryKey: z.boolean().optional() }))
  });
  const body = schema.parse(await c.req.json());
  const safeTable = sql(sanitizeIdentifier(body.name));
  const colDefs = body.columns.map(col => {
    const safeCol = sanitizeIdentifier(col.name);
    let def = `${safeCol} ${col.type}`;
    if (col.primaryKey) def += " PRIMARY KEY";
    if (col.nullable === false) def += " NOT NULL";
    if (col.default) def += ` DEFAULT ${col.default}`;
    return def;
  }).join(", ");
  await sql.unsafe(`CREATE TABLE ${safeTable} (${colDefs})`);
  return c.json({ data: { success: true } });
});

adminRouter.delete("/projects/:projectId/schema/tables/:name", async (c) => {
  const projectId = c.req.param("projectId");
  const name = c.req.param("name");
  const [project] = await db.select().from(projects).where(eq(projects.id, projectId));
  const sql = getDataDb(project?.dbConnectionString);
  await sql.unsafe(`DROP TABLE ${sanitizeIdentifier(name)}`);
  return c.json({ data: { success: true } });
});

adminRouter.post("/projects/:projectId/schema/tables/:name/columns", async (c) => {
  const projectId = c.req.param("projectId");
  const name = c.req.param("name");
  const [project] = await db.select().from(projects).where(eq(projects.id, projectId));
  const sql = getDataDb(project?.dbConnectionString);
  const schema = z.object({ name: z.string(), type: z.string(), nullable: z.boolean().optional(), default: z.string().optional() });
  const body = schema.parse(await c.req.json());
  let def = `${sanitizeIdentifier(body.name)} ${body.type}`;
  if (body.nullable === false) def += " NOT NULL";
  if (body.default) def += ` DEFAULT ${body.default}`;
  await sql.unsafe(`ALTER TABLE ${sanitizeIdentifier(name)} ADD COLUMN ${def}`);
  return c.json({ data: { success: true } });
});

adminRouter.delete("/projects/:projectId/schema/tables/:name/columns/:colName", async (c) => {
  const projectId = c.req.param("projectId");
  const name = c.req.param("name");
  const colName = c.req.param("colName");
  const [project] = await db.select().from(projects).where(eq(projects.id, projectId));
  const sql = getDataDb(project?.dbConnectionString);
  await sql.unsafe(`ALTER TABLE ${sanitizeIdentifier(name)} DROP COLUMN ${sanitizeIdentifier(colName)}`);
  return c.json({ data: { success: true } });
});

adminRouter.post("/projects/:projectId/schema/sql", async (c) => {
  const projectId = c.req.param("projectId");
  const [project] = await db.select().from(projects).where(eq(projects.id, projectId));
  const sql = getDataDb(project?.dbConnectionString);
  const schema = z.object({ query: z.string() });
  const body = schema.parse(await c.req.json());
  const data = await sql.unsafe(body.query);
  return c.json({ data });
});

adminRouter.get("/projects/:projectId/telemetry", async (c) => {
  const projectId = c.req.param("projectId");
  const [project] = await db.select().from(projects).where(eq(projects.id, projectId));
  if (!project) return c.json({ error: "Project not found" }, 404);

  let targetDb = "mypg_data";
  if (project.dbConnectionString) {
    try {
      const u = new URL(project.dbConnectionString);
      targetDb = u.pathname.replace(/^\//, "") || targetDb;
    } catch {}
  } else if (project.slug) {
    const slugDb = project.slug.replace(/-/g, "_");
    targetDb = slugDb.startsWith("db_") || slugDb === "mypg_data" ? slugDb : `db_${slugDb}`;
  }

  let dbStats: any = null;
  let tableRows: any[] = [];
  try {
    const rawSql = getDataDb();
    const [stats] = await rawSql`
      SELECT 
        datname,
        numbackends,
        xact_commit,
        xact_rollback,
        blks_read,
        blks_hit,
        tup_returned,
        tup_fetched,
        tup_inserted,
        tup_updated,
        tup_deleted,
        conflicts,
        deadlocks
      FROM pg_stat_database
      WHERE datname = ${targetDb}
    `;
    dbStats = stats;
  } catch {}

  try {
    const dbUrl = new URL(config.DATA_DATABASE_URL);
    dbUrl.pathname = `/${targetDb}`;
    const specificDb = getDataDb(dbUrl.toString());
    tableRows = await specificDb`
      SELECT 
        relname as table_name,
        COALESCE(n_tup_ins, 0)::text as inserts,
        COALESCE(n_tup_upd, 0)::text as updates,
        COALESCE(n_tup_del, 0)::text as deletes,
        COALESCE(seq_scan, 0)::text as seq_scans,
        COALESCE(idx_scan, 0)::text as idx_scans,
        COALESCE(seq_tup_read, 0)::text as seq_reads,
        COALESCE(idx_tup_fetch, 0)::text as idx_reads,
        COALESCE(n_live_tup, 0)::text as live_rows
      FROM pg_stat_user_tables
      WHERE schemaname = 'public'
    `;
  } catch {}

  let lastHourRequests = 0;
  let totalErrors = 0;
  const recentErrors: any[] = [];
  const tableLastHourMap = new Map<string, number>();
  const tableErrorMap = new Map<string, number>();

  const logFilePath = config.POSTGRES_LOG_FILE;
  if (fs.existsSync(logFilePath)) {
    try {
      const stats = fs.statSync(logFilePath);
      const readSize = Math.min(stats.size, 3 * 1024 * 1024);
      const buffer = Buffer.alloc(readSize);
      const fd = fs.openSync(logFilePath, "r");
      fs.readSync(fd, buffer, 0, readSize, Math.max(0, stats.size - readSize));
      fs.closeSync(fd);

      const content = buffer.toString("utf-8");
      const rawLines = content.split("\n");
      const oneHourAgo = Date.now() - 3600 * 1000;

      const entries: { timestamp: string; timeMs: number; pid: number; db: string; text: string; isError: boolean }[] = [];
      let current: { timestamp: string; timeMs: number; pid: number; db: string; text: string; isError: boolean } | null = null;

      for (const rawLine of rawLines) {
        if (!rawLine.trim()) continue;
        try {
          const jsonLog = JSON.parse(rawLine);
          const msg = jsonLog.log || "";
          const timeMatch = msg.match(/^(\d{4}-\d{2}-\d{2}\s\d{2}:\d{2}:\d{2}(?:\.\d{3})?)\sUTC/);
          if (timeMatch) {
            if (current) entries.push(current);
            const timeMs = new Date(timeMatch[1].replace(" ", "T") + "Z").getTime();
            const dbMatch = msg.match(/db=([^,\s]+)/);
            const pidMatch = msg.match(/\[(\d+)\]/);
            current = {
              timestamp: timeMatch[1],
              timeMs,
              pid: pidMatch ? parseInt(pidMatch[1]) : 0,
              db: dbMatch ? dbMatch[1] : "",
              text: msg,
              isError: msg.includes("ERROR:") || msg.includes("FATAL:"),
            };
          } else if (current) {
            current.text += " " + msg.trim();
            if (msg.includes("ERROR:") || msg.includes("FATAL:")) current.isError = true;
          }
        } catch {}
      }
      if (current) entries.push(current);

      for (let i = entries.length - 1; i >= 0; i--) {
        const entry = entries[i];
        if (entry.db !== targetDb) continue;

        const isLastHour = entry.timeMs >= oneHourAgo;
        const isQuery = entry.text.includes("execute") || entry.text.includes("statement:");
        const isInternal =
          entry.text.includes("information_schema") ||
          entry.text.includes("pg_catalog") ||
          entry.text.includes("pg_stat_");

        let matchedTable = "";
        for (const t of tableRows) {
          const pattern = new RegExp(`["\`]?${t.table_name}["\`]?`, "i");
          if (pattern.test(entry.text)) {
            matchedTable = t.table_name;
            break;
          }
        }

        if (isLastHour && isQuery && !isInternal) {
          lastHourRequests++;
          if (matchedTable) {
            tableLastHourMap.set(matchedTable, (tableLastHourMap.get(matchedTable) || 0) + 1);
          }
        }

        if (entry.isError) {
          totalErrors++;
          if (matchedTable) {
            tableErrorMap.set(matchedTable, (tableErrorMap.get(matchedTable) || 0) + 1);
          }
          if (recentErrors.length < 50) {
            recentErrors.push({
              timestamp: entry.timestamp,
              error: entry.text.split("ERROR:")[1]?.trim() || entry.text.split("FATAL:")[1]?.trim() || entry.text,
              table: matchedTable || "general",
              pid: entry.pid,
            });
          }
        }
      }
    } catch {}
  }

  const tableStats = tableRows.map((t) => {
    const ins = parseInt(t.inserts || "0");
    const upd = parseInt(t.updates || "0");
    const del = parseInt(t.deletes || "0");
    const seq = parseInt(t.seq_scans || "0");
    const idx = parseInt(t.idx_scans || "0");
    const totalOps = ins + upd + del + seq + idx;
    return {
      tableName: t.table_name,
      totalOperations: totalOps,
      lastHourRequests: tableLastHourMap.get(t.table_name) || 0,
      errorCount: tableErrorMap.get(t.table_name) || 0,
      inserts: ins,
      updates: upd,
      deletes: del,
      reads: seq + idx,
      liveRows: parseInt(t.live_rows || "0"),
    };
  }).sort((a, b) => b.totalOperations - a.totalOperations);

  const totalOpsSum = tableStats.reduce((acc, curr) => acc + curr.totalOperations, 0);

  return c.json({
    data: {
      database: targetDb,
      totalOperations: totalOpsSum,
      lastHourRequests,
      errorCount: totalErrors,
      xactCommit: parseInt(dbStats?.xact_commit || "0"),
      xactRollback: parseInt(dbStats?.xact_rollback || "0"),
      tableStats,
      recentErrors,
    },
  });
});

export { adminRouter };
