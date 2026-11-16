import { db } from '../../config/database'
import type { CreateAssetDto, UpdateAssetDto } from './assets.schema'

function toPlain(asset: any) {
  return {
    ...asset,
    value: Number(asset.value),
    purchasePrice: asset.purchasePrice !== null ? Number(asset.purchasePrice) : null,
    purchaseDate: asset.purchaseDate ? asset.purchaseDate.toISOString() : null,
    targetDate: asset.targetDate ? asset.targetDate.toISOString() : null,
    quantity: asset.quantity !== null ? Number(asset.quantity) : null,
    createdAt: asset.createdAt.toISOString(),
    updatedAt: asset.updatedAt.toISOString(),
  }
}

export class AssetsRepository {
  async findAll(userId: string) {
    const assets = await db.asset.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    })
    return assets.map(toPlain)
  }

  async findById(id: string, userId: string) {
    const asset = await db.asset.findFirst({ where: { id, userId } })
    return asset ? toPlain(asset) : null
  }

  async create(userId: string, data: CreateAssetDto) {
    const asset = await db.asset.create({
      data: {
        ...data,
        userId,
        purchaseDate: data.purchaseDate ? new Date(data.purchaseDate) : undefined,
        targetDate: data.targetDate ? new Date(data.targetDate) : undefined,
      },
    })
    return toPlain(asset)
  }

  async update(id: string, data: UpdateAssetDto) {
    const asset = await db.asset.update({
      where: { id },
      data: {
        ...data,
        purchaseDate: data.purchaseDate ? new Date(data.purchaseDate) : undefined,
        targetDate: data.targetDate ? new Date(data.targetDate) : undefined,
      },
    })
    return toPlain(asset)
  }

  async delete(id: string) {
    await db.asset.delete({ where: { id } })
  }

  async getTotalValue(userId: string): Promise<number> {
    const result = await db.asset.aggregate({
      where: { userId },
      _sum: { value: true },
    })
    return Number(result._sum.value ?? 0)
  }
}
