import { db } from '../../config/database'
import type { CreateLiabilityDto, UpdateLiabilityDto } from './liabilities.schema'

function toPlain(liability: any) {
  return {
    ...liability,
    balance: Number(liability.balance),
    originalAmount: liability.originalAmount !== null ? Number(liability.originalAmount) : null,
    interestRate: liability.interestRate !== null ? Number(liability.interestRate) : null,
    minimumPayment: liability.minimumPayment !== null ? Number(liability.minimumPayment) : null,
    dueDate: liability.dueDate ? liability.dueDate.toISOString() : null,
    createdAt: liability.createdAt.toISOString(),
    updatedAt: liability.updatedAt.toISOString(),
  }
}

export class LiabilitiesRepository {
  async findAll(userId: string) {
    const rows = await db.liability.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    })
    return rows.map(toPlain)
  }

  async findById(id: string, userId: string) {
    const row = await db.liability.findFirst({ where: { id, userId } })
    return row ? toPlain(row) : null
  }

  async create(userId: string, data: CreateLiabilityDto) {
    const row = await db.liability.create({
      data: {
        ...data,
        userId,
        dueDate: data.dueDate ? new Date(data.dueDate) : undefined,
      },
    })
    return toPlain(row)
  }

  async update(id: string, data: UpdateLiabilityDto) {
    const row = await db.liability.update({
      where: { id },
      data: {
        ...data,
        dueDate: data.dueDate ? new Date(data.dueDate) : undefined,
      },
    })
    return toPlain(row)
  }

  async delete(id: string) {
    await db.liability.delete({ where: { id } })
  }

  async getTotalBalance(userId: string): Promise<number> {
    const result = await db.liability.aggregate({
      where: { userId },
      _sum: { balance: true },
    })
    return Number(result._sum.balance ?? 0)
  }
}
