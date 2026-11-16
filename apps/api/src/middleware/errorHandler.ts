import { FastifyError, FastifyReply, FastifyRequest } from 'fastify'
import { ZodError } from 'zod'
import { AppError } from '../utils/errors'

export function errorHandler(
  error: FastifyError | Error,
  request: FastifyRequest,
  reply: FastifyReply,
): void {
  // Known application errors
  if (error instanceof AppError) {
    reply.code(error.statusCode).send({
      statusCode: error.statusCode,
      error: error.code,
      message: error.message,
    })
    return
  }

  // Zod validation errors (from explicit zod.parse calls)
  if (error instanceof ZodError) {
    reply.code(422).send({
      statusCode: 422,
      error: 'VALIDATION_ERROR',
      message: 'Validation failed',
      details: error.errors.map((e) => ({
        path: e.path.join('.'),
        message: e.message,
      })),
    })
    return
  }

  // Fastify validation errors (from route schema)
  if ('validation' in error && error.validation) {
    reply.code(422).send({
      statusCode: 422,
      error: 'VALIDATION_ERROR',
      message: error.message,
    })
    return
  }

  // JWT errors
  if (error.name === 'JsonWebTokenError' || error.name === 'TokenExpiredError') {
    reply.code(401).send({
      statusCode: 401,
      error: 'UNAUTHORIZED',
      message: 'Invalid or expired token',
    })
    return
  }

  // Prisma errors
  if (error.constructor.name.startsWith('Prisma')) {
    request.log.error({ err: error }, 'Database error')
    reply.code(500).send({
      statusCode: 500,
      error: 'DATABASE_ERROR',
      message: 'A database error occurred',
    })
    return
  }

  // Unhandled errors
  request.log.error({ err: error }, 'Unhandled error')
  reply.code(500).send({
    statusCode: 500,
    error: 'INTERNAL_SERVER_ERROR',
    message: 'An unexpected error occurred',
  })
}
