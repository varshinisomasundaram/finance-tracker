import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { liabilitiesService } from '@/services/liabilities.service'
import { networthKeys } from './useNetWorth'
import type { Liability } from '@/types'

export const liabilityKeys = { all: ['liabilities'] as const }

export function useLiabilities() {
  return useQuery({ queryKey: liabilityKeys.all, queryFn: liabilitiesService.getAll })
}

export function useCreateLiability() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (data: Partial<Liability>) => liabilitiesService.create(data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: liabilityKeys.all })
      qc.invalidateQueries({ queryKey: networthKeys.current })
    },
  })
}

export function useUpdateLiability() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<Liability> }) =>
      liabilitiesService.update(id, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: liabilityKeys.all })
      qc.invalidateQueries({ queryKey: networthKeys.current })
    },
  })
}

export function useDeleteLiability() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => liabilitiesService.delete(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: liabilityKeys.all })
      qc.invalidateQueries({ queryKey: networthKeys.current })
    },
  })
}
