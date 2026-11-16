import { FastifyInstance, FastifyReply, FastifyRequest } from 'fastify'
import fastifyJwt from '@fastify/jwt'
import fp from 'fastify-plugin'
import { config } from '../config/env'
import { UnauthorizedError } from '../utils/errors'

// fp() makes decorations escape encapsulation and attach to the root Fastify instance
export const jwtPlugin = fp(async function plugin(fastify: FastifyInstance) {
  await fastify.register(fastifyJwt, {
    secret: config.get('JWT_SECRET'),
    sign: {
      expiresIn: config.get('JWT_EXPIRES_IN'),
    },
  })

  fastify.decorate(
    'authenticate',
    async function (request: FastifyRequest, reply: FastifyReply) {
      try {
        await request.jwtVerify()
      } catch (err) {
        const error = new UnauthorizedError('Invalid or expired access token')
        reply.code(401).send({
          statusCode: 401,
          error: error.code,
          message: error.message,
        })
      }
    },
  )
})
