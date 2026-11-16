import { FastifyInstance } from 'fastify'
import { ZodTypeProvider } from 'fastify-type-provider-zod'
import { z } from 'zod'
import { TransactionsService } from './transactions.service'
import {
  CreateTransactionSchema,
  UpdateTransactionSchema,
  TransactionFiltersSchema,
  TransactionResponseSchema,
  PaginatedTransactionsSchema,
} from './transactions.schema'

const svc = new TransactionsService()

export async function transactionRoutes(fastify: FastifyInstance) {
  const f = fastify.withTypeProvider<ZodTypeProvider>()
  const auth = { preHandler: [fastify.authenticate] }

  f.get('/', {
    ...auth,
    schema: {
      tags: ['Transactions'],
      summary: 'List transactions with filters and pagination',
      security: [{ bearerAuth: [] }],
      querystring: TransactionFiltersSchema,
      response: { 200: PaginatedTransactionsSchema },
    },
  }, async (request) => svc.findAll(request.user.id, request.query))

  f.get('/recent', {
    ...auth,
    schema: {
      tags: ['Transactions'],
      summary: 'Get recent transactions',
      security: [{ bearerAuth: [] }],
      querystring: z.object({ limit: z.string().optional().default('10').transform(Number) }),
      response: { 200: z.array(TransactionResponseSchema) },
    },
  }, async (request) => svc.getRecentTransactions(request.user.id, request.query.limit))

  f.get('/summary', {
    ...auth,
    schema: {
      tags: ['Transactions'],
      summary: 'Monthly income vs expense summary',
      security: [{ bearerAuth: [] }],
      querystring: z.object({
        year: z.string().transform(Number),
        month: z.string().transform(Number),
      }),
      response: {
        200: z.array(z.object({
          type: z.string(),
          total: z.number(),
          count: z.number(),
        })),
      },
    },
  }, async (request) => {
    return svc.getMonthlySummary(request.user.id, request.query.year, request.query.month)
  })

  f.get('/:id', {
    ...auth,
    schema: {
      tags: ['Transactions'],
      summary: 'Get transaction by ID',
      security: [{ bearerAuth: [] }],
      params: z.object({ id: z.string() }),
      response: { 200: TransactionResponseSchema },
    },
  }, async (request) => svc.findById(request.params.id, request.user.id))

  f.post('/', {
    ...auth,
    schema: {
      tags: ['Transactions'],
      summary: 'Create a new transaction',
      security: [{ bearerAuth: [] }],
      body: CreateTransactionSchema,
      response: { 201: TransactionResponseSchema },
    },
  }, async (request, reply) => {
    const tx = await svc.create(request.user.id, request.body)
    return reply.code(201).send(tx)
  })

  f.patch('/:id', {
    ...auth,
    schema: {
      tags: ['Transactions'],
      summary: 'Update a transaction',
      security: [{ bearerAuth: [] }],
      params: z.object({ id: z.string() }),
      body: UpdateTransactionSchema,
      response: { 200: TransactionResponseSchema },
    },
  }, async (request) => svc.update(request.params.id, request.user.id, request.body))

  f.delete('/:id', {
    ...auth,
    schema: {
      tags: ['Transactions'],
      summary: 'Delete a transaction',
      security: [{ bearerAuth: [] }],
      params: z.object({ id: z.string() }),
      response: { 204: z.null() },
    },
  }, async (request, reply) => {
    await svc.delete(request.params.id, request.user.id)
    return reply.code(204).send()
  })
}
