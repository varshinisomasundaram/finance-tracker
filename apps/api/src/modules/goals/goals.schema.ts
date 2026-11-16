import { z } from 'zod'

export const GoalTypeEnum = z.enum([
  'SAVINGS', 'DEBT_PAYOFF', 'INVESTMENT', 'EMERGENCY_FUND', 'PURCHASE', 'OTHER',
])

export const GoalStatusEnum = z.enum(['ACTIVE', 'COMPLETED', 'PAUSED', 'CANCELLED'])

export const CreateGoalSchema = z.object({
  name: z.string().min(1).max(100),
  type: GoalTypeEnum,
  targetAmount: z.number().min(0),
  currentAmount: z.number().min(0).default(0),
  targetDate: z.string().datetime().optional(),
  status: GoalStatusEnum.default('ACTIVE'),
  color: z.string().optional(),
  notes: z.string().max(500).optional(),
})

export const UpdateGoalSchema = CreateGoalSchema.partial()

export const GoalResponseSchema = z.object({
  id: z.string(),
  userId: z.string(),
  name: z.string(),
  type: GoalTypeEnum,
  targetAmount: z.number(),
  currentAmount: z.number(),
  progressPercent: z.number(),
  targetDate: z.string().nullable(),
  status: GoalStatusEnum,
  color: z.string().nullable(),
  notes: z.string().nullable(),
  createdAt: z.string(),
  updatedAt: z.string(),
})

export type CreateGoalDto = z.infer<typeof CreateGoalSchema>
export type UpdateGoalDto = z.infer<typeof UpdateGoalSchema>
export type GoalResponse = z.infer<typeof GoalResponseSchema>
