import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { goalsService } from '@/services/goals.service'
import type { Goal } from '@/types'

export const goalKeys = { all: ['goals'] as const }

export function useGoals() {
  return useQuery({ queryKey: goalKeys.all, queryFn: goalsService.getAll })
}

export function useCreateGoal() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (data: Partial<Goal>) => goalsService.create(data),
    onSuccess: () => qc.invalidateQueries({ queryKey: goalKeys.all }),
  })
}

export function useUpdateGoal() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<Goal> }) =>
      goalsService.update(id, data),
    onSuccess: () => qc.invalidateQueries({ queryKey: goalKeys.all }),
  })
}

export function useDeleteGoal() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => goalsService.delete(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: goalKeys.all }),
  })
}
