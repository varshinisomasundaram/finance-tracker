export interface StockReference {
  symbol: string
  name: string
  sector: string
  priceApprox: number
  bookValuePerShare: number
  eps: number
  pb: number
  pe: number
  roe: number
  marketCapBillionINR: number
  currency: 'INR' | 'USD'
}

// Approximate data for educational purposes — last updated April 2026.
// Source: NSE India, Screener.in. Values are indicative and may differ from live prices.
export const indianStocks: StockReference[] = [
  { symbol: 'RELIANCE', name: 'Reliance Industries', sector: 'Oil & Gas', priceApprox: 2500, bookValuePerShare: 886, eps: 100, pb: 2.8, pe: 25, roe: 12, marketCapBillionINR: 16900, currency: 'INR' },
  { symbol: 'TCS', name: 'Tata Consultancy Services', sector: 'IT', priceApprox: 3800, bookValuePerShare: 290, eps: 130, pb: 13.1, pe: 29, roe: 48, marketCapBillionINR: 13800, currency: 'INR' },
  { symbol: 'HDFCBANK', name: 'HDFC Bank', sector: 'Banking', priceApprox: 1650, bookValuePerShare: 750, eps: 97, pb: 2.2, pe: 17, roe: 16, marketCapBillionINR: 12600, currency: 'INR' },
  { symbol: 'INFY', name: 'Infosys', sector: 'IT', priceApprox: 1550, bookValuePerShare: 210, eps: 68, pb: 7.4, pe: 23, roe: 33, marketCapBillionINR: 6400, currency: 'INR' },
  { symbol: 'ICICIBANK', name: 'ICICI Bank', sector: 'Banking', priceApprox: 1100, bookValuePerShare: 380, eps: 70, pb: 2.9, pe: 16, roe: 18, marketCapBillionINR: 7700, currency: 'INR' },
  { symbol: 'SBIN', name: 'State Bank of India', sector: 'Banking', priceApprox: 780, bookValuePerShare: 540, eps: 78, pb: 1.4, pe: 10, roe: 20, marketCapBillionINR: 6960, currency: 'INR' },
  { symbol: 'BHARTIARTL', name: 'Bharti Airtel', sector: 'Telecom', priceApprox: 1700, bookValuePerShare: 280, eps: 42, pb: 6.1, pe: 40, roe: 16, marketCapBillionINR: 9700, currency: 'INR' },
  { symbol: 'ITC', name: 'ITC Limited', sector: 'FMCG', priceApprox: 440, bookValuePerShare: 68, eps: 18, pb: 6.5, pe: 24, roe: 29, marketCapBillionINR: 5500, currency: 'INR' },
  { symbol: 'KOTAKBANK', name: 'Kotak Mahindra Bank', sector: 'Banking', priceApprox: 1900, bookValuePerShare: 840, eps: 95, pb: 2.3, pe: 20, roe: 13, marketCapBillionINR: 3780, currency: 'INR' },
  { symbol: 'HINDUNILVR', name: 'Hindustan Unilever', sector: 'FMCG', priceApprox: 2400, bookValuePerShare: 230, eps: 46, pb: 10.4, pe: 52, roe: 20, marketCapBillionINR: 5640, currency: 'INR' },
  { symbol: 'LT', name: 'Larsen & Toubro', sector: 'Infrastructure', priceApprox: 3500, bookValuePerShare: 680, eps: 140, pb: 5.1, pe: 25, roe: 15, marketCapBillionINR: 4800, currency: 'INR' },
  { symbol: 'AXISBANK', name: 'Axis Bank', sector: 'Banking', priceApprox: 1100, bookValuePerShare: 580, eps: 80, pb: 1.9, pe: 14, roe: 15, marketCapBillionINR: 3400, currency: 'INR' },
  { symbol: 'BAJFINANCE', name: 'Bajaj Finance', sector: 'NBFC', priceApprox: 7500, bookValuePerShare: 2200, eps: 270, pb: 3.4, pe: 28, roe: 22, marketCapBillionINR: 4640, currency: 'INR' },
  { symbol: 'MARUTI', name: 'Maruti Suzuki', sector: 'Automobile', priceApprox: 12000, bookValuePerShare: 3800, eps: 420, pb: 3.2, pe: 29, roe: 15, marketCapBillionINR: 3700, currency: 'INR' },
  { symbol: 'SUNPHARMA', name: 'Sun Pharma', sector: 'Pharma', priceApprox: 1800, bookValuePerShare: 430, eps: 50, pb: 4.2, pe: 36, roe: 16, marketCapBillionINR: 4320, currency: 'INR' },
  { symbol: 'TITAN', name: 'Titan Company', sector: 'Consumer Goods', priceApprox: 3400, bookValuePerShare: 280, eps: 45, pb: 12.1, pe: 76, roe: 25, marketCapBillionINR: 3020, currency: 'INR' },
  { symbol: 'ASIANPAINT', name: 'Asian Paints', sector: 'Consumer Goods', priceApprox: 2800, bookValuePerShare: 210, eps: 48, pb: 13.3, pe: 58, roe: 25, marketCapBillionINR: 2680, currency: 'INR' },
  { symbol: 'NTPC', name: 'NTPC Limited', sector: 'Power', priceApprox: 360, bookValuePerShare: 200, eps: 22, pb: 1.8, pe: 16, roe: 12, marketCapBillionINR: 3490, currency: 'INR' },
  { symbol: 'POWERGRID', name: 'Power Grid Corp', sector: 'Power', priceApprox: 300, bookValuePerShare: 170, eps: 25, pb: 1.8, pe: 12, roe: 18, marketCapBillionINR: 2790, currency: 'INR' },
  { symbol: 'WIPRO', name: 'Wipro', sector: 'IT', priceApprox: 480, bookValuePerShare: 160, eps: 20, pb: 3.0, pe: 24, roe: 15, marketCapBillionINR: 2510, currency: 'INR' },
  { symbol: 'TECHM', name: 'Tech Mahindra', sector: 'IT', priceApprox: 1600, bookValuePerShare: 480, eps: 60, pb: 3.3, pe: 27, roe: 15, marketCapBillionINR: 1560, currency: 'INR' },
  { symbol: 'ULTRACEMCO', name: 'UltraTech Cement', sector: 'Cement', priceApprox: 11000, bookValuePerShare: 3200, eps: 330, pb: 3.4, pe: 33, roe: 12, marketCapBillionINR: 3170, currency: 'INR' },
  { symbol: 'NESTLEIND', name: 'Nestle India', sector: 'FMCG', priceApprox: 2400, bookValuePerShare: 180, eps: 52, pb: 13.3, pe: 46, roe: 110, marketCapBillionINR: 2310, currency: 'INR' },
  { symbol: 'ADANIPORTS', name: 'Adani Ports', sector: 'Infrastructure', priceApprox: 1200, bookValuePerShare: 380, eps: 55, pb: 3.2, pe: 22, roe: 16, marketCapBillionINR: 2590, currency: 'INR' },
  { symbol: 'JSWSTEEL', name: 'JSW Steel', sector: 'Metals', priceApprox: 900, bookValuePerShare: 480, eps: 60, pb: 1.9, pe: 15, roe: 14, marketCapBillionINR: 2190, currency: 'INR' },
  { symbol: 'TATASTEEL', name: 'Tata Steel', sector: 'Metals', priceApprox: 140, bookValuePerShare: 120, eps: 12, pb: 1.2, pe: 12, roe: 10, marketCapBillionINR: 1710, currency: 'INR' },
  { symbol: 'INDUSINDBK', name: 'IndusInd Bank', sector: 'Banking', priceApprox: 1000, bookValuePerShare: 1100, eps: 70, pb: 0.9, pe: 14, roe: 8, marketCapBillionINR: 780, currency: 'INR' },
  { symbol: 'BAJAJFINSV', name: 'Bajaj Finserv', sector: 'NBFC', priceApprox: 1700, bookValuePerShare: 620, eps: 55, pb: 2.7, pe: 31, roe: 14, marketCapBillionINR: 2710, currency: 'INR' },
  { symbol: 'M&M', name: 'Mahindra & Mahindra', sector: 'Automobile', priceApprox: 2800, bookValuePerShare: 580, eps: 110, pb: 4.8, pe: 25, roe: 18, marketCapBillionINR: 3470, currency: 'INR' },
  { symbol: 'HCLTECH', name: 'HCL Technologies', sector: 'IT', priceApprox: 1700, bookValuePerShare: 340, eps: 62, pb: 5.0, pe: 27, roe: 22, marketCapBillionINR: 4610, currency: 'INR' },
]
