/**
 * Seeds 10 fictional test users, each with a full financial profile:
 * accounts, assets, liabilities, insurance, ~6 months of transactions,
 * goals, budgets and monthly net-worth snapshots.
 *
 * Safe to re-run: it only deletes and recreates the 10 users below
 * (all on the reserved @fintracker.test domain). No other users are touched.
 *
 * Run:  npx ts-node prisma/seed-test-users.ts
 * Login: <first>.<last>@fintracker.test / Test@1234
 */
import {
  PrismaClient, Prisma,
  AccountType, AssetType, InvestmentStrategy, LiabilityType,
  InsuranceType, PremiumFrequency, GoalType, GoalStatus, TransactionType,
} from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

const PASSWORD = 'Test@1234'
const DOMAIN = 'fintracker.test'
const MONTHS = 6
const DAY_MS = 86_400_000

const today = new Date()
today.setHours(12, 0, 0, 0)
const windowStart = new Date(today.getFullYear(), today.getMonth() - (MONTHS - 1), 1)

const cat = (name: string) => `system-${name.toLowerCase().replace(/[^a-z0-9]/g, '-')}`
const daysFromNow = (d: number) => new Date(today.getTime() + d * DAY_MS)
const emailOf = (p: Persona) => `${p.first}.${p.last}@${DOMAIN}`.toLowerCase()

/** Small deterministic PRNG so every run produces the same data. */
function makeRng(seed: number) {
  return () => {
    seed = (seed + 0x6d2b79f5) | 0
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

// ─── Persona shape ────────────────────────────────────────────────────────────

interface AccountSeed { key: string; name: string; type: AccountType; institution?: string; balance: number }
interface AssetSeed {
  name: string; type: AssetType; value: number; purchasePrice?: number; purchaseDate?: string
  quantity?: number; investmentStrategy?: InvestmentStrategy; targetDate?: string; notes?: string
}
interface LiabilitySeed {
  name: string; type: LiabilityType; balance: number; originalAmount?: number
  interestRate?: number; minimumPayment?: number; dueDay?: number; notes?: string
}
interface InsuranceSeed {
  name: string; type: InsuranceType; provider: string; premiumAmount: number
  premiumFrequency: PremiumFrequency; sumInsured: number
  renewalInDays: number; yearsHeld: number; vehicleRegistration?: string; nominees?: string
}
interface GoalSeed {
  name: string; type: GoalType; targetAmount: number; currentAmount: number
  targetDate?: string; status?: GoalStatus; color: string; notes?: string
}
interface IncomeSeed { category: string; description: string; monthly: number; variance: number; payments: number; day?: number }
interface Persona {
  first: string; last: string; profile: string
  incomes: IncomeSeed[]
  rent?: number
  sip?: number
  spend: number                     // lifestyle multiplier, 1 = typical
  vehicle?: 'bike' | 'car'
  gym?: boolean
  parentsSupport?: number
  internet?: number
  subscriptions: Array<[string, number]>
  trip?: { monthsAgo: number; category: 'Air Travel' | 'Train Travel'; description: string; amount: number }
  accounts: AccountSeed[]           // first account receives income and fixed payments
  assets: AssetSeed[]
  liabilities: LiabilitySeed[]
  insurances: InsuranceSeed[]
  goals: GoalSeed[]
}

// ─── The 10 people (all fictional) ────────────────────────────────────────────

const personas: Persona[] = [
  {
    first: 'Priya', last: 'Sharma', profile: '28, software engineer, Bengaluru, renting, two-wheeler',
    incomes: [{ category: 'Salary', description: 'Salary credit - TechNova Solutions', monthly: 142000, variance: 0, payments: 1, day: 1 }],
    rent: 28000, sip: 25000, spend: 1.1, vehicle: 'bike', gym: true, internet: 999,
    subscriptions: [['Netflix', 649], ['Spotify Premium', 119]],
    trip: { monthsAgo: 3, category: 'Air Travel', description: 'IndiGo BLR-GOI return', amount: 9800 },
    accounts: [
      { key: 'main', name: 'HDFC Savings', type: 'SAVINGS', institution: 'HDFC Bank', balance: 186500 },
      { key: 'demat', name: 'Zerodha Demat', type: 'INVESTMENT', institution: 'Zerodha', balance: 412000 },
      { key: 'cash', name: 'Cash Wallet', type: 'CASH', balance: 4500 },
    ],
    assets: [
      { name: 'UTI Nifty 50 Index Fund', type: 'MUTUAL_FUND', value: 385000, purchasePrice: 300000, quantity: 1420.5, investmentStrategy: 'LONG_TERM', purchaseDate: '2023-06-10' },
      { name: 'Infosys shares', type: 'EQUITY', value: 77500, purchasePrice: 62000, quantity: 50, investmentStrategy: 'LONG_TERM', purchaseDate: '2024-01-15' },
      { name: 'Nippon Gold ETF', type: 'GOLD', value: 64000, purchasePrice: 52000, quantity: 10 },
      { name: 'EPF', type: 'RETIREMENT', value: 410000 },
      { name: 'HDFC Fixed Deposit', type: 'SAVINGS', value: 150000, purchasePrice: 150000, targetDate: '2027-04-15' },
      { name: 'Honda Activa 6G', type: 'VEHICLE', value: 58000, purchasePrice: 78000, purchaseDate: '2023-02-01' },
    ],
    liabilities: [
      { name: 'HDFC Two-Wheeler Loan', type: 'TWO_WHEELER_LOAN', balance: 18000, originalAmount: 65000, interestRate: 10.5, minimumPayment: 2900, dueDay: 5 },
      { name: 'HDFC Millennia Credit Card', type: 'CREDIT_CARD', balance: 22400, interestRate: 42, minimumPayment: 1120, dueDay: 18 },
    ],
    insurances: [
      { name: 'Star Health Comprehensive', type: 'HEALTH', provider: 'Star Health', premiumAmount: 14200, premiumFrequency: 'ANNUALLY', sumInsured: 1000000, renewalInDays: 25, yearsHeld: 2 },
      { name: 'HDFC Life Click 2 Protect', type: 'TERM_LIFE', provider: 'HDFC Life', premiumAmount: 11800, premiumFrequency: 'ANNUALLY', sumInsured: 10000000, renewalInDays: 140, yearsHeld: 3, nominees: 'Rakesh Sharma' },
      { name: 'Activa Insurance', type: 'VEHICLE_TWO_WHEELER', provider: 'Acko', premiumAmount: 1450, premiumFrequency: 'ANNUALLY', sumInsured: 52000, renewalInDays: 70, yearsHeld: 1, vehicleRegistration: 'KA-03-HX-4821' },
    ],
    goals: [
      { name: 'Emergency Fund (6 months)', type: 'EMERGENCY_FUND', targetAmount: 600000, currentAmount: 336500, targetDate: '2027-06-30', color: '#3b82f6' },
      { name: 'Europe Trip', type: 'PURCHASE', targetAmount: 350000, currentAmount: 120000, targetDate: '2027-09-01', color: '#10b981' },
      { name: 'Clear Credit Card', type: 'DEBT_PAYOFF', targetAmount: 22400, currentAmount: 8000, targetDate: '2026-12-31', color: '#ef4444' },
    ],
  },
  {
    first: 'Rahul', last: 'Verma', profile: '35, product manager, Pune, married with a daughter, home + car loan',
    incomes: [
      { category: 'Salary', description: 'Salary credit - Brightpath Analytics', monthly: 218000, variance: 0, payments: 1, day: 1 },
      { category: 'Other Income', description: 'Spouse contribution to joint account', monthly: 40000, variance: 0, payments: 1, day: 2 },
    ],
    sip: 40000, spend: 1.4, vehicle: 'car', parentsSupport: 15000, internet: 1179,
    subscriptions: [['Amazon Prime', 299], ['Disney+ Hotstar', 299]],
    trip: { monthsAgo: 2, category: 'Air Travel', description: 'Air India PNQ-DEL family trip', amount: 28000 },
    accounts: [
      { key: 'main', name: 'ICICI Salary Account', type: 'SAVINGS', institution: 'ICICI Bank', balance: 245000 },
      { key: 'joint', name: 'SBI Joint Savings', type: 'SAVINGS', institution: 'SBI', balance: 98000 },
      { key: 'demat', name: 'Groww', type: 'INVESTMENT', institution: 'Groww', balance: 520000 },
      { key: 'cash', name: 'Cash', type: 'CASH', balance: 8000 },
    ],
    assets: [
      { name: '3BHK Flat, Baner', type: 'REAL_ESTATE', value: 12500000, purchasePrice: 9200000, purchaseDate: '2020-08-15' },
      { name: 'Hyundai Creta', type: 'VEHICLE', value: 1150000, purchasePrice: 1650000, purchaseDate: '2022-03-10' },
      { name: 'Parag Parikh Flexi Cap', type: 'MUTUAL_FUND', value: 820000, purchasePrice: 610000, quantity: 10850, investmentStrategy: 'LONG_TERM' },
      { name: 'HDFC Mid-Cap Opportunities', type: 'MUTUAL_FUND', value: 340000, purchasePrice: 270000, quantity: 2410, investmentStrategy: 'LONG_TERM' },
      { name: 'PPF', type: 'PROVIDENT_FUND', value: 690000 },
      { name: 'EPF', type: 'RETIREMENT', value: 1240000 },
      { name: 'Sukanya Samriddhi', type: 'GOVERNMENT_SCHEME', value: 210000, notes: "For daughter's education", targetDate: '2038-06-01' },
      { name: 'Gold jewellery (90g)', type: 'GOLD', value: 640000, quantity: 90 },
    ],
    liabilities: [
      { name: 'SBI Home Loan', type: 'MORTGAGE', balance: 6850000, originalAmount: 8000000, interestRate: 8.4, minimumPayment: 68500, dueDay: 5 },
      { name: 'HDFC Car Loan', type: 'CAR_LOAN', balance: 420000, originalAmount: 1100000, interestRate: 9.1, minimumPayment: 22800, dueDay: 7 },
      { name: 'ICICI Amazon Pay Credit Card', type: 'CREDIT_CARD', balance: 31800, interestRate: 42, minimumPayment: 1590, dueDay: 18 },
    ],
    insurances: [
      { name: 'Tata AIA Term Plan', type: 'TERM_LIFE', provider: 'Tata AIA', premiumAmount: 21500, premiumFrequency: 'ANNUALLY', sumInsured: 20000000, renewalInDays: 210, yearsHeld: 5, nominees: 'Sneha Verma' },
      { name: 'HDFC ERGO Optima Family', type: 'HEALTH', provider: 'HDFC ERGO', premiumAmount: 28400, premiumFrequency: 'ANNUALLY', sumInsured: 1500000, renewalInDays: 12, yearsHeld: 4 },
      { name: 'Creta Car Insurance', type: 'VEHICLE_FOUR_WHEELER', provider: 'ICICI Lombard', premiumAmount: 18900, premiumFrequency: 'ANNUALLY', sumInsured: 1100000, renewalInDays: 95, yearsHeld: 3, vehicleRegistration: 'MH-12-RT-7734' },
      { name: 'LIC Jeevan Labh', type: 'ENDOWMENT', provider: 'LIC', premiumAmount: 4200, premiumFrequency: 'MONTHLY', sumInsured: 1000000, renewalInDays: 18, yearsHeld: 6 },
    ],
    goals: [
      { name: "Daughter's Higher Education", type: 'SAVINGS', targetAmount: 3000000, currentAmount: 650000, targetDate: '2038-06-01', color: '#8b5cf6' },
      { name: 'Prepay ₹10L of Home Loan', type: 'DEBT_PAYOFF', targetAmount: 1000000, currentAmount: 300000, targetDate: '2028-03-31', color: '#ef4444' },
      { name: 'Family Emergency Fund', type: 'EMERGENCY_FUND', targetAmount: 900000, currentAmount: 900000, status: 'COMPLETED', color: '#3b82f6' },
    ],
  },
  {
    first: 'Ananya', last: 'Iyer', profile: '24, graduate engineer trainee, Chennai, education loan',
    incomes: [{ category: 'Salary', description: 'Salary credit - Coastline Systems', monthly: 54000, variance: 0, payments: 1, day: 1 }],
    rent: 9000, sip: 3000, spend: 0.6, internet: 0,
    subscriptions: [['Spotify Premium', 119], ['YouTube Premium', 129]],
    trip: { monthsAgo: 4, category: 'Train Travel', description: 'IRCTC Chennai-Coimbatore', amount: 1450 },
    accounts: [
      { key: 'main', name: 'Axis Savings', type: 'SAVINGS', institution: 'Axis Bank', balance: 38500 },
      { key: 'cash', name: 'Cash', type: 'CASH', balance: 2200 },
    ],
    assets: [
      { name: 'Axis ELSS Tax Saver', type: 'MUTUAL_FUND', value: 42000, purchasePrice: 36000, quantity: 480, investmentStrategy: 'LONG_TERM' },
      { name: 'SBI Fixed Deposit', type: 'SAVINGS', value: 50000, purchasePrice: 50000, targetDate: '2027-03-01' },
      { name: 'EPF', type: 'RETIREMENT', value: 64000 },
    ],
    liabilities: [
      { name: 'SBI Education Loan', type: 'STUDENT_LOAN', balance: 485000, originalAmount: 600000, interestRate: 9.6, minimumPayment: 7200, dueDay: 10 },
    ],
    insurances: [
      { name: 'Niva Bupa ReAssure', type: 'HEALTH', provider: 'Niva Bupa', premiumAmount: 7600, premiumFrequency: 'ANNUALLY', sumInsured: 500000, renewalInDays: 160, yearsHeld: 1 },
    ],
    goals: [
      { name: 'Emergency Fund', type: 'EMERGENCY_FUND', targetAmount: 150000, currentAmount: 38500, targetDate: '2027-06-30', color: '#3b82f6' },
      { name: 'New Laptop', type: 'PURCHASE', targetAmount: 85000, currentAmount: 22000, targetDate: '2027-03-31', color: '#10b981' },
    ],
  },
  {
    first: 'Vikram', last: 'Singh', profile: '42, textile export business owner, Jaipur, property + gold heavy',
    incomes: [
      { category: 'Business Income', description: 'Payment received - export order', monthly: 380000, variance: 0.35, payments: 3 },
      { category: 'Rental Income', description: 'Shop rent - MI Road', monthly: 35000, variance: 0, payments: 1, day: 5 },
    ],
    sip: 50000, spend: 1.6, vehicle: 'car', parentsSupport: 20000, internet: 1499,
    subscriptions: [['Netflix', 649]],
    trip: { monthsAgo: 2, category: 'Air Travel', description: 'Vistara JAI-DXB business trip', amount: 32000 },
    accounts: [
      { key: 'main', name: 'Kotak Current Account', type: 'CHECKING', institution: 'Kotak Mahindra Bank', balance: 1240000 },
      { key: 'savings', name: 'HDFC Savings', type: 'SAVINGS', institution: 'HDFC Bank', balance: 410000 },
      { key: 'demat', name: 'Zerodha Demat', type: 'INVESTMENT', institution: 'Zerodha', balance: 1850000 },
      { key: 'cash', name: 'Cash', type: 'CASH', balance: 65000 },
    ],
    assets: [
      { name: 'Family Haveli, Civil Lines', type: 'REAL_ESTATE', value: 32000000, purchasePrice: 18000000, purchaseDate: '2012-05-01' },
      { name: 'Commercial Shop, MI Road', type: 'REAL_ESTATE', value: 9500000, purchasePrice: 6000000, purchaseDate: '2016-11-20' },
      { name: 'Toyota Fortuner', type: 'VEHICLE', value: 3100000, purchasePrice: 4200000, purchaseDate: '2023-04-12' },
      { name: 'Textile Export Business', type: 'BUSINESS', value: 15000000, notes: 'Valuation at 3x annual profit' },
      { name: 'Gold (500g)', type: 'GOLD', value: 3600000, quantity: 500 },
      { name: 'Sovereign Gold Bond 2023', type: 'GOLD', value: 380000, purchasePrice: 300000, quantity: 50, targetDate: '2031-02-01' },
      { name: 'Direct Equity Portfolio', type: 'EQUITY', value: 2400000, purchasePrice: 1700000, investmentStrategy: 'HOLD_FOREVER' },
    ],
    liabilities: [
      { name: 'Kotak Working Capital Loan', type: 'OTHER', balance: 2500000, originalAmount: 4000000, interestRate: 11.2, minimumPayment: 85000, dueDay: 5 },
      { name: 'Fortuner Car Loan', type: 'CAR_LOAN', balance: 1450000, originalAmount: 3000000, interestRate: 8.9, minimumPayment: 62000, dueDay: 8 },
      { name: 'Muthoot Gold Loan', type: 'GOLD_LOAN', balance: 600000, originalAmount: 600000, interestRate: 10, minimumPayment: 5000, dueDay: 15 },
    ],
    insurances: [
      { name: 'LIC Tech Term', type: 'TERM_LIFE', provider: 'LIC', premiumAmount: 30000, premiumFrequency: 'ANNUALLY', sumInsured: 30000000, renewalInDays: 45, yearsHeld: 7, nominees: 'Rajeshwari Singh' },
      { name: 'Care Supreme Family', type: 'HEALTH', provider: 'Care Health', premiumAmount: 42000, premiumFrequency: 'ANNUALLY', sumInsured: 2500000, renewalInDays: 280, yearsHeld: 3 },
      { name: 'Fortuner Insurance', type: 'VEHICLE_FOUR_WHEELER', provider: 'Bajaj Allianz', premiumAmount: 52000, premiumFrequency: 'ANNUALLY', sumInsured: 3200000, renewalInDays: 33, yearsHeld: 2, vehicleRegistration: 'RJ-14-CK-0909' },
      { name: 'Shop Property Insurance', type: 'HOME', provider: 'New India Assurance', premiumAmount: 9500, premiumFrequency: 'ANNUALLY', sumInsured: 9500000, renewalInDays: 120, yearsHeld: 5 },
    ],
    goals: [
      { name: 'Second Factory Unit', type: 'SAVINGS', targetAmount: 10000000, currentAmount: 3200000, targetDate: '2028-12-31', color: '#f59e0b' },
      { name: 'Clear Working Capital Loan', type: 'DEBT_PAYOFF', targetAmount: 4000000, currentAmount: 1500000, targetDate: '2027-12-31', color: '#ef4444' },
    ],
  },
  {
    first: 'Meera', last: 'Nair', profile: '31, freelance UX designer, Kochi, irregular income',
    incomes: [{ category: 'Freelance', description: 'Client payment - design project', monthly: 95000, variance: 0.4, payments: 2 }],
    rent: 16000, sip: 12000, spend: 0.9, vehicle: 'bike', gym: true, internet: 799,
    subscriptions: [['Adobe Creative Cloud', 4230], ['Notion Plus', 400], ['Spotify Premium', 119]],
    trip: { monthsAgo: 3, category: 'Air Travel', description: 'IndiGo COK-BLR client visit', amount: 6200 },
    accounts: [
      { key: 'main', name: 'Federal Bank Savings', type: 'SAVINGS', institution: 'Federal Bank', balance: 268000 },
      { key: 'buffer', name: 'IDFC First Savings', type: 'SAVINGS', institution: 'IDFC First Bank', balance: 120000 },
      { key: 'demat', name: 'Kuvera', type: 'INVESTMENT', institution: 'Kuvera', balance: 210000 },
      { key: 'cash', name: 'Cash', type: 'CASH', balance: 3000 },
    ],
    assets: [
      { name: 'Parag Parikh Flexi Cap', type: 'MUTUAL_FUND', value: 260000, purchasePrice: 200000, quantity: 3440, investmentStrategy: 'LONG_TERM' },
      { name: 'UTI Nifty Next 50 Index', type: 'MUTUAL_FUND', value: 95000, purchasePrice: 80000, quantity: 4120, investmentStrategy: 'HOLD_FOREVER' },
      { name: 'PPF', type: 'PROVIDENT_FUND', value: 180000 },
      { name: 'Gold jewellery (60g)', type: 'GOLD', value: 420000, quantity: 60 },
      { name: 'Royal Enfield Classic 350', type: 'VEHICLE', value: 150000, purchasePrice: 210000, purchaseDate: '2023-09-05' },
      { name: 'IDFC Fixed Deposit', type: 'SAVINGS', value: 120000, purchasePrice: 120000, targetDate: '2027-01-20' },
    ],
    liabilities: [
      { name: 'Royal Enfield Bike Loan', type: 'TWO_WHEELER_LOAN', balance: 42000, originalAmount: 150000, interestRate: 9.8, minimumPayment: 4800, dueDay: 6 },
    ],
    insurances: [
      { name: 'Activ One Health', type: 'HEALTH', provider: 'Aditya Birla Health', premiumAmount: 11200, premiumFrequency: 'ANNUALLY', sumInsured: 1000000, renewalInDays: 58, yearsHeld: 2 },
      { name: 'Max Life Smart Term', type: 'TERM_LIFE', provider: 'Max Life', premiumAmount: 9800, premiumFrequency: 'ANNUALLY', sumInsured: 7500000, renewalInDays: 230, yearsHeld: 2, nominees: 'Lakshmi Nair' },
      { name: 'Royal Enfield Insurance', type: 'VEHICLE_TWO_WHEELER', provider: 'Digit', premiumAmount: 2100, premiumFrequency: 'ANNUALLY', sumInsured: 160000, renewalInDays: 8, yearsHeld: 3, vehicleRegistration: 'KL-07-CB-3310' },
    ],
    goals: [
      { name: '12-Month Freelancer Buffer', type: 'EMERGENCY_FUND', targetAmount: 1000000, currentAmount: 388000, targetDate: '2027-12-31', color: '#3b82f6', notes: 'Income is irregular, so a bigger buffer' },
      { name: 'Home Studio Setup', type: 'PURCHASE', targetAmount: 250000, currentAmount: 90000, targetDate: '2027-05-01', color: '#10b981' },
    ],
  },
  {
    first: 'Arjun', last: 'Reddy', profile: '38, engineering manager, Hyderabad, two properties, rental income',
    incomes: [
      { category: 'Salary', description: 'Salary credit - Lakeview Cloud', monthly: 295000, variance: 0, payments: 1, day: 1 },
      { category: 'Rental Income', description: 'Rent - Kondapur flat', monthly: 26000, variance: 0, payments: 1, day: 5 },
    ],
    sip: 60000, spend: 1.5, vehicle: 'car', gym: true, parentsSupport: 25000, internet: 1199,
    subscriptions: [['Netflix', 649], ['Amazon Prime', 299], ['Spotify Family', 179]],
    trip: { monthsAgo: 1, category: 'Air Travel', description: 'Singapore holiday flights (family)', amount: 64000 },
    accounts: [
      { key: 'main', name: 'HDFC Salary Account', type: 'SAVINGS', institution: 'HDFC Bank', balance: 412000 },
      { key: 'savings', name: 'SBI Savings', type: 'SAVINGS', institution: 'SBI', balance: 156000 },
      { key: 'demat', name: 'Zerodha Demat', type: 'INVESTMENT', institution: 'Zerodha', balance: 1380000 },
      { key: 'cash', name: 'Cash', type: 'CASH', balance: 12000 },
    ],
    assets: [
      { name: 'Villa, Gachibowli', type: 'REAL_ESTATE', value: 21000000, purchasePrice: 15500000, purchaseDate: '2019-07-01' },
      { name: 'Flat, Kondapur (rented out)', type: 'REAL_ESTATE', value: 8800000, purchasePrice: 6200000, purchaseDate: '2017-03-18' },
      { name: 'Kia Seltos', type: 'VEHICLE', value: 1350000, purchasePrice: 1800000, purchaseDate: '2022-10-02' },
      { name: 'Employer RSUs (vested)', type: 'EQUITY', value: 2600000, investmentStrategy: 'LONG_TERM', notes: 'Vested RSUs' },
      { name: 'Nifty 50 + Midcap 150 Index Funds', type: 'MUTUAL_FUND', value: 1450000, purchasePrice: 1100000, investmentStrategy: 'HOLD_FOREVER' },
      { name: 'EPF', type: 'RETIREMENT', value: 2100000 },
      { name: 'NPS Tier-I', type: 'RETIREMENT', value: 640000 },
      { name: 'Gold (70g)', type: 'GOLD', value: 520000, quantity: 70 },
    ],
    liabilities: [
      { name: 'HDFC Home Loan (Villa)', type: 'MORTGAGE', balance: 9800000, originalAmount: 12400000, interestRate: 8.35, minimumPayment: 102000, dueDay: 5 },
      { name: 'Seltos Car Loan', type: 'CAR_LOAN', balance: 380000, originalAmount: 1000000, interestRate: 8.75, minimumPayment: 20500, dueDay: 10 },
      { name: 'HDFC Infinia Credit Card', type: 'CREDIT_CARD', balance: 46500, interestRate: 42, minimumPayment: 2325, dueDay: 18 },
    ],
    insurances: [
      { name: 'HDFC Life Term Plan', type: 'TERM_LIFE', provider: 'HDFC Life', premiumAmount: 32000, premiumFrequency: 'ANNUALLY', sumInsured: 30000000, renewalInDays: 300, yearsHeld: 6, nominees: 'Divya Reddy' },
      { name: 'Star Family Health Optima', type: 'HEALTH', provider: 'Star Health', premiumAmount: 36500, premiumFrequency: 'ANNUALLY', sumInsured: 2000000, renewalInDays: 40, yearsHeld: 5 },
      { name: 'Seltos Car Insurance', type: 'VEHICLE_FOUR_WHEELER', provider: 'Tata AIG', premiumAmount: 21400, premiumFrequency: 'ANNUALLY', sumInsured: 1400000, renewalInDays: 150, yearsHeld: 4, vehicleRegistration: 'TS-09-FA-6620' },
      { name: 'Villa Home Insurance', type: 'HOME', provider: 'HDFC ERGO', premiumAmount: 6800, premiumFrequency: 'ANNUALLY', sumInsured: 15000000, renewalInDays: 210, yearsHeld: 6 },
    ],
    goals: [
      { name: "Kids' International School", type: 'SAVINGS', targetAmount: 2500000, currentAmount: 800000, targetDate: '2030-04-01', color: '#8b5cf6' },
      { name: 'Early Retirement Corpus', type: 'INVESTMENT', targetAmount: 50000000, currentAmount: 8200000, targetDate: '2040-01-01', color: '#f59e0b' },
      { name: 'Prepay ₹20L of Home Loan', type: 'DEBT_PAYOFF', targetAmount: 2000000, currentAmount: 450000, targetDate: '2029-03-31', color: '#ef4444' },
    ],
  },
  {
    first: 'Kavya', last: 'Patel', profile: '27, marketing executive, Ahmedabad, personal loan + family debt',
    incomes: [{ category: 'Salary', description: 'Salary credit - Sabarmati Retail', monthly: 84000, variance: 0, payments: 1, day: 1 }],
    rent: 14000, sip: 5000, spend: 0.8, vehicle: 'bike', internet: 699,
    subscriptions: [['Netflix Mobile', 199]],
    trip: { monthsAgo: 2, category: 'Train Travel', description: 'IRCTC ADI-BCT Shatabdi', amount: 1850 },
    accounts: [
      { key: 'main', name: 'Kotak Savings', type: 'SAVINGS', institution: 'Kotak Mahindra Bank', balance: 46200 },
      { key: 'cash', name: 'Cash', type: 'CASH', balance: 3500 },
    ],
    assets: [
      { name: 'Mirae ELSS Tax Saver', type: 'MUTUAL_FUND', value: 68000, purchasePrice: 60000, quantity: 1510, investmentStrategy: 'LONG_TERM' },
      { name: 'TVS Jupiter', type: 'VEHICLE', value: 52000, purchasePrice: 80000, purchaseDate: '2023-05-20' },
      { name: 'Gold coins (10g)', type: 'GOLD', value: 72000, quantity: 10 },
      { name: 'Kotak Fixed Deposit', type: 'SAVINGS', value: 40000, purchasePrice: 40000, targetDate: '2027-02-10' },
    ],
    liabilities: [
      { name: 'Bajaj Finserv Personal Loan', type: 'PERSONAL_LOAN', balance: 168000, originalAmount: 300000, interestRate: 14.5, minimumPayment: 10300, dueDay: 4 },
      { name: 'Loan from Uncle', type: 'INFORMAL_DEBT', balance: 60000, originalAmount: 100000, minimumPayment: 5000, dueDay: 25, notes: 'Interest-free, no fixed end date' },
      { name: 'SBI SimplyCLICK Credit Card', type: 'CREDIT_CARD', balance: 28900, interestRate: 42, minimumPayment: 1445, dueDay: 18 },
    ],
    insurances: [
      { name: 'Care Health Individual', type: 'HEALTH', provider: 'Care Health', premiumAmount: 8900, premiumFrequency: 'ANNUALLY', sumInsured: 500000, renewalInDays: 15, yearsHeld: 2 },
      { name: 'Jupiter Insurance', type: 'VEHICLE_TWO_WHEELER', provider: 'ICICI Lombard', premiumAmount: 1300, premiumFrequency: 'ANNUALLY', sumInsured: 55000, renewalInDays: 190, yearsHeld: 3, vehicleRegistration: 'GJ-01-RQ-2290' },
    ],
    goals: [
      { name: 'Clear Personal Loan', type: 'DEBT_PAYOFF', targetAmount: 300000, currentAmount: 132000, targetDate: '2028-01-31', color: '#ef4444' },
      { name: 'Emergency Fund', type: 'EMERGENCY_FUND', targetAmount: 200000, currentAmount: 46000, targetDate: '2027-12-31', color: '#3b82f6' },
    ],
  },
  {
    first: 'Sandeep', last: 'Kumar', profile: '50, government officer, Delhi, close to retirement, traditional savings',
    incomes: [{ category: 'Salary', description: 'Monthly salary (Govt.)', monthly: 112000, variance: 0, payments: 1, day: 1 }],
    sip: 10000, spend: 1.0, vehicle: 'car', parentsSupport: 12000, internet: 699,
    subscriptions: [['Tata Play DTH', 450]],
    trip: { monthsAgo: 4, category: 'Train Travel', description: 'IRCTC NDLS-HWH Rajdhani (family)', amount: 9600 },
    accounts: [
      { key: 'main', name: 'SBI Savings', type: 'SAVINGS', institution: 'SBI', balance: 324000 },
      { key: 'pnb', name: 'PNB Savings', type: 'SAVINGS', institution: 'Punjab National Bank', balance: 88000 },
      { key: 'cash', name: 'Cash', type: 'CASH', balance: 15000 },
    ],
    assets: [
      { name: 'DDA Flat, Dwarka', type: 'REAL_ESTATE', value: 9500000, purchasePrice: 2800000, purchaseDate: '2004-09-01' },
      { name: 'Maruti Ciaz', type: 'VEHICLE', value: 540000, purchasePrice: 980000, purchaseDate: '2020-01-15' },
      { name: 'PPF', type: 'PROVIDENT_FUND', value: 1480000 },
      { name: 'GPF', type: 'PROVIDENT_FUND', value: 1720000 },
      { name: 'NPS Tier-I', type: 'RETIREMENT', value: 2350000 },
      { name: 'NSC VIII Issue', type: 'GOVERNMENT_SCHEME', value: 300000, purchasePrice: 220000, targetDate: '2028-08-01' },
      { name: 'LIC Jeevan Anand (maturity value)', type: 'INSURANCE_POLICY', value: 820000, targetDate: '2029-04-01' },
      { name: 'Family gold', type: 'GOLD', value: 1100000, quantity: 150 },
      { name: 'Post Office RD', type: 'SAVINGS', value: 180000, targetDate: '2027-06-01' },
    ],
    liabilities: [
      { name: "SBI Education Loan (daughter)", type: 'STUDENT_LOAN', balance: 920000, originalAmount: 1200000, interestRate: 9.2, minimumPayment: 18500, dueDay: 10 },
    ],
    insurances: [
      { name: 'LIC Jeevan Anand', type: 'ENDOWMENT', provider: 'LIC', premiumAmount: 38000, premiumFrequency: 'ANNUALLY', sumInsured: 1000000, renewalInDays: 65, yearsHeld: 14, nominees: 'Sunita Kumar' },
      { name: 'Senior Citizen Red Carpet (parents)', type: 'HEALTH', provider: 'Star Health', premiumAmount: 26000, premiumFrequency: 'ANNUALLY', sumInsured: 500000, renewalInDays: 100, yearsHeld: 3 },
      { name: 'Ciaz Car Insurance', type: 'VEHICLE_FOUR_WHEELER', provider: 'New India Assurance', premiumAmount: 9800, premiumFrequency: 'ANNUALLY', sumInsured: 560000, renewalInDays: 22, yearsHeld: 6, vehicleRegistration: 'DL-9C-AQ-4417' },
    ],
    goals: [
      { name: 'Retirement Corpus', type: 'INVESTMENT', targetAmount: 15000000, currentAmount: 7870000, targetDate: '2036-03-31', color: '#f59e0b' },
      { name: "Daughter's Wedding", type: 'SAVINGS', targetAmount: 2500000, currentAmount: 1100000, targetDate: '2029-02-01', color: '#ec4899' },
    ],
  },
  {
    first: 'Neha', last: 'Gupta', profile: '33, investment banking analyst, Mumbai, high income, high card debt, crypto',
    incomes: [
      { category: 'Salary', description: 'Salary credit - Harbourline Capital', monthly: 186000, variance: 0, payments: 1, day: 1 },
      { category: 'Investment Returns', description: 'Dividend credit', monthly: 2500, variance: 0.8, payments: 1, day: 20 },
    ],
    rent: 52000, sip: 30000, spend: 1.7, gym: true, internet: 1179,
    subscriptions: [['Netflix', 649], ['Spotify Premium', 119], ['Kindle Unlimited', 169]],
    trip: { monthsAgo: 1, category: 'Air Travel', description: 'Vistara BOM-DEL', amount: 12500 },
    accounts: [
      { key: 'main', name: 'Kotak Savings', type: 'SAVINGS', institution: 'Kotak Mahindra Bank', balance: 96000 },
      { key: 'demat', name: 'Upstox', type: 'INVESTMENT', institution: 'Upstox', balance: 640000 },
      { key: 'crypto', name: 'CoinDCX Wallet', type: 'CRYPTO', institution: 'CoinDCX', balance: 405000 },
      { key: 'cash', name: 'Cash', type: 'CASH', balance: 6000 },
    ],
    assets: [
      { name: 'US Stocks (via INDmoney)', type: 'EQUITY', value: 540000, purchasePrice: 410000, quantity: 38, investmentStrategy: 'LONG_TERM' },
      { name: 'Indian Equity Portfolio', type: 'EQUITY', value: 380000, purchasePrice: 450000, investmentStrategy: 'SHORT_TERM', notes: 'Currently at a loss' },
      { name: 'Bitcoin', type: 'CRYPTO', value: 310000, purchasePrice: 220000, quantity: 0.042 },
      { name: 'Ethereum', type: 'CRYPTO', value: 95000, purchasePrice: 120000, quantity: 0.35 },
      { name: 'Nippon Small Cap Fund', type: 'MUTUAL_FUND', value: 210000, purchasePrice: 160000, quantity: 1290, investmentStrategy: 'LONG_TERM' },
      { name: 'EPF', type: 'RETIREMENT', value: 520000 },
    ],
    liabilities: [
      { name: 'Axis Magnus Credit Card', type: 'CREDIT_CARD', balance: 148000, interestRate: 42, minimumPayment: 7400, dueDay: 18 },
      { name: 'HDFC Regalia Credit Card', type: 'CREDIT_CARD', balance: 63500, interestRate: 42, minimumPayment: 3175, dueDay: 22 },
      { name: 'ICICI Personal Loan', type: 'PERSONAL_LOAN', balance: 240000, originalAmount: 400000, interestRate: 12.75, minimumPayment: 13400, dueDay: 5 },
    ],
    insurances: [
      { name: 'ICICI Lombard Elevate', type: 'HEALTH', provider: 'ICICI Lombard', premiumAmount: 13900, premiumFrequency: 'ANNUALLY', sumInsured: 1000000, renewalInDays: 5, yearsHeld: 2 },
      { name: 'Max Life Online Term', type: 'TERM_LIFE', provider: 'Max Life', premiumAmount: 14600, premiumFrequency: 'ANNUALLY', sumInsured: 15000000, renewalInDays: 330, yearsHeld: 4, nominees: 'Anil Gupta' },
    ],
    goals: [
      { name: 'Clear Credit Card Debt', type: 'DEBT_PAYOFF', targetAmount: 211500, currentAmount: 40000, targetDate: '2027-03-31', color: '#ef4444', notes: '42% interest, top priority' },
      { name: 'Emergency Fund', type: 'EMERGENCY_FUND', targetAmount: 600000, currentAmount: 96000, targetDate: '2027-12-31', color: '#3b82f6' },
      { name: 'Down Payment, Mumbai Flat', type: 'SAVINGS', targetAmount: 4000000, currentAmount: 600000, targetDate: '2030-06-01', color: '#f59e0b' },
    ],
  },
  {
    first: 'Farhan', last: 'Khan', profile: '29, pharma sales representative, Lucknow, medical bills + supporting parents',
    incomes: [
      { category: 'Salary', description: 'Salary credit - Avadh Pharma', monthly: 68000, variance: 0, payments: 1, day: 1 },
      { category: 'Other Income', description: 'Monthly sales incentive', monthly: 9000, variance: 0.6, payments: 1, day: 12 },
    ],
    rent: 11000, sip: 4000, spend: 0.75, vehicle: 'bike', parentsSupport: 10000, internet: 0,
    subscriptions: [['JioHotstar', 149]],
    trip: { monthsAgo: 3, category: 'Train Travel', description: 'IRCTC LKO-NDLS', amount: 1200 },
    accounts: [
      { key: 'main', name: 'Bank of Baroda Savings', type: 'SAVINGS', institution: 'Bank of Baroda', balance: 41000 },
      { key: 'cash', name: 'Cash', type: 'CASH', balance: 5200 },
    ],
    assets: [
      { name: 'Bajaj Pulsar 150', type: 'VEHICLE', value: 72000, purchasePrice: 110000, purchaseDate: '2024-02-10' },
      { name: 'SBI Small Cap Fund (SIP)', type: 'MUTUAL_FUND', value: 58000, purchasePrice: 48000, quantity: 330, investmentStrategy: 'LONG_TERM' },
      { name: 'Gold chain (13g)', type: 'GOLD', value: 95000, quantity: 13 },
      { name: 'Bank of Baroda RD', type: 'SAVINGS', value: 36000, targetDate: '2027-08-01' },
    ],
    liabilities: [
      { name: 'Pulsar Bike Loan', type: 'TWO_WHEELER_LOAN', balance: 38000, originalAmount: 90000, interestRate: 11, minimumPayment: 3300, dueDay: 5 },
      { name: 'Hospital Bill Instalments', type: 'MEDICAL', balance: 45000, originalAmount: 120000, minimumPayment: 7500, dueDay: 10, notes: "Father's surgery, interest-free instalments" },
      { name: 'Loan from Friend', type: 'INFORMAL_DEBT', balance: 20000, originalAmount: 30000, minimumPayment: 2500, dueDay: 25 },
    ],
    insurances: [
      { name: 'Star Health Family Floater', type: 'HEALTH', provider: 'Star Health', premiumAmount: 9400, premiumFrequency: 'ANNUALLY', sumInsured: 500000, renewalInDays: 210, yearsHeld: 1 },
      { name: 'Pulsar Insurance', type: 'VEHICLE_TWO_WHEELER', provider: 'Digit', premiumAmount: 1600, premiumFrequency: 'ANNUALLY', sumInsured: 75000, renewalInDays: 48, yearsHeld: 2, vehicleRegistration: 'UP-32-MK-5508' },
      { name: 'ICICI Pru iProtect Smart', type: 'TERM_LIFE', provider: 'ICICI Prudential', premiumAmount: 7900, premiumFrequency: 'ANNUALLY', sumInsured: 5000000, renewalInDays: 100, yearsHeld: 1, nominees: 'Shabana Khan' },
    ],
    goals: [
      { name: 'Clear Medical Bills', type: 'DEBT_PAYOFF', targetAmount: 120000, currentAmount: 75000, targetDate: '2027-04-30', color: '#ef4444' },
      { name: 'Emergency Fund', type: 'EMERGENCY_FUND', targetAmount: 150000, currentAmount: 41000, targetDate: '2027-12-31', color: '#3b82f6' },
      { name: 'Wedding Savings', type: 'SAVINGS', targetAmount: 800000, currentAmount: 120000, targetDate: '2028-11-01', color: '#ec4899' },
    ],
  },
]

// ─── Transaction generator ────────────────────────────────────────────────────

const PREMIUM_STEP_MONTHS: Record<PremiumFrequency, number> = {
  MONTHLY: 1, QUARTERLY: 3, HALF_YEARLY: 6, ANNUALLY: 12, SINGLE_PREMIUM: 0,
}

function buildTransactions(
  p: Persona, userId: string, accountIds: Record<string, string>, rand: () => number,
): Prisma.TransactionCreateManyInput[] {
  const txs: Prisma.TransactionCreateManyInput[] = []
  const pick = <T,>(items: T[]) => items[Math.floor(rand() * items.length)]
  const between = (lo: number, hi: number) => Math.round(lo + rand() * (hi - lo))
  const primary = accountIds[p.accounts[0].key]
  const spendAccounts = p.accounts.filter((a) => a.type !== 'INVESTMENT' && a.type !== 'CRYPTO').map((a) => accountIds[a.key])

  const add = (
    date: Date, type: TransactionType, category: string, description: string,
    amount: number, accountId: string = pick(spendAccounts), isRecurring = false,
  ) => {
    if (date > today || date < windowStart || amount <= 0) return
    txs.push({ userId, accountId, categoryId: cat(category), type, amount, date, description, isRecurring, tags: [] })
  }

  for (let k = MONTHS - 1; k >= 0; k--) {
    const y = today.getFullYear()
    const m = today.getMonth() - k
    const dim = new Date(y, m + 1, 0).getDate()
    const d = (day: number) => new Date(y, m, Math.min(Math.max(day, 1), dim), 12)
    const anyDay = () => d(1 + Math.floor(rand() * dim))
    const monthIdx = ((m % 12) + 12) % 12
    const s = p.spend

    // Income
    for (const inc of p.incomes) {
      const total = inc.monthly * (1 + (rand() * 2 - 1) * inc.variance)
      if (inc.payments === 1) {
        add(d(inc.day ?? 1), 'INCOME', inc.category, inc.description, Math.round(total), primary, inc.variance === 0)
      } else {
        for (let i = 0; i < inc.payments; i++) {
          add(anyDay(), 'INCOME', inc.category, `${inc.description} #${i + 1}`, Math.round(total / inc.payments), primary)
        }
      }
    }
    if (monthIdx % 3 === 2) add(d(28), 'INCOME', 'Investment Returns', 'Savings account interest credit', between(250, 1800), primary)

    // Fixed monthly outflows
    if (p.rent) add(d(3), 'EXPENSE', 'Housing & Rent', 'House rent', p.rent, primary, true)
    if (p.parentsSupport) add(d(2), 'EXPENSE', 'Parents Support', 'Monthly transfer to parents', p.parentsSupport, primary, true)
    if (p.sip) add(d(7), 'EXPENSE', 'Savings & Investments', 'Mutual fund SIP', p.sip, primary, true)
    if (p.gym) add(d(3), 'EXPENSE', 'Gym & Fitness', pick(['Cult.fit membership', 'Gold\'s Gym monthly', 'Yoga studio fees']), Math.round(1500 * s), primary, true)
    if (p.internet) add(d(8), 'EXPENSE', 'Internet & Fiber', pick(['ACT Fibernet bill', 'Jio Fiber bill', 'Airtel Xstream Fiber']), p.internet, primary, true)
    for (const [name, amt] of p.subscriptions) add(d(9), 'EXPENSE', 'Subscriptions', name, amt, primary, true)

    for (const l of p.liabilities) {
      if (!l.minimumPayment) continue
      if (l.type === 'CREDIT_CARD') {
        add(d(l.dueDay ?? 18), 'EXPENSE', 'Loan Payment', `Credit card bill - ${l.name}`, between(l.minimumPayment, l.minimumPayment * 3), primary)
      } else if (l.type === 'INFORMAL_DEBT') {
        add(d(l.dueDay ?? 25), 'EXPENSE', 'Family Debt Repayment', `Repayment - ${l.name}`, l.minimumPayment, primary)
      } else {
        add(d(l.dueDay ?? 5), 'EXPENSE', 'Loan Payment', `EMI - ${l.name}`, l.minimumPayment, primary, true)
      }
    }

    // Bills
    add(d(10), 'EXPENSE', 'Utilities', 'Electricity bill', Math.round(between(900, 3200) * s))
    add(d(15), 'EXPENSE', 'Utilities', pick(['Jio prepaid recharge', 'Airtel postpaid bill', 'Vi recharge']), pick([299, 349, 449, 599, 719]))
    if (monthIdx % 2 === 0) add(d(20), 'EXPENSE', 'Gas & LPG', pick(['Indane LPG cylinder', 'HP Gas booking', 'Bharat Gas refill']), 905)

    // Day-to-day spending
    for (const day of [4, 11, 18, 25]) {
      add(d(day), 'EXPENSE', 'Groceries', pick(['BigBasket order', 'DMart', 'Zepto groceries', 'Reliance Fresh', 'More Retail']), Math.round(between(1200, 3500) * s))
      add(d(day + 2), 'EXPENSE', 'Vegetables & Fruits', pick(['Vegetable market', 'Fruits - local vendor', 'Sabzi mandi']), between(250, 700))
    }
    const meals = 5 + Math.floor(rand() * 6)
    for (let i = 0; i < meals; i++) {
      add(anyDay(), 'EXPENSE', 'Food & Dining', pick(['Swiggy', 'Zomato', 'Starbucks', "Domino's Pizza", 'Cafe Coffee Day', 'Restaurant dinner', 'Biryani house']), Math.round(between(200, 1400) * s))
    }
    const shops = 1 + Math.floor(rand() * 3)
    for (let i = 0; i < shops; i++) {
      add(anyDay(), 'EXPENSE', 'Shopping', pick(['Amazon', 'Flipkart', 'Myntra', 'Ajio', 'Nykaa', 'Decathlon']), Math.round(between(600, 5000) * s))
    }
    if (rand() < 0.8) add(anyDay(), 'EXPENSE', 'Entertainment', pick(['BookMyShow', 'PVR Cinemas', 'INOX', 'Comedy show tickets']), Math.round(between(300, 1200) * s))
    if (rand() < 0.6) add(anyDay(), 'EXPENSE', 'Healthcare', pick(['Apollo Pharmacy', 'Practo consultation', 'Diagnostic lab test', 'MedPlus']), between(300, 2500))
    if (rand() < 0.7) add(anyDay(), 'EXPENSE', 'Personal Care', pick(['Salon', 'Urban Company - salon at home', 'Barber']), Math.round(between(300, 1800) * s))

    if (p.vehicle === 'car') {
      for (let i = 0; i < 3; i++) add(anyDay(), 'EXPENSE', 'Fuel & Petrol', pick(['HP Petrol', 'Indian Oil fuel', 'BPCL fuel']), between(2000, 3500))
      add(d(14), 'EXPENSE', 'FASTag & Tolls', 'FASTag recharge', pick([500, 750, 1000]))
    } else if (p.vehicle === 'bike') {
      for (let i = 0; i < 3; i++) add(anyDay(), 'EXPENSE', 'Fuel & Petrol', pick(['HP Petrol', 'Indian Oil fuel', 'BPCL fuel']), between(300, 650))
    } else {
      const rides = 4 + Math.floor(rand() * 5)
      for (let i = 0; i < rides; i++) add(anyDay(), 'EXPENSE', 'Transportation', pick(['Uber', 'Ola', 'Rapido', 'Metro card recharge']), between(80, 450))
    }

    // Occasions and travel
    if (monthIdx === 7) add(d(9), 'EXPENSE', 'Festival & Occasions', 'Raksha Bandhan gifts', Math.round(between(1000, 3000) * s))
    if (monthIdx === 10) add(d(6), 'EXPENSE', 'Festival & Occasions', 'Diwali shopping, sweets & gifts', Math.round(between(4000, 15000) * s))
    if (p.trip && k === p.trip.monthsAgo) {
      add(d(14), 'EXPENSE', p.trip.category, p.trip.description, p.trip.amount)
      add(d(15), 'EXPENSE', 'Travel', 'Hotel stay', Math.round(p.trip.amount * 0.8))
    }
  }

  // Insurance premiums paid inside the window
  for (const ins of p.insurances) {
    const step = PREMIUM_STEP_MONTHS[ins.premiumFrequency]
    if (!step) continue
    const renewal = daysFromNow(ins.renewalInDays)
    for (let j = 1; j <= 24; j++) {
      const paid = new Date(renewal)
      paid.setMonth(paid.getMonth() - step * j)
      if (paid < windowStart) break
      add(paid, 'EXPENSE', 'Insurance', `Premium - ${ins.name}`, ins.premiumAmount, primary, true)
    }
  }

  return txs
}

// ─── Main ─────────────────────────────────────────────────────────────────────

const roundTo = (n: number, step: number) => Math.max(step, Math.round(n / step) * step)
const annualMultiplier: Record<PremiumFrequency, number> = { MONTHLY: 12, QUARTERLY: 4, HALF_YEARLY: 2, ANNUALLY: 1, SINGLE_PREMIUM: 0 }

async function seedPersona(p: Persona, index: number, passwordHash: string) {
  const rand = makeRng(1000 + index * 7919)
  const user = await prisma.user.create({
    data: { email: emailOf(p), name: `${p.first} ${p.last}`, passwordHash, currency: 'INR' },
  })
  const uid = user.id

  const accountIds: Record<string, string> = {}
  for (const a of p.accounts) {
    const created = await prisma.account.create({
      data: { userId: uid, name: a.name, type: a.type, institution: a.institution, balance: a.balance, currency: 'INR' },
    })
    accountIds[a.key] = created.id
  }

  await prisma.asset.createMany({
    data: p.assets.map((a) => ({
      userId: uid, name: a.name, type: a.type, value: a.value, purchasePrice: a.purchasePrice,
      purchaseDate: a.purchaseDate ? new Date(a.purchaseDate) : undefined, quantity: a.quantity,
      investmentStrategy: a.investmentStrategy, targetDate: a.targetDate ? new Date(a.targetDate) : undefined,
      notes: a.notes, currency: 'INR',
    })),
  })

  await prisma.liability.createMany({
    data: p.liabilities.map((l) => {
      const due = new Date(today.getFullYear(), today.getMonth(), l.dueDay ?? 5, 12)
      if (due < today) due.setMonth(due.getMonth() + 1)
      return {
        userId: uid, name: l.name, type: l.type, balance: l.balance, originalAmount: l.originalAmount,
        interestRate: l.interestRate, minimumPayment: l.minimumPayment, dueDate: due, notes: l.notes, currency: 'INR',
      }
    }),
  })

  await prisma.insurance.createMany({
    data: p.insurances.map((ins, i) => {
      const renewalDate = daysFromNow(ins.renewalInDays)
      const startDate = new Date(renewalDate)
      startDate.setFullYear(startDate.getFullYear() - ins.yearsHeld)
      return {
        userId: uid, name: ins.name, type: ins.type, provider: ins.provider,
        policyNumber: `${ins.provider.replace(/[^A-Z]/g, '').slice(0, 4) || 'POL'}-${2026 - ins.yearsHeld}-${String(1000 + index * 10 + i)}`,
        premiumAmount: ins.premiumAmount, premiumFrequency: ins.premiumFrequency, sumInsured: ins.sumInsured,
        startDate, renewalDate, status: 'ACTIVE' as const,
        vehicleRegistration: ins.vehicleRegistration, nominees: ins.nominees,
      }
    }),
  })

  const txs = buildTransactions(p, uid, accountIds, rand)
  await prisma.transaction.createMany({ data: txs })

  await prisma.goal.createMany({
    data: p.goals.map((g, i) => ({
      userId: uid, name: g.name, type: g.type, targetAmount: g.targetAmount, currentAmount: g.currentAmount,
      targetDate: g.targetDate ? new Date(g.targetDate) : undefined, status: g.status ?? 'ACTIVE',
      priority: i, color: g.color, notes: g.notes,
    })),
  })

  // Budgets for this month and last month, plus one annual budget
  const s = p.spend
  const monthly: Array<[string, string, number]> = [
    ['Groceries', 'Groceries', roundTo(10000 * s, 500)],
    ['Food & Dining', 'Eating Out', roundTo(5500 * s, 500)],
    ['Shopping', 'Shopping', roundTo(5000 * s, 500)],
    ['Entertainment', 'Entertainment', roundTo(1200 * s, 500)],
    ['Utilities', 'Bills & Recharges', roundTo(3000 * s, 500)],
  ]
  if (p.vehicle) monthly.push(['Fuel & Petrol', 'Fuel', p.vehicle === 'car' ? 9000 : 1500])
  else monthly.push(['Transportation', 'Cabs & Metro', 2000])

  const budgetRows: Prisma.BudgetCreateManyInput[] = []
  for (const back of [1, 0]) {
    const ref = new Date(today.getFullYear(), today.getMonth() - back, 1)
    for (const [category, name, amount] of monthly) {
      budgetRows.push({ userId: uid, categoryId: cat(category), name, amount, period: 'MONTHLY', month: ref.getMonth() + 1, year: ref.getFullYear() })
    }
  }
  const annualPremiums = p.insurances.reduce((sum, i) => sum + i.premiumAmount * annualMultiplier[i.premiumFrequency], 0)
  budgetRows.push({ userId: uid, categoryId: cat('Insurance'), name: 'Annual Insurance Premiums', amount: roundTo(annualPremiums * 1.1, 1000), period: 'ANNUAL', year: today.getFullYear() })
  await prisma.budget.createMany({ data: budgetRows })

  // Monthly net worth snapshots, trending towards today's numbers
  const totalAssets = p.assets.reduce((sum, a) => sum + a.value, 0)
  const totalLiabilities = p.liabilities.reduce((sum, l) => sum + l.balance, 0)
  const snapshots: Prisma.NetWorthSnapshotCreateManyInput[] = []
  for (let k = MONTHS - 1; k >= 0; k--) {
    const assetsAt = Math.round(totalAssets * (1 - 0.011 * k + (rand() - 0.5) * 0.008))
    const liabilitiesAt = Math.round(totalLiabilities * (1 + 0.012 * k))
    const snapshotDate = k === 0 ? today : new Date(today.getFullYear(), today.getMonth() - k, 1, 9)
    snapshots.push({ userId: uid, totalAssets: assetsAt, totalLiabilities: liabilitiesAt, netWorth: assetsAt - liabilitiesAt, snapshotDate })
  }
  await prisma.netWorthSnapshot.createMany({ data: snapshots })

  return {
    email: emailOf(p), profile: p.profile,
    accounts: p.accounts.length, assets: p.assets.length, liabilities: p.liabilities.length,
    insurance: p.insurances.length, transactions: txs.length, goals: p.goals.length, budgets: budgetRows.length,
    netWorth: totalAssets - totalLiabilities,
  }
}

async function main() {
  const systemCats = await prisma.category.count({ where: { isSystem: true } })
  if (systemCats === 0) throw new Error('No system categories found. Run `npm run db:seed` first.')

  const emails = personas.map(emailOf)
  const removed = await prisma.user.deleteMany({ where: { email: { in: emails } } })
  if (removed.count) console.log(`Removed ${removed.count} previously seeded test users (only @${DOMAIN} accounts)`)

  const passwordHash = await bcrypt.hash(PASSWORD, 10)
  const summary = []
  for (let i = 0; i < personas.length; i++) {
    summary.push(await seedPersona(personas[i], i, passwordHash))
    console.log(`✓ ${personas[i].first} ${personas[i].last}`)
  }

  console.table(summary.map((s) => ({
    email: s.email, accts: s.accounts, assets: s.assets, liabs: s.liabilities, ins: s.insurance,
    txns: s.transactions, goals: s.goals, budgets: s.budgets, netWorth: s.netWorth.toLocaleString('en-IN'),
  })))
  console.log(`\nAll 10 users log in with password: ${PASSWORD}`)
}

main()
  .catch((e) => {
    console.error('❌ Seeding test users failed:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
