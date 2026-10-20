import { db, getDataDb } from "../db";
import { collections, permissions, projects } from "../db/schema";
import { eq, and } from "drizzle-orm";
import { buildQuery, sanitizeIdentifier } from "../utils/query-builder";
import * as fs from "fs";
import * as path from "path";

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

  static processPhoto(tableName: string, cols: string[], id: string, data: any) {
    if (tableName === "curriculums" || cols.includes("photo_url")) {
      const photoVal = data.photo_url !== undefined ? data.photo_url : data.photo;
      if (photoVal === null) {
        data.photo_url = null;
        return;
      }
      if (typeof photoVal === "string") {
        if (photoVal.startsWith("data:image/")) {
          try {
            const uploadsDir = path.resolve(process.cwd(), "uploads", "photos");
            if (!fs.existsSync(uploadsDir)) {
              fs.mkdirSync(uploadsDir, { recursive: true });
            }
            const matches = photoVal.match(/^data:image\/([a-zA-Z0-9]+);base64,(.+)$/);
            if (matches) {
              const ext = matches[1] === "jpeg" ? "jpg" : matches[1];
              const recordId = id || data.id || Math.random().toString(36).substring(2, 10);
              const fileName = `${recordId}.${ext}`;
              const filePath = path.join(uploadsDir, fileName);
              fs.writeFileSync(filePath, Buffer.from(matches[2], "base64"));
              data.photo_url = `/uploads/photos/${fileName}`;
            }
          } catch (err) {
            console.error("Error saving photo from base64:", err);
          }
        } else if (photoVal.startsWith("/uploads/")) {
          data.photo_url = photoVal;
        } else if (photoVal.startsWith("http://") || photoVal.startsWith("https://")) {
          try {
            const parsed = new URL(photoVal);
            if (parsed.pathname.startsWith("/uploads/")) {
              data.photo_url = parsed.pathname;
            } else {
              data.photo_url = photoVal;
            }
          } catch {
            data.photo_url = photoVal;
          }
        }
      }
    }
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

    records.forEach((r: any) => {
      if (r.photo_url && !r.photo) {
        r.photo = r.photo_url;
      }
    });

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
    this.processPhoto(tableName, cols, data.id || "", data);

    const safeData: any = {};
    for (const key of Object.keys(data)) {
      if (cols.includes(key)) safeData[sanitizeIdentifier(key)] = data[key];
    }
    const safeTable = sql(sanitizeIdentifier(tableName));
    const [record] = await sql`INSERT INTO ${safeTable} ${sql(safeData)} RETURNING *`;
    if (record && record.photo_url && !record.photo) {
      record.photo = record.photo_url;
    }
    return record;
  }

  static async update(projectId: string, tableName: string, id: string, data: any, role: string, userId?: string) {
    const { sql } = await this.getProjectAndDb(projectId);
    const meta = await this.getCollectionMeta(projectId, tableName);
    const can = await this.checkPermission(meta, role, "update");
    if (!can) throw new Error("Forbidden");

    const cols = await this.getColumns(sql, tableName);
    this.processPhoto(tableName, cols, id, data);

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
    if (record && record.photo_url && !record.photo) {
      record.photo = record.photo_url;
    }
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
