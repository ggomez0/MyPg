import { Hono } from "hono";
import { db } from "../db";

const metricsRouter = new Hono();

metricsRouter.get("/", async (c) => {
  const result = await db.execute(`
    SELECT
      (SELECT COUNT(*) FROM mypg_request_logs) as total_requests,
      (SELECT AVG(duration_ms) FROM mypg_request_logs) as avg_duration,
      (SELECT count(*) FROM pg_stat_activity) as active_connections
  `);
  
  const { total_requests, avg_duration, active_connections } = result[0];
  
  const metrics = `
# HELP request_total The total number of requests
# TYPE request_total counter
request_total ${total_requests || 0}
# HELP request_duration The average request duration in ms
# TYPE request_duration gauge
request_duration ${avg_duration || 0}
# HELP active_connections The number of active database connections
# TYPE active_connections gauge
active_connections ${active_connections || 0}
  `.trim();

  return c.text(metrics);
});

export { metricsRouter };
