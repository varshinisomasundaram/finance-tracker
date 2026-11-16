import api from '@/lib/api'
import type { Transaction, PaginatedResult } from '@/types'

export interface TransactionFilters {
  type?: string
  categoryId?: string
  accountId?: string
  startDate?: string
  endDate?: string
  search?: string
  page?: number
  limit?: number
}

export const transactionsService = {
  getAll: async (filters: TransactionFilters = {}) => {
    const params = Object.fromEntries(
      Object.entries(filters).filter(([, v]) => v !== undefined && v !== ''),
    )
    const res = await api.get<PaginatedResult<Transaction>>('/transactions', { params })
    return res.data
  },

  getRecent: async (limit = 10) => {
    const res = await api.get<Transaction[]>('/transactions/recent', { params: { limit } })
    return res.data
  },

  getMonthlySummary: async (year: number, month: number) => {
    const res = await api.get<Array<{ type: string; total: number; count: number }>>(
      '/transactions/summary',
      { params: { year, month } },
    )
    return res.data
  },

  create: async (data: Partial<Transaction>) => {
    const res = await api.post<Transaction>('/transactions', data)
    return res.data
  },

  update: async (id: string, data: Partial<Transaction>) => {
    const res = await api.patch<Transaction>(`/transactions/${id}`, data)
    return res.data
  },

  delete: async (id: string) => {
    await api.delete(`/transactions/${id}`)
  },
}
