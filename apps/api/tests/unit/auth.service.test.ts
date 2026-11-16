import { AuthService } from '../../src/modules/auth/auth.service'
import { ConflictError, UnauthorizedError } from '../../src/utils/errors'
import { db } from '../../src/config/database'
import bcrypt from 'bcryptjs'

jest.mock('../../src/config/database', () => ({
  db: {
    user: {
      findUnique: jest.fn(),
      create: jest.fn(),
    },
    refreshToken: {
      create: jest.fn(),
      findUnique: jest.fn(),
      deleteMany: jest.fn(),
    },
  },
}))

const mockDb = db as jest.Mocked<typeof db>

const mockFastify = {
  jwt: {
    sign: jest.fn().mockReturnValue('mock-access-token'),
  },
} as any

describe('AuthService', () => {
  let authService: AuthService

  beforeEach(() => {
    authService = new AuthService()
    jest.clearAllMocks()
  })

  describe('register', () => {
    it('should throw ConflictError if email already exists', async () => {
      ;(mockDb.user.findUnique as jest.Mock).mockResolvedValue({ id: '1', email: 'test@test.com' })

      await expect(
        authService.register(
          { email: 'test@test.com', name: 'Test', password: 'Password1' },
          mockFastify,
        ),
      ).rejects.toThrow(ConflictError)
    })

    it('should create user and return tokens for new email', async () => {
      ;(mockDb.user.findUnique as jest.Mock).mockResolvedValue(null)
      ;(mockDb.user.create as jest.Mock).mockResolvedValue({
        id: 'new-id',
        email: 'new@test.com',
        name: 'New User',
        currency: 'USD',
        createdAt: new Date(),
      })
      ;(mockDb.refreshToken.create as jest.Mock).mockResolvedValue({})

      const result = await authService.register(
        { email: 'new@test.com', name: 'New User', password: 'Password1' },
        mockFastify,
      )

      expect(result).toHaveProperty('accessToken')
      expect(result).toHaveProperty('refreshToken')
      expect(result.user.email).toBe('new@test.com')
      expect(mockDb.user.create).toHaveBeenCalledTimes(1)
    })

    it('should hash the password before storing', async () => {
      ;(mockDb.user.findUnique as jest.Mock).mockResolvedValue(null)
      ;(mockDb.user.create as jest.Mock).mockResolvedValue({
        id: 'id',
        email: 'a@b.com',
        name: 'User',
        currency: 'USD',
        createdAt: new Date(),
      })
      ;(mockDb.refreshToken.create as jest.Mock).mockResolvedValue({})

      await authService.register(
        { email: 'a@b.com', name: 'User', password: 'Password1' },
        mockFastify,
      )

      const createCall = (mockDb.user.create as jest.Mock).mock.calls[0][0]
      const isHashed = await bcrypt.compare('Password1', createCall.data.passwordHash)
      expect(isHashed).toBe(true)
    })
  })

  describe('login', () => {
    it('should throw UnauthorizedError for unknown email', async () => {
      ;(mockDb.user.findUnique as jest.Mock).mockResolvedValue(null)

      await expect(
        authService.login({ email: 'unknown@test.com', password: 'Password1' }, mockFastify),
      ).rejects.toThrow(UnauthorizedError)
    })

    it('should throw UnauthorizedError for wrong password', async () => {
      const hash = await bcrypt.hash('CorrectPassword1', 12)
      ;(mockDb.user.findUnique as jest.Mock).mockResolvedValue({
        id: '1',
        email: 'test@test.com',
        name: 'Test',
        passwordHash: hash,
        currency: 'USD',
        createdAt: new Date(),
      })

      await expect(
        authService.login({ email: 'test@test.com', password: 'WrongPassword1' }, mockFastify),
      ).rejects.toThrow(UnauthorizedError)
    })

    it('should return tokens for valid credentials', async () => {
      const hash = await bcrypt.hash('Password1', 12)
      ;(mockDb.user.findUnique as jest.Mock).mockResolvedValue({
        id: '1',
        email: 'test@test.com',
        name: 'Test',
        passwordHash: hash,
        currency: 'USD',
        createdAt: new Date(),
      })
      ;(mockDb.refreshToken.create as jest.Mock).mockResolvedValue({})

      const result = await authService.login(
        { email: 'test@test.com', password: 'Password1' },
        mockFastify,
      )

      expect(result).toHaveProperty('accessToken', 'mock-access-token')
      expect(result).toHaveProperty('refreshToken')
      expect(result.user.email).toBe('test@test.com')
    })
  })
})
