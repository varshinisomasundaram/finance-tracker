import {
  ResponsiveContainer, BarChart, Bar, XAxis, YAxis,
  CartesianGrid, Tooltip, Legend,
} from 'recharts'
import { formatCurrency } from '@/lib/utils'

interface MonthData {
  month: string
  income: number
  expense: number
}

interface Props {
  data: MonthData[]
  currency?: string
}

export function IncomeExpenseChart({ data, currency = 'INR' }: Props) {
  return (
    <ResponsiveContainer width="100%" height={280}>
      <BarChart data={data} margin={{ top: 5, right: 10, left: 10, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
        <XAxis
          dataKey="month"
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
          formatter={(value: number, name: string) => [
            formatCurrency(value, currency),
            name.charAt(0).toUpperCase() + name.slice(1),
          ]}
        />
        <Legend wrapperStyle={{ fontSize: '13px' }} />
        <Bar dataKey="income" fill="#22c55e" radius={[4, 4, 0, 0]} name="income" />
        <Bar dataKey="expense" fill="#ef4444" radius={[4, 4, 0, 0]} name="expense" />
      </BarChart>
    </ResponsiveContainer>
  )
}
