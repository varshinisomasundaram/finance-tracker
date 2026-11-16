import { db } from '../../config/database'
import type { CreateGoalDto, UpdateGoalDto } from './goals.schema'

function toPlain(goal: any) {
  const target = Number(goal.targetAmount)
  const current = Number(goal.currentAmount)
  return {
    ...goal,
    targetAmount: target,
    currentAmount: current,
    progressPercent: target > 0 ? Math.min(100, Math.round((current / target) * 100)) : 0,
    targetDate: goal.targetDate ? goal.targetDate.toISOString() : null,
    createdAt: goal.createdAt.toISOString(),
    updatedAt: goal.updatedAt.toISOString(),
  }
}

export class GoalsRepository {
  async findAll(userId: string) {
    const goals = await db.goal.findMany({
      where: { userId },
      orderBy: [{ status: 'asc' }, { createdAt: 'desc' }],
    })
    return goals.map(toPlain)
  }

  async findById(id: string, userId: string) {
    const goal = await db.goal.findFirst({ where: { id, userId } })
    return goal ? toPlain(goal) : null
  }

  async create(userId: string, data: CreateGoalDto) {
    const goal = await db.goal.create({
      data: {
        ...data,
        userId,
        targetDate: data.targetDate ? new Date(data.targetDate) : undefined,
      },
    })
    return toPlain(goal)
  }

  async update(id: string, data: UpdateGoalDto) {
    const goal = await db.goal.update({
      where: { id },
      data: {
        ...data,
        targetDate: data.targetDate ? new Date(data.targetDate) : undefined,
      },
    })
    return toPlain(goal)
  }

  async delete(id: string) {
    await db.goal.delete({ where: { id } })
  }
}
