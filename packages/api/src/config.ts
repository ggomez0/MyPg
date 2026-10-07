import { z } from "zod";

const envSchema = z.object({
  INTERNAL_DATABASE_URL: z.string().default("postgresql://mypg:mypg_pass@localhost:5432/mypg_internal"),
  DATA_DATABASE_URL: z.string().default("postgresql://mypg:mypg_pass@localhost:5432/mypg_data"),
  JWT_SECRET: z.string().default("mypg_dev_super_secret_key_1234567890"),
  JWT_EXPIRES_IN: z.string().default("24h"),
  API_PORT: z.string().transform(Number).default("4000"),
  CORS_ORIGINS: z.string().default("http://localhost:3000"),
  STORAGE_TYPE: z.enum(["local", "s3"]).default("local"),
  STORAGE_LOCAL_PATH: z.string().default("./uploads"),
  S3_ENDPOINT: z.string().optional(),
  S3_ACCESS_KEY: z.string().optional(),
  S3_SECRET_KEY: z.string().optional(),
  S3_BUCKET: z.string().optional(),
  S3_REGION: z.string().optional(),
  POSTGRES_LOG_FILE: z.string().default("/var/log/postgres/postgres.log"),
});

const env = envSchema.parse(process.env);
export const config = env;
