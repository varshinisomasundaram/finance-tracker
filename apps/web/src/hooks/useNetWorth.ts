import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { networthService } from '@/services/networth.service'

export const networthKeys = {
  current: ['networth', 'current'] as const,
  history: ['networth', 'history'] as const,
}

export function useNetWorthCurrent() {
  return useQuery({
    queryKey: networthKeys.current,
    queryFn: networthService.getCurrent,
  })
}

export function useNetWorthHistory() {
  return useQuery({
    queryKey: networthKeys.history,
    queryFn: networthService.getHistory,
  })
}

export function useTakeSnapshot() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: networthService.takeSnapshot,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: networthKeys.history })
      qc.invalidateQueries({ queryKey: networthKeys.current })
    },
  })
}
