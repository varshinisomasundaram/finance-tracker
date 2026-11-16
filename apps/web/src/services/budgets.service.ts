import api from '@/lib/api'
import type { Budget } from '@/types'

export const budgetsService = {
  getAll: async () => {
    const res = await api.get<Budget[]>('/budgets')
    return res.data
  },

  create: async (data: Partial<Budget>) => {
    const res = await api.post<Budget>('/budgets', data)
    return res.data
  },

  update: async (id: string, data: Partial<Budget>) => {
    const res = await api.patch<Budget>(`/budgets/${id}`, data)
    return res.data
  },

  delete: async (id: string) => {
    await api.delete(`/budgets/${id}`)
  },
}
