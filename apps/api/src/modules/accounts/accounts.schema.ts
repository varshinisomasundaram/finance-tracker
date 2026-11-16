import { z } from 'zod'

export const AccountTypeEnum = z.enum([
  'CHECKING', 'SAVINGS', 'INVESTMENT', 'CRYPTO', 'CASH', 'OTHER',
])

export const CreateAccountSchema = z.object({
  name: z.string().min(1).max(100),
  type: AccountTypeEnum,
  institution: z.string().max(100).optional(),
  balance: z.number().default(0),
  currency: z.string().length(3).default('USD'),
  color: z.string().regex(/^#[0-9A-Fa-f]{6}$/).optional(),
  notes: z.string().max(500).optional(),
})

export const UpdateAccountSchema = CreateAccountSchema.partial().extend({
  isActive: z.boolean().optional(),
})

export const AccountResponseSchema = z.object({
  id: z.string(),
  userId: z.string(),
  name: z.string(),
  type: AccountTypeEnum,
  institution: z.string().nullable(),
  balance: z.number(),
  currency: z.string(),
  color: z.string().nullable(),
  isActive: z.boolean(),
  notes: z.string().nullable(),
  createdAt: z.string(),
  updatedAt: z.string(),
})

export type CreateAccountDto = z.infer<typeof CreateAccountSchema>
export type UpdateAccountDto = z.infer<typeof UpdateAccountSchema>
export type AccountResponse = z.infer<typeof AccountResponseSchema>
