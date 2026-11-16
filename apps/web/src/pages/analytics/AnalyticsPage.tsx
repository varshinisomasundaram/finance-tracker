import { Routes, Route, Navigate } from 'react-router-dom'
import { useNavigate, useLocation } from 'react-router-dom'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { SpendingTab } from './SpendingTab'
import { TrendsTab } from './TrendsTab'
import { BudgetAnalysisTab } from './BudgetAnalysisTab'
import { InsuranceRenewalsTab } from './InsuranceRenewalsTab'

export function AnalyticsPage() {
  const navigate = useNavigate()
  const { pathname } = useLocation()

  const activeTab = pathname.includes('trends')
    ? 'trends'
    : pathname.includes('budgets')
      ? 'budgets'
      : pathname.includes('renewals')
        ? 'renewals'
        : 'spending'

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Analytics</h1>
        <p className="text-sm text-muted-foreground">
          Insights into your spending patterns, trends, and financial health
        </p>
      </div>

      <Tabs value={activeTab} onValueChange={(v) => navigate(`/analytics/${v}`)}>
        <TabsList className="overflow-x-auto">
          <TabsTrigger value="spending">Spending</TabsTrigger>
          <TabsTrigger value="trends">Trends</TabsTrigger>
          <TabsTrigger value="budgets">Budget Analysis</TabsTrigger>
          <TabsTrigger value="renewals">Renewals</TabsTrigger>
        </TabsList>
      </Tabs>

      <Routes>
        <Route index element={<Navigate to="spending" replace />} />
        <Route path="spending" element={<SpendingTab />} />
        <Route path="trends" element={<TrendsTab />} />
        <Route path="budgets" element={<BudgetAnalysisTab />} />
        <Route path="renewals" element={<InsuranceRenewalsTab />} />
      </Routes>
    </div>
  )
}
