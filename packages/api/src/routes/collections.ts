import { Hono } from "hono";
import { CollectionsService } from "../services/collections.service";
import { adminAuth } from "../middleware/auth";
import { db, getDataDb } from "../db";
import { collections, permissions } from "../db/schema";
import { eq, and } from "drizzle-orm";
import { z } from "zod";

const collectionsRouter = new Hono();
collectionsRouter.use("*", adminAuth);

collectionsRouter.get("/:projectId/collections", async (c) => {
  const projectId = c.req.param("projectId");
  const result = await CollectionsService.listCollections(projectId);
  return c.json({ data: result });
});

collectionsRouter.post("/:projectId/collections", async (c) => {
  const projectId = c.req.param("projectId");
  const schema = z.object({ tableName: z.string(), displayName: z.string(), enableRls: z.boolean().default(false) });
  const body = schema.parse(await c.req.json());
  const result = await CollectionsService.registerCollection(projectId, body.tableName, body.displayName, body.enableRls);
  return c.json({ data: result });
});

collectionsRouter.get("/:projectId/collections/:name", async (c) => {
  const projectId = c.req.param("projectId");
  const name = c.req.param("name");
  const result = await CollectionsService.getCollection(projectId, name);
  return c.json({ data: result });
});

collectionsRouter.patch("/:projectId/collections/:name", async (c) => {
  const projectId = c.req.param("projectId");
  const name = c.req.param("name");
  const schema = z.object({ displayName: z.string().optional(), enableRls: z.boolean().optional() });
  const body = schema.parse(await c.req.json());
  const [result] = await db.update(collections).set(body).where(and(eq(collections.projectId, projectId), eq(collections.tableName, name))).returning();
  return c.json({ data: result });
});

collectionsRouter.delete("/:projectId/collections/:name", async (c) => {
  const projectId = c.req.param("projectId");
  const name = c.req.param("name");
  await db.delete(collections).where(and(eq(collections.projectId, projectId), eq(collections.tableName, name)));
  return c.json({ data: { success: true } });
});

export { collectionsRouter };
