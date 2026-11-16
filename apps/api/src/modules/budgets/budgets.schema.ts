import { z } from 'zod'

export const BudgetPeriodEnum = z.enum(['MONTHLY', 'ANNUAL'])

export const CreateBudgetSchema = z.object({
  name: z.string().min(1).max(100),
  amount: z.number().min(0),
  period: BudgetPeriodEnum.default('MONTHLY'),
  categoryId: z.string().optional(),
  month: z.number().int().min(1).max(12).optional(),
  year: z.number().int().min(2000).max(2100).optional(),
})

export const UpdateBudgetSchema = CreateBudgetSchema.partial()

export const BudgetResponseSchema = z.object({
  id: z.string(),
  userId: z.string(),
  name: z.string(),
  amount: z.number(),
  period: BudgetPeriodEnum,
  categoryId: z.string().nullable(),
  month: z.number().nullable(),
  year: z.number().nullable(),
  createdAt: z.string(),
  updatedAt: z.string(),
})

export type CreateBudgetDto = z.infer<typeof CreateBudgetSchema>
export type UpdateBudgetDto = z.infer<typeof UpdateBudgetSchema>
export type BudgetResponse = z.infer<typeof BudgetResponseSchema>
