import { cache, CACHE_TTL } from '../../utils/cache'
import { AnalyticsRepository } from './analytics.repository'

const analyticsKey = (userId: string, endpoint: string, ...parts: (string | number)[]) =>
  `analytics:${userId}:${endpoint}${parts.length ? ':' + parts.join(':') : ''}`

export class AnalyticsService {
  private readonly repo = new AnalyticsRepository()

  async getSpendingByCategory(userId: string, year: number, month: number) {
    return cache.getOrSet(
      analyticsKey(userId, 'spending-by-category', year, month),
      CACHE_TTL.SHORT,
      () => this.repo.getSpendingByCategory(userId, year, month),
    )
  }

  async getIncomeVsExpense(userId: string, months: number) {
    return cache.getOrSet(
      analyticsKey(userId, 'income-vs-expense', months),
      CACHE_TTL.SHORT,
      () => this.repo.getIncomeVsExpense(userId, months),
    )
  }

  async getSpendingTrends(userId: string, months: number) {
    return cache.getOrSet(
      analyticsKey(userId, 'spending-trends', months),
      CACHE_TTL.SHORT,
      () => this.repo.getSpendingTrends(userId, months),
    )
  }

  async getBudgetVsActual(userId: string, year: number, month: number) {
    return cache.getOrSet(
      analyticsKey(userId, 'budget-vs-actual', year, month),
      CACHE_TTL.SHORT,
      () => this.repo.getBudgetVsActual(userId, year, month),
    )
  }

  async getAssetAllocation(userId: string) {
    return cache.getOrSet(
      analyticsKey(userId, 'asset-allocation'),
      CACHE_TTL.SHORT,
      () => this.repo.getAssetAllocation(userId),
    )
  }

  async getInsuranceRenewals(userId: string, days: number) {
    return cache.getOrSet(
      analyticsKey(userId, 'insurance-renewals', days),
      CACHE_TTL.SHORT,
      () => this.repo.getInsuranceRenewals(userId, days),
    )
  }

  async getTopExpenses(userId: string, year: number, month: number, limit: number) {
    return cache.getOrSet(
      analyticsKey(userId, 'top-expenses', year, month, limit),
      CACHE_TTL.SHORT,
      () => this.repo.getTopExpenses(userId, year, month, limit),
    )
  }
}
