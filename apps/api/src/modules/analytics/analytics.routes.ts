import { FastifyInstance } from 'fastify'
import { ZodTypeProvider } from 'fastify-type-provider-zod'
import { AnalyticsService } from './analytics.service'
import {
  SpendingByCategoryQuerySchema,
  SpendingByCategoryResponseSchema,
  IncomeVsExpenseQuerySchema,
  IncomeVsExpenseResponseSchema,
  SpendingTrendsQuerySchema,
  SpendingTrendsResponseSchema,
  BudgetVsActualQuerySchema,
  BudgetVsActualResponseSchema,
  AssetAllocationResponseSchema,
  InsuranceRenewalsQuerySchema,
  InsuranceRenewalResponseSchema,
  TopExpensesQuerySchema,
  TopExpensesResponseSchema,
} from './analytics.schema'

const svc = new AnalyticsService()

export async function analyticsRoutes(fastify: FastifyInstance) {
  const f = fastify.withTypeProvider<ZodTypeProvider>()
  const auth = { preHandler: [fastify.authenticate] }

  f.get('/spending-by-category', {
    ...auth,
    schema: {
      tags: ['Analytics'],
      summary: 'Expense breakdown by category for a given month',
      security: [{ bearerAuth: [] }],
      querystring: SpendingByCategoryQuerySchema,
      response: { 200: SpendingByCategoryResponseSchema },
    },
  }, async (request) => {
    const { year, month } = request.query
    return svc.getSpendingByCategory(request.user.id, year, month)
  })

  f.get('/income-vs-expense', {
    ...auth,
    schema: {
      tags: ['Analytics'],
      summary: 'Monthly income vs expense trend over N months',
      security: [{ bearerAuth: [] }],
      querystring: IncomeVsExpenseQuerySchema,
      response: { 200: IncomeVsExpenseResponseSchema },
    },
  }, async (request) => {
    return svc.getIncomeVsExpense(request.user.id, request.query.months)
  })

  f.get('/spending-trends', {
    ...auth,
    schema: {
      tags: ['Analytics'],
      summary: 'Monthly expense totals and daily average over N months',
      security: [{ bearerAuth: [] }],
      querystring: SpendingTrendsQuerySchema,
      response: { 200: SpendingTrendsResponseSchema },
    },
  }, async (request) => {
    return svc.getSpendingTrends(request.user.id, request.query.months)
  })

  f.get('/budget-vs-actual', {
    ...auth,
    schema: {
      tags: ['Analytics'],
      summary: 'Budget utilization — budgeted amount vs actual spend',
      security: [{ bearerAuth: [] }],
      querystring: BudgetVsActualQuerySchema,
      response: { 200: BudgetVsActualResponseSchema },
    },
  }, async (request) => {
    const { year, month } = request.query
    return svc.getBudgetVsActual(request.user.id, year, month)
  })

  f.get('/asset-allocation', {
    ...auth,
    schema: {
      tags: ['Analytics'],
      summary: 'Asset distribution by type with percentages',
      security: [{ bearerAuth: [] }],
      response: { 200: AssetAllocationResponseSchema },
    },
  }, async (request) => {
    return svc.getAssetAllocation(request.user.id)
  })

  f.get('/insurance-renewals', {
    ...auth,
    schema: {
      tags: ['Analytics'],
      summary: 'Upcoming insurance renewals within N days',
      security: [{ bearerAuth: [] }],
      querystring: InsuranceRenewalsQuerySchema,
      response: { 200: InsuranceRenewalResponseSchema },
    },
  }, async (request) => {
    return svc.getInsuranceRenewals(request.user.id, request.query.days)
  })

  f.get('/top-expenses', {
    ...auth,
    schema: {
      tags: ['Analytics'],
      summary: 'Top expense descriptions by total amount for a given month',
      security: [{ bearerAuth: [] }],
      querystring: TopExpensesQuerySchema,
      response: { 200: TopExpensesResponseSchema },
    },
  }, async (request) => {
    const { year, month, limit } = request.query
    return svc.getTopExpenses(request.user.id, year, month, limit)
  })
}
