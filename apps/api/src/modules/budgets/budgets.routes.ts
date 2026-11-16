import { FastifyInstance } from 'fastify'
import { ZodTypeProvider } from 'fastify-type-provider-zod'
import { z } from 'zod'
import { BudgetsService } from './budgets.service'
import { CreateBudgetSchema, UpdateBudgetSchema, BudgetResponseSchema } from './budgets.schema'

const svc = new BudgetsService()

export async function budgetRoutes(fastify: FastifyInstance) {
  const f = fastify.withTypeProvider<ZodTypeProvider>()
  const auth = { preHandler: [fastify.authenticate] }

  f.get('/', {
    ...auth,
    schema: {
      tags: ['Budgets'],
      summary: 'List all budgets',
      security: [{ bearerAuth: [] }],
      response: { 200: z.array(BudgetResponseSchema) },
    },
  }, async (request) => svc.findAll(request.user.id))

  f.post('/', {
    ...auth,
    schema: {
      tags: ['Budgets'],
      summary: 'Create a budget',
      security: [{ bearerAuth: [] }],
      body: CreateBudgetSchema,
      response: { 201: BudgetResponseSchema },
    },
  }, async (request, reply) => {
    const budget = await svc.create(request.user.id, request.body)
    return reply.code(201).send(budget)
  })

  f.patch('/:id', {
    ...auth,
    schema: {
      tags: ['Budgets'],
      summary: 'Update a budget',
      security: [{ bearerAuth: [] }],
      params: z.object({ id: z.string() }),
      body: UpdateBudgetSchema,
      response: { 200: BudgetResponseSchema },
    },
  }, async (request) => svc.update(request.params.id, request.user.id, request.body))

  f.delete('/:id', {
    ...auth,
    schema: {
      tags: ['Budgets'],
      summary: 'Delete a budget',
      security: [{ bearerAuth: [] }],
      params: z.object({ id: z.string() }),
      response: { 204: z.null() },
    },
  }, async (request, reply) => {
    await svc.delete(request.params.id, request.user.id)
    return reply.code(204).send()
  })
}
