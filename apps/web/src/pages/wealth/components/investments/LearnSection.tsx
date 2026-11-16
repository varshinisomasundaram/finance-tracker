import { useState } from 'react'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { CollapsibleCalculator } from './CollapsibleCalculator'
import { BookOpen, TrendingUp, BarChart3, Target } from 'lucide-react'
import { cn } from '@/lib/utils'

function fmt(n: number): string {
  return new Intl.NumberFormat('en-IN', { maximumFractionDigits: 2 }).format(n)
}

// ─── 1. Book Value Calculator ───────────────────────────────────────────────

function BookValueCalc() {
  const [totalAssets, setTotalAssets] = useState(10000)
  const [totalLiabilities, setTotalLiabilities] = useState(9000)
  const [shares, setShares] = useState(10)

  const bookValue = totalAssets - totalLiabilities
  const bvps = shares > 0 ? bookValue / shares : 0

  return (
    <div className="space-y-4">
      <p className="text-sm text-muted-foreground">
        Book Value tells you what shareholders would receive if the company sold everything and paid off all debts. Think of it as the company's "net worth".
      </p>

      <div className="grid grid-cols-3 gap-3">
        <div className="space-y-1">
          <Label className="text-xs">Total Assets (Cr)</Label>
          <Input type="number" value={totalAssets} onChange={(e) => setTotalAssets(Number(e.target.value))} />
        </div>
        <div className="space-y-1">
          <Label className="text-xs">Total Liabilities (Cr)</Label>
          <Input type="number" value={totalLiabilities} onChange={(e) => setTotalLiabilities(Number(e.target.value))} />
        </div>
        <div className="space-y-1">
          <Label className="text-xs">Total Shares (Cr)</Label>
          <Input type="number" value={shares} onChange={(e) => setShares(Number(e.target.value))} />
        </div>
      </div>

      <div className="bg-primary/5 border border-primary/20 rounded-lg p-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-xs text-muted-foreground">Book Value (Net Worth)</p>
            <p className="text-xl font-bold text-primary">{fmt(bookValue)} Cr</p>
            <p className="text-xs text-muted-foreground mt-1">= {fmt(totalAssets)} - {fmt(totalLiabilities)}</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Book Value Per Share</p>
            <p className="text-xl font-bold text-primary">{fmt(bvps)}</p>
            <p className="text-xs text-muted-foreground mt-1">= {fmt(bookValue)} / {fmt(shares)}</p>
          </div>
        </div>
      </div>

      <div className="bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800 rounded-lg p-3 text-sm text-blue-800 dark:text-blue-300">
        <strong>Example:</strong> If a bank has assets worth {fmt(totalAssets)} Cr and owes {fmt(totalLiabilities)} Cr in deposits/loans, its net worth is {fmt(bookValue)} Cr. Divided by {fmt(shares)} Cr shares = {fmt(bvps)} per share. If the bank shuts down, each share should be worth at least {fmt(bvps)}.
      </div>
    </div>
  )
}

// ─── 2. P/B Ratio Calculator ────────────────────────────────────────────────

function PBRatioCalc() {
  const [sharePrice, setSharePrice] = useState(200)
  const [bvps, setBvps] = useState(100)

  const pb = bvps > 0 ? sharePrice / bvps : 0

  const pbColor = pb < 1 ? 'text-green-600 dark:text-green-400' : pb <= 2 ? 'text-yellow-600 dark:text-yellow-400' : 'text-red-600 dark:text-red-400'
  const pbLabel = pb < 1 ? 'Undervalued' : pb <= 2 ? 'Fair Value' : 'Premium'
  const pbBadgeVariant = pb < 1 ? 'default' : pb <= 2 ? 'secondary' : 'destructive'

  return (
    <div className="space-y-4">
      <p className="text-sm text-muted-foreground">
        P/B tells you how much premium (or discount) you're paying compared to the company's actual book value. This is the <strong>primary valuation metric for banks</strong>.
      </p>

      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1">
          <Label className="text-xs">Share Price</Label>
          <Input type="number" value={sharePrice} onChange={(e) => setSharePrice(Number(e.target.value))} />
        </div>
        <div className="space-y-1">
          <Label className="text-xs">Book Value Per Share</Label>
          <Input type="number" value={bvps} onChange={(e) => setBvps(Number(e.target.value))} />
        </div>
      </div>

      <div className="bg-primary/5 border border-primary/20 rounded-lg p-4">
        <div className="flex items-center gap-3">
          <div>
            <p className="text-xs text-muted-foreground">P/B Ratio</p>
            <p className={cn('text-2xl font-bold', pbColor)}>{pb.toFixed(2)}</p>
          </div>
          <Badge variant={pbBadgeVariant as 'default' | 'secondary' | 'destructive'}>{pbLabel}</Badge>
        </div>
        <p className="text-xs text-muted-foreground mt-2">= {fmt(sharePrice)} / {fmt(bvps)}</p>
      </div>

      {/* Interpretation table */}
      <div className="border rounded-lg overflow-hidden text-sm">
        <table className="w-full">
          <thead className="bg-muted/50">
            <tr>
              <th className="p-2 text-left font-medium text-muted-foreground">P/B Value</th>
              <th className="p-2 text-left font-medium text-muted-foreground">Meaning</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            <tr><td className="p-2 text-green-600 font-medium">&lt; 1.0</td><td className="p-2">Buying assets below their value (cheap, but check for risk)</td></tr>
            <tr><td className="p-2 text-yellow-600 font-medium">1.0 - 2.0</td><td className="p-2">Fair value — paying close to what assets are worth</td></tr>
            <tr><td className="p-2 text-red-600 font-medium">&gt; 2.0</td><td className="p-2">Premium — justified only if the company has strong ROE & growth</td></tr>
          </tbody>
        </table>
      </div>

      {/* Real bank examples */}
      <div className="border rounded-lg overflow-hidden text-sm">
        <table className="w-full">
          <thead className="bg-muted/50">
            <tr>
              <th className="p-2 text-left font-medium text-muted-foreground">Bank</th>
              <th className="p-2 text-right font-medium text-muted-foreground">P/B</th>
              <th className="p-2 text-left font-medium text-muted-foreground">Interpretation</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            <tr><td className="p-2 font-medium">HDFC Bank</td><td className="p-2 text-right">2.2</td><td className="p-2 text-muted-foreground">Stable, quality bank — premium is justified</td></tr>
            <tr><td className="p-2 font-medium">SBI</td><td className="p-2 text-right">1.4</td><td className="p-2 text-muted-foreground">Better value — higher ROE at lower price</td></tr>
            <tr><td className="p-2 font-medium">IndusInd Bank</td><td className="p-2 text-right">0.9</td><td className="p-2 text-muted-foreground">Below book value — turnaround story, risky</td></tr>
          </tbody>
        </table>
      </div>
    </div>
  )
}

// ─── 3. P/E Ratio Calculator ────────────────────────────────────────────────

function PERatioCalc() {
  const [sharePrice, setSharePrice] = useState(200)
  const [eps, setEps] = useState(20)

  const pe = eps > 0 ? sharePrice / eps : 0

  return (
    <div className="space-y-4">
      <p className="text-sm text-muted-foreground">
        P/E tells you how much you're paying for every 1 of profit. Lower P/E = cheaper relative to earnings.
      </p>

      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1">
          <Label className="text-xs">Share Price</Label>
          <Input type="number" value={sharePrice} onChange={(e) => setSharePrice(Number(e.target.value))} />
        </div>
        <div className="space-y-1">
          <Label className="text-xs">Earnings Per Share (EPS)</Label>
          <Input type="number" value={eps} onChange={(e) => setEps(Number(e.target.value))} />
        </div>
      </div>

      <div className="bg-primary/5 border border-primary/20 rounded-lg p-4">
        <p className="text-xs text-muted-foreground">P/E Ratio</p>
        <p className="text-2xl font-bold text-primary">{pe.toFixed(1)}</p>
        <p className="text-sm text-muted-foreground mt-1">
          You pay <strong>{fmt(pe)}</strong> for every 1 of profit the company earns
        </p>
      </div>

      {/* Warning about P/E for banks */}
      <div className="bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 rounded-lg p-3 text-sm text-amber-800 dark:text-amber-300">
        <strong>Why P/E is less reliable for banks:</strong>
        <ul className="list-disc ml-4 mt-1 space-y-0.5">
          <li>Banks can manipulate profits through NPA provisioning</li>
          <li>High provisions = lower reported profit (conservative, actually safer)</li>
          <li>Low provisions = higher reported profit (risky, may hide bad loans)</li>
          <li>Always check P/B first, then P/E as a secondary metric</li>
        </ul>
      </div>

      <div className="border rounded-lg overflow-hidden text-sm">
        <table className="w-full">
          <thead className="bg-muted/50">
            <tr>
              <th className="p-2 text-left font-medium text-muted-foreground">Bank</th>
              <th className="p-2 text-right font-medium text-muted-foreground">P/E</th>
              <th className="p-2 text-left font-medium text-muted-foreground">What it means</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            <tr><td className="p-2 font-medium">SBI</td><td className="p-2 text-right text-green-600">10</td><td className="p-2 text-muted-foreground">Pay 10 per 1 profit — very attractive!</td></tr>
            <tr><td className="p-2 font-medium">HDFC Bank</td><td className="p-2 text-right text-yellow-600">17</td><td className="p-2 text-muted-foreground">Moderate — premium for quality</td></tr>
            <tr><td className="p-2 font-medium">IDFC First Bank</td><td className="p-2 text-right text-red-600">36</td><td className="p-2 text-muted-foreground">Expensive — low profitability, growth story</td></tr>
          </tbody>
        </table>
      </div>
    </div>
  )
}

// ─── 4. ROE Calculator + Golden Rule ────────────────────────────────────────

function ROECalc() {
  const [netProfit, setNetProfit] = useState(50000)
  const [netWorth, setNetWorth] = useState(1000000)

  const roe = netWorth > 0 ? (netProfit / netWorth) * 100 : 0
  const roeColor = roe >= 15 ? 'text-green-600 dark:text-green-400' : roe >= 10 ? 'text-yellow-600 dark:text-yellow-400' : 'text-red-600 dark:text-red-400'
  const roeLabel = roe >= 15 ? 'Excellent' : roe >= 10 ? 'Average' : 'Poor'

  return (
    <div className="space-y-4">
      <p className="text-sm text-muted-foreground">
        ROE measures how efficiently a company uses shareholders' money to generate profit. This is the key metric that decides whether a high P/B is justified.
      </p>

      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1">
          <Label className="text-xs">Net Profit</Label>
          <Input type="number" value={netProfit} onChange={(e) => setNetProfit(Number(e.target.value))} />
        </div>
        <div className="space-y-1">
          <Label className="text-xs">Net Worth (Shareholders' Equity)</Label>
          <Input type="number" value={netWorth} onChange={(e) => setNetWorth(Number(e.target.value))} />
        </div>
      </div>

      <div className="bg-primary/5 border border-primary/20 rounded-lg p-4">
        <div className="flex items-center gap-3">
          <div>
            <p className="text-xs text-muted-foreground">Return on Equity (ROE)</p>
            <p className={cn('text-2xl font-bold', roeColor)}>{roe.toFixed(1)}%</p>
          </div>
          <Badge variant={roe >= 15 ? 'default' : roe >= 10 ? 'secondary' : 'destructive'}>{roeLabel}</Badge>
        </div>
        <p className="text-xs text-muted-foreground mt-2">= ({fmt(netProfit)} / {fmt(netWorth)}) x 100</p>
      </div>

      {/* Golden Rule */}
      <div className="bg-amber-50 dark:bg-amber-950/30 border-2 border-amber-300 dark:border-amber-700 rounded-lg p-4">
        <p className="font-bold text-amber-900 dark:text-amber-200 mb-2">The Golden Rule</p>
        <p className="text-amber-800 dark:text-amber-300 text-sm">
          Good Investment = <strong>High ROE (&gt;15%)</strong> + <strong>Reasonable P/B (&lt;2-3)</strong>
        </p>
        <p className="text-xs text-amber-700 dark:text-amber-400 mt-2">
          A high P/B is justified ONLY if the company generates high ROE. Paying 3x book value for a bank with 5% ROE is a bad deal. But paying 3x for 30% ROE? That's a bargain.
        </p>
      </div>

      {/* Side-by-side comparison */}
      <div className="border rounded-lg overflow-hidden text-sm">
        <table className="w-full">
          <thead className="bg-muted/50">
            <tr>
              <th className="p-2 text-left font-medium text-muted-foreground">Metric</th>
              <th className="p-2 text-center font-medium text-red-500">Bank A (Avoid)</th>
              <th className="p-2 text-center font-medium text-green-500">Bank B (Buy)</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            <tr><td className="p-2 font-medium">Net Worth</td><td className="p-2 text-center">10 Lakh</td><td className="p-2 text-center">10 Lakh</td></tr>
            <tr><td className="p-2 font-medium">Market Price</td><td className="p-2 text-center">10 Lakh</td><td className="p-2 text-center">30 Lakh</td></tr>
            <tr><td className="p-2 font-medium">P/B Ratio</td><td className="p-2 text-center">1.0</td><td className="p-2 text-center">3.0</td></tr>
            <tr><td className="p-2 font-medium">Profit</td><td className="p-2 text-center text-red-500">50,000</td><td className="p-2 text-center text-green-500">3,00,000</td></tr>
            <tr><td className="p-2 font-medium">ROE</td><td className="p-2 text-center text-red-500">5%</td><td className="p-2 text-center text-green-500">30%</td></tr>
          </tbody>
        </table>
        <p className="p-2 text-xs text-muted-foreground bg-muted/30">
          Bank B costs 3x more but earns 6x more profit. The premium is worth it!
        </p>
      </div>

      {/* Real bank comparison */}
      <div className="border rounded-lg overflow-hidden text-sm">
        <table className="w-full">
          <thead className="bg-muted/50">
            <tr>
              <th className="p-2 text-left font-medium text-muted-foreground">Bank</th>
              <th className="p-2 text-center font-medium text-muted-foreground">ROE</th>
              <th className="p-2 text-center font-medium text-muted-foreground">P/B</th>
              <th className="p-2 text-left font-medium text-muted-foreground">Verdict</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            <tr><td className="p-2 font-medium">SBI</td><td className="p-2 text-center text-green-600">18-21%</td><td className="p-2 text-center">1.2-1.6</td><td className="p-2 text-green-600 font-medium">Best value</td></tr>
            <tr><td className="p-2 font-medium">HDFC Bank</td><td className="p-2 text-center text-green-600">14%</td><td className="p-2 text-center">2.2</td><td className="p-2 text-muted-foreground">Stable, undervalued quality</td></tr>
            <tr><td className="p-2 font-medium">Axis Bank</td><td className="p-2 text-center text-yellow-600">13-15%</td><td className="p-2 text-center">1.8-2.2</td><td className="p-2 text-muted-foreground">Fair value, balanced</td></tr>
            <tr><td className="p-2 font-medium">Kotak Mahindra</td><td className="p-2 text-center text-yellow-600">12-13%</td><td className="p-2 text-center">2.1-2.5</td><td className="p-2 text-muted-foreground">Premium, wait for dip</td></tr>
            <tr><td className="p-2 font-medium">IDFC First</td><td className="p-2 text-center text-red-600">9%</td><td className="p-2 text-center">1.2</td><td className="p-2 text-red-600">Growing, risky</td></tr>
          </tbody>
        </table>
      </div>
    </div>
  )
}

// ─── Main Export ─────────────────────────────────────────────────────────────

export function LearnSection() {
  return (
    <div className="space-y-4">
      <CollapsibleCalculator
        title="1. Book Value"
        description="What a company is worth if it sold everything and paid off all debts"
        icon={<BookOpen className="h-5 w-5 text-primary" />}
        defaultOpen
      >
        <BookValueCalc />
      </CollapsibleCalculator>

      <CollapsibleCalculator
        title="2. Price to Book (P/B Ratio)"
        description="How much premium you pay over the company's actual book value"
        icon={<TrendingUp className="h-5 w-5 text-primary" />}
      >
        <PBRatioCalc />
      </CollapsibleCalculator>

      <CollapsibleCalculator
        title="3. Price to Earnings (P/E Ratio)"
        description="How much you pay for every 1 of profit"
        icon={<BarChart3 className="h-5 w-5 text-primary" />}
      >
        <PERatioCalc />
      </CollapsibleCalculator>

      <CollapsibleCalculator
        title="4. Return on Equity (ROE) + The Golden Rule"
        description="How efficiently a company uses shareholders' money — the most important metric"
        icon={<Target className="h-5 w-5 text-primary" />}
      >
        <ROECalc />
      </CollapsibleCalculator>
    </div>
  )
}
