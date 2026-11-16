import { NotFoundError } from '../../utils/errors'
import { cache, CacheKeys, CACHE_TTL } from '../../utils/cache'
import { GoalsRepository } from './goals.repository'
import type { CreateGoalDto, UpdateGoalDto } from './goals.schema'

export class GoalsService {
  private readonly repo = new GoalsRepository()

  async findAll(userId: string) {
    return cache.getOrSet(
      CacheKeys.goals.list(userId),
      CACHE_TTL.MEDIUM,
      () => this.repo.findAll(userId),
    )
  }

  async findById(id: string, userId: string) {
    const goal = await this.repo.findById(id, userId)
    if (!goal) throw new NotFoundError('Goal')
    return goal
  }

  async create(userId: string, dto: CreateGoalDto) {
    const result = await this.repo.create(userId, dto)
    await cache.del(CacheKeys.goals.list(userId))
    return result
  }

  async update(id: string, userId: string, dto: UpdateGoalDto) {
    await this.findById(id, userId)
    const result = await this.repo.update(id, dto)
    await cache.del(CacheKeys.goals.list(userId))
    return result
  }

  async delete(id: string, userId: string) {
    await this.findById(id, userId)
    await this.repo.delete(id)
    await cache.del(CacheKeys.goals.list(userId))
  }
}
