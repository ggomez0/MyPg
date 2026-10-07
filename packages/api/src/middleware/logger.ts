import { Context, Next } from "hono";
import { db } from "../db";
import { requestLogs } from "../db/schema";

export async function requestLogger(c: Context, next: Next) {
  const start = Date.now();
  await next();
  const durationMs = Date.now() - start;
  const projectId = c.get("projectId") || null;
  const userId = c.get("userId") || null;
  try {
    await db.insert(requestLogs).values({
      projectId,
      method: c.req.method,
      path: c.req.path,
      statusCode: c.res.status,
      durationMs,
      ip: c.req.header("x-forwarded-for") || "",
      userAgent: c.req.header("user-agent") || "",
      userId,
    });
  } catch (e) {
  }
}
