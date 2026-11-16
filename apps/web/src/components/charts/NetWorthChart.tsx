import {
  ResponsiveContainer, AreaChart, Area,
  XAxis, YAxis, CartesianGrid, Tooltip,
} from 'recharts'
import { formatCurrency, formatDate } from '@/lib/utils'
import type { NetWorthSnapshot } from '@/types'

interface Props {
  snapshots: NetWorthSnapshot[]
  currency?: string
}

export function NetWorthChart({ snapshots, currency = 'INR' }: Props) {
  const data = snapshots.map((s) => ({
    date: formatDate(s.snapshotDate, 'month'),
    netWorth: s.netWorth,
    assets: s.totalAssets,
    liabilities: s.totalLiabilities,
  }))

  return (
    <ResponsiveContainer width="100%" height={280}>
      <AreaChart data={data} margin={{ top: 5, right: 10, left: 10, bottom: 0 }}>
        <defs>
          <linearGradient id="netWorthGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
            <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
        <XAxis
          dataKey="date"
          tick={{ fontSize: 12, fill: 'hsl(var(--muted-foreground))' }}
          axisLine={false}
          tickLine={false}
        />
        <YAxis
          tick={{ fontSize: 12, fill: 'hsl(var(--muted-foreground))' }}
          axisLine={false}
          tickLine={false}
          tickFormatter={(v) => formatCurrency(v, currency)}
        />
        <Tooltip
          contentStyle={{
            backgroundColor: 'hsl(var(--card))',
            border: '1px solid hsl(var(--border))',
            borderRadius: '8px',
            fontSize: '13px',
          }}
          formatter={(value: number) => [formatCurrency(value, currency), 'Net Worth']}
        />
        <Area
          type="monotone"
          dataKey="netWorth"
          stroke="#3b82f6"
          strokeWidth={2}
          fill="url(#netWorthGrad)"
        />
      </AreaChart>
    </ResponsiveContainer>
  )
}
