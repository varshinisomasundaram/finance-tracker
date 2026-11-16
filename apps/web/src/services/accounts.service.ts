import api from '@/lib/api'
import type { Account } from '@/types'

export const accountsService = {
  getAll: async () => {
    const res = await api.get<Account[]>('/accounts')
    return res.data
  },

  getById: async (id: string) => {
    const res = await api.get<Account>(`/accounts/${id}`)
    return res.data
  },

  create: async (data: Partial<Account>) => {
    const res = await api.post<Account>('/accounts', data)
    return res.data
  },

  update: async (id: string, data: Partial<Account>) => {
    const res = await api.patch<Account>(`/accounts/${id}`, data)
    return res.data
  },

  delete: async (id: string) => {
    await api.delete(`/accounts/${id}`)
  },
}
