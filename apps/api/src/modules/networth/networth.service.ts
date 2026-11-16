import { cache, CacheKeys, CACHE_TTL } from '../../utils/cache'
import { NetWorthRepository } from './networth.repository'

export class NetWorthService {
  private readonly repo = new NetWorthRepository()

  async getCurrent(userId: string) {
    return cache.getOrSet(
      CacheKeys.networth.current(userId),
      CACHE_TTL.SHORT,
      async () => {
        const [totalAssets, totalLiabilities, assetsByType, liabilitiesByType] = await Promise.all([
          this.repo.getTotalAssets(userId),
          this.repo.getTotalLiabilities(userId),
          this.repo.getTotalAssetsByType(userId),
          this.repo.getTotalLiabilitiesByType(userId),
        ])

        return {
          totalAssets,
          totalLiabilities,
          netWorth: totalAssets - totalLiabilities,
          assetsByType,
          liabilitiesByType,
          calculatedAt: new Date().toISOString(),
        }
      },
    )
  }

  async getHistory(userId: string) {
    return cache.getOrSet(
      CacheKeys.networth.history(userId),
      CACHE_TTL.MEDIUM,
      async () => {
        const snapshots = await this.repo.getHistory(userId)

        let change: { amount: number; percent: number; direction: 'up' | 'down' | 'flat' } = {
          amount: 0,
          percent: 0,
          direction: 'flat',
        }

        if (snapshots.length >= 2) {
          const latest = snapshots[snapshots.length - 1]
          const previous = snapshots[snapshots.length - 2]
          const amount = latest.netWorth - previous.netWorth
          const percent =
            previous.netWorth !== 0 ? (amount / Math.abs(previous.netWorth)) * 100 : 0
          change = {
            amount,
            percent: Math.round(percent * 100) / 100,
            direction: amount > 0 ? 'up' : amount < 0 ? 'down' : 'flat',
          }
        }

        return { snapshots, change }
      },
    )
  }

  async takeSnapshot(userId: string) {
    const totalAssets = await this.repo.getTotalAssets(userId)
    const totalLiabilities = await this.repo.getTotalLiabilities(userId)
    const snapshot = await this.repo.createSnapshot(userId, totalAssets, totalLiabilities)
    // Invalidate history cache since a new snapshot was added
    await cache.del(CacheKeys.networth.history(userId))
    return snapshot
  }
}
