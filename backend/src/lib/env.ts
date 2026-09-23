import { env } from 'process';
import {z} from 'zod';


const envSchema = z.object({
  NODE_ENV: z
    .enum(['development', 'production', 'test'])
    .default('development'),

  PORT: z
    .string()
    .default('3001')
    .transform((val) => parseInt(val, 10)),

  DATABASE_URL: z.string().url(),

  FRONTEND_URL: z.string().url(),

  IMAGEKIT_PUBLIC_KEY: z.string(),
  IMAGEKIT_PRIVATE_KEY: z.string(),
  IMAGEKIT_URL_ENDPOINT: z.string().url(),

  CLERK_API_KEY: z.string().optional(),
  CLERK_API_VERSION: z.string().optional(),
  CLERK_JWT_KEY: z.string().optional(),
  CLERK_WEBHOOK_SECRET: z.string().optional(),

  POLAR_API_BASE_URL: z.string().url().optional(),
  POLAR_API_KEY: z.string().optional(),
  POLAR_ACCESS_TOKEN: z.string().optional(),
  POLAR_WEBHOOK_SECRET: z.string().optional(),
});


export type Env = z.infer<typeof envSchema>;

export function loadEnv(): Env {
  const parsed = envSchema.safeParse(process.env);
  if (!parsed.success) {
    console.error('Invalid environment variables:', parsed.error.format());
    process.exit(1);
    throw new Error('Invalid environment variables');
  }
  else{
    return parsed.data
  }

} 


let cachedEnv: Env | null = null;

export function getEnv():Env {
  if (!cachedEnv) {
    cachedEnv = loadEnv();
  }
  return cachedEnv;
}