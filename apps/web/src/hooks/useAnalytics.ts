import { useQuery } from '@tanstack/react-query'
import { analyticsService } from '@/services/analytics.service'

export const analyticsKeys = {
  spendingByCategory: (year: number, month: number) => ['analytics', 'spending-by-category', year, month] as const,
  incomeVsExpense: (months: number) => ['analytics', 'income-vs-expense', months] as const,
  spendingTrends: (months: number) => ['analytics', 'spending-trends', months] as const,
  budgetVsActual: (year: number, month: number) => ['analytics', 'budget-vs-actual', year, month] as const,
  assetAllocation: () => ['analytics', 'asset-allocation'] as const,
  insuranceRenewals: (days: number) => ['analytics', 'insurance-renewals', days] as const,
  topExpenses: (year: number, month: number, limit: number) => ['analytics', 'top-expenses', year, month, limit] as const,
}

export const useSpendingByCategory = (year: number, month: number) =>
  useQuery({
    queryKey: analyticsKeys.spendingByCategory(year, month),
    queryFn: () => analyticsService.getSpendingByCategory(year, month),
  })

export const useIncomeVsExpense = (months = 6) =>
  useQuery({
    queryKey: analyticsKeys.incomeVsExpense(months),
    queryFn: () => analyticsService.getIncomeVsExpense(months),
  })

export const useSpendingTrends = (months = 6) =>
  useQuery({
    queryKey: analyticsKeys.spendingTrends(months),
    queryFn: () => analyticsService.getSpendingTrends(months),
  })

export const useBudgetVsActual = (year: number, month: number) =>
  useQuery({
    queryKey: analyticsKeys.budgetVsActual(year, month),
    queryFn: () => analyticsService.getBudgetVsActual(year, month),
  })

export const useAssetAllocation = () =>
  useQuery({
    queryKey: analyticsKeys.assetAllocation(),
    queryFn: () => analyticsService.getAssetAllocation(),
  })

export const useInsuranceRenewals = (days = 90) =>
  useQuery({
    queryKey: analyticsKeys.insuranceRenewals(days),
    queryFn: () => analyticsService.getInsuranceRenewals(days),
  })

export const useTopExpenses = (year: number, month: number, limit = 10) =>
  useQuery({
    queryKey: analyticsKeys.topExpenses(year, month, limit),
    queryFn: () => analyticsService.getTopExpenses(year, month, limit),
  })
