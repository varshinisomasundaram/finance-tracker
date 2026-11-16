import { z } from 'zod'

export const CreateReviewSchema = z.object({
  name: z.string().min(2).max(100),
  role: z.string().min(2).max(150),
  rating: z.number().int().min(1).max(5),
  text: z.string().min(20).max(1000),
})

export const VoteSchema = z.object({
  type: z.enum(['UP', 'DOWN']),
})

export const ReviewResponseSchema = z.object({
  id: z.string(),
  name: z.string(),
  role: z.string(),
  rating: z.number(),
  text: z.string(),
  isApproved: z.boolean(),
  helpfulCount: z.number().default(0),
  notHelpfulCount: z.number().default(0),
  createdAt: z.string(),
})

export const ReviewListResponseSchema = z.object({
  reviews: z.array(ReviewResponseSchema),
})

export type CreateReviewDto = z.infer<typeof CreateReviewSchema>
export type VoteDto = z.infer<typeof VoteSchema>
