import { Hono } from "hono";
import { RealtimeService } from "../services/realtime.service";
import { apiAuth } from "../middleware/auth";
import { db } from "../db";
import { projects } from "../db/schema";
import { eq } from "drizzle-orm";
import type { AppEnv } from "../types";

const realtimeRouter = new Hono<AppEnv>();

realtimeRouter.get("/:collection", apiAuth, async (c) => {
  const collection = c.req.param("collection");
  if (!collection) return c.json({ error: "Collection is required" }, 400);
  const projectId = c.get("projectId") as string;
  const [project] = await db.select().from(projects).where(eq(projects.id, projectId));
  if (!project) return c.json({ error: "Project not found" }, 404);

  return new Response(new ReadableStream({
    async start(controller) {
      const encoder = new TextEncoder();
      const unsub = await RealtimeService.subscribe(project.dbConnectionString ?? null, projectId, collection, (payload) => {
        controller.enqueue(encoder.encode(`data: ${JSON.stringify(payload)}\n\n`));
      });
      c.req.raw.signal.addEventListener("abort", () => {
        unsub();
        controller.close();
      });
    }
  }), { headers: { "Content-Type": "text/event-stream", "Cache-Control": "no-cache", "Connection": "keep-alive" } });
});

export { realtimeRouter };

