import { FastifyInstance } from 'fastify'
import { ZodTypeProvider } from 'fastify-type-provider-zod'
import { z } from 'zod'
import { InsuranceService } from './insurance.service'
import { CreateInsuranceSchema, UpdateInsuranceSchema, InsuranceResponseSchema } from './insurance.schema'

const svc = new InsuranceService()

export async function insuranceRoutes(fastify: FastifyInstance) {
  const f = fastify.withTypeProvider<ZodTypeProvider>()
  const auth = { preHandler: [fastify.authenticate] }

  f.get('/', {
    ...auth,
    schema: {
      tags: ['Insurance'],
      summary: 'List all insurance policies',
      security: [{ bearerAuth: [] }],
      response: { 200: z.array(InsuranceResponseSchema) },
    },
  }, async (request) => svc.findAll(request.user.id))

  f.get('/:id', {
    ...auth,
    schema: {
      tags: ['Insurance'],
      summary: 'Get insurance policy by ID',
      security: [{ bearerAuth: [] }],
      params: z.object({ id: z.string() }),
      response: { 200: InsuranceResponseSchema },
    },
  }, async (request) => svc.findById(request.params.id, request.user.id))

  f.post('/', {
    ...auth,
    schema: {
      tags: ['Insurance'],
      summary: 'Add a new insurance policy',
      security: [{ bearerAuth: [] }],
      body: CreateInsuranceSchema,
      response: { 201: InsuranceResponseSchema },
    },
  }, async (request, reply) => {
    const result = await svc.create(request.user.id, request.body)
    return reply.code(201).send(result)
  })

  f.patch('/:id', {
    ...auth,
    schema: {
      tags: ['Insurance'],
      summary: 'Update an insurance policy',
      security: [{ bearerAuth: [] }],
      params: z.object({ id: z.string() }),
      body: UpdateInsuranceSchema,
      response: { 200: InsuranceResponseSchema },
    },
  }, async (request) => svc.update(request.params.id, request.user.id, request.body))

  f.delete('/:id', {
    ...auth,
    schema: {
      tags: ['Insurance'],
      summary: 'Delete an insurance policy',
      security: [{ bearerAuth: [] }],
      params: z.object({ id: z.string() }),
      response: { 204: z.null() },
    },
  }, async (request, reply) => {
    await svc.delete(request.params.id, request.user.id)
    return reply.code(204).send()
  })
}
