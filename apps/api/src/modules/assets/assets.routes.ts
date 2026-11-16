import { FastifyInstance } from 'fastify'
import { ZodTypeProvider } from 'fastify-type-provider-zod'
import { z } from 'zod'
import { AssetsService } from './assets.service'
import { CreateAssetSchema, UpdateAssetSchema, AssetResponseSchema } from './assets.schema'

const svc = new AssetsService()

export async function assetRoutes(fastify: FastifyInstance) {
  const f = fastify.withTypeProvider<ZodTypeProvider>()
  const auth = { preHandler: [fastify.authenticate] }

  f.get('/', {
    ...auth,
    schema: {
      tags: ['Assets'],
      summary: 'List all assets',
      security: [{ bearerAuth: [] }],
      response: { 200: z.array(AssetResponseSchema) },
    },
  }, async (request) => svc.findAll(request.user.id))

  f.get('/:id', {
    ...auth,
    schema: {
      tags: ['Assets'],
      summary: 'Get asset by ID',
      security: [{ bearerAuth: [] }],
      params: z.object({ id: z.string() }),
      response: { 200: AssetResponseSchema },
    },
  }, async (request) => svc.findById(request.params.id, request.user.id))

  f.post('/', {
    ...auth,
    schema: {
      tags: ['Assets'],
      summary: 'Create a new asset',
      security: [{ bearerAuth: [] }],
      body: CreateAssetSchema,
      response: { 201: AssetResponseSchema },
    },
  }, async (request, reply) => {
    const asset = await svc.create(request.user.id, request.body)
    return reply.code(201).send(asset)
  })

  f.patch('/:id', {
    ...auth,
    schema: {
      tags: ['Assets'],
      summary: 'Update an asset',
      security: [{ bearerAuth: [] }],
      params: z.object({ id: z.string() }),
      body: UpdateAssetSchema,
      response: { 200: AssetResponseSchema },
    },
  }, async (request) => svc.update(request.params.id, request.user.id, request.body))

  f.delete('/:id', {
    ...auth,
    schema: {
      tags: ['Assets'],
      summary: 'Delete an asset',
      security: [{ bearerAuth: [] }],
      params: z.object({ id: z.string() }),
      response: { 204: z.null() },
    },
  }, async (request, reply) => {
    await svc.delete(request.params.id, request.user.id)
    return reply.code(204).send()
  })
}
