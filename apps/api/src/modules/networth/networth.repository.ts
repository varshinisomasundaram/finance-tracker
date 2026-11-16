import { db } from '../../config/database'

function toPlain(snapshot: any) {
  return {
    ...snapshot,
    totalAssets: Number(snapshot.totalAssets),
    totalLiabilities: Number(snapshot.totalLiabilities),
    netWorth: Number(snapshot.netWorth),
    snapshotDate: snapshot.snapshotDate.toISOString(),
    createdAt: snapshot.createdAt.toISOString(),
  }
}

export class NetWorthRepository {
  async createSnapshot(userId: string, totalAssets: number, totalLiabilities: number) {
    const netWorth = totalAssets - totalLiabilities
    const snapshot = await db.netWorthSnapshot.create({
      data: { userId, totalAssets, totalLiabilities, netWorth },
    })
    return toPlain(snapshot)
  }

  async getHistory(userId: string, limit = 13) {
    const rows = await db.netWorthSnapshot.findMany({
      where: { userId },
      orderBy: { snapshotDate: 'desc' },
      take: limit,
    })
    return rows.map(toPlain).reverse()
  }

  async getLatest(userId: string) {
    const row = await db.netWorthSnapshot.findFirst({
      where: { userId },
      orderBy: { snapshotDate: 'desc' },
    })
    return row ? toPlain(row) : null
  }

  async getTotalAssetsByType(userId: string) {
    const result = await db.asset.groupBy({
      by: ['type'],
      where: { userId },
      _sum: { value: true },
      _count: true,
    })
    return result.map((r) => ({
      type: r.type,
      total: Number(r._sum.value ?? 0),
      count: r._count,
    }))
  }

  async getTotalLiabilitiesByType(userId: string) {
    const result = await db.liability.groupBy({
      by: ['type'],
      where: { userId },
      _sum: { balance: true },
      _count: true,
    })
    return result.map((r) => ({
      type: r.type,
      total: Number(r._sum.balance ?? 0),
      count: r._count,
    }))
  }

  async getTotalAssets(userId: string): Promise<number> {
    const result = await db.asset.aggregate({
      where: { userId },
      _sum: { value: true },
    })
    return Number(result._sum.value ?? 0)
  }

  async getTotalLiabilities(userId: string): Promise<number> {
    const result = await db.liability.aggregate({
      where: { userId },
      _sum: { balance: true },
    })
    return Number(result._sum.balance ?? 0)
  }
}
