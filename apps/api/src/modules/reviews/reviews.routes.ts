import { FastifyInstance } from 'fastify'
import {
  CreateReviewSchema,
  VoteSchema,
  ReviewListResponseSchema,
  ReviewResponseSchema,
} from './reviews.schema'
import { reviewsService } from './reviews.service'

export async function reviewRoutes(fastify: FastifyInstance) {
  // GET /api/reviews — public, returns approved reviews only
  fastify.get(
    '/',
    {
      schema: {
        tags: ['Reviews'],
        summary: 'Get all approved reviews',
        response: { 200: ReviewListResponseSchema },
      },
    },
    async (_req, reply) => {
      const reviews = await reviewsService.getApproved()
      return reply.send({ reviews })
    },
  )

  // POST /api/reviews — public; auto-approved if JWT present
  fastify.post(
    '/',
    {
      schema: {
        tags: ['Reviews'],
        summary: 'Submit a review',
        body: CreateReviewSchema,
        response: { 201: ReviewResponseSchema },
      },
    },
    async (request, reply) => {
      const body = request.body as import('./reviews.schema').CreateReviewDto

      let userId: string | undefined
      try {
        await request.jwtVerify()
        userId = (request.user as { id: string }).id
      } catch {
        userId = undefined
      }

      const review = await reviewsService.submit(body, userId)
      return reply.code(201).send(review)
    },
  )

  // POST /api/reviews/:id/vote — public, increments helpful/not-helpful count
  fastify.post(
    '/:id/vote',
    {
      schema: {
        tags: ['Reviews'],
        summary: 'Vote a review as helpful or not helpful',
        body: VoteSchema,
        response: { 200: ReviewResponseSchema },
      },
    },
    async (request, reply) => {
      const { id } = request.params as { id: string }
      const body = request.body as import('./reviews.schema').VoteDto
      const review = await reviewsService.vote(id, body)
      return reply.send(review)
    },
  )
}
