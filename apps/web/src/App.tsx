import { Routes, Route, Navigate } from 'react-router-dom'
import { useAuthStore } from '@/store/authStore'
import { AppLayout } from '@/components/layout/AppLayout'
import { LoginPage } from '@/pages/auth/LoginPage'
import { RegisterPage } from '@/pages/auth/RegisterPage'
import { OverviewPage } from '@/pages/overview/OverviewPage'
import { WealthPage } from '@/pages/wealth/WealthPage'
import { IncomePage } from '@/pages/money/IncomePage'
import { ExpensePage } from '@/pages/money/ExpensePage'
import { AccountsPage } from '@/pages/money/AccountsPage'
import { PlanPage } from '@/pages/plan/PlanPage'
import { AnalyticsPage } from '@/pages/analytics/AnalyticsPage'
import { SettingsPage } from '@/pages/settings/SettingsPage'
import { LandingPage } from '@/pages/landing/LandingPage'
import { AboutPage } from '@/pages/landing/AboutPage'
import { ContactPage } from '@/pages/landing/ContactPage'
import { SupportPage, PrivacyPolicyPage, TermsPage, RefundPolicyPage } from '@/pages/legal/LegalPages'
import { Toaster } from '@/components/ui/toaster'

function PrivateRoute({ children }: { children: React.ReactNode }) {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated)
  return isAuthenticated ? <>{children}</> : <Navigate to="/login" replace />
}

function PublicRoute({ children }: { children: React.ReactNode }) {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated)
  return isAuthenticated ? <Navigate to="/overview" replace /> : <>{children}</>
}

export default function App() {
  return (
    <>
      <Routes>
        {/* Landing — root shows landing for guests, redirects to /overview for authenticated */}
        <Route path="/" element={<PublicRoute><LandingPage /></PublicRoute>} />

        {/* Auth */}
        <Route path="/login" element={<PublicRoute><LoginPage /></PublicRoute>} />
        <Route path="/register" element={<PublicRoute><RegisterPage /></PublicRoute>} />

        {/* About & Contact — open to everyone */}
        <Route path="/about" element={<AboutPage />} />
        <Route path="/contact" element={<ContactPage />} />

        {/* Legal — accessible to everyone, no auth required */}
        <Route path="/support" element={<SupportPage />} />
        <Route path="/privacy-policy" element={<PrivacyPolicyPage />} />
        <Route path="/terms" element={<TermsPage />} />
        <Route path="/refund-policy" element={<RefundPolicyPage />} />

        {/* Private — wrapped in AppLayout */}
        <Route path="/" element={<PrivateRoute><AppLayout /></PrivateRoute>}>
          <Route path="overview" element={<OverviewPage />} />
          <Route path="wealth/*" element={<WealthPage />} />
          <Route path="money/income" element={<IncomePage />} />
          <Route path="money/expenses" element={<ExpensePage />} />
          <Route path="money/accounts" element={<AccountsPage />} />
          <Route path="money" element={<Navigate to="/money/income" replace />} />
          <Route path="plan/*" element={<PlanPage />} />
          <Route path="analytics/*" element={<AnalyticsPage />} />
          <Route path="settings" element={<SettingsPage />} />
        </Route>

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
      <Toaster />
    </>
  )
}
