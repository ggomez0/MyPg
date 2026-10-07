import { Hono } from "hono";
import { AuthService } from "../services/auth.service";
import { z } from "zod";
import { adminAuth, apiAuth } from "../middleware/auth";
import { db } from "../db";
import { admins, users } from "../db/schema";
import { eq } from "drizzle-orm";

const authRouter = new Hono();

authRouter.post("/admin/auth/register", async (c) => {
  const schema = z.object({ email: z.string().email(), password: z.string().min(6), name: z.string() });
  const body = schema.parse(await c.req.json());
  try {
    const admin = await AuthService.registerAdmin(body.email, body.password, body.name);
    return c.json({ data: admin });
  } catch (err: any) {
    return c.json({ error: err.message }, 400);
  }
});

authRouter.post("/admin/auth/login", async (c) => {
  const schema = z.object({ email: z.string().email(), password: z.string() });
  const body = schema.parse(await c.req.json());
  try {
    const result = await AuthService.loginAdmin(body.email, body.password);
    return c.json({ data: result });
  } catch (err: any) {
    return c.json({ error: err.message }, 400);
  }
});

authRouter.get("/admin/auth/me", adminAuth, async (c) => {
  const adminId = c.get("adminId");
  const [admin] = await db.select().from(admins).where(eq(admins.id, adminId));
  return c.json({ data: { id: admin.id, email: admin.email, name: admin.name } });
});

authRouter.post("/api/auth/register", apiAuth, async (c) => {
  const schema = z.object({ email: z.string().email(), password: z.string().min(6), name: z.string() });
  const body = schema.parse(await c.req.json());
  const projectId = c.get("projectId");
  try {
    const user = await AuthService.registerUser(projectId, body.email, body.password, body.name);
    return c.json({ data: user });
  } catch (err: any) {
    return c.json({ error: err.message }, 400);
  }
});

authRouter.post("/api/auth/login", apiAuth, async (c) => {
  const schema = z.object({ email: z.string().email(), password: z.string() });
  const body = schema.parse(await c.req.json());
  const projectId = c.get("projectId");
  try {
    const result = await AuthService.loginUser(projectId, body.email, body.password);
    return c.json({ data: result });
  } catch (err: any) {
    return c.json({ error: err.message }, 400);
  }
});

authRouter.get("/api/auth/me", apiAuth, async (c) => {
  if (c.get("authType") !== "user") return c.json({ error: "User token required" }, 403);
  const userId = c.get("userId");
  const [user] = await db.select().from(users).where(eq(users.id, userId));
  return c.json({ data: { id: user.id, email: user.email, name: user.name, role: user.role } });
});

authRouter.patch("/api/auth/me", apiAuth, async (c) => {
  if (c.get("authType") !== "user") return c.json({ error: "User token required" }, 403);
  const userId = c.get("userId");
  const schema = z.object({ name: z.string().optional(), metadata: z.any().optional() });
  const body = schema.parse(await c.req.json());
  const [user] = await db.update(users).set(body).where(eq(users.id, userId)).returning();
  return c.json({ data: { id: user.id, email: user.email, name: user.name, role: user.role, metadata: user.metadata } });
});

export { authRouter };
