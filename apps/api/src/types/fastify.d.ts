import 'fastify'
import { FastifyRequest, FastifyReply } from 'fastify'

export interface JwtPayload {
  id: string
  email: string
  name: string
}

declare module 'fastify' {
  interface FastifyInstance {
    authenticate: (request: FastifyRequest, reply: FastifyReply) => Promise<void>
  }

  interface FastifyRequest {
    user: JwtPayload
  }
}

declare module '@fastify/jwt' {
  interface FastifyJWT {
    payload: JwtPayload
    user: JwtPayload
  }
}
