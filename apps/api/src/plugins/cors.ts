import { FastifyInstance } from 'fastify'
import fastifyCors from '@fastify/cors'
import fp from 'fastify-plugin'
import { config } from '../config/env'

// fp() ensures CORS hooks are registered on the root instance and apply to all routes
export const corsPlugin = fp(async function plugin(fastify: FastifyInstance) {
  await fastify.register(fastifyCors, {
    origin: config.get('CORS_ORIGIN'),
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true,
  })
})
