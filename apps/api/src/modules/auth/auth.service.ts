import bcrypt from 'bcryptjs'
import crypto from 'crypto'
import { FastifyInstance } from 'fastify'
import { db } from '../../config/database'
import { config } from '../../config/env'
import { ConflictError, UnauthorizedError, NotFoundError } from '../../utils/errors'
import { AuthRepository } from './auth.repository'
import type { RegisterDto, LoginDto, TokenResponse } from './auth.schema'

const SALT_ROUNDS = 12

function parseExpiresIn(duration: string): number {
  const unit = duration.slice(-1)
  const value = parseInt(duration.slice(0, -1), 10)
  const multipliers: Record<string, number> = { s: 1, m: 60, h: 3600, d: 86400 }
  return value * (multipliers[unit] ?? 60) * 1000
}

export class AuthService {
  private readonly repo = new AuthRepository()

  async register(dto: RegisterDto, fastify: FastifyInstance): Promise<TokenResponse> {
    const existing = await db.user.findUnique({ where: { email: dto.email } })
    if (existing) {
      throw new ConflictError('An account with this email already exists')
    }

    const passwordHash = await bcrypt.hash(dto.password, SALT_ROUNDS)
    const user = await db.user.create({
      data: {
        email: dto.email,
        name: dto.name,
        passwordHash,
        currency: dto.currency ?? 'INR',
      },
    })

    return this.generateTokens(user, fastify)
  }

  async login(dto: LoginDto, fastify: FastifyInstance): Promise<TokenResponse> {
    const user = await db.user.findUnique({ where: { email: dto.email } })
    if (!user) {
      throw new UnauthorizedError('Invalid email or password')
    }

    const isValid = await bcrypt.compare(dto.password, user.passwordHash)
    if (!isValid) {
      throw new UnauthorizedError('Invalid email or password')
    }

    return this.generateTokens(user, fastify)
  }

  async refresh(
    refreshToken: string,
    fastify: FastifyInstance,
  ): Promise<{ accessToken: string }> {
    const stored = await this.repo.findRefreshToken(refreshToken)

    if (!stored || stored.expiresAt < new Date()) {
      if (stored) await this.repo.deleteRefreshToken(refreshToken)
      throw new UnauthorizedError('Invalid or expired refresh token')
    }

    const accessToken = fastify.jwt.sign(
      { id: stored.user.id, email: stored.user.email, name: stored.user.name },
      { expiresIn: config.get('JWT_EXPIRES_IN') },
    )

    return { accessToken }
  }

  async logout(refreshToken: string): Promise<void> {
    await this.repo.deleteRefreshToken(refreshToken)
  }

  async logoutAll(userId: string): Promise<void> {
    await this.repo.deleteAllUserRefreshTokens(userId)
  }

  private async generateTokens(
    user: { id: string; email: string; name: string; currency: string; createdAt: Date },
    fastify: FastifyInstance,
  ): Promise<TokenResponse> {
    const payload = { id: user.id, email: user.email, name: user.name }

    const accessToken = fastify.jwt.sign(payload, {
      expiresIn: config.get('JWT_EXPIRES_IN'),
    })

    const refreshToken = crypto.randomBytes(64).toString('hex')
    const refreshExpiresMs = parseExpiresIn(config.get('JWT_REFRESH_EXPIRES_IN'))
    const expiresAt = new Date(Date.now() + refreshExpiresMs)

    await this.repo.createRefreshToken(user.id, refreshToken, expiresAt)

    return {
      accessToken,
      refreshToken,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        currency: user.currency,
        createdAt: user.createdAt.toISOString(),
      },
    }
  }
}
