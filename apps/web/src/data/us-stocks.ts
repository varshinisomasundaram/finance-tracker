import type { StockReference } from './indian-stocks'

// Approximate data for educational purposes — last updated April 2026.
// Source: Yahoo Finance, Google Finance. Values are indicative and may differ from live prices.
export const usStocks: StockReference[] = [
  { symbol: 'AAPL', name: 'Apple Inc.', sector: 'Technology', priceApprox: 210, bookValuePerShare: 4.4, eps: 7.0, pb: 48, pe: 30, roe: 160, marketCapBillionINR: 269000, currency: 'USD' },
  { symbol: 'MSFT', name: 'Microsoft Corp.', sector: 'Technology', priceApprox: 420, bookValuePerShare: 36, eps: 13, pb: 11.7, pe: 32, roe: 38, marketCapBillionINR: 259000, currency: 'USD' },
  { symbol: 'AMZN', name: 'Amazon.com Inc.', sector: 'E-Commerce', priceApprox: 190, bookValuePerShare: 22, eps: 5.5, pb: 8.6, pe: 35, roe: 22, marketCapBillionINR: 163000, currency: 'USD' },
  { symbol: 'GOOGL', name: 'Alphabet Inc.', sector: 'Technology', priceApprox: 165, bookValuePerShare: 24, eps: 7.5, pb: 6.9, pe: 22, roe: 30, marketCapBillionINR: 168000, currency: 'USD' },
  { symbol: 'META', name: 'Meta Platforms', sector: 'Technology', priceApprox: 510, bookValuePerShare: 64, eps: 22, pb: 8.0, pe: 23, roe: 35, marketCapBillionINR: 107000, currency: 'USD' },
  { symbol: 'NVDA', name: 'NVIDIA Corp.', sector: 'Semiconductors', priceApprox: 880, bookValuePerShare: 18, eps: 25, pb: 49, pe: 35, roe: 120, marketCapBillionINR: 180000, currency: 'USD' },
  { symbol: 'TSLA', name: 'Tesla Inc.', sector: 'Automobile', priceApprox: 250, bookValuePerShare: 22, eps: 4.5, pb: 11.4, pe: 56, roe: 20, marketCapBillionINR: 66000, currency: 'USD' },
  { symbol: 'BRK.B', name: 'Berkshire Hathaway', sector: 'Conglomerate', priceApprox: 460, bookValuePerShare: 300, eps: 40, pb: 1.5, pe: 12, roe: 14, marketCapBillionINR: 83000, currency: 'USD' },
  { symbol: 'JPM', name: 'JPMorgan Chase', sector: 'Banking', priceApprox: 210, bookValuePerShare: 110, eps: 18, pb: 1.9, pe: 12, roe: 17, marketCapBillionINR: 50000, currency: 'USD' },
  { symbol: 'JNJ', name: 'Johnson & Johnson', sector: 'Healthcare', priceApprox: 155, bookValuePerShare: 34, eps: 9.5, pb: 4.6, pe: 16, roe: 38, marketCapBillionINR: 31000, currency: 'USD' },
  { symbol: 'V', name: 'Visa Inc.', sector: 'Financial Services', priceApprox: 290, bookValuePerShare: 18, eps: 10, pb: 16.1, pe: 29, roe: 48, marketCapBillionINR: 49000, currency: 'USD' },
  { symbol: 'UNH', name: 'UnitedHealth Group', sector: 'Healthcare', priceApprox: 480, bookValuePerShare: 90, eps: 27, pb: 5.3, pe: 18, roe: 26, marketCapBillionINR: 37000, currency: 'USD' },
  { symbol: 'PG', name: 'Procter & Gamble', sector: 'FMCG', priceApprox: 165, bookValuePerShare: 22, eps: 6.4, pb: 7.5, pe: 26, roe: 30, marketCapBillionINR: 32000, currency: 'USD' },
  { symbol: 'MA', name: 'Mastercard Inc.', sector: 'Financial Services', priceApprox: 470, bookValuePerShare: 18, eps: 15, pb: 26, pe: 31, roe: 170, marketCapBillionINR: 37000, currency: 'USD' },
  { symbol: 'HD', name: 'Home Depot', sector: 'Retail', priceApprox: 370, bookValuePerShare: 5, eps: 16, pb: 74, pe: 23, roe: 1200, marketCapBillionINR: 30000, currency: 'USD' },
  { symbol: 'PFE', name: 'Pfizer Inc.', sector: 'Pharma', priceApprox: 28, bookValuePerShare: 16, eps: 1.5, pb: 1.8, pe: 19, roe: 8, marketCapBillionINR: 13000, currency: 'USD' },
  { symbol: 'KO', name: 'Coca-Cola Co.', sector: 'FMCG', priceApprox: 62, bookValuePerShare: 6, eps: 2.5, pb: 10.3, pe: 25, roe: 40, marketCapBillionINR: 22000, currency: 'USD' },
  { symbol: 'PEP', name: 'PepsiCo Inc.', sector: 'FMCG', priceApprox: 170, bookValuePerShare: 20, eps: 8, pb: 8.5, pe: 21, roe: 50, marketCapBillionINR: 19000, currency: 'USD' },
  { symbol: 'BAC', name: 'Bank of America', sector: 'Banking', priceApprox: 38, bookValuePerShare: 34, eps: 3.3, pb: 1.1, pe: 12, roe: 10, marketCapBillionINR: 25000, currency: 'USD' },
  { symbol: 'DIS', name: 'Walt Disney Co.', sector: 'Entertainment', priceApprox: 110, bookValuePerShare: 52, eps: 5, pb: 2.1, pe: 22, roe: 8, marketCapBillionINR: 16000, currency: 'USD' },
]
