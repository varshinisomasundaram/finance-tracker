import { NotFoundError, ForbiddenError } from '../../utils/errors'
import { cache, CacheKeys, CACHE_TTL } from '../../utils/cache'
import { CategoriesRepository } from './categories.repository'
import type { CreateCategoryDto, UpdateCategoryDto } from './categories.schema'

export class CategoriesService {
  private readonly repo = new CategoriesRepository()

  async findAll(userId: string) {
    return cache.getOrSet(
      CacheKeys.categories.list(userId),
      CACHE_TTL.LONG,
      () => this.repo.findAll(userId),
    )
  }

  async findById(id: string, userId: string) {
    const cat = await this.repo.findById(id, userId)
    if (!cat) throw new NotFoundError('Category')
    return cat
  }

  async create(userId: string, dto: CreateCategoryDto) {
    const result = await this.repo.create(userId, dto)
    await cache.del(CacheKeys.categories.list(userId))
    return result
  }

  async update(id: string, userId: string, dto: UpdateCategoryDto) {
    const cat = await this.findById(id, userId)
    if (cat.isSystem) throw new ForbiddenError('Cannot modify system categories')
    const result = await this.repo.update(id, dto)
    await cache.del(CacheKeys.categories.list(userId))
    return result
  }

  async delete(id: string, userId: string) {
    const cat = await this.findById(id, userId)
    if (cat.isSystem) throw new ForbiddenError('Cannot delete system categories')
    await this.repo.delete(id)
    await cache.del(CacheKeys.categories.list(userId))
  }
}
