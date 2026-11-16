import api from '@/lib/api'
import type { Category } from '@/types'

export const categoriesService = {
  getAll: async () => {
    const res = await api.get<Category[]>('/categories')
    return res.data
  },
}
