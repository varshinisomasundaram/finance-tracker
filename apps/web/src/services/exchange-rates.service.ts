// All stored monetary values are in INR (base currency).
// This service fetches live INR → X rates and caches them in localStorage for 1 hour.

const BASE = 'INR'
const CACHE_KEY = 'fx_rates_v1'
const TTL_MS = 60 * 60 * 1000 // 1 hour

interface CacheEntry {
  rates: Record<string, number>
  ts: number
}

export interface RatesData {
  rates: Record<string, number>
  fetchedAt: Date
}

export async function fetchExchangeRates(): Promise<RatesData> {
  // Return localStorage cache if still fresh
  try {
    const raw = localStorage.getItem(CACHE_KEY)
    if (raw) {
      const entry: CacheEntry = JSON.parse(raw)
      if (Date.now() - entry.ts < TTL_MS) {
        return { rates: entry.rates, fetchedAt: new Date(entry.ts) }
      }
    }
  } catch {}

  // Fetch live rates from open.er-api.com (free, no API key, updates daily)
  const res = await fetch(`https://open.er-api.com/v6/latest/${BASE}`)
  if (!res.ok) throw new Error(`Exchange rate fetch failed: ${res.status}`)
  const data = await res.json()

  const entry: CacheEntry = { rates: data.rates as Record<string, number>, ts: Date.now() }
  try { localStorage.setItem(CACHE_KEY, JSON.stringify(entry)) } catch {}

  return { rates: entry.rates, fetchedAt: new Date(entry.ts) }
}
