import api from '@/lib/api'
import type { ImportPreviewResult, ImportConfirmResult } from '@/types'

export const importService = {
  preview: async (file: File, password?: string, bankHint?: string): Promise<ImportPreviewResult> => {
    const form = new FormData()
    form.append('file', file)
    if (password) form.append('password', password)
    if (bankHint) form.append('bankHint', bankHint)
    const res = await api.post<ImportPreviewResult>('/import/preview', form, {
      headers: { 'Content-Type': 'multipart/form-data' },
    })
    return res.data
  },

  confirm: async (
    sessionId: string,
    selectedRowIndices: number[],
    rowCategories?: Record<number, string>,
    rowTypes?: Record<number, 'INCOME' | 'EXPENSE'>,
    categoryId?: string,
    accountId?: string,
  ): Promise<ImportConfirmResult> => {
    const toStringKeys = (obj?: Record<number, string>) =>
      obj ? Object.fromEntries(Object.entries(obj).map(([k, v]) => [String(k), v])) : undefined
    const res = await api.post<ImportConfirmResult>('/import/confirm', {
      sessionId,
      selectedRowIndices,
      rowCategories: toStringKeys(rowCategories),
      rowTypes: toStringKeys(rowTypes as Record<number, string>),
      categoryId,
      accountId,
    })
    return res.data
  },
}
