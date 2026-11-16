import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { insuranceService } from '@/services/insurance.service'
import type { Insurance } from '@/types'

export const insuranceKeys = { all: ['insurance'] as const }

export function useInsurance() {
  return useQuery({ queryKey: insuranceKeys.all, queryFn: insuranceService.getAll })
}

export function useCreateInsurance() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (data: Partial<Insurance>) => insuranceService.create(data),
    onSuccess: () => qc.invalidateQueries({ queryKey: insuranceKeys.all }),
  })
}

export function useUpdateInsurance() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<Insurance> }) =>
      insuranceService.update(id, data),
    onSuccess: () => qc.invalidateQueries({ queryKey: insuranceKeys.all }),
  })
}

export function useDeleteInsurance() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => insuranceService.delete(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: insuranceKeys.all }),
  })
}
