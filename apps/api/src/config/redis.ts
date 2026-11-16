import Redis from 'ioredis'
import { config } from './env'

class RedisService {
  private static instance: RedisService
  private client: Redis | null = null
  private _isConnected = false

  private constructor() {}

  static getInstance(): RedisService {
    if (!RedisService.instance) {
      RedisService.instance = new RedisService()
    }
    return RedisService.instance
  }

  get isEnabled(): boolean {
    return !!config.get('REDIS_URL')
  }

  get redis(): Redis | null {
    return this.client
  }

  get isConnected(): boolean {
    return this._isConnected
  }

  async connect(): Promise<void> {
    const url = config.get('REDIS_URL')
    if (!url) {
      console.log('ℹ️  Redis not configured (REDIS_URL not set) — running without Redis')
      return
    }

    try {
      this.client = new Redis(url, {
        maxRetriesPerRequest: 3,
        retryStrategy: (times) => {
          if (times > 3) return null // stop retrying after 3 attempts
          return Math.min(times * 100, 3000)
        },
        lazyConnect: true,
        connectTimeout: 5000,
      })

      this.client.on('error', (err) => {
        if (this._isConnected) {
          console.error('Redis error:', err.message)
        }
        this._isConnected = false
      })

      this.client.on('connect', () => {
        this._isConnected = true
      })

      this.client.on('close', () => {
        this._isConnected = false
      })

      await this.client.connect()
      this._isConnected = true
      console.log('✅ Redis connected')
    } catch (err) {
      console.warn(`⚠️  Redis connection failed (${err instanceof Error ? err.message : 'Unknown error'}) — running without Redis`)
      this._isConnected = false
      if (this.client) {
        this.client.disconnect()
        this.client = null
      }
    }
  }

  async disconnect(): Promise<void> {
    if (this.client) {
      try {
        await this.client.quit()
      } catch {
        // ignore disconnect errors
      }
      this.client = null
      this._isConnected = false
      console.log('Redis disconnected')
    }
  }

  async healthCheck(): Promise<{ ok: boolean; latencyMs?: number; error?: string }> {
    if (!this.client || !this._isConnected) {
      return { ok: false, error: 'Not connected' }
    }
    try {
      const t0 = Date.now()
      await this.client.ping()
      return { ok: true, latencyMs: Date.now() - t0 }
    } catch (err) {
      return { ok: false, error: err instanceof Error ? err.message : 'Unknown error' }
    }
  }
}

export default RedisService
