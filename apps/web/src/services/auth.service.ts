import api from '@/lib/api'
import type { AuthTokens } from '@/types'

export const authService = {
  register: async (data: { name: string; email: string; password: string }) => {
    const res = await api.post<AuthTokens>('/auth/register', data)
    return res.data
  },

  login: async (data: { email: string; password: string }) => {
    const res = await api.post<AuthTokens>('/auth/login', data)
    return res.data
  },

  refresh: async (refreshToken: string) => {
    const res = await api.post<{ accessToken: string }>('/auth/refresh', { refreshToken })
    return res.data
  },

  logout: async (refreshToken: string) => {
    await api.delete('/auth/logout', { data: { refreshToken } })
  },
}
