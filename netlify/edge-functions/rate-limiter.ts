import { Context } from '@netlify/edge-functions';

interface RateLimitConfig {
  limit: number;
  window: number; // seconds
  blockDuration: number; // minutes
  weight?: number; // request weight
}

const RATE_LIMITS: Record<string, RateLimitConfig> = {
  auth: {
    limit: 5,
    window: 60,
    blockDuration: 30,
    weight: 2
  },
  api: {
    limit: 100,
    window: 60,
    blockDuration: 15,
    weight: 1
  },
  static: {
    limit: 1000,
    window: 60,
    blockDuration: 5,
    weight: 0.1
  }
};

interface RateLimitInfo {
  tokens: number;
  lastRefill: number;
  blocked?: boolean;
  blockExpiry?: number;
  requestCount: number;
  firstRequest: number;
}

export default async (request: Request, context: Context) => {
  const clientIP = context.ip;
  const url = new URL(request.url);
  
  // Determine rate limit based on path and method
  const limitConfig = url.pathname.startsWith('/auth')
    ? RATE_LIMITS.auth
    : url.pathname.startsWith('/api')
      ? RATE_LIMITS.api
      : RATE_LIMITS.static;

  const cacheKey = `ratelimit:${clientIP}:${url.pathname}`;
  const blockKey = `ratelimit:block:${clientIP}`;

  // Check if IP is blocked
  const blockInfo: RateLimitInfo | null = context.store.get(blockKey);
  if (blockInfo?.blocked && blockInfo.blockExpiry && Date.now() < blockInfo.blockExpiry) {
    return new Response('Too Many Requests', {
      status: 429,
      headers: {
        'Retry-After': Math.ceil((blockInfo.blockExpiry - Date.now()) / 1000).toString(),
        'X-RateLimit-Reset': Math.ceil(blockInfo.blockExpiry / 1000).toString()
      }
    });
  }

  // Get current rate limit info
  let rateLimitInfo: RateLimitInfo = context.store.get(cacheKey) || {
    tokens: limitConfig.limit,
    lastRefill: Date.now(),
    requestCount: 0,
    firstRequest: Date.now()
  };

  // Token bucket algorithm
  const now = Date.now();
  const timePassed = (now - rateLimitInfo.lastRefill) / 1000;
  const tokensToAdd = timePassed * (limitConfig.limit / limitConfig.window);
  
  rateLimitInfo.tokens = Math.min(
    limitConfig.limit,
    rateLimitInfo.tokens + tokensToAdd
  );
  rateLimitInfo.lastRefill = now;

  // Sliding window counter
  if (now - rateLimitInfo.firstRequest > limitConfig.window * 1000) {
    rateLimitInfo.requestCount = 0;
    rateLimitInfo.firstRequest = now;
  }

  // Check if enough tokens and within sliding window
  const requestWeight = limitConfig.weight || 1;
  if (rateLimitInfo.tokens < requestWeight || 
      rateLimitInfo.requestCount >= limitConfig.limit) {
    // Block the IP
    const blockExpiry = now + (limitConfig.blockDuration * 60 * 1000);
    context.store.set(blockKey, {
      blocked: true,
      blockExpiry,
      tokens: 0,
      lastRefill: now,
      requestCount: rateLimitInfo.requestCount,
      firstRequest: rateLimitInfo.firstRequest
    }, limitConfig.blockDuration * 60);

    return new Response('Too Many Requests', {
      status: 429,
      headers: {
        'Retry-After': (limitConfig.blockDuration * 60).toString(),
        'X-RateLimit-Reset': Math.ceil(blockExpiry / 1000).toString()
      }
    });
  }

  // Consume token and increment request count
  rateLimitInfo.tokens -= requestWeight;
  rateLimitInfo.requestCount++;

  // Store updated info
  context.store.set(cacheKey, rateLimitInfo, limitConfig.window);

  // Add rate limit headers to response
  const response = await context.next();
  response.headers.set('X-RateLimit-Limit', limitConfig.limit.toString());
  response.headers.set('X-RateLimit-Remaining', Math.floor(rateLimitInfo.tokens).toString());
  response.headers.set('X-RateLimit-Reset', Math.ceil(rateLimitInfo.lastRefill / 1000 + limitConfig.window).toString());
  response.headers.set('X-RateLimit-Window', limitConfig.window.toString());

  return response;
}