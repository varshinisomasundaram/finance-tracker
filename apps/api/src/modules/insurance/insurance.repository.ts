import { db } from '../../config/database'
import type { CreateInsuranceDto, UpdateInsuranceDto } from './insurance.schema'

// Annual premium multipliers per frequency
const ANNUAL_MULTIPLIER: Record<string, number> = {
  MONTHLY: 12,
  QUARTERLY: 4,
  HALF_YEARLY: 2,
  ANNUALLY: 1,
  SINGLE_PREMIUM: 0, // treat one-time payment as 0 recurring cost
}

function toPlain(row: any) {
  const premium = Number(row.premiumAmount)
  const multiplier = ANNUAL_MULTIPLIER[row.premiumFrequency] ?? 1
  return {
    ...row,
    premiumAmount: premium,
    sumInsured: Number(row.sumInsured),
    annualPremium: row.premiumFrequency === 'SINGLE_PREMIUM' ? premium : premium * multiplier,
    startDate: row.startDate.toISOString(),
    renewalDate: row.renewalDate.toISOString(),
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt.toISOString(),
  }
}

export class InsuranceRepository {
  async findAll(userId: string) {
    const rows = await db.insurance.findMany({
      where: { userId },
      orderBy: { renewalDate: 'asc' },
    })
    return rows.map(toPlain)
  }

  async findById(id: string, userId: string) {
    const row = await db.insurance.findFirst({ where: { id, userId } })
    return row ? toPlain(row) : null
  }

  async create(userId: string, data: CreateInsuranceDto) {
    const row = await db.insurance.create({
      data: {
        ...data,
        userId,
        startDate: new Date(data.startDate),
        renewalDate: new Date(data.renewalDate),
      },
    })
    return toPlain(row)
  }

  async update(id: string, data: UpdateInsuranceDto) {
    const row = await db.insurance.update({
      where: { id },
      data: {
        ...data,
        startDate: data.startDate ? new Date(data.startDate) : undefined,
        renewalDate: data.renewalDate ? new Date(data.renewalDate) : undefined,
      },
    })
    return toPlain(row)
  }

  async delete(id: string) {
    await db.insurance.delete({ where: { id } })
  }

  /** Total annual premium across all active policies — used for dashboard */
  async getTotalAnnualPremium(userId: string): Promise<number> {
    const rows = await db.insurance.findMany({
      where: { userId, status: 'ACTIVE' },
      select: { premiumAmount: true, premiumFrequency: true },
    })
    return rows.reduce((sum, r) => {
      const m = ANNUAL_MULTIPLIER[r.premiumFrequency] ?? 1
      return sum + (r.premiumFrequency === 'SINGLE_PREMIUM' ? 0 : Number(r.premiumAmount) * m)
    }, 0)
  }
}
