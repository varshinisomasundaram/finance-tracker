import { NotFoundError } from '../../utils/errors'
import { cache, CacheKeys, CACHE_TTL } from '../../utils/cache'
import { AccountsRepository } from './accounts.repository'
import type { CreateAccountDto, UpdateAccountDto } from './accounts.schema'

export class AccountsService {
  private readonly repo = new AccountsRepository()

  async findAll(userId: string) {
    return cache.getOrSet(
      CacheKeys.accounts.list(userId),
      CACHE_TTL.MEDIUM,
      () => this.repo.findAll(userId),
    )
  }

  async findById(id: string, userId: string) {
    const account = await this.repo.findById(id, userId)
    if (!account) throw new NotFoundError('Account')
    return account
  }

  async create(userId: string, dto: CreateAccountDto) {
    const result = await this.repo.create(userId, dto)
    await cache.del(CacheKeys.accounts.list(userId), CacheKeys.accounts.balance(userId))
    return result
  }

  async update(id: string, userId: string, dto: UpdateAccountDto) {
    await this.findById(id, userId)
    const result = await this.repo.update(id, userId, dto)
    await cache.del(
      CacheKeys.accounts.list(userId),
      CacheKeys.accounts.balance(userId),
      CacheKeys.accounts.single(id),
    )
    return result
  }

  async delete(id: string, userId: string) {
    await this.findById(id, userId)
    await this.repo.delete(id, userId)
    await cache.del(CacheKeys.accounts.list(userId), CacheKeys.accounts.balance(userId))
  }

  async getTotalBalance(userId: string) {
    return cache.getOrSet(
      CacheKeys.accounts.balance(userId),
      CACHE_TTL.SHORT,
      () => this.repo.getTotalBalance(userId),
    )
  }
}
