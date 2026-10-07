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
});
