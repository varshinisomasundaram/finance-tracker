import { FastifyReply, FastifyRequest } from 'fastify'
import RedisService from '../config/redis'
import { CacheKeys } from '../utils/cache'

export interface RateLimitOptions {
  /** Key prefix to bucket by (e.g. 'login', 'register') */
  prefix: string
  /** Maximum requests allowed in the window */
  max: number
  /** Window size in seconds */
  windowSecs: number
}

/**
 * Creates a Fastify preHandler that applies an IP-based fixed-window rate limit.
 * Falls back to a lightweight in-memory counter when Redis is unavailable so the
 * app keeps running without Redis.
 */
export function rateLimiter(opts: RateLimitOptions) {
  const memoryStore = new Map<string, { count: number; expiresAt: number }>()

  return async (request: FastifyRequest, reply: FastifyReply): Promise<void> => {
    if (process.env.NODE_ENV === 'test') return

    const ip = request.ip ?? 'unknown'
    const key = CacheKeys.rateLimit(opts.prefix, ip)
    const now = Date.now()

    const redis = RedisService.getInstance().redis
    const redisReady = RedisService.getInstance().isConnected

    let current: number

    if (redisReady && redis) {
      // Atomic INCR + EXPIRE (only sets TTL on first request)
      const pipe = redis.pipeline()
      pipe.incr(key)
      pipe.expire(key, opts.windowSecs, 'NX')
      const results = await pipe.exec()
      current = (results?.[0]?.[1] as number) ?? 1
    } else {
      // In-memory fallback
      const entry = memoryStore.get(key)
      if (!entry || entry.expiresAt < now) {
        memoryStore.set(key, { count: 1, expiresAt: now + opts.windowSecs * 1000 })
        current = 1
      } else {
        entry.count += 1
        current = entry.count
      }
    }

    reply.header('X-RateLimit-Limit', opts.max)
    reply.header('X-RateLimit-Remaining', Math.max(0, opts.max - current))

    if (current > opts.max) {
      reply.header('Retry-After', opts.windowSecs)
      return reply.code(429).send({
        statusCode: 429,
        error: 'Too Many Requests',
        message: `Too many attempts. Try again in ${opts.windowSecs} seconds.`,
      })
    }
  }
}

/** Pre-built limiters for auth endpoints */
export const loginLimiter = rateLimiter({ prefix: 'login', max: 10, windowSecs: 60 })
export const registerLimiter = rateLimiter({ prefix: 'register', max: 5, windowSecs: 60 })
