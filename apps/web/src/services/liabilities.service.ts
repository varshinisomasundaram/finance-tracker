import api from '@/lib/api'
import type { Liability } from '@/types'

export const liabilitiesService = {
  getAll: async () => {
    const res = await api.get<Liability[]>('/liabilities')
    return res.data
  },

  create: async (data: Partial<Liability>) => {
    const res = await api.post<Liability>('/liabilities', data)
    return res.data
  },

  update: async (id: string, data: Partial<Liability>) => {
    const res = await api.patch<Liability>(`/liabilities/${id}`, data)
    return res.data
  },

  delete: async (id: string) => {
    await api.delete(`/liabilities/${id}`)
  },
}
