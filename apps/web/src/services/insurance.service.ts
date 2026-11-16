import api from '@/lib/api'
import type { Insurance } from '@/types'

export const insuranceService = {
  getAll: async () => {
    const res = await api.get<Insurance[]>('/insurance')
    return res.data
  },

  create: async (data: Partial<Insurance>) => {
    const res = await api.post<Insurance>('/insurance', data)
    return res.data
  },

  update: async (id: string, data: Partial<Insurance>) => {
    const res = await api.patch<Insurance>(`/insurance/${id}`, data)
    return res.data
  },

  delete: async (id: string) => {
    await api.delete(`/insurance/${id}`)
  },
}
