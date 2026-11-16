import { z } from 'zod'

export const PaginationSchema = z.object({
  page: z.string().optional().default('1').transform(Number),
  limit: z.string().optional().default('20').transform(Number),
})

export type PaginationQuery = z.infer<typeof PaginationSchema>

export interface PaginatedResult<T> {
  data: T[]
  meta: {
    total: number
    page: number
    limit: number
    totalPages: number
  }
}

export function paginate<T>(
  data: T[],
  total: number,
  page: number,
  limit: number,
): PaginatedResult<T> {
  return {
    data,
    meta: {
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    },
  }
}

export function getPaginationParams(page: number, limit: number) {
  const sanitizedLimit = Math.min(Math.max(limit, 1), 100)
  const sanitizedPage = Math.max(page, 1)
  return {
    skip: (sanitizedPage - 1) * sanitizedLimit,
    take: sanitizedLimit,
    page: sanitizedPage,
    limit: sanitizedLimit,
  }
}
