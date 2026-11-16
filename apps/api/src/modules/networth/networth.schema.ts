import { z } from 'zod'

export const NetWorthSnapshotResponseSchema = z.object({
  id: z.string(),
  userId: z.string(),
  totalAssets: z.number(),
  totalLiabilities: z.number(),
  netWorth: z.number(),
  snapshotDate: z.string(),
  createdAt: z.string(),
})

export const NetWorthCurrentResponseSchema = z.object({
  totalAssets: z.number(),
  totalLiabilities: z.number(),
  netWorth: z.number(),
  assetsByType: z.array(z.object({
    type: z.string(),
    total: z.number(),
    count: z.number(),
  })),
  liabilitiesByType: z.array(z.object({
    type: z.string(),
    total: z.number(),
    count: z.number(),
  })),
  calculatedAt: z.string(),
})

export const NetWorthHistoryResponseSchema = z.object({
  snapshots: z.array(NetWorthSnapshotResponseSchema),
  change: z.object({
    amount: z.number(),
    percent: z.number(),
    direction: z.enum(['up', 'down', 'flat']),
  }),
})
