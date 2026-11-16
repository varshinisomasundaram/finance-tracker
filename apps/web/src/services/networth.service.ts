import api from '@/lib/api'
import type { NetWorthCurrent, NetWorthHistory, NetWorthSnapshot } from '@/types'

export const networthService = {
  getCurrent: async () => {
    const res = await api.get<NetWorthCurrent>('/networth/current')
    return res.data
  },

  getHistory: async () => {
    const res = await api.get<NetWorthHistory>('/networth/history')
    return res.data
  },

  takeSnapshot: async () => {
    const res = await api.post<NetWorthSnapshot>('/networth/snapshot')
    return res.data
  },
}
