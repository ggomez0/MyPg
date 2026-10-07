import { Context, Next } from "hono";
import { verifyJwt } from "../utils/jwt";
import { db } from "../db";
import { apiKeys } from "../db/schema";
import { eq } from "drizzle-orm";
import type { AppEnv } from "../types";

export async function adminAuth(c: Context<AppEnv>, next: Next) {
  const authHeader = c.req.header("Authorization");
  if (!authHeader?.startsWith("Bearer ")) {
    return c.json({ error: "Unauthorized" }, 401);
  }
  const token = authHeader.substring(7);
  try {
    const payload = await verifyJwt(token);
    if (payload.type !== "admin") throw new Error();
    c.set("adminId", payload.sub as string);
    await next();
  } catch {
    return c.json({ error: "Unauthorized" }, 401);
  }
}

export async function apiAuth(c: Context<AppEnv>, next: Next) {
  const apiKey = c.req.header("X-API-Key");
  if (apiKey) {
    if (!apiKey.startsWith("mypg_")) {
      return c.json({ error: "Invalid API Key format" }, 401);
    }
    const parts = apiKey.split("_");
    if (parts.length !== 3) {
      return c.json({ error: "Invalid API Key format" }, 401);
    }
    const prefix = parts[1];
    const [keyRecord] = await db.select().from(apiKeys).where(eq(apiKeys.keyPrefix, prefix));
    if (!keyRecord) {
      return c.json({ error: "Unauthorized" }, 401);
    }
    const { verifyPassword } = await import("../utils/crypto");
    const isValid = await verifyPassword(keyRecord.keyHash, apiKey);
    if (!isValid) {
      return c.json({ error: "Unauthorized" }, 401);
    }
    await db.update(apiKeys).set({ lastUsedAt: new Date() }).where(eq(apiKeys.id, keyRecord.id));
    c.set("projectId", keyRecord.projectId);
    c.set("authType", "apikey");
    c.set("role", "admin");
    return await next();
  }

  const authHeader = c.req.header("Authorization");
  if (authHeader?.startsWith("Bearer ")) {
    const token = authHeader.substring(7);
    try {
      const payload = await verifyJwt(token);
      if (payload.type === "admin") {
        const projectIdHeader = c.req.header("X-Project-Id") || c.req.query("projectId");
        if (projectIdHeader) {
          c.set("projectId", projectIdHeader);
        }
        c.set("userId", payload.sub as string);
        c.set("role", "admin");
        c.set("authType", "user");
        return await next();
      }
      if (payload.type !== "user") throw new Error();
      c.set("projectId", payload.projectId as string);
      c.set("userId", payload.sub as string);
      c.set("role", payload.role as string);
      c.set("authType", "user");
      return await next();
    } catch {
      return c.json({ error: "Unauthorized" }, 401);
    }
  }
  return c.json({ error: "Unauthorized" }, 401);
}

