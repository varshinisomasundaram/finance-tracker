import { TransactionType } from '@prisma/client'

/**
 * The 35 built-in categories every user sees. Seeded by prisma/seed.ts.
 * Kept in its own file so tests and other scripts can import the list
 * without running the seed.
 */
export const systemCategories = [
  // Income
  { name: 'Salary', type: TransactionType.INCOME, color: '#22c55e', icon: 'briefcase' },
  { name: 'Freelance', type: TransactionType.INCOME, color: '#16a34a', icon: 'laptop' },
  { name: 'Investment Returns', type: TransactionType.INCOME, color: '#15803d', icon: 'trending-up' },
  { name: 'Rental Income', type: TransactionType.INCOME, color: '#166534', icon: 'home' },
  { name: 'Business Income', type: TransactionType.INCOME, color: '#14532d', icon: 'building' },
  { name: 'Other Income', type: TransactionType.INCOME, color: '#86efac', icon: 'plus-circle' },
  // Expense
  { name: 'Housing & Rent', type: TransactionType.EXPENSE, color: '#3b82f6', icon: 'home' },
  { name: 'Transportation', type: TransactionType.EXPENSE, color: '#6366f1', icon: 'car' },
  { name: 'Food & Dining', type: TransactionType.EXPENSE, color: '#f59e0b', icon: 'utensils' },
  { name: 'Groceries', type: TransactionType.EXPENSE, color: '#d97706', icon: 'shopping-cart' },
  { name: 'Healthcare', type: TransactionType.EXPENSE, color: '#ef4444', icon: 'heart' },
  { name: 'Entertainment', type: TransactionType.EXPENSE, color: '#8b5cf6', icon: 'tv' },
  { name: 'Shopping', type: TransactionType.EXPENSE, color: '#ec4899', icon: 'shopping-bag' },
  { name: 'Education', type: TransactionType.EXPENSE, color: '#06b6d4', icon: 'book' },
  { name: 'Utilities', type: TransactionType.EXPENSE, color: '#64748b', icon: 'zap' },
  { name: 'Insurance', type: TransactionType.EXPENSE, color: '#475569', icon: 'shield' },
  { name: 'Subscriptions', type: TransactionType.EXPENSE, color: '#7c3aed', icon: 'repeat' },
  { name: 'Travel', type: TransactionType.EXPENSE, color: '#0891b2', icon: 'plane' },
  { name: 'Personal Care', type: TransactionType.EXPENSE, color: '#db2777', icon: 'user' },
  { name: 'Savings & Investments', type: TransactionType.EXPENSE, color: '#0ea5e9', icon: 'piggy-bank' },
  { name: 'Loan Payment', type: TransactionType.EXPENSE, color: '#dc2626', icon: 'credit-card' },
  // India-specific categories
  { name: 'Fuel & Petrol', type: TransactionType.EXPENSE, color: '#f97316', icon: 'fuel' },
  { name: 'Air Travel', type: TransactionType.EXPENSE, color: '#0284c7', icon: 'plane' },
  { name: 'Train Travel', type: TransactionType.EXPENSE, color: '#7c3aed', icon: 'train-front' },
  { name: 'Internet & Fiber', type: TransactionType.EXPENSE, color: '#0891b2', icon: 'wifi' },
  { name: 'Gas & LPG', type: TransactionType.EXPENSE, color: '#ea580c', icon: 'flame' },
  { name: 'FASTag & Tolls', type: TransactionType.EXPENSE, color: '#b45309', icon: 'tag' },
  { name: 'Vegetables & Fruits', type: TransactionType.EXPENSE, color: '#16a34a', icon: 'leaf' },
  { name: 'Stationery & Books', type: TransactionType.EXPENSE, color: '#4f46e5', icon: 'book-open' },
  { name: 'Parents Support', type: TransactionType.EXPENSE, color: '#db2777', icon: 'heart-handshake' },
  { name: 'Family Allowance', type: TransactionType.EXPENSE, color: '#8b5cf6', icon: 'users' },
  { name: 'Family Debt Repayment', type: TransactionType.EXPENSE, color: '#dc2626', icon: 'hand-coins' },
  { name: 'Gym & Fitness', type: TransactionType.EXPENSE, color: '#059669', icon: 'dumbbell' },
  { name: 'Festival & Occasions', type: TransactionType.EXPENSE, color: '#d97706', icon: 'sparkles' },
  { name: 'Other Expenses', type: TransactionType.EXPENSE, color: '#94a3b8', icon: 'more-horizontal' },
]

/** Stable ID used for each system category, e.g. "Food & Dining" -> "system-food---dining". */
export function systemCategoryId(name: string): string {
  return `system-${name.toLowerCase().replace(/[^a-z0-9]/g, '-')}`
}
