import { FastifyInstance } from 'fastify'
import { ZodTypeProvider } from 'fastify-type-provider-zod'
import { NetWorthService } from './networth.service'
import {
  NetWorthCurrentResponseSchema,
  NetWorthHistoryResponseSchema,
  NetWorthSnapshotResponseSchema,
} from './networth.schema'

const svc = new NetWorthService()

export async function networthRoutes(fastify: FastifyInstance) {
  const f = fastify.withTypeProvider<ZodTypeProvider>()
  const auth = { preHandler: [fastify.authenticate] }

  f.get('/current', {
    ...auth,
    schema: {
      tags: ['Net Worth'],
      summary: 'Get current net worth with asset/liability breakdown',
      security: [{ bearerAuth: [] }],
      response: { 200: NetWorthCurrentResponseSchema },
    },
  }, async (request) => svc.getCurrent(request.user.id))

  f.get('/history', {
    ...auth,
    schema: {
      tags: ['Net Worth'],
      summary: 'Get net worth history (snapshots) with trend',
      security: [{ bearerAuth: [] }],
      response: { 200: NetWorthHistoryResponseSchema },
    },
  }, async (request) => svc.getHistory(request.user.id))

  f.post('/snapshot', {
    ...auth,
    schema: {
      tags: ['Net Worth'],
      summary: 'Take a new net worth snapshot',
      security: [{ bearerAuth: [] }],
      response: { 201: NetWorthSnapshotResponseSchema },
    },
  }, async (request, reply) => {
    const snapshot = await svc.takeSnapshot(request.user.id)
    return reply.code(201).send(snapshot)
  })
}
