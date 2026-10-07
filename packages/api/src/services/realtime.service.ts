import { EventEmitter } from "events";
import { getDataDb } from "../db";

const eventBus = new EventEmitter();
eventBus.setMaxListeners(1000);

const activeConnections = new Map<string, any>();

export class RealtimeService {
  static async subscribe(connectionString: string | undefined | null, projectId: string, collection: string, callback: (payload: any) => void) {
    const connStr = connectionString || process.env.DATA_DATABASE_URL || "";
    if (!activeConnections.has(connStr)) {
      const sql = getDataDb(connStr);
      await sql.listen("mypg_realtime", (payload) => {
        try {
          const data = JSON.parse(payload);
          eventBus.emit(`realtime:${data.projectId}:${data.collection}`, data);
        } catch (e) {}
      });
      activeConnections.set(connStr, true);
    }

    const eventName = `realtime:${projectId}:${collection}`;
    eventBus.on(eventName, callback);
    return () => {
      eventBus.off(eventName, callback);
    };
  }
}
