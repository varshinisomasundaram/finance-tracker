import { FastifyInstance } from 'fastify'
import { ZodTypeProvider } from 'fastify-type-provider-zod'
import { z } from 'zod'
import { AuthService } from './auth.service'
import {
  RegisterSchema,
  LoginSchema,
  RefreshTokenSchema,
  TokenResponseSchema,
  AccessTokenResponseSchema,
} from './auth.schema'
import { loginLimiter, registerLimiter } from '../../middleware/rateLimiter'

const authService = new AuthService()

export async function authRoutes(fastify: FastifyInstance) {
  const f = fastify.withTypeProvider<ZodTypeProvider>()

  f.post('/register', {
    schema: {
      tags: ['Auth'],
      summary: 'Register a new user',
      body: RegisterSchema,
      response: {
        201: TokenResponseSchema,
        409: z.object({ statusCode: z.number(), error: z.string(), message: z.string() }),
      },
    },
    preHandler: [registerLimiter],
  }, async (request, reply) => {
    const result = await authService.register(request.body, fastify)
    return reply.code(201).send(result)
  })

  f.post('/login', {
    schema: {
      tags: ['Auth'],
      summary: 'Login with email and password',
      body: LoginSchema,
      response: {
        200: TokenResponseSchema,
        401: z.object({ statusCode: z.number(), error: z.string(), message: z.string() }),
      },
    },
    preHandler: [loginLimiter],
  }, async (request, reply) => {
    const result = await authService.login(request.body, fastify)
    return reply.send(result)
  })

  f.post('/refresh', {
    schema: {
      tags: ['Auth'],
      summary: 'Get a new access token using a refresh token',
      body: RefreshTokenSchema,
      response: {
        200: AccessTokenResponseSchema,
        401: z.object({ statusCode: z.number(), error: z.string(), message: z.string() }),
      },
    },
  }, async (request, reply) => {
    const result = await authService.refresh(request.body.refreshToken, fastify)
    return reply.send(result)
  })

  f.delete('/logout', {
    schema: {
      tags: ['Auth'],
      summary: 'Logout — invalidate refresh token',
      body: RefreshTokenSchema,
      response: {
        204: z.null(),
      },
    },
  }, async (request, reply) => {
    await authService.logout(request.body.refreshToken)
    return reply.code(204).send()
  })

  f.delete('/logout-all', {
    schema: {
      tags: ['Auth'],
      summary: 'Logout from all devices',
      security: [{ bearerAuth: [] }],
      response: {
        204: z.null(),
      },
    },
    preHandler: [fastify.authenticate],
  }, async (request, reply) => {
    await authService.logoutAll(request.user.id)
    return reply.code(204).send()
  })
}
