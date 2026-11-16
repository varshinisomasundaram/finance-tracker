import { createTestApp, cleanDatabase, prisma } from '../helpers/factories'
import { FastifyInstance } from 'fastify'

describe('Auth API', () => {
  let app: FastifyInstance

  beforeAll(async () => {
    app = await createTestApp()
  })

  afterAll(async () => {
    await app.close()
    await prisma.$disconnect()
  })

  beforeEach(async () => {
    await cleanDatabase()
  })

  describe('POST /api/auth/register', () => {
    const validPayload = {
      name: 'Test User',
      email: 'test@example.com',
      password: 'Password1',
    }

    it('should register a new user and return tokens', async () => {
      const res = await app.inject({
        method: 'POST',
        url: '/api/auth/register',
        payload: validPayload,
      })

      expect(res.statusCode).toBe(201)
      const body = JSON.parse(res.body)
      expect(body).toHaveProperty('accessToken')
      expect(body).toHaveProperty('refreshToken')
      expect(body.user.email).toBe(validPayload.email)
      expect(body.user.name).toBe(validPayload.name)
    })

    it('should return 409 when email already exists', async () => {
      await app.inject({ method: 'POST', url: '/api/auth/register', payload: validPayload })
      const res = await app.inject({ method: 'POST', url: '/api/auth/register', payload: validPayload })

      expect(res.statusCode).toBe(409)
      const body = JSON.parse(res.body)
      expect(body.error).toBe('CONFLICT')
    })

    it('should return 422 for invalid email', async () => {
      const res = await app.inject({
        method: 'POST',
        url: '/api/auth/register',
        payload: { ...validPayload, email: 'not-an-email' },
      })
      expect(res.statusCode).toBe(422)
    })

    it('should return 422 for weak password', async () => {
      const res = await app.inject({
        method: 'POST',
        url: '/api/auth/register',
        payload: { ...validPayload, password: 'weak' },
      })
      expect(res.statusCode).toBe(422)
    })
  })

  describe('POST /api/auth/login', () => {
    beforeEach(async () => {
      await app.inject({
        method: 'POST',
        url: '/api/auth/register',
        payload: { name: 'Test', email: 'login@example.com', password: 'Password1' },
      })
    })

    it('should login with valid credentials', async () => {
      const res = await app.inject({
        method: 'POST',
        url: '/api/auth/login',
        payload: { email: 'login@example.com', password: 'Password1' },
      })

      expect(res.statusCode).toBe(200)
      const body = JSON.parse(res.body)
      expect(body).toHaveProperty('accessToken')
      expect(body).toHaveProperty('refreshToken')
    })

    it('should return 401 for wrong password', async () => {
      const res = await app.inject({
        method: 'POST',
        url: '/api/auth/login',
        payload: { email: 'login@example.com', password: 'WrongPass1' },
      })
      expect(res.statusCode).toBe(401)
    })

    it('should return 401 for unknown email', async () => {
      const res = await app.inject({
        method: 'POST',
        url: '/api/auth/login',
        payload: { email: 'unknown@example.com', password: 'Password1' },
      })
      expect(res.statusCode).toBe(401)
    })
  })

  describe('POST /api/auth/refresh', () => {
    it('should return new access token with valid refresh token', async () => {
      const registerRes = await app.inject({
        method: 'POST',
        url: '/api/auth/register',
        payload: { name: 'Test', email: 'refresh@example.com', password: 'Password1' },
      })
      const { refreshToken } = JSON.parse(registerRes.body)

      const res = await app.inject({
        method: 'POST',
        url: '/api/auth/refresh',
        payload: { refreshToken },
      })

      expect(res.statusCode).toBe(200)
      expect(JSON.parse(res.body)).toHaveProperty('accessToken')
    })

    it('should return 401 for invalid refresh token', async () => {
      const res = await app.inject({
        method: 'POST',
        url: '/api/auth/refresh',
        payload: { refreshToken: 'invalid-token' },
      })
      expect(res.statusCode).toBe(401)
    })
  })

  describe('DELETE /api/auth/logout', () => {
    it('should logout successfully', async () => {
      const registerRes = await app.inject({
        method: 'POST',
        url: '/api/auth/register',
        payload: { name: 'Test', email: 'logout@example.com', password: 'Password1' },
      })
      const { refreshToken } = JSON.parse(registerRes.body)

      const res = await app.inject({
        method: 'DELETE',
        url: '/api/auth/logout',
        payload: { refreshToken },
      })

      expect(res.statusCode).toBe(204)

      // Token should be invalidated
      const refreshRes = await app.inject({
        method: 'POST',
        url: '/api/auth/refresh',
        payload: { refreshToken },
      })
      expect(refreshRes.statusCode).toBe(401)
    })
  })
})
