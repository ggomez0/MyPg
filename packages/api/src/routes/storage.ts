import { Hono } from "hono";
import { StorageService } from "../services/storage.service";
import { apiAuth, adminAuth } from "../middleware/auth";
import { db } from "../db";
import { storageFiles } from "../db/schema";
import multer from "multer";
import type { AppEnv } from "../types";

const storageRouter = new Hono<AppEnv>();
const upload = multer({ dest: "tmp_uploads/" });

storageRouter.post("/upload", apiAuth, (c) => {
  return new Promise<Response>((resolve) => {
    upload.single("file")(c.req.raw as any, {} as any, async (err: any) => {
      if (err) { resolve(c.json({ error: "Upload failed" }, 400) as any); return; }
      const file = (c.req.raw as any).file;
      if (!file) { resolve(c.json({ error: "No file provided" }, 400) as any); return; }
      const projectId = c.get("projectId") as string;
      const userId = c.get("userId") as string | undefined;
      try {
        const result = await StorageService.upload(projectId, file, userId);
        resolve(c.json({ data: result }) as any);
      } catch (e: any) {
        resolve(c.json({ error: e.message }, 400) as any);
      }
    });
  });
});

storageRouter.get("/:id", async (c) => {
  const id = c.req.param("id");
  try {
    const fileUrl = await StorageService.getFileUrl(id);
    if (fileUrl.isRedirect) {
      return c.redirect(fileUrl.url!);
    } else {
      const fs = await import("fs");
      const stream = fs.createReadStream(fileUrl.path!);
      return new Response(stream as any, { headers: { "Content-Type": fileUrl.mimeType! } });
    }
  } catch (e: any) {
    return c.json({ error: e.message }, 404);
  }
});

storageRouter.delete("/:id", apiAuth, async (c) => {
  const id = c.req.param("id");
  if (!id) return c.json({ error: "File ID is required" }, 400);
  try {
    await StorageService.delete(id);
    return c.json({ data: { success: true } });
  } catch (e: any) {
    return c.json({ error: e.message }, 400);
  }
});

storageRouter.get("/", adminAuth, async (c) => {
  const records = await db.select().from(storageFiles);
  return c.json({ data: records });
});

export { storageRouter };

