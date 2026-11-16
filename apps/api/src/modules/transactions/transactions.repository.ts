import { Prisma } from '@prisma/client'
import { db } from '../../config/database'
import { getPaginationParams, paginate } from '../../utils/pagination'
import type { CreateTransactionDto, UpdateTransactionDto, TransactionFilters } from './transactions.schema'

function toPlain(tx: any) {
  return {
    ...tx,
    amount: Number(tx.amount),
    date: tx.date.toISOString(),
    createdAt: tx.createdAt.toISOString(),
    updatedAt: tx.updatedAt.toISOString(),
  }
}

export class TransactionsRepository {
  async findAll(userId: string, filters: TransactionFilters) {
    const { skip, take, page, limit } = getPaginationParams(filters.page, filters.limit)

    const where: Prisma.TransactionWhereInput = {
      userId,
      ...(filters.type && { type: filters.type }),
      ...(filters.categoryId && { categoryId: filters.categoryId }),
      ...(filters.accountId && { accountId: filters.accountId }),
      ...(filters.startDate || filters.endDate
        ? {
            date: {
              ...(filters.startDate && { gte: new Date(filters.startDate) }),
              ...(filters.endDate && { lte: new Date(filters.endDate) }),
            },
          }
        : {}),
      ...(filters.search && {
        description: { contains: filters.search, mode: 'insensitive' },
      }),
    }

    const [rows, total] = await Promise.all([
      db.transaction.findMany({
        where,
        include: {
          account: { select: { id: true, name: true } },
          category: { select: { id: true, name: true, color: true } },
        },
        orderBy: { date: 'desc' },
        skip,
        take,
      }),
      db.transaction.count({ where }),
    ])

    return paginate(rows.map(toPlain), total, page, limit)
  }

  async findById(id: string, userId: string) {
    const tx = await db.transaction.findFirst({
      where: { id, userId },
      include: {
        account: { select: { id: true, name: true } },
        category: { select: { id: true, name: true, color: true } },
      },
    })
    return tx ? toPlain(tx) : null
  }

  async create(userId: string, data: CreateTransactionDto) {
    const tx = await db.transaction.create({
      data: {
        ...data,
        userId,
        date: new Date(data.date),
      },
      include: {
        account: { select: { id: true, name: true } },
        category: { select: { id: true, name: true, color: true } },
      },
    })
    return toPlain(tx)
  }

  async update(id: string, data: UpdateTransactionDto) {
    const tx = await db.transaction.update({
      where: { id },
      data: {
        ...data,
        date: data.date ? new Date(data.date) : undefined,
      },
      include: {
        account: { select: { id: true, name: true } },
        category: { select: { id: true, name: true, color: true } },
      },
    })
    return toPlain(tx)
  }

  async delete(id: string) {
    await db.transaction.delete({ where: { id } })
  }

  async getMonthlySummary(userId: string, year: number, month: number) {
    const startDate = new Date(year, month - 1, 1)
    const endDate = new Date(year, month, 0, 23, 59, 59)

    const result = await db.transaction.groupBy({
      by: ['type'],
      where: { userId, date: { gte: startDate, lte: endDate } },
      _sum: { amount: true },
      _count: true,
    })

    return result.map((r) => ({
      type: r.type,
      total: Number(r._sum.amount ?? 0),
      count: r._count,
    }))
  }

  async getRecentTransactions(userId: string, limit = 10) {
    const rows = await db.transaction.findMany({
      where: { userId },
      include: {
        account: { select: { id: true, name: true } },
        category: { select: { id: true, name: true, color: true } },
      },
      orderBy: { date: 'desc' },
      take: limit,
    })
    return rows.map(toPlain)
  }
}
