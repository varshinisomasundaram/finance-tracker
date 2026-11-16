import { useQuery } from '@tanstack/react-query'
import { useAuthStore } from '@/store/authStore'
import { fetchExchangeRates } from '@/services/exchange-rates.service'

const BASE_CURRENCY = 'INR'

export function useExchangeRates() {
  const currency = useAuthStore((s) => s.user?.currency ?? BASE_CURRENCY)
  const needsConversion = currency !== BASE_CURRENCY

  const { data, isLoading, isError } = useQuery({
    queryKey: ['exchange-rates'],
    queryFn: fetchExchangeRates,
    staleTime: 60 * 60 * 1000,       // treat data as fresh for 1 hour
    gcTime: 2 * 60 * 60 * 1000,      // keep in memory 2 hours
    enabled: needsConversion,
    retry: 1,
  })

  // 1 INR → `rate` units of display currency (e.g. 0.012 for USD)
  const rate = needsConversion ? (data?.rates[currency] ?? null) : 1

  return {
    rate,                  // null while loading / on error
    fetchedAt: data?.fetchedAt ?? null,
    isLoading: needsConversion && isLoading,
    isError,
    baseCurrency: BASE_CURRENCY,
    displayCurrency: currency,
    /** Multiply an INR-stored amount to the display currency */
    convert: (amount: number): number => (rate !== null ? amount * rate : amount),
  }
}

/** Format a relative time like "5 min ago", "2 hrs ago", "just now" */
export function formatRelativeTime(date: Date): string {
  const diffMs = Date.now() - date.getTime()
  const mins = Math.floor(diffMs / 60_000)
  if (mins < 1) return 'just now'
  if (mins < 60) return `${mins} min ago`
  const hrs = Math.floor(mins / 60)
  if (hrs < 24) return `${hrs} hr${hrs > 1 ? 's' : ''} ago`
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}
