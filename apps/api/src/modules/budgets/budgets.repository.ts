import { db } from '../../config/database'
import type { CreateBudgetDto, UpdateBudgetDto } from './budgets.schema'

function toPlain(budget: any) {
  return {
    ...budget,
    amount: Number(budget.amount),
    createdAt: budget.createdAt.toISOString(),
    updatedAt: budget.updatedAt.toISOString(),
  }
}

export class BudgetsRepository {
  async findAll(userId: string) {
    const budgets = await db.budget.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    })
    return budgets.map(toPlain)
  }

  async findById(id: string, userId: string) {
    const budget = await db.budget.findFirst({ where: { id, userId } })
    return budget ? toPlain(budget) : null
  }

  async create(userId: string, data: CreateBudgetDto) {
    const budget = await db.budget.create({ data: { ...data, userId } })
    return toPlain(budget)
  }

  async update(id: string, data: UpdateBudgetDto) {
    const budget = await db.budget.update({ where: { id }, data })
    return toPlain(budget)
  }

  async delete(id: string) {
    await db.budget.delete({ where: { id } })
  }
}
