import api from '@/lib/api'
import type {
  SpendingByCategory,
  IncomeVsExpense,
  SpendingTrend,
  BudgetVsActual,
  AssetAllocation,
  InsuranceRenewal,
  TopExpense,
} from '@/types'

export const analyticsService = {
  getSpendingByCategory: async (year: number, month: number) => {
    const res = await api.get<SpendingByCategory[]>('/analytics/spending-by-category', {
      params: { year, month },
    })
    return res.data
  },

  getIncomeVsExpense: async (months = 6) => {
    const res = await api.get<IncomeVsExpense[]>('/analytics/income-vs-expense', {
      params: { months },
    })
    return res.data
  },

  getSpendingTrends: async (months = 6) => {
    const res = await api.get<SpendingTrend[]>('/analytics/spending-trends', {
      params: { months },
    })
    return res.data
  },

  getBudgetVsActual: async (year: number, month: number) => {
    const res = await api.get<BudgetVsActual[]>('/analytics/budget-vs-actual', {
      params: { year, month },
    })
    return res.data
  },

  getAssetAllocation: async () => {
    const res = await api.get<AssetAllocation[]>('/analytics/asset-allocation')
    return res.data
  },

  getInsuranceRenewals: async (days = 90) => {
    const res = await api.get<InsuranceRenewal[]>('/analytics/insurance-renewals', {
      params: { days },
    })
    return res.data
  },

  getTopExpenses: async (year: number, month: number, limit = 10) => {
    const res = await api.get<TopExpense[]>('/analytics/top-expenses', {
      params: { year, month, limit },
    })
    return res.data
  },
}
