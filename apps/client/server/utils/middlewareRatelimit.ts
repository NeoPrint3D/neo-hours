export interface RateLimitOptions {
  namespace: string;
  strategy?: "ip" | "user";
  limit: number;
  duration: number;
}

const defaultOptions: RateLimitOptions = {
  namespace: "rate-limit",
  strategy: "ip",
  limit: 10,
  duration: 60,
};

export const middlewareRateLimit = (
  options: RateLimitOptions = defaultOptions,
) => {
  return defineEventHandler(async (event) => {
    // append a cookie with a unique identifier to the response

    const { namespace, strategy, limit, duration } = options;
    const id = event.context.user?.id;
    const ip = getRequestIP(event) || getIp(event.node.req);

    const rateLimitIdCookie = getCookie(event, "rate-limit-unique-id");

    let uniqueId = rateLimitIdCookie;

    if (!uniqueId) {
      const newUniqueId = createId();
      uniqueId = newUniqueId;
      setCookie(event, "rate-limit-unique-id", newUniqueId, {
        httpOnly: false,
        maxAge: duration,
      });
    }

    const key = `${namespace}:${strategy === "ip" ? ip || uniqueId : id || uniqueId}`;
    const kv = hubKV();

    const count = parseInt((await kv.get(key)) || "0", 10);
    const resetAt = parseInt((await kv.get(`${key}:reset`)) || "0", 10);
    const now = Math.floor(Date.now() / 1000);

    if (resetAt < now) {
      await kv.set(key, "1", { expirationTtl: duration });
      await kv.set(`${key}:reset`, (now + duration).toString());
    } else if (count >= limit) {
      const retryAfter = resetAt - now;
      throw createError({
        statusCode: 429,
        statusMessage: "Rate limit exceeded",
        message: `Rate limit exceeded. Please try again in ${retryAfter} seconds`,
      });
    } else {
      await kv.set(key, (count + 1).toString(), { expirationTtl: duration });
    }
  });
};
