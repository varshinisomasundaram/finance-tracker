import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip, Legend } from 'recharts'
import { formatCurrency } from '@/lib/utils'

const COLORS = ['#3b82f6', '#22c55e', '#f59e0b', '#8b5cf6', '#ec4899', '#06b6d4', '#10b981', '#64748b']

interface Props {
  data: Array<{ type: string; total: number }>
  currency?: string
}

export function AssetAllocationChart({ data, currency = 'INR' }: Props) {
  const formatted = data.map((d, i) => ({
    name: d.type.replace(/_/g, ' '),
    value: d.total,
    color: COLORS[i % COLORS.length],
  }))

  return (
    <ResponsiveContainer width="100%" height={280}>
      <PieChart>
        <Pie
          data={formatted}
          cx="50%"
          cy="50%"
          innerRadius={70}
          outerRadius={110}
          paddingAngle={3}
          dataKey="value"
        >
          {formatted.map((entry, index) => (
            <Cell key={entry.name} fill={entry.color} />
          ))}
        </Pie>
        <Tooltip
          contentStyle={{
            backgroundColor: 'hsl(var(--card))',
            border: '1px solid hsl(var(--border))',
            borderRadius: '8px',
            fontSize: '13px',
          }}
          formatter={(value: number) => [formatCurrency(value, currency)]}
        />
        <Legend
          wrapperStyle={{ fontSize: '12px' }}
          formatter={(value) => value}
        />
      </PieChart>
    </ResponsiveContainer>
  )
}
