import api from '@/lib/api'
import type { Goal } from '@/types'

export const goalsService = {
  getAll: async () => {
    const res = await api.get<Goal[]>('/goals')
    return res.data
  },

  create: async (data: Partial<Goal>) => {
    const res = await api.post<Goal>('/goals', data)
    return res.data
  },

  update: async (id: string, data: Partial<Goal>) => {
    const res = await api.patch<Goal>(`/goals/${id}`, data)
    return res.data
  },

  delete: async (id: string) => {
    await api.delete(`/goals/${id}`)
  },
}
