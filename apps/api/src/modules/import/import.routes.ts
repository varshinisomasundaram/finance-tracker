import { FastifyInstance } from 'fastify'
import '@fastify/multipart'
import {
  ConfirmImportSchema,
  ConfirmResponseSchema,
  PreviewResponseSchema,
} from './import.schema'
import { previewImport, confirmImport } from './import.service'

export async function importRoutes(fastify: FastifyInstance) {
  // POST /api/import/preview — multipart; accepts CSV or PDF file
  fastify.post(
    '/preview',
    {
      preHandler: [fastify.authenticate],
      schema: {
        tags: ['Import'],
        summary: 'Parse a CSV or PDF bank statement and return a preview of detected transactions',
        consumes: ['multipart/form-data'],
        response: { 200: PreviewResponseSchema },
      },
    },
    async (request, reply) => {
      const userId = (request.user as { id: string }).id

      let fileBuffer: Buffer | null = null
      let filename = 'upload'
      let password: string | undefined
      let bankHint: string | undefined

      const parts = request.parts()
      for await (const part of parts) {
        if (part.type === 'file') {
          filename = part.filename || 'upload'
          const chunks: Buffer[] = []
          for await (const chunk of part.file) {
            chunks.push(chunk)
          }
          fileBuffer = Buffer.concat(chunks)
        } else {
          if (part.fieldname === 'password') password = part.value as string
          if (part.fieldname === 'bankHint') bankHint = part.value as string
        }
      }

      if (!fileBuffer || fileBuffer.length === 0) {
        return reply.code(400).send({ error: 'No file uploaded' })
      }

      void bankHint // may be used for hints in future

      const result = await previewImport(userId, filename, fileBuffer, password)
      return reply.send(result)
    },
  )

  // POST /api/import/confirm — JSON; insert selected rows
  fastify.post(
    '/confirm',
    {
      preHandler: [fastify.authenticate],
      schema: {
        tags: ['Import'],
        summary: 'Insert selected rows from a previously previewed import session',
        body: ConfirmImportSchema,
        response: { 200: ConfirmResponseSchema },
      },
    },
    async (request, reply) => {
      const userId = (request.user as { id: string }).id
      const dto = request.body as import('./import.schema').ConfirmImportDto
      const result = await confirmImport(userId, dto)
      return reply.send(result)
    },
  )
}
