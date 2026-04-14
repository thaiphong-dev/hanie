import { createServerClient } from '@/lib/supabase/server';

interface RateLimitConfig {
  key: string;
  maxRequests: number;
  windowSeconds: number;
}

interface RateLimitResult {
  allowed: boolean;
  remaining: number;
  resetAt: number;
}

export async function checkRateLimit(config: RateLimitConfig): Promise<RateLimitResult> {
  const supabase = createServerClient();
  const windowStart = new Date(Date.now() - config.windowSeconds * 1000).toISOString();

  const { count } = await supabase
    .from('rate_limit_log')
    .select('*', { count: 'exact', head: true })
    .eq('key', config.key)
    .gte('created_at', windowStart);

  const requestCount = count ?? 0;
  const allowed = requestCount < config.maxRequests;

  if (allowed) {
    await supabase.from('rate_limit_log').insert({ key: config.key });
  }

  return {
    allowed,
    remaining: Math.max(0, config.maxRequests - requestCount - 1),
    resetAt: Date.now() + config.windowSeconds * 1000,
  };
}
