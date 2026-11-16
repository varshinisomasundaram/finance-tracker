import { db } from '../../config/database'
import type { CreateAccountDto, UpdateAccountDto } from './accounts.schema'

function toPlain(account: any) {
  return {
    ...account,
    balance: Number(account.balance),
    createdAt: account.createdAt.toISOString(),
    updatedAt: account.updatedAt.toISOString(),
  }
}

export class AccountsRepository {
  async findAll(userId: string) {
    const accounts = await db.account.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    })
    return accounts.map(toPlain)
  }

  async findById(id: string, userId: string) {
    const account = await db.account.findFirst({ where: { id, userId } })
    return account ? toPlain(account) : null
  }

  async create(userId: string, data: CreateAccountDto) {
    const account = await db.account.create({ data: { ...data, userId } })
    return toPlain(account)
  }

  async update(id: string, userId: string, data: UpdateAccountDto) {
    const account = await db.account.update({ where: { id }, data })
    return toPlain(account)
  }

  async delete(id: string, userId: string) {
    await db.account.delete({ where: { id } })
  }

  async getTotalBalance(userId: string): Promise<number> {
    const result = await db.account.aggregate({
      where: { userId, isActive: true },
      _sum: { balance: true },
    })
    return Number(result._sum.balance ?? 0)
  }
}
