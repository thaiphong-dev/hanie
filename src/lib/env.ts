import { z } from 'zod';

const envSchema = z.object({
  NEXT_PUBLIC_SUPABASE_URL:      z.string().url(),
  NEXT_PUBLIC_SUPABASE_ANON_KEY: z.string().min(1),
  SUPABASE_SERVICE_ROLE_KEY:     z.string().min(1),
  JWT_SECRET:                    z.string().min(32),
  JWT_REFRESH_SECRET:            z.string().min(32),
  JWT_ACCESS_EXPIRES_IN:         z.string().default('15m'),
  JWT_REFRESH_EXPIRES_IN:        z.string().default('30d'),
  NEXT_PUBLIC_ZALO_OA_ID:        z.string().default(''),
  ZALO_OA_ACCESS_TOKEN:          z.string().default(''),
  NEXT_PUBLIC_APP_URL:           z.string().url(),
  NODE_ENV:                      z.enum(['development', 'test', 'production']),
});

const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
  console.error('❌ Missing environment variables:');
  console.error(parsed.error.flatten().fieldErrors);
  throw new Error('Invalid environment configuration — check .env.local');
}

export const env = parsed.data;
