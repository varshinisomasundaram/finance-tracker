import DatabaseService from '../../config/database'
import { CreateReviewDto } from './reviews.schema'

const db = () => DatabaseService.getInstance().prisma

function toPlain(r: {
  id: string
  name: string
  role: string
  rating: number
  text: string
  isApproved: boolean
  helpfulCount: number
  notHelpfulCount: number
  createdAt: Date
}) {
  return {
    id: r.id,
    name: r.name,
    role: r.role,
    rating: r.rating,
    text: r.text,
    isApproved: r.isApproved,
    helpfulCount: r.helpfulCount,
    notHelpfulCount: r.notHelpfulCount,
    createdAt: r.createdAt.toISOString(),
  }
}

export const reviewsRepository = {
  async findApproved() {
    const rows = await db().review.findMany({
      where: { isApproved: true },
      orderBy: { createdAt: 'desc' },
    })
    return rows.map(toPlain)
  },

  async create(dto: CreateReviewDto, userId?: string) {
    const row = await db().review.create({
      data: {
        name: dto.name,
        role: dto.role,
        rating: dto.rating,
        text: dto.text,
        isApproved: !!userId,
        userId: userId ?? null,
      },
    })
    return toPlain(row)
  },

  async vote(id: string, type: 'UP' | 'DOWN') {
    const row = await db().review.update({
      where: { id },
      data: type === 'UP'
        ? { helpfulCount: { increment: 1 } }
        : { notHelpfulCount: { increment: 1 } },
    })
    return toPlain(row)
  },
}
