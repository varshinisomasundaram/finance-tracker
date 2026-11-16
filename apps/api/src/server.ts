import { buildApp } from './app'
import { config } from './config/env'
import DatabaseService from './config/database'
import RedisService from './config/redis'

async function shutdown(): Promise<void> {
  await Promise.all([
    DatabaseService.getInstance().disconnect(),
    RedisService.getInstance().disconnect(),
  ])
}

async function start(): Promise<void> {
  const dbService = DatabaseService.getInstance()
  const redisService = RedisService.getInstance()

  try {
    await dbService.connect()
    console.log('✅ Database connected')

    await redisService.connect()

    const app = await buildApp()

    await app.listen({
      port: config.get('PORT'),
      host: '0.0.0.0',
    })

    console.log(`🚀 API running on http://localhost:${config.get('PORT')}`)
    console.log(`📖 Swagger docs at http://localhost:${config.get('PORT')}/docs`)
  } catch (err) {
    console.error('❌ Failed to start server:', err)
    await shutdown()
    process.exit(1)
  }
}

process.on('SIGTERM', async () => {
  console.log('SIGTERM received, shutting down gracefully...')
  await shutdown()
  process.exit(0)
})

process.on('SIGINT', async () => {
  console.log('SIGINT received, shutting down gracefully...')
  await shutdown()
  process.exit(0)
})

start()
