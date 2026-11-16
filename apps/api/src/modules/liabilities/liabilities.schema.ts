import { z } from 'zod'

export const LiabilityTypeEnum = z.enum([
  'MORTGAGE', 'CAR_LOAN', 'TWO_WHEELER_LOAN', 'GOLD_LOAN',
  'STUDENT_LOAN', 'PERSONAL_LOAN', 'INFORMAL_DEBT',
  'CREDIT_CARD', 'MEDICAL', 'OTHER',
])

export const CreateLiabilitySchema = z.object({
  name: z.string().min(1).max(100),
  type: LiabilityTypeEnum,
  balance: z.number().min(0),
  originalAmount: z.number().min(0).optional(),
  interestRate: z.number().min(0).max(100).optional(),
  minimumPayment: z.number().min(0).optional(),
  dueDate: z.string().datetime().optional(),
  currency: z.string().length(3).default('INR'),
  notes: z.string().max(500).optional(),
})

export const UpdateLiabilitySchema = CreateLiabilitySchema.partial()

export const LiabilityResponseSchema = z.object({
  id: z.string(),
  userId: z.string(),
  name: z.string(),
  type: LiabilityTypeEnum,
  balance: z.number(),
  originalAmount: z.number().nullable(),
  interestRate: z.number().nullable(),
  minimumPayment: z.number().nullable(),
  dueDate: z.string().nullable(),
  currency: z.string(),
  notes: z.string().nullable(),
  createdAt: z.string(),
  updatedAt: z.string(),
})

export type CreateLiabilityDto = z.infer<typeof CreateLiabilitySchema>
export type UpdateLiabilityDto = z.infer<typeof UpdateLiabilitySchema>
export type LiabilityResponse = z.infer<typeof LiabilityResponseSchema>
