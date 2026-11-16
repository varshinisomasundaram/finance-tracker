import { PrismaClient, AccountType, AssetType, InvestmentStrategy, LiabilityType, InsuranceType, PremiumFrequency, InsuranceStatus, TransactionType, GoalType, GoalStatus, BudgetPeriod } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

const EMAIL = 'demo@fintracker.app'
const PASSWORD = 'Demo@1234'

function cat(name: string) {
  return `system-${name.toLowerCase().replace(/[^a-z0-9]/g, '-')}`
}

async function main() {
  console.log('Cleaning old demo data...')
  await prisma.user.deleteMany({ where: { email: EMAIL } })

  console.log('Creating demo user...')
  const user = await prisma.user.create({
    data: {
      email: EMAIL,
      passwordHash: await bcrypt.hash(PASSWORD, 10),
      name: 'Arjun Mehta',
      currency: 'INR',
    },
  })
  const uid = user.id

  const savings = await prisma.account.create({
    data: { userId: uid, name: 'HDFC Savings', type: AccountType.SAVINGS, institution: 'HDFC Bank', balance: 85000, currency: 'INR' },
  })
  const investment = await prisma.account.create({
    data: { userId: uid, name: 'Zerodha Demat', type: AccountType.INVESTMENT, institution: 'Zerodha', balance: 170500, currency: 'INR' },
  })
  const cash = await prisma.account.create({
    data: { userId: uid, name: 'Cash Wallet', type: AccountType.CASH, balance: 12000, currency: 'INR' },
  })

  await prisma.asset.createMany({
    data: [
      { userId: uid, name: '2BHK Flat, Whitefield', type: AssetType.REAL_ESTATE, value: 4500000, purchasePrice: 3800000, currency: 'INR' },
      { userId: uid, name: 'Honda City 2021', type: AssetType.VEHICLE, value: 850000, purchasePrice: 1200000, currency: 'INR' },
      { userId: uid, name: 'Infosys Ltd', type: AssetType.EQUITY, value: 92500, purchasePrice: 75000, quantity: 50, investmentStrategy: InvestmentStrategy.LONG_TERM, currency: 'INR' },
      { userId: uid, name: 'SBI Blue Chip Fund', type: AssetType.MUTUAL_FUND, value: 78000, purchasePrice: 60000, quantity: 1200, investmentStrategy: InvestmentStrategy.LONG_TERM, currency: 'INR' },
      { userId: uid, name: 'Physical Gold 50g', type: AssetType.GOLD, value: 325000, purchasePrice: 280000, quantity: 50, currency: 'INR' },
      { userId: uid, name: 'PPF Account', type: AssetType.PROVIDENT_FUND, value: 350000, currency: 'INR' },
      { userId: uid, name: 'NPS Tier-I', type: AssetType.RETIREMENT, value: 420000, currency: 'INR' },
      { userId: uid, name: 'HDFC FD', type: AssetType.SAVINGS, value: 200000, purchasePrice: 200000, currency: 'INR' },
      { userId: uid, name: 'Sukanya Samriddhi', type: AssetType.GOVERNMENT_SCHEME, value: 180000, currency: 'INR' },
      { userId: uid, name: 'Cash', type: AssetType.CASH, value: 25000, currency: 'INR' },
    ],
  })

  await prisma.liability.createMany({
    data: [
      { userId: uid, name: 'HDFC Home Loan', type: LiabilityType.MORTGAGE, balance: 3200000, originalAmount: 3600000, interestRate: 8.5, minimumPayment: 28000, currency: 'INR' },
      { userId: uid, name: 'HDFC Car Loan', type: LiabilityType.CAR_LOAN, balance: 350000, originalAmount: 700000, interestRate: 9.25, minimumPayment: 12000, currency: 'INR' },
      { userId: uid, name: 'ICICI Personal Loan', type: LiabilityType.PERSONAL_LOAN, balance: 150000, originalAmount: 300000, interestRate: 13.5, minimumPayment: 5000, currency: 'INR' },
      { userId: uid, name: 'HDFC Credit Card', type: LiabilityType.CREDIT_CARD, balance: 35000, interestRate: 42, minimumPayment: 3500, currency: 'INR' },
    ],
  })

  await prisma.insurance.createMany({
    data: [
      { userId: uid, name: 'HDFC Life Term Plan', type: InsuranceType.TERM_LIFE, provider: 'HDFC Life', policyNumber: 'HDFC-TL-2023-1045', premiumAmount: 15000, premiumFrequency: PremiumFrequency.ANNUALLY, sumInsured: 10000000, startDate: new Date('2023-03-01'), renewalDate: new Date('2026-03-01'), status: InsuranceStatus.ACTIVE, nominees: 'Priya Mehta' },
      { userId: uid, name: 'Star Health Family Floater', type: InsuranceType.HEALTH, provider: 'Star Health', policyNumber: 'STAR-HF-2024-778', premiumAmount: 18000, premiumFrequency: PremiumFrequency.ANNUALLY, sumInsured: 500000, startDate: new Date('2024-06-01'), renewalDate: new Date('2026-06-01'), status: InsuranceStatus.ACTIVE },
      { userId: uid, name: 'Bajaj Allianz Car Insurance', type: InsuranceType.VEHICLE_FOUR_WHEELER, provider: 'Bajaj Allianz', premiumAmount: 12500, premiumFrequency: PremiumFrequency.ANNUALLY, sumInsured: 950000, startDate: new Date('2025-06-20'), renewalDate: new Date('2026-06-20'), status: InsuranceStatus.ACTIVE, vehicleRegistration: 'KA-01-AB-1234' },
      { userId: uid, name: 'HDFC ERGO Bike Insurance', type: InsuranceType.VEHICLE_TWO_WHEELER, provider: 'HDFC ERGO', premiumAmount: 3500, premiumFrequency: PremiumFrequency.ANNUALLY, sumInsured: 80000, startDate: new Date('2025-07-15'), renewalDate: new Date('2026-07-15'), status: InsuranceStatus.ACTIVE, vehicleRegistration: 'KA-01-CD-5678' },
    ],
  })

  await prisma.goal.createMany({
    data: [
      { userId: uid, name: 'Emergency Fund', type: GoalType.EMERGENCY_FUND, targetAmount: 300000, currentAmount: 85000, targetDate: new Date('2026-12-31'), status: GoalStatus.ACTIVE, color: '#3b82f6', notes: '3 months of expenses as buffer' },
      { userId: uid, name: 'Goa Family Trip', type: GoalType.PURCHASE, targetAmount: 80000, currentAmount: 35000, targetDate: new Date('2026-10-01'), status: GoalStatus.ACTIVE, color: '#10b981', notes: 'Annual family vacation' },
      { userId: uid, name: 'Home Down Payment (2nd)', type: GoalType.SAVINGS, targetAmount: 1500000, currentAmount: 200000, targetDate: new Date('2029-01-01'), status: GoalStatus.ACTIVE, color: '#f59e0b', notes: 'Saving for next property' },
      { userId: uid, name: 'Pay off Personal Loan', type: GoalType.DEBT_PAYOFF, targetAmount: 150000, currentAmount: 0, targetDate: new Date('2026-09-30'), status: GoalStatus.ACTIVE, color: '#ef4444' },
      { userId: uid, name: 'New MacBook Pro', type: GoalType.PURCHASE, targetAmount: 200000, currentAmount: 200000, targetDate: new Date('2025-12-01'), status: GoalStatus.COMPLETED, color: '#8b5cf6' },
    ],
  })

  await prisma.budget.createMany({
    data: [
      { userId: uid, categoryId: cat('Groceries'), name: 'Groceries', amount: 10000, period: BudgetPeriod.MONTHLY, month: 3, year: 2026 },
      { userId: uid, categoryId: cat('Food & Dining'), name: 'Dining Out', amount: 5000, period: BudgetPeriod.MONTHLY, month: 3, year: 2026 },
      { userId: uid, categoryId: cat('Transportation'), name: 'Transportation', amount: 8000, period: BudgetPeriod.MONTHLY, month: 3, year: 2026 },
      { userId: uid, categoryId: cat('Entertainment'), name: 'Entertainment', amount: 3000, period: BudgetPeriod.MONTHLY, month: 3, year: 2026 },
      { userId: uid, categoryId: cat('Subscriptions'), name: 'Subscriptions', amount: 2000, period: BudgetPeriod.MONTHLY, month: 3, year: 2026 },
      { userId: uid, categoryId: cat('Personal Care'), name: 'Personal Care', amount: 2500, period: BudgetPeriod.MONTHLY, month: 3, year: 2026 },
      { userId: uid, name: 'Annual Insurance Premiums', amount: 50000, period: BudgetPeriod.ANNUAL, year: 2026 },
    ],
  })

  await prisma.transaction.createMany({
    data: [
      { userId: uid, accountId: savings.id, categoryId: cat('Salary'), type: TransactionType.INCOME, amount: 120000, date: new Date('2026-03-01'), description: 'March Salary', isRecurring: true, tags: [] },
      { userId: uid, accountId: savings.id, categoryId: cat('Housing & Rent'), type: TransactionType.EXPENSE, amount: 28000, date: new Date('2026-03-01'), description: 'HDFC Home Loan EMI', isRecurring: true, tags: [] },
      { userId: uid, accountId: savings.id, categoryId: cat('Loan Payment'), type: TransactionType.EXPENSE, amount: 12000, date: new Date('2026-03-01'), description: 'Car Loan EMI', isRecurring: true, tags: [] },
      { userId: uid, accountId: savings.id, categoryId: cat('Savings & Investments'), type: TransactionType.EXPENSE, amount: 10000, date: new Date('2026-03-01'), description: 'SBI Blue Chip SIP', isRecurring: true, tags: [] },
      { userId: uid, accountId: savings.id, categoryId: cat('Parents Support'), type: TransactionType.EXPENSE, amount: 10000, date: new Date('2026-03-01'), description: 'Parents Monthly Support', tags: [] },
      { userId: uid, accountId: savings.id, categoryId: cat('Groceries'), type: TransactionType.EXPENSE, amount: 6500, date: new Date('2026-03-02'), description: 'Big Basket Groceries', tags: [] },
      { userId: uid, accountId: cash.id, categoryId: cat('Fuel & Petrol'), type: TransactionType.EXPENSE, amount: 3500, date: new Date('2026-03-02'), description: 'BPCL Petrol Fill', tags: [] },
      { userId: uid, accountId: savings.id, categoryId: cat('Internet & Fiber'), type: TransactionType.EXPENSE, amount: 999, date: new Date('2026-03-02'), description: 'Airtel Fiber', isRecurring: true, tags: [] },
      { userId: uid, accountId: cash.id, categoryId: cat('Vegetables & Fruits'), type: TransactionType.EXPENSE, amount: 2200, date: new Date('2026-03-03'), description: 'Vegetables - Local Market', tags: [] },
      { userId: uid, accountId: savings.id, categoryId: cat('Food & Dining'), type: TransactionType.EXPENSE, amount: 2100, date: new Date('2026-03-03'), description: 'Dinner - Barbeque Nation', tags: [] },
      { userId: uid, accountId: savings.id, categoryId: cat('Utilities'), type: TransactionType.EXPENSE, amount: 2400, date: new Date('2026-03-03'), description: 'BESCOM Electricity Bill', tags: [] },
      { userId: uid, accountId: savings.id, categoryId: cat('Subscriptions'), type: TransactionType.EXPENSE, amount: 649, date: new Date('2026-03-04'), description: 'Netflix Subscription', isRecurring: true, tags: [] },
      { userId: uid, accountId: investment.id, categoryId: cat('Investment Returns'), type: TransactionType.INCOME, amount: 5500, date: new Date('2026-03-04'), description: 'Infosys Dividend', tags: [] },
    ],
  })

  await prisma.netWorthSnapshot.createMany({
    data: [
      { userId: uid, totalAssets: 5680000, totalLiabilities: 3850000, netWorth: 1830000, snapshotDate: new Date('2025-10-01') },
      { userId: uid, totalAssets: 5750000, totalLiabilities: 3800000, netWorth: 1950000, snapshotDate: new Date('2025-11-01') },
      { userId: uid, totalAssets: 5830000, totalLiabilities: 3770000, netWorth: 2060000, snapshotDate: new Date('2025-12-01') },
      { userId: uid, totalAssets: 5900000, totalLiabilities: 3740000, netWorth: 2160000, snapshotDate: new Date('2026-01-01') },
      { userId: uid, totalAssets: 5960000, totalLiabilities: 3710000, netWorth: 2250000, snapshotDate: new Date('2026-02-01') },
      { userId: uid, totalAssets: 6020000, totalLiabilities: 3735000, netWorth: 2285000, snapshotDate: new Date('2026-03-01') },
    ],
  })

  console.log('\n✅ Demo data ready!')
  console.log('  Email    : demo@fintracker.app')
  console.log('  Password : Demo@1234')
  console.log('  Assets: 10 | Liabilities: 4 | Insurance: 4 | Transactions: 13 | NW Snapshots: 6')
  console.log('  Goals: 5 (4 active, 1 completed) | Budgets: 7 (6 monthly + 1 annual)')
}

main()
  .catch((e) => { console.error('❌ Failed:', e); process.exit(1) })
  .finally(() => prisma.$disconnect())
