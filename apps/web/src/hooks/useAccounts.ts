import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { accountsService } from '@/services/accounts.service'
import type { Account } from '@/types'

export const accountKeys = {
  all: ['accounts'] as const,
}

export function useAccounts() {
  return useQuery({ queryKey: accountKeys.all, queryFn: accountsService.getAll })
}

export function useCreateAccount() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (data: Partial<Account>) => accountsService.create(data),
    onSuccess: () => qc.invalidateQueries({ queryKey: accountKeys.all }),
  })
}

export function useUpdateAccount() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<Account> }) =>
      accountsService.update(id, data),
    onSuccess: () => qc.invalidateQueries({ queryKey: accountKeys.all }),
  })
}

export function useDeleteAccount() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => accountsService.delete(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: accountKeys.all }),
  })
}
