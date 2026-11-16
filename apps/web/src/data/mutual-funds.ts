export interface MutualFundReference {
  name: string
  amc: string
  category: 'Large Cap' | 'Mid Cap' | 'Small Cap' | 'Multi Cap' | 'Flexi Cap' | 'ELSS' | 'Index' | 'Debt' | 'Hybrid'
  return1Y: number
  return3Y: number
  return5Y: number
  expenseRatio: number
  aumBillionINR: number
  riskLevel: 'Low' | 'Moderate' | 'High' | 'Very High'
}

// Approximate data for educational purposes — last updated April 2026.
// Source: AMFI, ValueResearchOnline. Returns are CAGR. Values may differ from live data.
export const mutualFunds: MutualFundReference[] = [
  { name: 'SBI Bluechip Fund', amc: 'SBI', category: 'Large Cap', return1Y: 14.2, return3Y: 15.8, return5Y: 16.5, expenseRatio: 1.05, aumBillionINR: 480, riskLevel: 'High' },
  { name: 'HDFC Flexi Cap Fund', amc: 'HDFC', category: 'Flexi Cap', return1Y: 16.5, return3Y: 18.2, return5Y: 17.8, expenseRatio: 0.98, aumBillionINR: 520, riskLevel: 'High' },
  { name: 'ICICI Pru Bluechip Fund', amc: 'ICICI Pru', category: 'Large Cap', return1Y: 13.8, return3Y: 16.1, return5Y: 16.0, expenseRatio: 1.02, aumBillionINR: 450, riskLevel: 'High' },
  { name: 'Axis Bluechip Fund', amc: 'Axis', category: 'Large Cap', return1Y: 11.5, return3Y: 13.2, return5Y: 14.8, expenseRatio: 0.95, aumBillionINR: 330, riskLevel: 'High' },
  { name: 'Mirae Asset Large Cap Fund', amc: 'Mirae', category: 'Large Cap', return1Y: 15.1, return3Y: 16.5, return5Y: 17.2, expenseRatio: 0.85, aumBillionINR: 380, riskLevel: 'High' },
  { name: 'Parag Parikh Flexi Cap Fund', amc: 'PPFAS', category: 'Flexi Cap', return1Y: 18.2, return3Y: 20.5, return5Y: 21.0, expenseRatio: 0.75, aumBillionINR: 680, riskLevel: 'High' },
  { name: 'Kotak Emerging Equity Fund', amc: 'Kotak', category: 'Mid Cap', return1Y: 22.0, return3Y: 24.5, return5Y: 22.8, expenseRatio: 0.88, aumBillionINR: 350, riskLevel: 'Very High' },
  { name: 'HDFC Mid-Cap Opportunities', amc: 'HDFC', category: 'Mid Cap', return1Y: 20.5, return3Y: 22.8, return5Y: 21.5, expenseRatio: 1.05, aumBillionINR: 560, riskLevel: 'Very High' },
  { name: 'SBI Small Cap Fund', amc: 'SBI', category: 'Small Cap', return1Y: 25.0, return3Y: 28.5, return5Y: 26.0, expenseRatio: 1.12, aumBillionINR: 280, riskLevel: 'Very High' },
  { name: 'Nippon India Small Cap Fund', amc: 'Nippon', category: 'Small Cap', return1Y: 28.5, return3Y: 32.0, return5Y: 30.5, expenseRatio: 1.05, aumBillionINR: 480, riskLevel: 'Very High' },
  { name: 'Axis ELSS Tax Saver Fund', amc: 'Axis', category: 'ELSS', return1Y: 12.0, return3Y: 14.5, return5Y: 15.2, expenseRatio: 0.90, aumBillionINR: 350, riskLevel: 'High' },
  { name: 'Mirae Asset Tax Saver Fund', amc: 'Mirae', category: 'ELSS', return1Y: 16.8, return3Y: 18.0, return5Y: 18.5, expenseRatio: 0.78, aumBillionINR: 220, riskLevel: 'High' },
  { name: 'UTI Nifty 50 Index Fund', amc: 'UTI', category: 'Index', return1Y: 12.5, return3Y: 14.0, return5Y: 15.0, expenseRatio: 0.18, aumBillionINR: 180, riskLevel: 'High' },
  { name: 'HDFC Index Fund - Nifty 50', amc: 'HDFC', category: 'Index', return1Y: 12.3, return3Y: 13.8, return5Y: 14.8, expenseRatio: 0.20, aumBillionINR: 150, riskLevel: 'High' },
  { name: 'Motilal Oswal Nifty Midcap 150', amc: 'Motilal Oswal', category: 'Index', return1Y: 24.0, return3Y: 25.5, return5Y: 23.0, expenseRatio: 0.30, aumBillionINR: 120, riskLevel: 'Very High' },
  { name: 'DSP Multi Cap Fund', amc: 'DSP', category: 'Multi Cap', return1Y: 17.5, return3Y: 19.0, return5Y: 18.0, expenseRatio: 0.95, aumBillionINR: 180, riskLevel: 'High' },
  { name: 'ICICI Pru Balanced Advantage', amc: 'ICICI Pru', category: 'Hybrid', return1Y: 10.5, return3Y: 12.0, return5Y: 13.0, expenseRatio: 1.10, aumBillionINR: 580, riskLevel: 'Moderate' },
  { name: 'HDFC Balanced Advantage Fund', amc: 'HDFC', category: 'Hybrid', return1Y: 11.0, return3Y: 13.5, return5Y: 14.0, expenseRatio: 1.05, aumBillionINR: 620, riskLevel: 'Moderate' },
  { name: 'SBI Magnum Gilt Fund', amc: 'SBI', category: 'Debt', return1Y: 7.5, return3Y: 6.8, return5Y: 7.0, expenseRatio: 0.55, aumBillionINR: 80, riskLevel: 'Low' },
  { name: 'HDFC Corporate Bond Fund', amc: 'HDFC', category: 'Debt', return1Y: 8.0, return3Y: 7.2, return5Y: 7.5, expenseRatio: 0.45, aumBillionINR: 260, riskLevel: 'Low' },
]
