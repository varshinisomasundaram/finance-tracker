import { FastifyInstance } from 'fastify'
import { ZodTypeProvider } from 'fastify-type-provider-zod'
import { z } from 'zod'
import { CategoriesService } from './categories.service'
import { CreateCategorySchema, UpdateCategorySchema, CategoryResponseSchema } from './categories.schema'

const svc = new CategoriesService()

export async function categoryRoutes(fastify: FastifyInstance) {
  const f = fastify.withTypeProvider<ZodTypeProvider>()
  const auth = { preHandler: [fastify.authenticate] }

  f.get('/', {
    ...auth,
    schema: {
      tags: ['Categories'],
      summary: 'List all categories (system + user)',
      security: [{ bearerAuth: [] }],
      response: { 200: z.array(CategoryResponseSchema) },
    },
  }, async (request) => svc.findAll(request.user.id))

  f.post('/', {
    ...auth,
    schema: {
      tags: ['Categories'],
      summary: 'Create a custom category',
      security: [{ bearerAuth: [] }],
      body: CreateCategorySchema,
      response: { 201: CategoryResponseSchema },
    },
  }, async (request, reply) => {
    const cat = await svc.create(request.user.id, request.body)
    return reply.code(201).send(cat)
  })

  f.patch('/:id', {
    ...auth,
    schema: {
      tags: ['Categories'],
      summary: 'Update a custom category',
      security: [{ bearerAuth: [] }],
      params: z.object({ id: z.string() }),
      body: UpdateCategorySchema,
      response: { 200: CategoryResponseSchema },
    },
  }, async (request) => svc.update(request.params.id, request.user.id, request.body))

  f.delete('/:id', {
    ...auth,
    schema: {
      tags: ['Categories'],
      summary: 'Delete a custom category',
      security: [{ bearerAuth: [] }],
      params: z.object({ id: z.string() }),
      response: { 204: z.null() },
    },
  }, async (request, reply) => {
    await svc.delete(request.params.id, request.user.id)
    return reply.code(204).send()
  })
}
