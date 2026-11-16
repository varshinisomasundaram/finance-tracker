import api from '@/lib/api'

export interface Review {
  id: string
  name: string
  role: string
  rating: number
  text: string
  isApproved: boolean
  helpfulCount: number
  notHelpfulCount: number
  createdAt: string
}

export interface CreateReviewDto {
  name: string
  role: string
  rating: number
  text: string
}

export const reviewsService = {
  getAll: () => api.get<{ reviews: Review[] }>('/reviews').then((r) => r.data.reviews),
  submit: (dto: CreateReviewDto) => api.post<Review>('/reviews', dto).then((r) => r.data),
  vote: (id: string, type: 'UP' | 'DOWN') =>
    api.post<Review>(`/reviews/${id}/vote`, { type }).then((r) => r.data),
}
