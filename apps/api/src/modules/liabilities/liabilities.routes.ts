import { FastifyInstance } from 'fastify'
import { ZodTypeProvider } from 'fastify-type-provider-zod'
import { z } from 'zod'
import { LiabilitiesService } from './liabilities.service'
import {
  CreateLiabilitySchema,
  UpdateLiabilitySchema,
  LiabilityResponseSchema,
} from './liabilities.schema'

const svc = new LiabilitiesService()

export async function liabilityRoutes(fastify: FastifyInstance) {
  const f = fastify.withTypeProvider<ZodTypeProvider>()
  const auth = { preHandler: [fastify.authenticate] }

  f.get('/', {
    ...auth,
    schema: {
      tags: ['Liabilities'],
      summary: 'List all liabilities',
      security: [{ bearerAuth: [] }],
      response: { 200: z.array(LiabilityResponseSchema) },
    },
  }, async (request) => svc.findAll(request.user.id))

  f.get('/:id', {
    ...auth,
    schema: {
      tags: ['Liabilities'],
      summary: 'Get liability by ID',
      security: [{ bearerAuth: [] }],
      params: z.object({ id: z.string() }),
      response: { 200: LiabilityResponseSchema },
    },
  }, async (request) => svc.findById(request.params.id, request.user.id))

  f.post('/', {
    ...auth,
    schema: {
      tags: ['Liabilities'],
      summary: 'Create a new liability',
      security: [{ bearerAuth: [] }],
      body: CreateLiabilitySchema,
      response: { 201: LiabilityResponseSchema },
    },
  }, async (request, reply) => {
    const liability = await svc.create(request.user.id, request.body)
    return reply.code(201).send(liability)
  })

  f.patch('/:id', {
    ...auth,
    schema: {
      tags: ['Liabilities'],
      summary: 'Update a liability',
      security: [{ bearerAuth: [] }],
      params: z.object({ id: z.string() }),
      body: UpdateLiabilitySchema,
      response: { 200: LiabilityResponseSchema },
    },
  }, async (request) => svc.update(request.params.id, request.user.id, request.body))

  f.delete('/:id', {
    ...auth,
    schema: {
      tags: ['Liabilities'],
      summary: 'Delete a liability',
      security: [{ bearerAuth: [] }],
      params: z.object({ id: z.string() }),
      response: { 204: z.null() },
    },
  }, async (request, reply) => {
    await svc.delete(request.params.id, request.user.id)
    return reply.code(204).send()
  })
}
