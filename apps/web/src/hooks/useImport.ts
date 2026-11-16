import { useMutation, useQueryClient } from '@tanstack/react-query'
import { importService } from '@/services/import.service'

export function usePreviewImport() {
  return useMutation({
    mutationFn: ({ file, password, bankHint }: { file: File; password?: string; bankHint?: string }) =>
      importService.preview(file, password, bankHint),
  })
}

export function useConfirmImport() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({
      sessionId,
      selectedRowIndices,
      rowCategories,
      rowTypes,
      categoryId,
      accountId,
    }: {
      sessionId: string
      selectedRowIndices: number[]
      rowCategories?: Record<number, string>
      rowTypes?: Record<number, 'INCOME' | 'EXPENSE'>
      categoryId?: string
      accountId?: string
    }) => importService.confirm(sessionId, selectedRowIndices, rowCategories, rowTypes, categoryId, accountId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['transactions'] })
    },
  })
}
