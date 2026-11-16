import { NotFoundError } from '../../utils/errors'
import { cache, CacheKeys, CACHE_TTL } from '../../utils/cache'
import { AssetsRepository } from './assets.repository'
import type { CreateAssetDto, UpdateAssetDto } from './assets.schema'

export class AssetsService {
  private readonly repo = new AssetsRepository()

  async findAll(userId: string) {
    return cache.getOrSet(
      CacheKeys.assets.list(userId),
      CACHE_TTL.LONG,
      () => this.repo.findAll(userId),
    )
  }

  async findById(id: string, userId: string) {
    const asset = await this.repo.findById(id, userId)
    if (!asset) throw new NotFoundError('Asset')
    return asset
  }

  async create(userId: string, dto: CreateAssetDto) {
    const result = await this.repo.create(userId, dto)
    await cache.del(
      CacheKeys.assets.list(userId),
      CacheKeys.assets.value(userId),
      CacheKeys.networth.current(userId),
    )
    return result
  }

  async update(id: string, userId: string, dto: UpdateAssetDto) {
    await this.findById(id, userId)
    const result = await this.repo.update(id, dto)
    await cache.del(
      CacheKeys.assets.list(userId),
      CacheKeys.assets.value(userId),
      CacheKeys.networth.current(userId),
    )
    return result
  }

  async delete(id: string, userId: string) {
    await this.findById(id, userId)
    await this.repo.delete(id)
    await cache.del(
      CacheKeys.assets.list(userId),
      CacheKeys.assets.value(userId),
      CacheKeys.networth.current(userId),
    )
  }

  async getTotalValue(userId: string) {
    return cache.getOrSet(
      CacheKeys.assets.value(userId),
      CACHE_TTL.SHORT,
      () => this.repo.getTotalValue(userId),
    )
  }
}
