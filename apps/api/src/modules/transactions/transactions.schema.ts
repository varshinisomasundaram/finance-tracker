import { z } from 'zod'

export const TransactionTypeEnum = z.enum(['INCOME', 'EXPENSE', 'TRANSFER'])

export const CreateTransactionSchema = z.object({
  type: TransactionTypeEnum,
  amount: z.number().positive('Amount must be positive'),
  date: z.string().datetime(),
  description: z.string().min(1).max(200),
  accountId: z.string().optional(),
  categoryId: z.string().optional(),
  notes: z.string().max(500).optional(),
  tags: z.array(z.string()).default([]),
  isRecurring: z.boolean().default(false),
})

export const UpdateTransactionSchema = CreateTransactionSchema.partial()

export const TransactionFiltersSchema = z.object({
  type: TransactionTypeEnum.optional(),
  categoryId: z.string().optional(),
  accountId: z.string().optional(),
  startDate: z.string().datetime().optional(),
  endDate: z.string().datetime().optional(),
  search: z.string().optional(),
  page: z.string().optional().default('1').transform(Number),
  limit: z.string().optional().default('20').transform(Number),
})

export const CategorySummarySchema = z.object({
  categoryId: z.string().nullable(),
  categoryName: z.string().nullable(),
  categoryColor: z.string().nullable(),
  total: z.number(),
  count: z.number(),
})

export const TransactionResponseSchema = z.object({
  id: z.string(),
  userId: z.string(),
  accountId: z.string().nullable(),
  categoryId: z.string().nullable(),
  type: TransactionTypeEnum,
  amount: z.number(),
  date: z.string(),
  description: z.string(),
  notes: z.string().nullable(),
  tags: z.array(z.string()),
  isRecurring: z.boolean(),
  account: z.object({ id: z.string(), name: z.string() }).nullable(),
  category: z.object({ id: z.string(), name: z.string(), color: z.string() }).nullable(),
  createdAt: z.string(),
  updatedAt: z.string(),
})

export const PaginatedTransactionsSchema = z.object({
  data: z.array(TransactionResponseSchema),
  meta: z.object({
    total: z.number(),
    page: z.number(),
    limit: z.number(),
    totalPages: z.number(),
  }),
})

export type CreateTransactionDto = z.infer<typeof CreateTransactionSchema>
export type UpdateTransactionDto = z.infer<typeof UpdateTransactionSchema>
export type TransactionFilters = z.infer<typeof TransactionFiltersSchema>
