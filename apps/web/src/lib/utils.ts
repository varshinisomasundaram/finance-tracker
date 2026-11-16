import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

const CURRENCY_LOCALE: Record<string, string> = {
  INR: 'en-IN',
  USD: 'en-US',
  EUR: 'de-DE',
  GBP: 'en-GB',
  JPY: 'ja-JP',
  AUD: 'en-AU',
  CAD: 'en-CA',
  SGD: 'en-SG',
  AED: 'ar-AE',
}

export function formatCurrency(amount: number, currency = 'INR'): string {
  const locale = CURRENCY_LOCALE[currency] ?? 'en-IN'
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(amount)
}

export function formatPercent(value: number, decimals = 1): string {
  const sign = value > 0 ? '+' : ''
  return `${sign}${value.toFixed(decimals)}%`
}

export function formatDate(dateStr: string, format: 'short' | 'long' | 'month' = 'short'): string {
  const date = new Date(dateStr)
  const options: Intl.DateTimeFormatOptions =
    format === 'long'
      ? { year: 'numeric', month: 'long', day: 'numeric' }
      : format === 'month'
        ? { year: 'numeric', month: 'short' }
        : { year: 'numeric', month: 'short', day: 'numeric' }
  return date.toLocaleDateString('en-US', options)
}

export function getInitials(name: string): string {
  return name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)
}

export function classifyAmount(type: 'INCOME' | 'EXPENSE' | 'TRANSFER') {
  return {
    INCOME: 'text-income',
    EXPENSE: 'text-expense',
    TRANSFER: 'text-muted-foreground',
  }[type]
}
