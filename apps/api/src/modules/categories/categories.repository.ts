import { db } from '../../config/database'
import type { CreateCategoryDto, UpdateCategoryDto } from './categories.schema'

function toPlain(cat: any) {
  return {
    ...cat,
    createdAt: cat.createdAt.toISOString(),
  }
}

export class CategoriesRepository {
  async findAll(userId: string) {
    const rows = await db.category.findMany({
      where: { OR: [{ userId }, { isSystem: true, userId: null }] },
      orderBy: [{ isSystem: 'desc' }, { name: 'asc' }],
    })
    return rows.map(toPlain)
  }

  async findById(id: string, userId: string) {
    const row = await db.category.findFirst({
      where: { id, OR: [{ userId }, { isSystem: true }] },
    })
    return row ? toPlain(row) : null
  }

  async create(userId: string, data: CreateCategoryDto) {
    const row = await db.category.create({ data: { ...data, userId } })
    return toPlain(row)
  }

  async update(id: string, data: UpdateCategoryDto) {
    const row = await db.category.update({ where: { id }, data })
    return toPlain(row)
  }

  async delete(id: string) {
    await db.category.delete({ where: { id } })
  }
}
