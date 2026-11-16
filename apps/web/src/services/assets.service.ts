import api from '@/lib/api'
import type { Asset } from '@/types'

export const assetsService = {
  getAll: async () => {
    const res = await api.get<Asset[]>('/assets')
    return res.data
  },

  create: async (data: Partial<Asset>) => {
    const res = await api.post<Asset>('/assets', data)
    return res.data
  },

  update: async (id: string, data: Partial<Asset>) => {
    const res = await api.patch<Asset>(`/assets/${id}`, data)
    return res.data
  },

  delete: async (id: string) => {
    await api.delete(`/assets/${id}`)
  },
}
