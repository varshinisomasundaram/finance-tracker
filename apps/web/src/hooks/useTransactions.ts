import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { transactionsService, type TransactionFilters } from '@/services/transactions.service'
import type { Transaction } from '@/types'

export const txKeys = {
  all: (filters: TransactionFilters) => ['transactions', filters] as const,
  recent: ['transactions', 'recent'] as const,
  summary: (year: number, month: number) => ['transactions', 'summary', year, month] as const,
}

export function useTransactions(filters: TransactionFilters = {}) {
  return useQuery({
    queryKey: txKeys.all(filters),
    queryFn: () => transactionsService.getAll(filters),
  })
}

export function useRecentTransactions(limit = 10) {
  return useQuery({
    queryKey: txKeys.recent,
    queryFn: () => transactionsService.getRecent(limit),
  })
}

export function useMonthlySummary(year: number, month: number) {
  return useQuery({
    queryKey: txKeys.summary(year, month),
    queryFn: () => transactionsService.getMonthlySummary(year, month),
  })
}

export function useCreateTransaction() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (data: Partial<Transaction>) => transactionsService.create(data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['transactions'] })
    },
  })
}

export function useDeleteTransaction() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => transactionsService.delete(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['transactions'] })
    },
  })
}
