import { z } from 'zod'

export const AssetTypeEnum = z.enum([
  'REAL_ESTATE', 'VEHICLE', 'EQUITY', 'MUTUAL_FUND', 'RETIREMENT',
  'PROVIDENT_FUND', 'GOVERNMENT_SCHEME', 'SAVINGS', 'CASH',
  'GOLD', 'CRYPTO', 'INSURANCE_POLICY', 'BUSINESS', 'OTHER',
])

export const InvestmentStrategyEnum = z.enum(['LONG_TERM', 'SHORT_TERM', 'HOLD_FOREVER'])

export const CreateAssetSchema = z.object({
  name: z.string().min(1).max(100),
  type: AssetTypeEnum,
  value: z.number().min(0),
  purchasePrice: z.number().min(0).optional(),
  purchaseDate: z.string().datetime().optional(),
  investmentStrategy: InvestmentStrategyEnum.optional(),
  targetDate: z.string().datetime().optional(),
  quantity: z.number().min(0).optional(),
  currency: z.string().length(3).default('INR'),
  notes: z.string().max(500).optional(),
})

export const UpdateAssetSchema = CreateAssetSchema.partial()

export const AssetResponseSchema = z.object({
  id: z.string(),
  userId: z.string(),
  name: z.string(),
  type: AssetTypeEnum,
  value: z.number(),
  purchasePrice: z.number().nullable(),
  purchaseDate: z.string().nullable(),
  investmentStrategy: InvestmentStrategyEnum.nullable(),
  targetDate: z.string().nullable(),
  quantity: z.number().nullable(),
  currency: z.string(),
  notes: z.string().nullable(),
  createdAt: z.string(),
  updatedAt: z.string(),
})

export type CreateAssetDto = z.infer<typeof CreateAssetSchema>
export type UpdateAssetDto = z.infer<typeof UpdateAssetSchema>
export type AssetResponse = z.infer<typeof AssetResponseSchema>
