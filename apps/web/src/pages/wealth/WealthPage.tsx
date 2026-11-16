import { Routes, Route, Navigate } from 'react-router-dom'
import { useNavigate, useLocation } from 'react-router-dom'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { AssetsTab } from './components/AssetsTab'
import { LiabilitiesTab } from './components/LiabilitiesTab'
import { NetWorthTab } from './components/NetWorthTab'
import { InsuranceTab } from './components/InsuranceTab'
import { InvestmentsTab } from './components/InvestmentsTab'

export function WealthPage() {
  const navigate = useNavigate()
  const { pathname } = useLocation()

  const activeTab = pathname.includes('liabilities')
    ? 'liabilities'
    : pathname.includes('networth')
      ? 'networth'
      : pathname.includes('insurance')
        ? 'insurance'
        : pathname.includes('investments')
          ? 'investments'
          : 'assets'

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Wealth</h1>
        <p className="text-sm text-muted-foreground">
          Track your assets, debts, insurance, investments, and overall net worth
        </p>
      </div>

      <Tabs value={activeTab} onValueChange={(v) => navigate(`/wealth/${v}`)}>
        <TabsList className="overflow-x-auto">
          <TabsTrigger value="assets">Assets</TabsTrigger>
          <TabsTrigger value="liabilities">Liabilities</TabsTrigger>
          <TabsTrigger value="insurance">Insurance</TabsTrigger>
          <TabsTrigger value="investments">Investments</TabsTrigger>
          <TabsTrigger value="networth">Net Worth</TabsTrigger>
        </TabsList>
      </Tabs>

      <Routes>
        <Route index element={<Navigate to="assets" replace />} />
        <Route path="assets" element={<AssetsTab />} />
        <Route path="liabilities" element={<LiabilitiesTab />} />
        <Route path="insurance" element={<InsuranceTab />} />
        <Route path="investments" element={<InvestmentsTab />} />
        <Route path="networth" element={<NetWorthTab />} />
      </Routes>
    </div>
  )
}
