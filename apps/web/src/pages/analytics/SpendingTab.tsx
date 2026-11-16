import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { useSpendingByCategory, useTopExpenses } from '@/hooks/useAnalytics'
import { useAuthStore } from '@/store/authStore'
import { formatCurrency } from '@/lib/utils'
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip, BarChart, Bar, XAxis, YAxis, CartesianGrid } from 'recharts'
import { InfoCallout } from '@/components/ui/info-callout'

const COLORS = ['#2563eb', '#dc2626', '#16a34a', '#d97706', '#7c3aed', '#0891b2', '#be185d', '#65a30d', '#0d9488', '#6366f1']

const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December']

export function SpendingTab() {
  const now = new Date()
  const [year, setYear] = useState(now.getFullYear())
  const [month, setMonth] = useState(now.getMonth() + 1)

  const user = useAuthStore((s) => s.user)
  const currency = user?.currency ?? 'INR'

  const { data: spending, isLoading: loadingSpending } = useSpendingByCategory(year, month)
  const { data: topExpenses, isLoading: loadingTop } = useTopExpenses(year, month, 10)

  const totalSpent = spending?.reduce((sum, s) => sum + s.total, 0) ?? 0

  return (
    <div className="space-y-6">
      <InfoCallout
        title="Category Spending Breakdown"
        description="See where your money goes each month, broken down by expense category."
        examples={['Food & Dining', 'Transportation', 'Utilities', 'Entertainment']}
      />

      <div className="flex gap-3">
        <Select value={String(month)} onValueChange={(v) => setMonth(Number(v))}>
          <SelectTrigger className="w-[140px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {MONTHS.map((m, i) => (
              <SelectItem key={i + 1} value={String(i + 1)}>{m}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={String(year)} onValueChange={(v) => setYear(Number(v))}>
          <SelectTrigger className="w-[100px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {[now.getFullYear(), now.getFullYear() - 1, now.getFullYear() - 2].map((y) => (
              <SelectItem key={y} value={String(y)}>{y}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">By Category</CardTitle>
            <p className="text-sm text-muted-foreground">
              Total: {formatCurrency(totalSpent, currency)}
            </p>
          </CardHeader>
          <CardContent>
            {loadingSpending ? (
              <div className="h-[300px] flex items-center justify-center text-muted-foreground">Loading...</div>
            ) : !spending?.length ? (
              <div className="h-[300px] flex items-center justify-center text-muted-foreground">No expense data for this month</div>
            ) : (
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={spending}
                    dataKey="total"
                    nameKey="categoryName"
                    cx="50%"
                    cy="50%"
                    outerRadius={100}
                    innerRadius={50}
                    label={({ categoryName, percentage }) => `${categoryName} (${percentage}%)`}
                    labelLine={false}
                  >
                    {spending.map((_, i) => (
                      <Cell key={i} fill={spending[i].color || COLORS[i % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value: number) => formatCurrency(value, currency)} />
                </PieChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Category Details</CardTitle>
          </CardHeader>
          <CardContent>
            {loadingSpending ? (
              <div className="h-[300px] flex items-center justify-center text-muted-foreground">Loading...</div>
            ) : !spending?.length ? (
              <div className="h-[300px] flex items-center justify-center text-muted-foreground">No data</div>
            ) : (
              <div className="space-y-3 max-h-[300px] overflow-y-auto">
                {spending.map((item, i) => (
                  <div key={item.categoryId ?? i} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="h-3 w-3 rounded-full" style={{ backgroundColor: item.color || COLORS[i % COLORS.length] }} />
                      <span className="text-sm">{item.categoryName}</span>
                    </div>
                    <div className="text-right">
                      <span className="text-sm font-medium">{formatCurrency(item.total, currency)}</span>
                      <span className="text-xs text-muted-foreground ml-2">({item.percentage}%)</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Top Expenses</CardTitle>
          <p className="text-sm text-muted-foreground">Highest spending items this month</p>
        </CardHeader>
        <CardContent>
          {loadingTop ? (
            <div className="h-[280px] flex items-center justify-center text-muted-foreground">Loading...</div>
          ) : !topExpenses?.length ? (
            <div className="h-[280px] flex items-center justify-center text-muted-foreground">No expense data</div>
          ) : (
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={topExpenses} layout="vertical" margin={{ left: 100, right: 20 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis type="number" tickFormatter={(v) => formatCurrency(v, currency)} />
                <YAxis type="category" dataKey="description" width={90} tick={{ fontSize: 12 }} />
                <Tooltip formatter={(value: number) => formatCurrency(value, currency)} />
                <Bar dataKey="total" fill="#6366f1" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
