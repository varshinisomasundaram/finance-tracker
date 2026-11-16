import { FastifyInstance } from 'fastify'
import { ZodTypeProvider } from 'fastify-type-provider-zod'
import { z } from 'zod'
import { UsersService } from './users.service'
import { UpdateUserSchema, ChangePasswordSchema, UserResponseSchema } from './users.schema'

const usersService = new UsersService()

export async function userRoutes(fastify: FastifyInstance) {
  const f = fastify.withTypeProvider<ZodTypeProvider>()
  const auth = { preHandler: [fastify.authenticate] }

  f.get('/me', {
    ...auth,
    schema: {
      tags: ['Users'],
      summary: 'Get current user profile',
      security: [{ bearerAuth: [] }],
      response: { 200: UserResponseSchema },
    },
  }, async (request) => {
    return usersService.getMe(request.user.id)
  })

  f.patch('/me', {
    ...auth,
    schema: {
      tags: ['Users'],
      summary: 'Update current user profile',
      security: [{ bearerAuth: [] }],
      body: UpdateUserSchema,
      response: { 200: UserResponseSchema },
    },
  }, async (request) => {
    return usersService.update(request.user.id, request.body)
  })

  f.post('/me/change-password', {
    ...auth,
    schema: {
      tags: ['Users'],
      summary: 'Change password',
      security: [{ bearerAuth: [] }],
      body: ChangePasswordSchema,
      response: { 204: z.null() },
    },
  }, async (request, reply) => {
    await usersService.changePassword(request.user.id, request.body)
    return reply.code(204).send()
  })

  f.delete('/me', {
    ...auth,
    schema: {
      tags: ['Users'],
      summary: 'Delete account permanently',
      security: [{ bearerAuth: [] }],
      response: { 204: z.null() },
    },
  }, async (request, reply) => {
    await usersService.deleteAccount(request.user.id)
    return reply.code(204).send()
  })
}
