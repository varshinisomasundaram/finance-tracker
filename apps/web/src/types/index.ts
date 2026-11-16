// ─── Auth ─────────────────────────────────────────────────────────────────────

export interface User {
  id: string
  email: string
  name: string
  currency: string
  avatarUrl: string | null
  createdAt: string
  updatedAt: string
}

export interface AuthTokens {
  accessToken: string
  refreshToken: string
  user: Pick<User, 'id' | 'email' | 'name' | 'currency' | 'createdAt'>
}

// ─── Accounts ─────────────────────────────────────────────────────────────────

export type AccountType = 'CHECKING' | 'SAVINGS' | 'INVESTMENT' | 'CRYPTO' | 'CASH' | 'OTHER'

export interface Account {
  id: string
  userId: string
  name: string
  type: AccountType
  institution: string | null
  balance: number
  currency: string
  color: string | null
  isActive: boolean
  notes: string | null
  createdAt: string
  updatedAt: string
}

// ─── Assets ───────────────────────────────────────────────────────────────────

export type AssetType =
  | 'REAL_ESTATE'
  | 'VEHICLE'
  | 'EQUITY'
  | 'MUTUAL_FUND'
  | 'RETIREMENT'
  | 'PROVIDENT_FUND'
  | 'GOVERNMENT_SCHEME'
  | 'SAVINGS'
  | 'CASH'
  | 'GOLD'
  | 'CRYPTO'
  | 'INSURANCE_POLICY'
  | 'BUSINESS'
  | 'OTHER'

export type InvestmentStrategy = 'LONG_TERM' | 'SHORT_TERM' | 'HOLD_FOREVER'

export interface Asset {
  id: string
  userId: string
  name: string
  type: AssetType
  value: number
  purchasePrice: number | null
  purchaseDate: string | null
  investmentStrategy: InvestmentStrategy | null
  targetDate: string | null
  quantity: number | null
  currency: string
  notes: string | null
  createdAt: string
  updatedAt: string
}

// ─── Liabilities ──────────────────────────────────────────────────────────────

export type LiabilityType =
  | 'MORTGAGE'
  | 'CAR_LOAN'
  | 'TWO_WHEELER_LOAN'
  | 'GOLD_LOAN'
  | 'STUDENT_LOAN'
  | 'PERSONAL_LOAN'
  | 'INFORMAL_DEBT'
  | 'CREDIT_CARD'
  | 'MEDICAL'
  | 'OTHER'

export interface Liability {
  id: string
  userId: string
  name: string
  type: LiabilityType
  balance: number
  originalAmount: number | null
  interestRate: number | null
  minimumPayment: number | null
  dueDate: string | null
  currency: string
  notes: string | null
  createdAt: string
  updatedAt: string
}

// ─── Insurance ────────────────────────────────────────────────────────────────

export type InsuranceType =
  | 'TERM_LIFE'
  | 'HEALTH'
  | 'VEHICLE_TWO_WHEELER'
  | 'VEHICLE_FOUR_WHEELER'
  | 'ENDOWMENT'
  | 'ULIP'
  | 'HOME'
  | 'OTHER'

export type PremiumFrequency = 'MONTHLY' | 'QUARTERLY' | 'HALF_YEARLY' | 'ANNUALLY' | 'SINGLE_PREMIUM'

export type InsuranceStatus = 'ACTIVE' | 'EXPIRED' | 'LAPSED' | 'CANCELLED'

export interface Insurance {
  id: string
  userId: string
  name: string
  type: InsuranceType
  provider: string
  policyNumber: string | null
  premiumAmount: number
  premiumFrequency: PremiumFrequency
  sumInsured: number
  startDate: string
  renewalDate: string
  status: InsuranceStatus
  vehicleRegistration: string | null
  nominees: string | null
  notes: string | null
  annualPremium: number
  createdAt: string
  updatedAt: string
}

// ─── Transactions ─────────────────────────────────────────────────────────────

export type TransactionType = 'INCOME' | 'EXPENSE' | 'TRANSFER'

export interface Category {
  id: string
  userId: string | null
  name: string
  type: TransactionType
  color: string
  icon: string | null
  isSystem: boolean
  createdAt: string
}

export interface Transaction {
  id: string
  userId: string
  accountId: string | null
  categoryId: string | null
  type: TransactionType
  amount: number
  date: string
  description: string
  notes: string | null
  tags: string[]
  isRecurring: boolean
  account: { id: string; name: string } | null
  category: { id: string; name: string; color: string } | null
  createdAt: string
  updatedAt: string
}

export interface PaginatedResult<T> {
  data: T[]
  meta: {
    total: number
    page: number
    limit: number
    totalPages: number
  }
}

// ─── Net Worth ────────────────────────────────────────────────────────────────

export interface NetWorthSnapshot {
  id: string
  userId: string
  totalAssets: number
  totalLiabilities: number
  netWorth: number
  snapshotDate: string
  createdAt: string
}

export interface NetWorthCurrent {
  totalAssets: number
  totalLiabilities: number
  netWorth: number
  assetsByType: Array<{ type: string; total: number; count: number }>
  liabilitiesByType: Array<{ type: string; total: number; count: number }>
  calculatedAt: string
}

export interface NetWorthHistory {
  snapshots: NetWorthSnapshot[]
  change: {
    amount: number
    percent: number
    direction: 'up' | 'down' | 'flat'
  }
}

// ─── Goals ────────────────────────────────────────────────────────────────────

export type GoalType = 'SAVINGS' | 'DEBT_PAYOFF' | 'INVESTMENT' | 'EMERGENCY_FUND' | 'PURCHASE' | 'OTHER'
export type GoalStatus = 'ACTIVE' | 'COMPLETED' | 'PAUSED' | 'CANCELLED'

export interface Goal {
  id: string
  userId: string
  name: string
  type: GoalType
  targetAmount: number
  currentAmount: number
  progressPercent: number
  targetDate: string | null
  status: GoalStatus
  priority: number
  color: string | null
  notes: string | null
  createdAt: string
  updatedAt: string
}

// ─── Budgets ──────────────────────────────────────────────────────────────────

export type BudgetPeriod = 'MONTHLY' | 'ANNUAL'

export interface Budget {
  id: string
  userId: string
  name: string
  amount: number
  period: BudgetPeriod
  categoryId: string | null
  month: number | null
  year: number | null
  createdAt: string
  updatedAt: string
}

// ─── Import ───────────────────────────────────────────────────────────────────

export interface ImportParsedRow {
  rowIndex: number
  date: string
  description: string
  amount: number
  type: 'INCOME' | 'EXPENSE'
  isDuplicate: boolean
  originalText: string
  suggestedCategoryId: string | null
  suggestedCategoryName: string | null
}

export interface ImportPreviewResult {
  sessionId: string
  filename: string
  bank: string
  totalRows: number
  rows: ImportParsedRow[]
}

export interface ImportConfirmResult {
  imported: number
  skipped: number
  duplicatesSkipped: number
  sessionId: string
}

// ─── Analytics ───────────────────────────────────────────────────────────────

export interface SpendingByCategory {
  categoryId: string | null
  categoryName: string
  color: string
  total: number
  count: number
  percentage: number
}

export interface IncomeVsExpense {
  month: number
  year: number
  income: number
  expense: number
  savings: number
  savingsRate: number
}

export interface SpendingTrend {
  month: number
  year: number
  total: number
  avgPerDay: number
}

export interface BudgetVsActual {
  budgetId: string
  name: string
  budgeted: number
  actual: number
  remaining: number
  percentUsed: number
  categoryName: string | null
}

export interface AssetAllocation {
  type: string
  total: number
  count: number
  percentage: number
}

export interface InsuranceRenewal {
  id: string
  name: string
  type: InsuranceType
  provider: string
  renewalDate: string
  premiumAmount: number
  premiumFrequency: PremiumFrequency
  daysUntilRenewal: number
}

export interface TopExpense {
  description: string
  total: number
  count: number
}

// ─── API Error ────────────────────────────────────────────────────────────────

export interface ApiError {
  statusCode: number
  error: string
  message: string
}
