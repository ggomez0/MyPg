import { Hono } from "hono";
import { authRouter } from "./auth";
import { dataRouter } from "./data";
import { realtimeRouter } from "./realtime";
import { storageRouter } from "./storage";
import { collectionsRouter } from "./collections";
import { logsRouter } from "./logs";
import { metricsRouter } from "./metrics";
import { adminRouter } from "./admin";

const appRouter = new Hono();

appRouter.route("/", authRouter);
appRouter.route("/admin/projects", collectionsRouter);
appRouter.route("/admin/logs", logsRouter);
appRouter.route("/admin", adminRouter);
appRouter.route("/data", dataRouter);
appRouter.route("/realtime", realtimeRouter);
appRouter.route("/storage", storageRouter);
appRouter.route("/metrics", metricsRouter);

export { appRouter };
