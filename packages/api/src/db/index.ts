import postgres from "postgres";
import { drizzle } from "drizzle-orm/postgres-js";
import { config } from "../config";
import * as schema from "./schema";

export const sql = postgres(config.INTERNAL_DATABASE_URL, { max: 10 });
export const db = drizzle(sql, { schema });

const dataConnections = new Map<string, postgres.Sql>();

export function getDataDb(connectionString?: string | null): postgres.Sql {
  const connStr = connectionString || config.DATA_DATABASE_URL;
  if (!dataConnections.has(connStr)) {
    dataConnections.set(connStr, postgres(connStr, { max: 20 }));
  }
  return dataConnections.get(connStr)!;
}
