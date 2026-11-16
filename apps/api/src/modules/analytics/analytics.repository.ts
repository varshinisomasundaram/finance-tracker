import { db } from '../../config/database'

export class AnalyticsRepository {
  async getSpendingByCategory(userId: string, year: number, month: number) {
    const startDate = new Date(year, month - 1, 1)
    const endDate = new Date(year, month, 0, 23, 59, 59)

    const result = await db.transaction.groupBy({
      by: ['categoryId'],
      where: { userId, type: 'EXPENSE', date: { gte: startDate, lte: endDate } },
      _sum: { amount: true },
      _count: true,
    })

    // Fetch category details for all categoryIds
    const categoryIds = result.map((r) => r.categoryId).filter(Boolean) as string[]
    const categories = categoryIds.length
      ? await db.category.findMany({
          where: { id: { in: categoryIds } },
          select: { id: true, name: true, color: true },
        })
      : []

    const categoryMap = new Map(categories.map((c) => [c.id, c]))
    const grandTotal = result.reduce((sum, r) => sum + Number(r._sum.amount ?? 0), 0)

    return result.map((r) => {
      const cat = r.categoryId ? categoryMap.get(r.categoryId) : null
      const total = Number(r._sum.amount ?? 0)
      return {
        categoryId: r.categoryId,
        categoryName: cat?.name ?? 'Uncategorized',
        color: cat?.color ?? '#94a3b8',
        total,
        count: r._count,
        percentage: grandTotal > 0 ? Math.round((total / grandTotal) * 10000) / 100 : 0,
      }
    }).sort((a, b) => b.total - a.total)
  }

  async getIncomeVsExpense(userId: string, months: number) {
    const now = new Date()
    const results = []

    for (let i = months - 1; i >= 0; i--) {
      const year = new Date(now.getFullYear(), now.getMonth() - i, 1).getFullYear()
      const month = new Date(now.getFullYear(), now.getMonth() - i, 1).getMonth() + 1
      const startDate = new Date(year, month - 1, 1)
      const endDate = new Date(year, month, 0, 23, 59, 59)

      const grouped = await db.transaction.groupBy({
        by: ['type'],
        where: { userId, date: { gte: startDate, lte: endDate } },
        _sum: { amount: true },
      })

      const income = Number(grouped.find((g) => g.type === 'INCOME')?._sum.amount ?? 0)
      const expense = Number(grouped.find((g) => g.type === 'EXPENSE')?._sum.amount ?? 0)
      const savings = income - expense
      const savingsRate = income > 0 ? Math.round((savings / income) * 10000) / 100 : 0

      results.push({ month, year, income, expense, savings, savingsRate })
    }

    return results
  }

  async getSpendingTrends(userId: string, months: number) {
    const now = new Date()
    const results = []

    for (let i = months - 1; i >= 0; i--) {
      const year = new Date(now.getFullYear(), now.getMonth() - i, 1).getFullYear()
      const month = new Date(now.getFullYear(), now.getMonth() - i, 1).getMonth() + 1
      const startDate = new Date(year, month - 1, 1)
      const endDate = new Date(year, month, 0, 23, 59, 59)
      const daysInMonth = endDate.getDate()

      const agg = await db.transaction.aggregate({
        where: { userId, type: 'EXPENSE', date: { gte: startDate, lte: endDate } },
        _sum: { amount: true },
      })

      const total = Number(agg._sum.amount ?? 0)
      results.push({
        month,
        year,
        total,
        avgPerDay: Math.round((total / daysInMonth) * 100) / 100,
      })
    }

    return results
  }

  async getBudgetVsActual(userId: string, year: number, month: number) {
    const startDate = new Date(year, month - 1, 1)
    const endDate = new Date(year, month, 0, 23, 59, 59)

    const budgets = await db.budget.findMany({
      where: {
        userId,
        OR: [
          { period: 'MONTHLY', year, month },
          { period: 'MONTHLY', year: null, month: null },
          { period: 'ANNUAL', year },
        ],
      },
      include: { category: { select: { id: true, name: true } } },
    })

    const results = await Promise.all(
      budgets.map(async (budget) => {
        let actual = 0

        if (budget.categoryId) {
          const agg = await db.transaction.aggregate({
            where: {
              userId,
              type: 'EXPENSE',
              categoryId: budget.categoryId,
              date: { gte: startDate, lte: endDate },
            },
            _sum: { amount: true },
          })
          actual = Number(agg._sum.amount ?? 0)
        } else {
          const agg = await db.transaction.aggregate({
            where: { userId, type: 'EXPENSE', date: { gte: startDate, lte: endDate } },
            _sum: { amount: true },
          })
          actual = Number(agg._sum.amount ?? 0)
        }

        const budgeted = budget.period === 'ANNUAL'
          ? Number(budget.amount) / 12
          : Number(budget.amount)

        const remaining = budgeted - actual
        const percentUsed = budgeted > 0 ? Math.round((actual / budgeted) * 10000) / 100 : 0

        return {
          budgetId: budget.id,
          name: budget.name,
          budgeted: Math.round(budgeted * 100) / 100,
          actual,
          remaining: Math.round(remaining * 100) / 100,
          percentUsed,
          categoryName: budget.category?.name ?? null,
        }
      }),
    )

    return results.sort((a, b) => b.percentUsed - a.percentUsed)
  }

  async getAssetAllocation(userId: string) {
    const result = await db.asset.groupBy({
      by: ['type'],
      where: { userId },
      _sum: { value: true },
      _count: true,
    })

    const grandTotal = result.reduce((sum, r) => sum + Number(r._sum.value ?? 0), 0)

    return result.map((r) => {
      const total = Number(r._sum.value ?? 0)
      return {
        type: r.type,
        total,
        count: r._count,
        percentage: grandTotal > 0 ? Math.round((total / grandTotal) * 10000) / 100 : 0,
      }
    }).sort((a, b) => b.total - a.total)
  }

  async getInsuranceRenewals(userId: string, days: number) {
    const now = new Date()
    const futureDate = new Date(now.getTime() + days * 24 * 60 * 60 * 1000)

    const rows = await db.insurance.findMany({
      where: {
        userId,
        status: 'ACTIVE',
        renewalDate: { gte: now, lte: futureDate },
      },
      orderBy: { renewalDate: 'asc' },
    })

    return rows.map((r) => ({
      id: r.id,
      name: r.name,
      type: r.type,
      provider: r.provider,
      renewalDate: r.renewalDate.toISOString(),
      premiumAmount: Number(r.premiumAmount),
      premiumFrequency: r.premiumFrequency,
      daysUntilRenewal: Math.ceil((r.renewalDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)),
    }))
  }

  async getTopExpenses(userId: string, year: number, month: number, limit: number) {
    const startDate = new Date(year, month - 1, 1)
    const endDate = new Date(year, month, 0, 23, 59, 59)

    const rows = await db.transaction.groupBy({
      by: ['description'],
      where: { userId, type: 'EXPENSE', date: { gte: startDate, lte: endDate } },
      _sum: { amount: true },
      _count: true,
      orderBy: { _sum: { amount: 'desc' } },
      take: limit,
    })

    return rows.map((r) => ({
      description: r.description,
      total: Number(r._sum.amount ?? 0),
      count: r._count,
    }))
  }
}
