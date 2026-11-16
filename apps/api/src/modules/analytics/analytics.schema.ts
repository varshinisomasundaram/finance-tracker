import { z } from 'zod'

// ─── Query Schemas ───────────────────────────────────────────────────────────

export const SpendingByCategoryQuerySchema = z.object({
  year: z.string().transform(Number),
  month: z.string().transform(Number),
})

export const IncomeVsExpenseQuerySchema = z.object({
  months: z.string().optional().default('6').transform(Number),
})

export const SpendingTrendsQuerySchema = z.object({
  months: z.string().optional().default('6').transform(Number),
})

export const BudgetVsActualQuerySchema = z.object({
  year: z.string().transform(Number),
  month: z.string().transform(Number),
})

export const InsuranceRenewalsQuerySchema = z.object({
  days: z.string().optional().default('90').transform(Number),
})

export const TopExpensesQuerySchema = z.object({
  year: z.string().transform(Number),
  month: z.string().transform(Number),
  limit: z.string().optional().default('10').transform(Number),
})

// ─── Response Schemas ────────────────────────────────────────────────────────

export const SpendingByCategoryResponseSchema = z.array(z.object({
  categoryId: z.string().nullable(),
  categoryName: z.string(),
  color: z.string(),
  total: z.number(),
  count: z.number(),
  percentage: z.number(),
}))

export const IncomeVsExpenseResponseSchema = z.array(z.object({
  month: z.number(),
  year: z.number(),
  income: z.number(),
  expense: z.number(),
  savings: z.number(),
  savingsRate: z.number(),
}))

export const SpendingTrendsResponseSchema = z.array(z.object({
  month: z.number(),
  year: z.number(),
  total: z.number(),
  avgPerDay: z.number(),
}))

export const BudgetVsActualResponseSchema = z.array(z.object({
  budgetId: z.string(),
  name: z.string(),
  budgeted: z.number(),
  actual: z.number(),
  remaining: z.number(),
  percentUsed: z.number(),
  categoryName: z.string().nullable(),
}))

export const AssetAllocationResponseSchema = z.array(z.object({
  type: z.string(),
  total: z.number(),
  count: z.number(),
  percentage: z.number(),
}))

export const InsuranceRenewalResponseSchema = z.array(z.object({
  id: z.string(),
  name: z.string(),
  type: z.string(),
  provider: z.string(),
  renewalDate: z.string(),
  premiumAmount: z.number(),
  premiumFrequency: z.string(),
  daysUntilRenewal: z.number(),
}))

export const TopExpensesResponseSchema = z.array(z.object({
  description: z.string(),
  total: z.number(),
  count: z.number(),
}))
