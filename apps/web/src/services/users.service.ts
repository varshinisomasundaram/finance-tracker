import api from '@/lib/api'
import type { User } from '@/types'

export const usersService = {
  updateMe: async (data: Partial<Pick<User, 'name' | 'currency'>>) => {
    const res = await api.patch<User>('/users/me', data)
    return res.data
  },

  changePassword: async (data: { currentPassword: string; newPassword: string }) => {
    await api.post('/users/me/change-password', data)
  },

  deleteAccount: async () => {
    await api.delete('/users/me')
  },
}
