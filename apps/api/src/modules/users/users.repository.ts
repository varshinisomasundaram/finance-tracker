import { db } from '../../config/database'
import type { UpdateUserDto } from './users.schema'

export class UsersRepository {
  async findById(id: string) {
    return db.user.findUnique({ where: { id } })
  }

  async update(id: string, data: UpdateUserDto) {
    return db.user.update({ where: { id }, data })
  }

  async updatePassword(id: string, passwordHash: string) {
    return db.user.update({ where: { id }, data: { passwordHash } })
  }

  async delete(id: string) {
    return db.user.delete({ where: { id } })
  }
}
