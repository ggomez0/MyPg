import { S3Client, PutObjectCommand, GetObjectCommand, DeleteObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { config } from "../config";
import fs from "fs";
import path from "path";
import { nanoid } from "nanoid";
import { db } from "../db";
import { storageFiles } from "../db/schema";
import { eq } from "drizzle-orm";

let s3: S3Client | null = null;
if (config.STORAGE_TYPE === "s3") {
  s3 = new S3Client({
    region: config.S3_REGION || "us-east-1",
    endpoint: config.S3_ENDPOINT,
    credentials: {
      accessKeyId: config.S3_ACCESS_KEY!,
      secretAccessKey: config.S3_SECRET_KEY!,
    }
  });
} else {
  if (!fs.existsSync(config.STORAGE_LOCAL_PATH)) {
    fs.mkdirSync(config.STORAGE_LOCAL_PATH, { recursive: true });
  }
}

export class StorageService {
  static async upload(projectId: string, file: any, userId?: string) {
    const filename = `${nanoid()}-${file.originalname}`;
    let storagePath = "";
    if (config.STORAGE_TYPE === "s3") {
      storagePath = `${projectId}/${filename}`;
      await s3!.send(new PutObjectCommand({
        Bucket: config.S3_BUCKET!,
        Key: storagePath,
        Body: fs.createReadStream(file.path),
        ContentType: file.mimetype,
      }));
      fs.unlinkSync(file.path);
    } else {
      storagePath = path.join(config.STORAGE_LOCAL_PATH, filename);
      fs.renameSync(file.path, storagePath);
    }

    const [record] = await db.insert(storageFiles).values({
      projectId,
      filename,
      originalName: file.originalname,
      mimeType: file.mimetype,
      sizeBytes: file.size,
      storagePath,
      userId,
      isPublic: true
    }).returning();

    return { id: record.id, filename: record.filename, url: `/api/storage/${record.id}` };
  }

  static async getFileUrl(id: string) {
    const [record] = await db.select().from(storageFiles).where(eq(storageFiles.id, id));
    if (!record) throw new Error("File not found");
    if (config.STORAGE_TYPE === "s3") {
      const command = new GetObjectCommand({ Bucket: config.S3_BUCKET!, Key: record.storagePath });
      const url = await getSignedUrl(s3!, command, { expiresIn: 3600 });
      return { url, isRedirect: true };
    } else {
      return { path: record.storagePath, mimeType: record.mimeType, isRedirect: false };
    }
  }

  static async delete(id: string) {
    const [record] = await db.select().from(storageFiles).where(eq(storageFiles.id, id));
    if (!record) return;
    if (config.STORAGE_TYPE === "s3") {
      await s3!.send(new DeleteObjectCommand({ Bucket: config.S3_BUCKET!, Key: record.storagePath }));
    } else {
      if (fs.existsSync(record.storagePath)) {
        fs.unlinkSync(record.storagePath);
      }
    }
    await db.delete(storageFiles).where(eq(storageFiles.id, id));
  }
}
