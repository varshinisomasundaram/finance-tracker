import { CATEGORY_RULES } from '../../src/modules/import/import.categories'
import { systemCategories, systemCategoryId } from '../../prisma/system-categories'

/** Same first-match-wins order the import service uses. */
const firstMatch = (description: string) =>
  CATEGORY_RULES.find((rule) => rule.pattern.test(description))?.category ?? null

describe('import category rules', () => {
  const systemNames = new Set(systemCategories.map((c) => c.name))

  it('only points at categories that exist in the system category seed', () => {
    // If a rule names a category that isn't seeded, the import preview silently
    // suggests nothing for matching rows. This is the bug that hid
    // 'Transport', 'Health & Medical', 'Bills & Utilities', 'Investments' and 'EMI & Loans'.
    const missing = [...new Set(CATEGORY_RULES.map((r) => r.category))].filter((name) => !systemNames.has(name))
    expect(missing).toEqual([])
  })

  it('only suggests expense categories', () => {
    const typeOf = new Map(systemCategories.map((c) => [c.name, c.type]))
    const notExpense = CATEGORY_RULES.map((r) => r.category).filter((name) => typeOf.get(name) !== 'EXPENSE')
    expect([...new Set(notExpense)]).toEqual([])
  })

  it.each([
    // The five rules that used to point at missing categories
    ['UBER TRIP BLR 8841', 'Transportation'],
    ['METRO CARD RECHARGE', 'Transportation'],
    ['APOLLO PHARMACY KORAMANGALA', 'Healthcare'],
    ['BESCOM ELECTRICITY BILL', 'Utilities'],
    ['JIO PREPAID RECHARGE', 'Utilities'],
    ['ZERODHA BROKING FUNDS ADD', 'Savings & Investments'],
    ['PPF DEPOSIT SBI', 'Savings & Investments'],
    ['EMI 3 OF 12 HDFC CC', 'Loan Payment'],
    // Rule order and lookaheads
    ['UBER EATS ORDER', 'Food & Dining'],
    ['AMAZON PRIME VIDEO SUBSCRIPTION', 'Entertainment'],
    ['AMAZON PAY INDIA', 'Shopping'],
    ['SWIGGY ORDER 99812', 'Food & Dining'],
  ])('%s → %s', (description, expected) => {
    expect(firstMatch(description)).toBe(expected)
  })

  it('returns no suggestion for unrecognised descriptions', () => {
    expect(firstMatch('NEFT TRANSFER TO R KUMAR')).toBeNull()
  })
})

describe('system categories', () => {
  it('have unique names and unique generated IDs', () => {
    const names = systemCategories.map((c) => c.name)
    const ids = names.map(systemCategoryId)
    expect(new Set(names).size).toBe(names.length)
    expect(new Set(ids).size).toBe(ids.length)
  })

  it('keep the ID format existing rows in the database rely on', () => {
    expect(systemCategoryId('Food & Dining')).toBe('system-food---dining')
    expect(systemCategoryId('Savings & Investments')).toBe('system-savings---investments')
  })
})
