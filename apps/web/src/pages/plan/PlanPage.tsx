import { Routes, Route, Navigate } from 'react-router-dom'
import { useNavigate, useLocation } from 'react-router-dom'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { GoalsTab } from './components/GoalsTab'
import { BudgetsTab } from './components/BudgetsTab'

export function PlanPage() {
  const navigate = useNavigate()
  const { pathname } = useLocation()

  const activeTab = pathname.includes('budget') ? 'budget' : 'goals'

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Plan</h1>
        <p className="text-sm text-muted-foreground">
          Set financial goals and manage your monthly budgets
        </p>
      </div>

      <Tabs value={activeTab} onValueChange={(v) => navigate(`/plan/${v}`)}>
        <TabsList>
          <TabsTrigger value="goals">Goals</TabsTrigger>
          <TabsTrigger value="budget">Budget</TabsTrigger>
        </TabsList>
      </Tabs>

      <Routes>
        <Route index element={<Navigate to="goals" replace />} />
        <Route path="goals" element={<GoalsTab />} />
        <Route path="budget" element={<BudgetsTab />} />
      </Routes>
    </div>
  )
}
