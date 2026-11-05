import "dotenv/config";
import { z } from "zod";

const schema = z.object({
  PORT: z.coerce.number().default(5000),
  MONGODB_URI: z.string().min(1),
  DB_NAME: z.string().default("orchestr8"),
  NODE_ENV: z.enum(["development", "test", "production"])
    .default("development")
});

export const env = schema.parse(process.env);
