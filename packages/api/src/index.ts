import { serve } from "@hono/node-server";
import { Hono } from "hono";
import { cors } from "hono/cors";
import { config } from "./config";
import { appRouter } from "./routes";
import { requestLogger } from "./middleware/logger";
import { runMigrations } from "./db/migrate";
import type { AppEnv } from "./types";

const app = new Hono<AppEnv>();

app.use("*", cors({
  origin: config.CORS_ORIGINS.split(",").map(s => s.trim()),
  allowMethods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
  exposeHeaders: ["Content-Type", "Authorization", "X-API-Key"]
}));
app.use("*", requestLogger);

app.route("/api", appRouter);

app.get("/metrics", async (c) => {
  const { metricsRouter } = await import("./routes/metrics");
  return metricsRouter.fetch(c.req.raw as any);
});

app.onError((err, c) => {
  return c.json({ error: err.message || "Internal Server Error" }, 500);
});

async function start() {
  await runMigrations();
  serve({
    fetch: app.fetch,
    port: config.API_PORT,
  });
  console.log(`MyPg API running on port ${config.API_PORT}`);
}

start();

export default app;

