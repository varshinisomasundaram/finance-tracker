/// <reference path="./types/fastify.d.ts" />
import Fastify, { FastifyInstance } from 'fastify'
import multipart from '@fastify/multipart'
import { z } from 'zod'
import { config } from './config/env'
import DatabaseService from './config/database'
import RedisService from './config/redis'
import { swaggerPlugin } from './plugins/swagger'
import { jwtPlugin } from './plugins/jwt'
import { corsPlugin } from './plugins/cors'
import { errorHandler } from './middleware/errorHandler'

// Route modules
import { authRoutes } from './modules/auth/auth.routes'
import { userRoutes } from './modules/users/users.routes'
import { accountRoutes } from './modules/accounts/accounts.routes'
import { assetRoutes } from './modules/assets/assets.routes'
import { liabilityRoutes } from './modules/liabilities/liabilities.routes'
import { transactionRoutes } from './modules/transactions/transactions.routes'
import { categoryRoutes } from './modules/categories/categories.routes'
import { networthRoutes } from './modules/networth/networth.routes'
import { insuranceRoutes } from './modules/insurance/insurance.routes'
import { goalRoutes } from './modules/goals/goals.routes'
import { budgetRoutes } from './modules/budgets/budgets.routes'
import { contactRoutes } from './modules/contact/contact.routes'
import { reviewRoutes } from './modules/reviews/reviews.routes'
import { importRoutes } from './modules/import/import.routes'
import { analyticsRoutes } from './modules/analytics/analytics.routes'

const ServiceStatusSchema = z.object({
  status: z.string(),
  latencyMs: z.number().optional(),
  error: z.string().optional(),
})

const HealthResponseSchema = z.object({
  status: z.string(),
  timestamp: z.string(),
  uptime: z.number(),
  version: z.string(),
  environment: z.string(),
  database: ServiceStatusSchema,
  redis: ServiceStatusSchema,
})

export async function buildApp(): Promise<FastifyInstance> {
  const fastify = Fastify({
    logger: {
      level: config.get('LOG_LEVEL'),
      transport: config.isDevelopment
        ? { target: 'pino-pretty', options: { colorize: true, translateTime: 'SYS:standard', ignore: 'pid,hostname' } }
        : undefined,
    },
    ajv: {
      customOptions: {
        strict: 'log',
        keywords: ['kind', 'modifier'],
      },
    },
  })

  // Register plugins
  await fastify.register(swaggerPlugin)
  await fastify.register(corsPlugin)
  await fastify.register(jwtPlugin)
  await fastify.register(multipart, { limits: { fileSize: 10 * 1024 * 1024 } })

  // Global error handler
  fastify.setErrorHandler(errorHandler)

  // Health check
  fastify.get(
    '/health',
    {
      schema: {
        tags: ['Health'],
        summary: 'Health check — server + database + redis status',
        response: {
          200: HealthResponseSchema,
          503: HealthResponseSchema,
        },
      },
    },
    async (_request, reply) => {
      const dbService = DatabaseService.getInstance()
      const redisService = RedisService.getInstance()

      const t0 = Date.now()
      const dbOk = await dbService.healthCheck()
      const dbLatencyMs = Date.now() - t0

      const redisResult = await redisService.healthCheck()

      const allOk = dbOk

      const body = {
        status: allOk ? 'ok' : 'degraded',
        timestamp: new Date().toISOString(),
        uptime: Math.floor(process.uptime()),
        version: process.env.npm_package_version ?? '1.0.0',
        environment: config.get('NODE_ENV'),
        database: dbOk
          ? { status: 'connected', latencyMs: dbLatencyMs }
          : { status: 'unreachable', error: 'Database ping failed' },
        redis: redisService.isEnabled
          ? redisResult.ok
            ? { status: 'connected', latencyMs: redisResult.latencyMs }
            : { status: 'unreachable', error: redisResult.error }
          : { status: 'disabled' },
      }

      return reply.code(allOk ? 200 : 503).send(body)
    },
  )

  // API routes under /api prefix
  await fastify.register(
    async (api) => {
      await api.register(authRoutes, { prefix: '/auth' })
      await api.register(userRoutes, { prefix: '/users' })
      await api.register(accountRoutes, { prefix: '/accounts' })
      await api.register(assetRoutes, { prefix: '/assets' })
      await api.register(liabilityRoutes, { prefix: '/liabilities' })
      await api.register(transactionRoutes, { prefix: '/transactions' })
      await api.register(categoryRoutes, { prefix: '/categories' })
      await api.register(networthRoutes, { prefix: '/networth' })
      await api.register(insuranceRoutes, { prefix: '/insurance' })
      await api.register(goalRoutes, { prefix: '/goals' })
      await api.register(budgetRoutes, { prefix: '/budgets' })
      await api.register(contactRoutes, { prefix: '/contact' })
      await api.register(reviewRoutes, { prefix: '/reviews' })
      await api.register(importRoutes, { prefix: '/import' })
      await api.register(analyticsRoutes, { prefix: '/analytics' })
    },
    { prefix: '/api' },
  )

  return fastify
}
