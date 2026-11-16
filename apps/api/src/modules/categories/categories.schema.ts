import { z } from 'zod'

const TransactionTypeEnum = z.enum(['INCOME', 'EXPENSE', 'TRANSFER'])

export const CreateCategorySchema = z.object({
  name: z.string().min(1).max(100),
  type: TransactionTypeEnum,
  color: z.string().regex(/^#[0-9A-Fa-f]{6}$/).default('#6366f1'),
  icon: z.string().optional(),
})

export const UpdateCategorySchema = CreateCategorySchema.partial()

export const CategoryResponseSchema = z.object({
  id: z.string(),
  userId: z.string().nullable(),
  name: z.string(),
  type: TransactionTypeEnum,
  color: z.string(),
  icon: z.string().nullable(),
  isSystem: z.boolean(),
  createdAt: z.string(),
})

export type CreateCategoryDto = z.infer<typeof CreateCategorySchema>
export type UpdateCategoryDto = z.infer<typeof UpdateCategorySchema>
