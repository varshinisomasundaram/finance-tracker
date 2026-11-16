import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { assetsService } from '@/services/assets.service'
import { networthKeys } from './useNetWorth'
import type { Asset } from '@/types'

export const assetKeys = { all: ['assets'] as const }

export function useAssets() {
  return useQuery({ queryKey: assetKeys.all, queryFn: assetsService.getAll })
}

export function useCreateAsset() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (data: Partial<Asset>) => assetsService.create(data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: assetKeys.all })
      qc.invalidateQueries({ queryKey: networthKeys.current })
    },
  })
}

export function useUpdateAsset() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<Asset> }) =>
      assetsService.update(id, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: assetKeys.all })
      qc.invalidateQueries({ queryKey: networthKeys.current })
    },
  })
}

export function useDeleteAsset() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => assetsService.delete(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: assetKeys.all })
      qc.invalidateQueries({ queryKey: networthKeys.current })
    },
  })
}
