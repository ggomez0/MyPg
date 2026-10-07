import { db, getDataDb } from "../db";
import { collections, permissions, projects } from "../db/schema";
import { eq } from "drizzle-orm";
import { installCollectionTrigger } from "../db/migrate";

export class CollectionsService {
  static async listCollections(projectId: string) {
    const [project] = await db.select().from(projects).where(eq(projects.id, projectId));
    const sql = getDataDb(project?.dbConnectionString);
    const tables = await sql`SELECT table_name FROM information_schema.tables WHERE table_schema = 'public'`;
    const metadata = await db.select().from(collections).where(eq(collections.projectId, projectId));
    return tables.map(t => {
      const meta = metadata.find(m => m.tableName === t.table_name);
      return {
        name: t.table_name,
        tableName: t.table_name,
        displayName: meta?.displayName || t.table_name,
        registered: !!meta,
        rls_enabled: meta?.enableRls ?? false,
        enableRls: meta?.enableRls ?? false,
        metadata: meta || null
      };
    });
  }

  static async registerCollection(projectId: string, tableName: string, displayName: string, enableRls: boolean) {
    const [project] = await db.select().from(projects).where(eq(projects.id, projectId));
    const dataDb = getDataDb(project?.dbConnectionString);
    await installCollectionTrigger(tableName, dataDb);
    const [coll] = await db.insert(collections).values({
      projectId, tableName, displayName, enableRls
    }).returning();
    return coll;
  }

  static async getCollection(projectId: string, tableName: string) {
    const [project] = await db.select().from(projects).where(eq(projects.id, projectId));
    const sql = getDataDb(project?.dbConnectionString);
    const cols = await sql`SELECT column_name, data_type FROM information_schema.columns WHERE table_name = ${tableName} AND table_schema = 'public'`;
    const [meta] = await db.select().from(collections).where(eq(collections.projectId, projectId));
    return { columns: cols, metadata: meta || null };
  }
}
