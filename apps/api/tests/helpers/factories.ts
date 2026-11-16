import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'
import { buildApp } from '../../src/app'
import { FastifyInstance } from 'fastify'

export const prisma = new PrismaClient({
  datasources: { db: { url: process.env.DATABASE_URL } },
})

export async function createTestApp(): Promise<FastifyInstance> {
  const app = await buildApp()
  await app.ready()
  return app
}

export async function createTestUser(overrides: Partial<{
  email: string
  name: string
  password: string
}> = {}) {
  const passwordHash = await bcrypt.hash(overrides.password ?? 'Password1', 12)
  return prisma.user.create({
    data: {
      email: overrides.email ?? `test-${Date.now()}@example.com`,
      name: overrides.name ?? 'Test User',
      passwordHash,
      currency: 'USD',
    },
  })
}

export async function loginTestUser(
  app: FastifyInstance,
  email: string,
  password = 'Password1',
): Promise<{ accessToken: string; refreshToken: string }> {
  const response = await app.inject({
    method: 'POST',
    url: '/api/auth/login',
    payload: { email, password },
  })
  return JSON.parse(response.body)
}

export async function cleanDatabase() {
  const tables = [
    'refresh_tokens', 'import_sessions', 'networth_snapshots',
    'budgets', 'goals', 'transactions', 'categories', 'liabilities',
    'assets', 'accounts', 'users',
  ]
  for (const table of tables) {
    await prisma.$executeRawUnsafe(`DELETE FROM "${table}"`)
  }
}
