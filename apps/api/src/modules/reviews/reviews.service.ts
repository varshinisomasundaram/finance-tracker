import { cache, CacheKeys, CACHE_TTL } from '../../utils/cache'
import { reviewsRepository } from './reviews.repository'
import { CreateReviewDto, VoteDto } from './reviews.schema'
import { NotFoundError } from '../../utils/errors'
import DatabaseService from '../../config/database'

export const reviewsService = {
  async getApproved() {
    return cache.getOrSet(CacheKeys.reviews.list(), CACHE_TTL.LONG, () =>
      reviewsRepository.findApproved(),
    )
  },

  async submit(dto: CreateReviewDto, userId?: string) {
    const review = await reviewsRepository.create(dto, userId)
    if (review.isApproved) {
      await cache.del(CacheKeys.reviews.list())
    }
    return review
  },

  async vote(id: string, dto: VoteDto) {
    // Verify review exists and is approved
    const exists = await DatabaseService.getInstance().prisma.review.findFirst({
      where: { id, isApproved: true },
      select: { id: true },
    })
    if (!exists) throw new NotFoundError('Review not found')

    const review = await reviewsRepository.vote(id, dto.type)
    // Bust the list cache so updated counts are served
    await cache.del(CacheKeys.reviews.list())
    return review
  },
}
