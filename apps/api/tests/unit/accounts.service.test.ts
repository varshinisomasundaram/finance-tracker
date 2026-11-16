import { AccountsService } from '../../src/modules/accounts/accounts.service'
import { AccountsRepository } from '../../src/modules/accounts/accounts.repository'
import { NotFoundError } from '../../src/utils/errors'

jest.mock('../../src/modules/accounts/accounts.repository')
const MockedRepo = AccountsRepository as jest.MockedClass<typeof AccountsRepository>

describe('AccountsService', () => {
  let service: AccountsService
  let mockRepo: jest.Mocked<AccountsRepository>

  const userId = 'user-1'
  const accountId = 'account-1'

  const mockAccount = {
    id: accountId,
    userId,
    name: 'Checking Account',
    type: 'CHECKING' as const,
    institution: 'Bank of Test',
    balance: 1000,
    currency: 'USD',
    color: null,
    isActive: true,
    notes: null,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  }

  beforeEach(() => {
    jest.clearAllMocks()
    service = new AccountsService()
    mockRepo = MockedRepo.mock.instances[0] as jest.Mocked<AccountsRepository>
  })

  describe('findAll', () => {
    it('should return all accounts for user', async () => {
      mockRepo.findAll.mockResolvedValue([mockAccount])
      const result = await service.findAll(userId)
      expect(result).toEqual([mockAccount])
      expect(mockRepo.findAll).toHaveBeenCalledWith(userId)
    })
  })

  describe('findById', () => {
    it('should return account when found', async () => {
      mockRepo.findById.mockResolvedValue(mockAccount)
      const result = await service.findById(accountId, userId)
      expect(result).toEqual(mockAccount)
    })

    it('should throw NotFoundError when account not found', async () => {
      mockRepo.findById.mockResolvedValue(null)
      await expect(service.findById('nonexistent', userId)).rejects.toThrow(NotFoundError)
    })
  })

  describe('create', () => {
    it('should create and return account', async () => {
      mockRepo.create.mockResolvedValue(mockAccount)
      const dto = { name: 'Checking Account', type: 'CHECKING' as const, balance: 1000, currency: 'USD' }
      const result = await service.create(userId, dto)
      expect(result).toEqual(mockAccount)
      expect(mockRepo.create).toHaveBeenCalledWith(userId, dto)
    })
  })

  describe('update', () => {
    it('should update account when found', async () => {
      mockRepo.findById.mockResolvedValue(mockAccount)
      const updated = { ...mockAccount, name: 'Updated Name' }
      mockRepo.update.mockResolvedValue(updated)
      const result = await service.update(accountId, userId, { name: 'Updated Name' })
      expect(result.name).toBe('Updated Name')
    })

    it('should throw NotFoundError when account not found', async () => {
      mockRepo.findById.mockResolvedValue(null)
      await expect(service.update('nonexistent', userId, { name: 'X' })).rejects.toThrow(NotFoundError)
    })
  })

  describe('delete', () => {
    it('should delete account when found', async () => {
      mockRepo.findById.mockResolvedValue(mockAccount)
      mockRepo.delete.mockResolvedValue(undefined)
      await expect(service.delete(accountId, userId)).resolves.not.toThrow()
      expect(mockRepo.delete).toHaveBeenCalledWith(accountId, userId)
    })

    it('should throw NotFoundError when account not found', async () => {
      mockRepo.findById.mockResolvedValue(null)
      await expect(service.delete('nonexistent', userId)).rejects.toThrow(NotFoundError)
    })
  })
})
