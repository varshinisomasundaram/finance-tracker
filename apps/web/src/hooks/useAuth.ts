import { useMutation } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'
import { authService } from '@/services/auth.service'
import { useAuthStore } from '@/store/authStore'
import { queryClient } from '@/lib/queryClient'
import type { User } from '@/types'

export function useLogin() {
  const { login } = useAuthStore()
  const navigate = useNavigate()

  return useMutation({
    mutationFn: authService.login,
    onSuccess: (data) => {
      login(data.user as User, data.accessToken, data.refreshToken)
      navigate('/overview', { replace: true })
    },
  })
}

export function useRegister() {
  const { login } = useAuthStore()
  const navigate = useNavigate()

  return useMutation({
    mutationFn: authService.register,
    onSuccess: (data) => {
      login(data.user as User, data.accessToken, data.refreshToken)
      navigate('/overview', { replace: true })
    },
  })
}

export function useLogout() {
  const { logout, refreshToken } = useAuthStore()
  const navigate = useNavigate()

  return useMutation({
    mutationFn: async () => {
      if (refreshToken) await authService.logout(refreshToken)
    },
    onSettled: () => {
      logout()
      queryClient.clear()
      navigate('/login', { replace: true })
    },
  })
}
