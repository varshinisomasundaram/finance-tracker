import { FastifyInstance } from 'fastify'
import { ZodTypeProvider } from 'fastify-type-provider-zod'
import { z } from 'zod'
import { GoalsService } from './goals.service'
import { CreateGoalSchema, UpdateGoalSchema, GoalResponseSchema } from './goals.schema'

const svc = new GoalsService()

export async function goalRoutes(fastify: FastifyInstance) {
  const f = fastify.withTypeProvider<ZodTypeProvider>()
  const auth = { preHandler: [fastify.authenticate] }

  f.get('/', {
    ...auth,
    schema: {
      tags: ['Goals'],
      summary: 'List all goals',
      security: [{ bearerAuth: [] }],
      response: { 200: z.array(GoalResponseSchema) },
    },
  }, async (request) => svc.findAll(request.user.id))

  f.post('/', {
    ...auth,
    schema: {
      tags: ['Goals'],
      summary: 'Create a goal',
      security: [{ bearerAuth: [] }],
      body: CreateGoalSchema,
      response: { 201: GoalResponseSchema },
    },
  }, async (request, reply) => {
    const goal = await svc.create(request.user.id, request.body)
    return reply.code(201).send(goal)
  })

  f.patch('/:id', {
    ...auth,
    schema: {
      tags: ['Goals'],
      summary: 'Update a goal',
      security: [{ bearerAuth: [] }],
      params: z.object({ id: z.string() }),
      body: UpdateGoalSchema,
      response: { 200: GoalResponseSchema },
    },
  }, async (request) => svc.update(request.params.id, request.user.id, request.body))

  f.delete('/:id', {
    ...auth,
    schema: {
      tags: ['Goals'],
      summary: 'Delete a goal',
      security: [{ bearerAuth: [] }],
      params: z.object({ id: z.string() }),
      response: { 204: z.null() },
    },
  }, async (request, reply) => {
    await svc.delete(request.params.id, request.user.id)
    return reply.code(204).send()
  })
}
