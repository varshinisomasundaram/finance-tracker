import { NotFoundError } from '../../utils/errors'
import { TransactionsRepository } from './transactions.repository'
import type { CreateTransactionDto, UpdateTransactionDto, TransactionFilters } from './transactions.schema'

export class TransactionsService {
  private readonly repo = new TransactionsRepository()

  async findAll(userId: string, filters: TransactionFilters) {
    return this.repo.findAll(userId, filters)
  }

  async findById(id: string, userId: string) {
    const tx = await this.repo.findById(id, userId)
    if (!tx) throw new NotFoundError('Transaction')
    return tx
  }

  async create(userId: string, dto: CreateTransactionDto) {
    return this.repo.create(userId, dto)
  }

  async update(id: string, userId: string, dto: UpdateTransactionDto) {
    await this.findById(id, userId)
    return this.repo.update(id, dto)
  }

  async delete(id: string, userId: string) {
    await this.findById(id, userId)
    await this.repo.delete(id)
  }

  async getMonthlySummary(userId: string, year: number, month: number) {
    return this.repo.getMonthlySummary(userId, year, month)
  }

  async getRecentTransactions(userId: string, limit?: number) {
    return this.repo.getRecentTransactions(userId, limit)
  }
}
