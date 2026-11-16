import { NotFoundError } from '../../utils/errors'
import { cache, CacheKeys, CACHE_TTL } from '../../utils/cache'
import { InsuranceRepository } from './insurance.repository'
import type { CreateInsuranceDto, UpdateInsuranceDto } from './insurance.schema'

export class InsuranceService {
  private readonly repo = new InsuranceRepository()

  async findAll(userId: string) {
    return cache.getOrSet(
      CacheKeys.insurance.list(userId),
      CACHE_TTL.LONG,
      () => this.repo.findAll(userId),
    )
  }

  async findById(id: string, userId: string) {
    const insurance = await this.repo.findById(id, userId)
    if (!insurance) throw new NotFoundError('Insurance policy')
    return insurance
  }

  async create(userId: string, dto: CreateInsuranceDto) {
    const result = await this.repo.create(userId, dto)
    await cache.del(CacheKeys.insurance.list(userId))
    return result
  }

  async update(id: string, userId: string, dto: UpdateInsuranceDto) {
    await this.findById(id, userId)
    const result = await this.repo.update(id, dto)
    await cache.del(CacheKeys.insurance.list(userId))
    return result
  }

  async delete(id: string, userId: string) {
    await this.findById(id, userId)
    await this.repo.delete(id)
    await cache.del(CacheKeys.insurance.list(userId))
  }
}
