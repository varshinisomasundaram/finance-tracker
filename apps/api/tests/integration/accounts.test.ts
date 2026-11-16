import { createTestApp, cleanDatabase, prisma, createTestUser, loginTestUser } from '../helpers/factories'
import { FastifyInstance } from 'fastify'

describe('Accounts API', () => {
  let app: FastifyInstance
  let accessToken: string
  let userId: string

  beforeAll(async () => {
    app = await createTestApp()
  })

  afterAll(async () => {
    await app.close()
    await prisma.$disconnect()
  })

  beforeEach(async () => {
    await cleanDatabase()
    const user = await createTestUser({ email: 'accounts@example.com', password: 'Password1' })
    userId = user.id
    const tokens = await loginTestUser(app, 'accounts@example.com')
    accessToken = tokens.accessToken
  })

  const authHeader = () => ({ Authorization: `Bearer ${accessToken}` })

  describe('GET /api/accounts', () => {
    it('should return empty array when no accounts', async () => {
      const res = await app.inject({ method: 'GET', url: '/api/accounts', headers: authHeader() })
      expect(res.statusCode).toBe(200)
      expect(JSON.parse(res.body)).toEqual([])
    })

    it('should return 401 without auth token', async () => {
      const res = await app.inject({ method: 'GET', url: '/api/accounts' })
      expect(res.statusCode).toBe(401)
    })
  })

  describe('POST /api/accounts', () => {
    const validAccount = {
      name: 'My Checking',
      type: 'CHECKING',
      institution: 'Test Bank',
      balance: 5000,
      currency: 'USD',
    }

    it('should create an account', async () => {
      const res = await app.inject({
        method: 'POST',
        url: '/api/accounts',
        headers: authHeader(),
        payload: validAccount,
      })

      expect(res.statusCode).toBe(201)
      const body = JSON.parse(res.body)
      expect(body.name).toBe(validAccount.name)
      expect(body.balance).toBe(5000)
      expect(body.userId).toBe(userId)
    })

    it('should return 422 for missing required fields', async () => {
      const res = await app.inject({
        method: 'POST',
        url: '/api/accounts',
        headers: authHeader(),
        payload: { name: 'Missing Type' },
      })
      expect(res.statusCode).toBe(422)
    })
  })

  describe('PATCH /api/accounts/:id', () => {
    it('should update account', async () => {
      const createRes = await app.inject({
        method: 'POST',
        url: '/api/accounts',
        headers: authHeader(),
        payload: { name: 'Original', type: 'SAVINGS', currency: 'USD' },
      })
      const { id } = JSON.parse(createRes.body)

      const res = await app.inject({
        method: 'PATCH',
        url: `/api/accounts/${id}`,
        headers: authHeader(),
        payload: { name: 'Updated' },
      })

      expect(res.statusCode).toBe(200)
      expect(JSON.parse(res.body).name).toBe('Updated')
    })

    it('should return 404 for non-existent account', async () => {
      const res = await app.inject({
        method: 'PATCH',
        url: '/api/accounts/nonexistent-id',
        headers: authHeader(),
        payload: { name: 'X' },
      })
      expect(res.statusCode).toBe(404)
    })
  })

  describe('DELETE /api/accounts/:id', () => {
    it('should delete account', async () => {
      const createRes = await app.inject({
        method: 'POST',
        url: '/api/accounts',
        headers: authHeader(),
        payload: { name: 'To Delete', type: 'CASH', currency: 'USD' },
      })
      const { id } = JSON.parse(createRes.body)

      const deleteRes = await app.inject({
        method: 'DELETE',
        url: `/api/accounts/${id}`,
        headers: authHeader(),
      })
      expect(deleteRes.statusCode).toBe(204)

      const getRes = await app.inject({
        method: 'GET',
        url: `/api/accounts/${id}`,
        headers: authHeader(),
      })
      expect(getRes.statusCode).toBe(404)
    })
  })
})
