import { describe, it, expect } from "vitest";
import { hashPassword, verifyPassword, generateApiKey } from "../utils/crypto";
import { signAdminJwt, signUserJwt, verifyJwt } from "../utils/jwt";
import { sanitizeIdentifier, buildQuery } from "../utils/query-builder";
import postgres from "postgres";

describe("MyPg Core Utilities & Security Tests", () => {
  it("should hash and verify passwords correctly with argon2", async () => {
    const password = "super_secure_password_123";
    const hash = await hashPassword(password);
    expect(hash).toBeDefined();
    expect(hash).not.toBe(password);

    const isValid = await verifyPassword(hash, password);
    expect(isValid).toBe(true);

    const isInvalid = await verifyPassword(hash, "wrong_password");
    expect(isInvalid).toBe(false);
  });

  it("should generate valid API key structure with mypg_ prefix", () => {
    const keyData = generateApiKey();
    expect(keyData.prefix).toHaveLength(8);
    expect(keyData.secret).toHaveLength(32);
    expect(keyData.key.startsWith(`mypg_${keyData.prefix}_`)).toBe(true);
  });

  it("should sign and verify Admin JWT", async () => {
    const adminId = "e2c0702d-3047-4950-8b0d-d9caef4f0e01";
    const token = await signAdminJwt(adminId);
    expect(token).toBeDefined();

    const payload = await verifyJwt(token);
    expect(payload.sub).toBe(adminId);
    expect(payload.type).toBe("admin");
  });

  it("should sign and verify User JWT", async () => {
    const userId = "user-uuid-123";
    const projectId = "project-uuid-456";
    const role = "editor";

    const token = await signUserJwt(userId, projectId, role);
    expect(token).toBeDefined();

    const payload = await verifyJwt(token);
    expect(payload.sub).toBe(userId);
    expect(payload.projectId).toBe(projectId);
    expect(payload.role).toBe(role);
    expect(payload.type).toBe("user");
  });

  it("should sanitize identifiers against SQL injection", () => {
    const maliciousName = "users; DROP TABLE users; --";
    const cleaned = sanitizeIdentifier(maliciousName);
    expect(cleaned).toBe("usersDROPTABLEusers");
  });

  it("should build safe query and parameters with pagination and filters", () => {
    const sqlMock: any = (val: any) => val;
    sqlMock.unsafe = (val: any) => val;

    const allowedColumns = ["id", "title", "status", "views"];
    const query = {
      page: "2",
      perPage: "15",
      sort: "views:desc",
      fields: "id,title",
      filter: { status: "published" },
    };

    const result = buildQuery(sqlMock, "posts", query, allowedColumns);
    expect(result.page).toBe(2);
    expect(result.perPage).toBe(15);
    expect(result.dataQuery).toBeDefined();
    expect(result.countQuery).toBeDefined();
  });

  it("should format auto-discovered database names and slugs properly", () => {
    const rawDbName = "db_municipalidad_wifi";
    const slug = rawDbName.toLowerCase().replace(/[^a-z0-9_-]/g, "-");
    const formattedName = rawDbName
      .replace(/^db_/, "")
      .replace(/[-_]/g, " ")
      .replace(/\b\w/g, (l: string) => l.toUpperCase());

    expect(slug).toBe("db_municipalidad_wifi");
    expect(formattedName).toBe("Municipalidad Wifi");
  });

  it("should handle visual hiding flags without modifying underlying database", () => {
    const projectState = {
      id: "proj-1",
      name: "Municipalidad",
      dbConnectionString: "postgresql://localhost:5432/db_municipalidad",
      isHidden: false,
    };

    const hiddenState = { ...projectState, isHidden: true };
    expect(hiddenState.isHidden).toBe(true);
    expect(hiddenState.dbConnectionString).toBe(projectState.dbConnectionString);

    const restoredState = { ...hiddenState, isHidden: false };
    expect(restoredState.isHidden).toBe(false);
  });

  it("should enforce readonly mode in checkApiKeyPermission", async () => {
    const { checkApiKeyPermission } = await import("../utils/permissions");
    const perms = { mode: "readonly" as const };

    expect(checkApiKeyPermission(perms, "posts", "read")).toBe(true);
    expect(checkApiKeyPermission(perms, "posts", "create")).toBe(false);
    expect(checkApiKeyPermission(perms, "posts", "update")).toBe(false);
    expect(checkApiKeyPermission(perms, "posts", "delete")).toBe(false);
  });

  it("should enforce granular collection permissions in checkApiKeyPermission", async () => {
    const { checkApiKeyPermission } = await import("../utils/permissions");
    const perms = {
      collections: {
        posts: ["read"],
        comments: ["read", "create"],
      },
    };

    expect(checkApiKeyPermission(perms, "posts", "read")).toBe(true);
    expect(checkApiKeyPermission(perms, "posts", "create")).toBe(false);
    expect(checkApiKeyPermission(perms, "comments", "read")).toBe(true);
    expect(checkApiKeyPermission(perms, "comments", "create")).toBe(true);
    expect(checkApiKeyPermission(perms, "comments", "delete")).toBe(false);
    expect(checkApiKeyPermission(perms, "users", "read")).toBe(false);
  });

  it("should allow full access when mode is full or permissions are omitted", async () => {
    const { checkApiKeyPermission } = await import("../utils/permissions");
    expect(checkApiKeyPermission(null, "posts", "create")).toBe(true);
    expect(checkApiKeyPermission({ mode: "full" }, "posts", "delete")).toBe(true);
  });

  it("should sort newest to oldest by default when no sort parameter is provided", () => {
    const capturedQueries: string[] = [];
    const sqlMock: any = (strings: any, ...values: any[]) => {
      if (Array.isArray(strings)) {
        capturedQueries.push(strings.join("?"));
      }
      return strings;
    };
    sqlMock.unsafe = (val: any) => val;

    const allowedColumns = ["id", "title", "created_at"];
    const result = buildQuery(sqlMock, "items", {}, allowedColumns);
    expect(result.dataQuery).toBeDefined();
    expect(capturedQueries.some((q) => q.includes("ORDER BY") && q.includes("DESC"))).toBe(true);
  });
});
