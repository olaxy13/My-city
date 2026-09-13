import dotenv from 'dotenv';
import { z } from 'zod';

dotenv.config();

const envSchema = z.object({
  PORT: z.string().default('4000').transform((v) => parseInt(v, 10)),
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  APP_URL: z.string().default('http://localhost:4000'),
  FRONTEND_URL: z.string().default('http://localhost:3000'),
  ALLOWED_ORIGINS: z
    .string()
    .default('http://localhost:3000,http://localhost:3001,http://localhost:5173')
    .transform((val) => val.split(',').map((origin) => origin.trim())),
  DATABASE_URL: z.string().min(1, 'DATABASE_URL is required'),
  JWT_SECRET: z.string().default('super-secret-city-discovery-jwt-key'),
  JWT_EXPIRES_IN: z.string().default('7d'),
  RESEND_API_KEY: z.string().default('re_placeholder_key'),
  EMAIL_FROM: z.string().default('City Discovery <notifications@resend.dev>'),
  CLOUDINARY_CLOUD_NAME: z.string().default('demo'),
  CLOUDINARY_API_KEY: z.string().default('123456789'),
  CLOUDINARY_API_SECRET: z.string().default('secret'),
  CLOUDINARY_FOLDER: z.string().default('city-discovery'),
});

const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
  console.error('❌ Invalid environment variables:', parsed.error.format());
  throw new Error('Invalid environment configuration');
}

export const env = parsed.data;
