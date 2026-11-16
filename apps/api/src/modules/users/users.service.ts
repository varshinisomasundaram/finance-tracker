import bcrypt from 'bcryptjs'
import { NotFoundError, UnauthorizedError } from '../../utils/errors'
import { UsersRepository } from './users.repository'
import type { UpdateUserDto, ChangePasswordDto, UserResponse } from './users.schema'

const SALT_ROUNDS = 12

function toResponse(user: {
  id: string
  email: string
  name: string
  currency: string
  avatarUrl: string | null
  createdAt: Date
  updatedAt: Date
}): UserResponse {
  return {
    id: user.id,
    email: user.email,
    name: user.name,
    currency: user.currency,
    avatarUrl: user.avatarUrl,
    createdAt: user.createdAt.toISOString(),
    updatedAt: user.updatedAt.toISOString(),
  }
}

export class UsersService {
  private readonly repo = new UsersRepository()

  async getMe(userId: string): Promise<UserResponse> {
    const user = await this.repo.findById(userId)
    if (!user) throw new NotFoundError('User')
    return toResponse(user)
  }

  async update(userId: string, dto: UpdateUserDto): Promise<UserResponse> {
    const user = await this.repo.update(userId, dto)
    return toResponse(user)
  }

  async changePassword(userId: string, dto: ChangePasswordDto): Promise<void> {
    const user = await this.repo.findById(userId)
    if (!user) throw new NotFoundError('User')

    const isValid = await bcrypt.compare(dto.currentPassword, user.passwordHash)
    if (!isValid) throw new UnauthorizedError('Current password is incorrect')

    const newHash = await bcrypt.hash(dto.newPassword, SALT_ROUNDS)
    await this.repo.updatePassword(userId, newHash)
  }

  async deleteAccount(userId: string): Promise<void> {
    await this.repo.delete(userId)
  }
}
