import { z } from 'zod'

export const InsuranceTypeEnum = z.enum([
  'TERM_LIFE',
  'HEALTH',
  'VEHICLE_TWO_WHEELER',
  'VEHICLE_FOUR_WHEELER',
  'ENDOWMENT',
  'ULIP',
  'HOME',
  'OTHER',
])

export const PremiumFrequencyEnum = z.enum([
  'MONTHLY',
  'QUARTERLY',
  'HALF_YEARLY',
  'ANNUALLY',
  'SINGLE_PREMIUM',
])

export const InsuranceStatusEnum = z.enum([
  'ACTIVE',
  'EXPIRED',
  'LAPSED',
  'CANCELLED',
])

export const CreateInsuranceSchema = z.object({
  name: z.string().min(1).max(100),
  type: InsuranceTypeEnum,
  provider: z.string().min(1).max(100),
  policyNumber: z.string().max(100).optional(),
  premiumAmount: z.number().min(0),
  premiumFrequency: PremiumFrequencyEnum,
  sumInsured: z.number().min(0),
  startDate: z.string().datetime(),
  renewalDate: z.string().datetime(),
  status: InsuranceStatusEnum.default('ACTIVE'),
  vehicleRegistration: z.string().max(20).optional(),
  nominees: z.string().max(500).optional(),
  notes: z.string().max(500).optional(),
})

export const UpdateInsuranceSchema = CreateInsuranceSchema.partial()

export const InsuranceResponseSchema = z.object({
  id: z.string(),
  userId: z.string(),
  name: z.string(),
  type: InsuranceTypeEnum,
  provider: z.string(),
  policyNumber: z.string().nullable(),
  premiumAmount: z.number(),
  premiumFrequency: PremiumFrequencyEnum,
  sumInsured: z.number(),
  startDate: z.string(),
  renewalDate: z.string(),
  status: InsuranceStatusEnum,
  vehicleRegistration: z.string().nullable(),
  nominees: z.string().nullable(),
  notes: z.string().nullable(),
  annualPremium: z.number(), // computed: premium normalised to annual
  createdAt: z.string(),
  updatedAt: z.string(),
})

export type CreateInsuranceDto = z.infer<typeof CreateInsuranceSchema>
export type UpdateInsuranceDto = z.infer<typeof UpdateInsuranceSchema>
export type InsuranceResponse = z.infer<typeof InsuranceResponseSchema>
