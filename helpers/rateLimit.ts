import { NextRequest } from "next/server";
import { LIMITS } from "../lib/constants";



interface RateLimitEntry {
  count: number;
  windowStart: number;
}

const store = new Map<string, RateLimitEntry>();

export function getClientIp(req: NextRequest): string {
  // Use Next.js built-in property (most reliable in Vercel/Edge)
  const nativeIp = (req as any).ip;
  if (nativeIp) return nativeIp;

  // Fallback but with strict preference for the first address (client)
  const xForwardedFor = req.headers.get("x-forwarded-for");
  if (xForwardedFor) {
    const ips = xForwardedFor.split(",");
    return ips[0].trim();
  }

  return req.headers.get("x-real-ip") ?? "unknown";
}

export interface RateLimitResult {
  allowed: boolean;
  retryAfterMs: number;
  remaining: number;
}

export function checkRateLimit(ip: string): RateLimitResult {
  const now = Date.now();
  const entry = store.get(ip);

  // New window or expired window
  if (!entry || now - entry.windowStart > LIMITS.RATE_LIMIT_WINDOW_MS) {
    store.set(ip, { count: 1, windowStart: now });
    return {
      allowed: true,
      retryAfterMs: 0,
      remaining: LIMITS.RATE_LIMIT_MAX_REQUESTS - 1,
    };
  }

  // Window exists and limit hit
  if (entry.count >= LIMITS.RATE_LIMIT_MAX_REQUESTS) {
    const retryAfterMs =
      LIMITS.RATE_LIMIT_WINDOW_MS - (now - entry.windowStart);
    return { allowed: false, retryAfterMs, remaining: 0 };
  }

  // Window exists, still under limit
  entry.count++;
  return {
    allowed: true,
    retryAfterMs: 0,
    remaining: LIMITS.RATE_LIMIT_MAX_REQUESTS - entry.count,
  };
}