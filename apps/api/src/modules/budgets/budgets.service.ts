import { NotFoundError } from '../../utils/errors'
import { cache, CacheKeys, CACHE_TTL } from '../../utils/cache'
import { BudgetsRepository } from './budgets.repository'
import type { CreateBudgetDto, UpdateBudgetDto } from './budgets.schema'

export class BudgetsService {
  private readonly repo = new BudgetsRepository()

  async findAll(userId: string) {
    return cache.getOrSet(
      CacheKeys.budgets.list(userId),
      CACHE_TTL.MEDIUM,
      () => this.repo.findAll(userId),
    )
  }

  async findById(id: string, userId: string) {
    const budget = await this.repo.findById(id, userId)
    if (!budget) throw new NotFoundError('Budget')
    return budget
  }

  async create(userId: string, dto: CreateBudgetDto) {
    const result = await this.repo.create(userId, dto)
    await cache.del(CacheKeys.budgets.list(userId))
    return result
  }

  async update(id: string, userId: string, dto: UpdateBudgetDto) {
    await this.findById(id, userId)
    const result = await this.repo.update(id, dto)
    await cache.del(CacheKeys.budgets.list(userId))
    return result
  }

  async delete(id: string, userId: string) {
    await this.findById(id, userId)
    await this.repo.delete(id)
    await cache.del(CacheKeys.budgets.list(userId))
  }
}
