import { db, getDataDb } from "../db";
import { collections, permissions, projects } from "../db/schema";
import { eq, and } from "drizzle-orm";
import { buildQuery, sanitizeIdentifier } from "../utils/query-builder";

export class DataService {
  static async getProjectAndDb(projectId: string) {
    const [project] = await db.select().from(projects).where(eq(projects.id, projectId));
    if (!project) throw new Error("Project not found");
    const sql = getDataDb(project.dbConnectionString);
    return { project, sql };
  }

  static async getCollectionMeta(projectId: string, tableName: string) {
    const [meta] = await db.select().from(collections).where(and(eq(collections.projectId, projectId), eq(collections.tableName, tableName)));
    return meta;
  }

  static async checkPermission(meta: any, role: string, action: "read" | "create" | "update" | "delete") {
    if (role === "admin") return true;
    if (!meta) return false;
    const [perm] = await db.select().from(permissions).where(and(eq(permissions.collectionId, meta.id), eq(permissions.role, role)));
    if (!perm) return false;
    if (action === "read") return perm.canRead;
    if (action === "create") return perm.canCreate;
    if (action === "update") return perm.canUpdate;
    if (action === "delete") return perm.canDelete;
    return false;
  }

  static async getColumns(sql: any, tableName: string): Promise<string[]> {
    const cols = await sql`SELECT column_name FROM information_schema.columns WHERE table_name = ${tableName} AND table_schema = 'public'`;
    return cols.map((c: any) => c.column_name);
  }

  static async list(projectId: string, tableName: string, queryParams: any, role: string, userId?: string) {
    const { sql } = await this.getProjectAndDb(projectId);
    const meta = await this.getCollectionMeta(projectId, tableName);
    const can = await this.checkPermission(meta, role, "read");
    if (!can) throw new Error("Forbidden");

    const cols = await this.getColumns(sql, tableName);
    if (meta?.enableRls && userId && role !== "admin") {
      queryParams.filter = queryParams.filter || {};
      queryParams.filter.user_id = userId;
    }

    const { dataQuery, countQuery, page, perPage } = buildQuery(sql, tableName, queryParams, cols);
    const [records, [{ count }]] = await Promise.all([dataQuery, countQuery]);

    const totalCount = parseInt(count);
    return { records, totalCount, page, perPage, totalPages: Math.ceil(totalCount / perPage) };
  }

  static async create(projectId: string, tableName: string, data: any, role: string, userId?: string) {
    const { sql } = await this.getProjectAndDb(projectId);
    const meta = await this.getCollectionMeta(projectId, tableName);
    const can = await this.checkPermission(meta, role, "create");
    if (!can) throw new Error("Forbidden");

    if (meta?.enableRls && userId && role !== "admin") {
      data.user_id = userId;
    }

    const cols = await this.getColumns(sql, tableName);
    const safeData: any = {};
    for (const key of Object.keys(data)) {
      if (cols.includes(key)) safeData[sanitizeIdentifier(key)] = data[key];
    }
    const safeTable = sql(sanitizeIdentifier(tableName));
    const [record] = await sql`INSERT INTO ${safeTable} ${sql(safeData)} RETURNING *`;
    return record;
  }

  static async update(projectId: string, tableName: string, id: string, data: any, role: string, userId?: string) {
    const { sql } = await this.getProjectAndDb(projectId);
    const meta = await this.getCollectionMeta(projectId, tableName);
    const can = await this.checkPermission(meta, role, "update");
    if (!can) throw new Error("Forbidden");

    const cols = await this.getColumns(sql, tableName);
    const safeData: any = {};
    for (const key of Object.keys(data)) {
      if (cols.includes(key)) safeData[sanitizeIdentifier(key)] = data[key];
    }
    const safeTable = sql(sanitizeIdentifier(tableName));
    let query = sql`UPDATE ${safeTable} SET ${sql(safeData)} WHERE id = ${id}`;
    if (meta?.enableRls && userId && role !== "admin") {
      query = sql`UPDATE ${safeTable} SET ${sql(safeData)} WHERE id = ${id} AND user_id = ${userId}`;
    }
    const [record] = await sql`${query} RETURNING *`;
    return record;
  }

  static async delete(projectId: string, tableName: string, id: string, role: string, userId?: string) {
    const { sql } = await this.getProjectAndDb(projectId);
    const meta = await this.getCollectionMeta(projectId, tableName);
    const can = await this.checkPermission(meta, role, "delete");
    if (!can) throw new Error("Forbidden");
    const safeTable = sql(sanitizeIdentifier(tableName));
    let query = sql`DELETE FROM ${safeTable} WHERE id = ${id}`;
    if (meta?.enableRls && userId && role !== "admin") {
      query = sql`DELETE FROM ${safeTable} WHERE id = ${id} AND user_id = ${userId}`;
    }
    const [record] = await sql`${query} RETURNING *`;
    return record;
  }
}
