import { NotFoundError } from '../../utils/errors'
import { cache, CacheKeys, CACHE_TTL } from '../../utils/cache'
import { LiabilitiesRepository } from './liabilities.repository'
import type { CreateLiabilityDto, UpdateLiabilityDto } from './liabilities.schema'

export class LiabilitiesService {
  private readonly repo = new LiabilitiesRepository()

  async findAll(userId: string) {
    return cache.getOrSet(
      CacheKeys.liabilities.list(userId),
      CACHE_TTL.LONG,
      () => this.repo.findAll(userId),
    )
  }

  async findById(id: string, userId: string) {
    const liability = await this.repo.findById(id, userId)
    if (!liability) throw new NotFoundError('Liability')
    return liability
  }

  async create(userId: string, dto: CreateLiabilityDto) {
    const result = await this.repo.create(userId, dto)
    await cache.del(
      CacheKeys.liabilities.list(userId),
      CacheKeys.liabilities.balance(userId),
      CacheKeys.networth.current(userId),
    )
    return result
  }

  async update(id: string, userId: string, dto: UpdateLiabilityDto) {
    await this.findById(id, userId)
    const result = await this.repo.update(id, dto)
    await cache.del(
      CacheKeys.liabilities.list(userId),
      CacheKeys.liabilities.balance(userId),
      CacheKeys.networth.current(userId),
    )
    return result
  }

  async delete(id: string, userId: string) {
    await this.findById(id, userId)
    await this.repo.delete(id)
    await cache.del(
      CacheKeys.liabilities.list(userId),
      CacheKeys.liabilities.balance(userId),
      CacheKeys.networth.current(userId),
    )
  }

  async getTotalBalance(userId: string) {
    return cache.getOrSet(
      CacheKeys.liabilities.balance(userId),
      CACHE_TTL.SHORT,
      () => this.repo.getTotalBalance(userId),
    )
  }
}
