import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { useIncomeVsExpense, useSpendingTrends } from '@/hooks/useAnalytics'
import { useAuthStore } from '@/store/authStore'
import { formatCurrency } from '@/lib/utils'
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  AreaChart,
  Area,
  LineChart,
  Line,
} from 'recharts'
import { InfoCallout } from '@/components/ui/info-callout'

const MONTHS_SHORT = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']

export function TrendsTab() {
  const [period, setPeriod] = useState(6)

  const user = useAuthStore((s) => s.user)
  const currency = user?.currency ?? 'INR'

  const { data: incomeExpense, isLoading: loadingIE } = useIncomeVsExpense(period)
  const { data: spendingTrends, isLoading: loadingST } = useSpendingTrends(period)

  const chartData = incomeExpense?.map((d) => ({
    ...d,
    label: `${MONTHS_SHORT[d.month - 1]} ${d.year}`,
  })) ?? []

  const trendData = spendingTrends?.map((d) => ({
    ...d,
    label: `${MONTHS_SHORT[d.month - 1]} ${d.year}`,
  })) ?? []

  const avgSavingsRate = incomeExpense?.length
    ? Math.round(incomeExpense.reduce((sum, d) => sum + d.savingsRate, 0) / incomeExpense.length * 100) / 100
    : 0

  return (
    <div className="space-y-6">
      <InfoCallout
        title="Income vs Expense Trends"
        description="Track how your income and spending change over time. A positive savings rate means you're spending less than you earn."
        examples={['Monthly comparison', 'Savings rate %', 'Daily average spend']}
      />

      <div className="flex gap-3 items-center">
        <span className="text-sm text-muted-foreground">Period:</span>
        <Select value={String(period)} onValueChange={(v) => setPeriod(Number(v))}>
          <SelectTrigger className="w-[120px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="3">3 Months</SelectItem>
            <SelectItem value="6">6 Months</SelectItem>
            <SelectItem value="12">12 Months</SelectItem>
          </SelectContent>
        </Select>
        {avgSavingsRate !== 0 && (
          <span className={`text-sm font-medium ml-auto ${avgSavingsRate >= 0 ? 'text-green-600' : 'text-red-600'}`}>
            Avg Savings Rate: {avgSavingsRate}%
          </span>
        )}
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Income vs Expense</CardTitle>
          <p className="text-sm text-muted-foreground">Monthly comparison over {period} months</p>
        </CardHeader>
        <CardContent>
          {loadingIE ? (
            <div className="h-[300px] flex items-center justify-center text-muted-foreground">Loading...</div>
          ) : !chartData.length ? (
            <div className="h-[300px] flex items-center justify-center text-muted-foreground">No data available</div>
          ) : (
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="label" />
                <YAxis tickFormatter={(v) => `${(v / 1000).toFixed(0)}k`} />
                <Tooltip formatter={(value: number) => formatCurrency(value, currency)} />
                <Legend />
                <Bar dataKey="income" name="Income" fill="#16a34a" radius={[4, 4, 0, 0]} />
                <Bar dataKey="expense" name="Expense" fill="#dc2626" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </CardContent>
      </Card>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Savings Rate</CardTitle>
            <p className="text-sm text-muted-foreground">% of income saved each month</p>
          </CardHeader>
          <CardContent>
            {loadingIE ? (
              <div className="h-[250px] flex items-center justify-center text-muted-foreground">Loading...</div>
            ) : !chartData.length ? (
              <div className="h-[250px] flex items-center justify-center text-muted-foreground">No data</div>
            ) : (
              <ResponsiveContainer width="100%" height={250}>
                <AreaChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="label" />
                  <YAxis unit="%" />
                  <Tooltip formatter={(value: number) => `${value}%`} />
                  <Area
                    type="monotone"
                    dataKey="savingsRate"
                    name="Savings Rate"
                    stroke="#16a34a"
                    fill="#16a34a"
                    fillOpacity={0.1}
                  />
                </AreaChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Daily Average Spend</CardTitle>
            <p className="text-sm text-muted-foreground">Average expense per day each month</p>
          </CardHeader>
          <CardContent>
            {loadingST ? (
              <div className="h-[250px] flex items-center justify-center text-muted-foreground">Loading...</div>
            ) : !trendData.length ? (
              <div className="h-[250px] flex items-center justify-center text-muted-foreground">No data</div>
            ) : (
              <ResponsiveContainer width="100%" height={250}>
                <LineChart data={trendData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="label" />
                  <YAxis tickFormatter={(v) => formatCurrency(v, currency)} />
                  <Tooltip formatter={(value: number) => formatCurrency(value, currency)} />
                  <Line
                    type="monotone"
                    dataKey="avgPerDay"
                    name="Avg/Day"
                    stroke="#6366f1"
                    strokeWidth={2}
                    dot={{ r: 4 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
