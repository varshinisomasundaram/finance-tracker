import RedisService from '../config/redis'

// TTL constants (seconds)
export const CACHE_TTL = {
  SHORT: 60,           // 1 minute  — fast-changing data (networth current)
  MEDIUM: 300,         // 5 minutes — moderate (account list, balances)
  LONG: 900,           // 15 minutes — slow-changing (categories, asset/liability lists)
  SESSION: 1800,       // 30 minutes — user sessions
} as const

// Typed cache key builders — prevents typos and centralises key shapes
export const CacheKeys = {
  accounts: {
    list: (userId: string) => `accounts:${userId}:list`,
    balance: (userId: string) => `accounts:${userId}:balance`,
    single: (id: string) => `accounts:item:${id}`,
  },
  assets: {
    list: (userId: string) => `assets:${userId}:list`,
    value: (userId: string) => `assets:${userId}:value`,
  },
  liabilities: {
    list: (userId: string) => `liabilities:${userId}:list`,
    balance: (userId: string) => `liabilities:${userId}:balance`,
  },
  categories: {
    list: (userId: string) => `categories:${userId}:list`,
  },
  insurance: {
    list: (userId: string) => `insurance:${userId}:list`,
  },
  goals: {
    list: (userId: string) => `goals:${userId}:list`,
  },
  budgets: {
    list: (userId: string) => `budgets:${userId}:list`,
  },
  networth: {
    current: (userId: string) => `networth:${userId}:current`,
    history: (userId: string) => `networth:${userId}:history`,
  },
  reviews: {
    list: () => `reviews:approved:list`,
  },
  analytics: {
    pattern: (userId: string) => `analytics:${userId}:*`,
  },
  // Rate limiting keys
  rateLimit: (prefix: string, key: string) => `rl:${prefix}:${key}`,
} as const

class CacheService {
  private get redis() {
    return RedisService.getInstance().redis
  }

  get isEnabled(): boolean {
    return RedisService.getInstance().isConnected
  }

  async get<T>(key: string): Promise<T | null> {
    if (!this.isEnabled || !this.redis) return null
    try {
      const value = await this.redis.get(key)
      return value ? (JSON.parse(value) as T) : null
    } catch {
      return null
    }
  }

  async set(key: string, value: unknown, ttlSeconds: number): Promise<void> {
    if (!this.isEnabled || !this.redis) return
    try {
      await this.redis.set(key, JSON.stringify(value), 'EX', ttlSeconds)
    } catch {
      // Cache failures must never break the app
    }
  }

  async del(...keys: string[]): Promise<void> {
    if (!this.isEnabled || !this.redis) return
    try {
      await this.redis.del(...keys)
    } catch {
      // Ignore
    }
  }

  /** Delete all keys matching a glob pattern (uses SCAN to avoid blocking) */
  async delPattern(pattern: string): Promise<void> {
    if (!this.isEnabled || !this.redis) return
    try {
      let cursor = '0'
      do {
        const [next, keys] = await this.redis.scan(cursor, 'MATCH', pattern, 'COUNT', 100)
        cursor = next
        if (keys.length) await this.redis.del(...keys)
      } while (cursor !== '0')
    } catch {
      // Ignore
    }
  }

  /** Cache-aside helper: return cached value or fetch + cache it */
  async getOrSet<T>(key: string, ttlSeconds: number, fetcher: () => Promise<T>): Promise<T> {
    const cached = await this.get<T>(key)
    if (cached !== null) return cached

    const value = await fetcher()
    await this.set(key, value, ttlSeconds)
    return value
  }
}

export const cache = new CacheService()
