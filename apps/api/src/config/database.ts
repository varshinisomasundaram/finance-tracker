import { PrismaClient } from '@prisma/client'
import { config } from './env'

class DatabaseService {
  private static instance: DatabaseService
  private readonly client: PrismaClient

  private constructor() {
    this.client = new PrismaClient({
      log: config.isDevelopment
        ? [
            { emit: 'stdout', level: 'query' },
            { emit: 'stdout', level: 'error' },
            { emit: 'stdout', level: 'warn' },
          ]
        : [{ emit: 'stdout', level: 'error' }],
    })
  }

  static getInstance(): DatabaseService {
    if (!DatabaseService.instance) {
      DatabaseService.instance = new DatabaseService()
    }
    return DatabaseService.instance
  }

  get prisma(): PrismaClient {
    return this.client
  }

  async connect(): Promise<void> {
    await this.client.$connect()
  }

  async disconnect(): Promise<void> {
    await this.client.$disconnect()
  }

  async healthCheck(): Promise<boolean> {
    try {
      await this.client.$queryRaw`SELECT 1`
      return true
    } catch {
      return false
    }
  }
}

const dbService = DatabaseService.getInstance()
export const db = dbService.prisma
export default DatabaseService
