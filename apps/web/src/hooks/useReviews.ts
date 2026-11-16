import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { reviewsService, CreateReviewDto } from '@/services/reviews.service'

export function useReviews() {
  return useQuery({
    queryKey: ['reviews'],
    queryFn: reviewsService.getAll,
    staleTime: 15 * 60 * 1000,
  })
}

export function useSubmitReview() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (dto: CreateReviewDto) => reviewsService.submit(dto),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['reviews'] })
    },
  })
}

export function useVoteReview() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, type }: { id: string; type: 'UP' | 'DOWN' }) =>
      reviewsService.vote(id, type),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['reviews'] })
    },
  })
}
