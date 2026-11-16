import { FastifyInstance } from 'fastify'
import fastifySwagger from '@fastify/swagger'
import fastifySwaggerUi from '@fastify/swagger-ui'
import fp from 'fastify-plugin'
import {
  jsonSchemaTransform,
  serializerCompiler,
  validatorCompiler,
} from 'fastify-type-provider-zod'

// fp() ensures validatorCompiler/serializerCompiler are set on the root instance
// so all route scopes use Zod for validation and serialization
export const swaggerPlugin = fp(async function plugin(fastify: FastifyInstance) {
  fastify.setValidatorCompiler(validatorCompiler)
  fastify.setSerializerCompiler(serializerCompiler)

  await fastify.register(fastifySwagger, {
    openapi: {
      openapi: '3.0.0',
      info: {
        title: 'Finance Tracker API',
        description:
          'Personal finance tracker — net worth, assets, liabilities, transactions and planning.',
        version: '1.0.0',
        contact: {
          name: 'Finance Tracker',
        },
      },
      servers: [{ url: 'http://localhost:3001', description: 'Development' }],
      components: {
        securitySchemes: {
          bearerAuth: {
            type: 'http',
            scheme: 'bearer',
            bearerFormat: 'JWT',
            description: 'Enter: Bearer <access_token>',
          },
        },
      },
      tags: [
        { name: 'Auth', description: 'Authentication & token management' },
        { name: 'Users', description: 'User profile' },
        { name: 'Accounts', description: 'Bank & investment accounts' },
        { name: 'Assets', description: 'Asset management' },
        { name: 'Liabilities', description: 'Debt & liability management' },
        { name: 'Transactions', description: 'Income & expense transactions' },
        { name: 'Categories', description: 'Transaction categories' },
        { name: 'Net Worth', description: 'Net worth snapshots & history' },
        { name: 'Health', description: 'Server health check' },
      ],
    },
    transform: jsonSchemaTransform,
  })

  // Use a single-segment routePrefix (/docs) to avoid a bug in @fastify/swagger-ui v4
  // where multi-segment prefixes (e.g. /api/docs) generate relative asset URLs that
  // resolve incorrectly in the browser (double prefix: /api/api/docs/static/…).
  await fastify.register(fastifySwaggerUi, {
    routePrefix: '/docs',
    uiConfig: {
      docExpansion: 'list',
      deepLinking: true,
      persistAuthorization: true,
    },
  })
})
