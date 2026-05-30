import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";

const url = process.env.UPSTASH_REDIS_REST_KV_REST_API_URL;
const token = process.env.UPSTASH_REDIS_REST_KV_REST_API_TOKEN;

// Only enable rate limiting when Upstash credentials are configured.
// Local dev without credentials runs unthrottled.
export const ratelimit =
  url && token
    ? new Ratelimit({
        redis: new Redis({ url, token }),
        limiter: Ratelimit.slidingWindow(5, "60 s"),
        analytics: true,
        prefix: "termref/generate",
      })
    : null;

export function getClientIp(request: Request): string {
  const forwarded = request.headers.get("x-forwarded-for");
  if (forwarded) return forwarded.split(",")[0].trim();
  return request.headers.get("x-real-ip") ?? "anonymous";
}
