import { z } from 'zod'
import dotenv from 'dotenv'

dotenv.config()

const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  PORT: z.string().default('3001').transform(Number),
  DATABASE_URL: z.string().min(1, 'DATABASE_URL is required'),
  JWT_SECRET: z.string().min(32, 'JWT_SECRET must be at least 32 characters'),
  JWT_REFRESH_SECRET: z.string().min(32, 'JWT_REFRESH_SECRET must be at least 32 characters'),
  JWT_EXPIRES_IN: z.string().default('15m'),
  JWT_REFRESH_EXPIRES_IN: z.string().default('7d'),
  CORS_ORIGIN: z.string().default('http://localhost:5173'),
  LOG_LEVEL: z
    .enum(['fatal', 'error', 'warn', 'info', 'debug', 'trace'])
    .default('info'),
  REDIS_URL: z.string().url().optional(),
  ANTHROPIC_API_KEY: z.string().optional(),
  // SMTP — optional. If omitted, contact form submissions are logged to console only.
  SMTP_HOST: z.string().optional(),
  SMTP_PORT: z.string().transform(Number).optional(),
  SMTP_USER: z.string().optional(),
  SMTP_PASS: z.string().optional(),
  SMTP_FROM: z.string().optional(),   // e.g. "FinanceTracker <no-reply@financetracker.app>"
  CONTACT_TO: z.string().optional(),  // company inbox that receives contact form emails
})

export type Env = z.infer<typeof envSchema>

class ConfigService {
  private static instance: ConfigService
  private readonly config: Env

  private constructor() {
    const result = envSchema.safeParse(process.env)
    if (!result.success) {
      console.error('❌ Invalid environment variables:')
      console.error(result.error.format())
      process.exit(1)
    }
    this.config = result.data
  }

  static getInstance(): ConfigService {
    if (!ConfigService.instance) {
      ConfigService.instance = new ConfigService()
    }
    return ConfigService.instance
  }

  get<K extends keyof Env>(key: K): Env[K] {
    return this.config[key]
  }

  getAll(): Env {
    return this.config
  }

  get isDevelopment(): boolean {
    return this.config.NODE_ENV === 'development'
  }

  get isProduction(): boolean {
    return this.config.NODE_ENV === 'production'
  }

  get isTest(): boolean {
    return this.config.NODE_ENV === 'test'
  }
}

export const config = ConfigService.getInstance()
export default ConfigService
