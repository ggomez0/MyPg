import { db, getDataDb } from "../db";
import { admins, users, projects } from "../db/schema";
import { eq, and } from "drizzle-orm";
import { hashPassword, verifyPassword } from "../utils/crypto";
import { signAdminJwt, signUserJwt } from "../utils/jwt";

export class AuthService {
  static async registerAdmin(email: string, passwordRaw: string, name: string) {
    const existing = await db.select().from(admins).limit(1);
    if (existing.length > 0) {
      throw new Error("Admin already exists");
    }
    const passwordHash = await hashPassword(passwordRaw);
    const [admin] = await db.insert(admins).values({ email, passwordHash, name, isSuperAdmin: true }).returning();
    const token = await signAdminJwt(admin.id);
    return { token, admin: { id: admin.id, email: admin.email, name: admin.name } };
  }

  static async loginAdmin(email: string, passwordRaw: string) {
    const [admin] = await db.select().from(admins).where(eq(admins.email, email));
    if (!admin) throw new Error("Invalid credentials");
    const valid = await verifyPassword(admin.passwordHash, passwordRaw);
    if (!valid) throw new Error("Invalid credentials");
    const token = await signAdminJwt(admin.id);
    return { token, admin: { id: admin.id, email: admin.email, name: admin.name } };
  }

  static async registerUser(projectId: string, email: string, passwordRaw: string, name: string) {
    const [project] = await db.select().from(projects).where(eq(projects.id, projectId));
    if (!project) throw new Error("Project not found");
    const passwordHash = await hashPassword(passwordRaw);
    const [user] = await db.insert(users).values({ projectId, email, passwordHash, name }).returning();
    return { id: user.id, email: user.email, name: user.name, role: user.role };
  }

  static async loginUser(projectId: string, email: string, passwordRaw: string) {
    const [user] = await db.select().from(users).where(and(eq(users.projectId, projectId), eq(users.email, email)));
    if (!user) throw new Error("Invalid credentials");
    const valid = await verifyPassword(user.passwordHash, passwordRaw);
    if (!valid) throw new Error("Invalid credentials");
    const token = await signUserJwt(user.id, projectId, user.role || "user");
    return { token, user: { id: user.id, email: user.email, name: user.name, role: user.role } };
  }
}
