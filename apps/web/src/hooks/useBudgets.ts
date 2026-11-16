import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { budgetsService } from '@/services/budgets.service'
import type { Budget } from '@/types'

export const budgetKeys = { all: ['budgets'] as const }

export function useBudgets() {
  return useQuery({ queryKey: budgetKeys.all, queryFn: budgetsService.getAll })
}

export function useCreateBudget() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (data: Partial<Budget>) => budgetsService.create(data),
    onSuccess: () => qc.invalidateQueries({ queryKey: budgetKeys.all }),
  })
}

export function useUpdateBudget() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<Budget> }) =>
      budgetsService.update(id, data),
    onSuccess: () => qc.invalidateQueries({ queryKey: budgetKeys.all }),
  })
}

export function useDeleteBudget() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => budgetsService.delete(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: budgetKeys.all }),
  })
}
