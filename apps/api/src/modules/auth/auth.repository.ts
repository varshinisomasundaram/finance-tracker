import { db } from '../../config/database'
import crypto from 'crypto'

export class AuthRepository {
  async createRefreshToken(userId: string, token: string, expiresAt: Date): Promise<void> {
    const tokenHash = crypto.createHash('sha256').update(token).digest('hex')
    await db.refreshToken.create({
      data: { userId, tokenHash, expiresAt },
    })
  }

  async findRefreshToken(token: string) {
    const tokenHash = crypto.createHash('sha256').update(token).digest('hex')
    return db.refreshToken.findUnique({
      where: { tokenHash },
      include: { user: true },
    })
  }

  async deleteRefreshToken(token: string): Promise<void> {
    const tokenHash = crypto.createHash('sha256').update(token).digest('hex')
    await db.refreshToken.deleteMany({ where: { tokenHash } })
  }

  async deleteAllUserRefreshTokens(userId: string): Promise<void> {
    await db.refreshToken.deleteMany({ where: { userId } })
  }

  async cleanExpiredTokens(): Promise<void> {
    await db.refreshToken.deleteMany({
      where: { expiresAt: { lt: new Date() } },
    })
  }
}
