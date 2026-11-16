import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Progress } from '@/components/ui/progress'
import { useBudgetVsActual } from '@/hooks/useAnalytics'
import { useAuthStore } from '@/store/authStore'
import { formatCurrency } from '@/lib/utils'
import { InfoCallout } from '@/components/ui/info-callout'

const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December']

export function BudgetAnalysisTab() {
  const now = new Date()
  const [year, setYear] = useState(now.getFullYear())
  const [month, setMonth] = useState(now.getMonth() + 1)

  const user = useAuthStore((s) => s.user)
  const currency = user?.currency ?? 'INR'

  const { data: budgets, isLoading } = useBudgetVsActual(year, month)

  const getStatusColor = (percentUsed: number) => {
    if (percentUsed >= 100) return 'text-red-600'
    if (percentUsed >= 80) return 'text-yellow-600'
    return 'text-green-600'
  }

  const getProgressColor = (percentUsed: number) => {
    if (percentUsed >= 100) return '[&>div]:bg-red-500'
    if (percentUsed >= 80) return '[&>div]:bg-yellow-500'
    return '[&>div]:bg-green-500'
  }

  const totalBudgeted = budgets?.reduce((sum, b) => sum + b.budgeted, 0) ?? 0
  const totalActual = budgets?.reduce((sum, b) => sum + b.actual, 0) ?? 0
  const overallPercent = totalBudgeted > 0 ? Math.round((totalActual / totalBudgeted) * 100) : 0

  return (
    <div className="space-y-6">
      <InfoCallout
        title="Budget vs Actual"
        description="Compare your planned budgets against actual spending. Green means on track, yellow is nearing the limit, and red means overspent."
        examples={['Groceries: 80% used', 'Entertainment: 120% overspent']}
      />

      <div className="flex gap-3 items-center">
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
            {[now.getFullYear(), now.getFullYear() - 1].map((y) => (
              <SelectItem key={y} value={String(y)}>{y}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        {budgets?.length ? (
          <div className="ml-auto text-sm">
            <span className="text-muted-foreground">Overall: </span>
            <span className={`font-medium ${getStatusColor(overallPercent)}`}>
              {formatCurrency(totalActual, currency)} / {formatCurrency(totalBudgeted, currency)} ({overallPercent}%)
            </span>
          </div>
        ) : null}
      </div>

      {isLoading ? (
        <Card>
          <CardContent className="py-12 text-center text-muted-foreground">Loading...</CardContent>
        </Card>
      ) : !budgets?.length ? (
        <Card>
          <CardContent className="py-12 text-center text-muted-foreground">
            No budgets found for {MONTHS[month - 1]} {year}. Create budgets on the Plan page to see analysis here.
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {budgets.map((budget) => (
            <Card key={budget.budgetId}>
              <CardContent className="py-4">
                <div className="flex items-center justify-between mb-2">
                  <div>
                    <span className="font-medium">{budget.name}</span>
                    {budget.categoryName && (
                      <span className="text-xs text-muted-foreground ml-2">({budget.categoryName})</span>
                    )}
                  </div>
                  <span className={`text-sm font-medium ${getStatusColor(budget.percentUsed)}`}>
                    {budget.percentUsed}%
                  </span>
                </div>
                <Progress
                  value={Math.min(budget.percentUsed, 100)}
                  className={`h-2 ${getProgressColor(budget.percentUsed)}`}
                />
                <div className="flex justify-between mt-2 text-xs text-muted-foreground">
                  <span>Spent: {formatCurrency(budget.actual, currency)}</span>
                  <span>Budget: {formatCurrency(budget.budgeted, currency)}</span>
                  <span className={budget.remaining >= 0 ? 'text-green-600' : 'text-red-600'}>
                    {budget.remaining >= 0 ? `${formatCurrency(budget.remaining, currency)} left` : `${formatCurrency(Math.abs(budget.remaining), currency)} over`}
                  </span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
