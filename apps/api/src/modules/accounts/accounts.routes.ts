import { FastifyInstance } from 'fastify'
import { ZodTypeProvider } from 'fastify-type-provider-zod'
import { z } from 'zod'
import { AccountsService } from './accounts.service'
import {
  CreateAccountSchema,
  UpdateAccountSchema,
  AccountResponseSchema,
} from './accounts.schema'

const svc = new AccountsService()

export async function accountRoutes(fastify: FastifyInstance) {
  const f = fastify.withTypeProvider<ZodTypeProvider>()
  const auth = { preHandler: [fastify.authenticate] }

  f.get('/', {
    ...auth,
    schema: {
      tags: ['Accounts'],
      summary: 'List all accounts',
      security: [{ bearerAuth: [] }],
      response: { 200: z.array(AccountResponseSchema) },
    },
  }, async (request) => svc.findAll(request.user.id))

  f.get('/:id', {
    ...auth,
    schema: {
      tags: ['Accounts'],
      summary: 'Get account by ID',
      security: [{ bearerAuth: [] }],
      params: z.object({ id: z.string() }),
      response: { 200: AccountResponseSchema },
    },
  }, async (request) => svc.findById(request.params.id, request.user.id))

  f.post('/', {
    ...auth,
    schema: {
      tags: ['Accounts'],
      summary: 'Create a new account',
      security: [{ bearerAuth: [] }],
      body: CreateAccountSchema,
      response: { 201: AccountResponseSchema },
    },
  }, async (request, reply) => {
    const account = await svc.create(request.user.id, request.body)
    return reply.code(201).send(account)
  })

  f.patch('/:id', {
    ...auth,
    schema: {
      tags: ['Accounts'],
      summary: 'Update an account',
      security: [{ bearerAuth: [] }],
      params: z.object({ id: z.string() }),
      body: UpdateAccountSchema,
      response: { 200: AccountResponseSchema },
    },
  }, async (request) => svc.update(request.params.id, request.user.id, request.body))

  f.delete('/:id', {
    ...auth,
    schema: {
      tags: ['Accounts'],
      summary: 'Delete an account',
      security: [{ bearerAuth: [] }],
      params: z.object({ id: z.string() }),
      response: { 204: z.null() },
    },
  }, async (request, reply) => {
    await svc.delete(request.params.id, request.user.id)
    return reply.code(204).send()
  })
}
