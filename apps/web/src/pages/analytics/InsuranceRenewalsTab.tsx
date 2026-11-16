import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { useInsuranceRenewals } from '@/hooks/useAnalytics'
import { useAuthStore } from '@/store/authStore'
import { formatCurrency } from '@/lib/utils'
import { InfoCallout } from '@/components/ui/info-callout'
import { AlertTriangle, Calendar, Shield } from 'lucide-react'

const INSURANCE_TYPE_LABELS: Record<string, string> = {
  TERM_LIFE: 'Term Life',
  HEALTH: 'Health',
  VEHICLE_TWO_WHEELER: 'Two Wheeler',
  VEHICLE_FOUR_WHEELER: 'Four Wheeler',
  ENDOWMENT: 'Endowment',
  ULIP: 'ULIP',
  HOME: 'Home',
  OTHER: 'Other',
}

export function InsuranceRenewalsTab() {
  const [days, setDays] = useState(90)

  const user = useAuthStore((s) => s.user)
  const currency = user?.currency ?? 'INR'

  const { data: renewals, isLoading } = useInsuranceRenewals(days)

  const getUrgencyColor = (daysUntil: number) => {
    if (daysUntil <= 7) return 'border-red-200 bg-red-50/50 dark:border-red-900 dark:bg-red-950/30'
    if (daysUntil <= 30) return 'border-yellow-200 bg-yellow-50/50 dark:border-yellow-900 dark:bg-yellow-950/30'
    return 'border-green-200 bg-green-50/50 dark:border-green-900 dark:bg-green-950/30'
  }

  const getUrgencyBadge = (daysUntil: number) => {
    if (daysUntil <= 7) return { text: 'Urgent', className: 'bg-red-100 text-red-700 dark:bg-red-900/50 dark:text-red-300' }
    if (daysUntil <= 30) return { text: 'Soon', className: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/50 dark:text-yellow-300' }
    return { text: 'Upcoming', className: 'bg-green-100 text-green-700 dark:bg-green-900/50 dark:text-green-300' }
  }

  const totalPremium = renewals?.reduce((sum, r) => sum + r.premiumAmount, 0) ?? 0

  return (
    <div className="space-y-6">
      <InfoCallout
        title="Insurance Renewal Calendar"
        description="Keep track of upcoming insurance renewals so you never miss a payment. Policies are color-coded by urgency."
        examples={['Health policy due in 5 days', 'Car insurance expires next month']}
      />

      <div className="flex gap-3 items-center">
        <span className="text-sm text-muted-foreground">Show next:</span>
        <Select value={String(days)} onValueChange={(v) => setDays(Number(v))}>
          <SelectTrigger className="w-[120px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="30">30 Days</SelectItem>
            <SelectItem value="60">60 Days</SelectItem>
            <SelectItem value="90">90 Days</SelectItem>
            <SelectItem value="180">6 Months</SelectItem>
            <SelectItem value="365">1 Year</SelectItem>
          </SelectContent>
        </Select>
        {renewals?.length ? (
          <div className="ml-auto text-sm">
            <span className="text-muted-foreground">{renewals.length} renewal(s) due — </span>
            <span className="font-medium">{formatCurrency(totalPremium, currency)} total</span>
          </div>
        ) : null}
      </div>

      {isLoading ? (
        <Card>
          <CardContent className="py-12 text-center text-muted-foreground">Loading...</CardContent>
        </Card>
      ) : !renewals?.length ? (
        <Card>
          <CardContent className="py-12 text-center text-muted-foreground">
            <Shield className="h-8 w-8 mx-auto mb-2 text-muted-foreground/50" />
            No insurance renewals due in the next {days} days.
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {renewals.map((renewal) => {
            const badge = getUrgencyBadge(renewal.daysUntilRenewal)
            return (
              <Card key={renewal.id} className={getUrgencyColor(renewal.daysUntilRenewal)}>
                <CardContent className="py-4">
                  <div className="flex items-start justify-between">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-medium">{renewal.name}</span>
                        <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${badge.className}`}>
                          {badge.text}
                        </span>
                      </div>
                      <div className="flex items-center gap-3 text-sm text-muted-foreground">
                        <span>{INSURANCE_TYPE_LABELS[renewal.type] ?? renewal.type}</span>
                        <span>·</span>
                        <span>{renewal.provider}</span>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-medium">{formatCurrency(renewal.premiumAmount, currency)}</p>
                      <p className="text-xs text-muted-foreground">{renewal.premiumFrequency.toLowerCase().replace('_', ' ')}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-1.5 mt-3 text-sm">
                    {renewal.daysUntilRenewal <= 7 ? (
                      <AlertTriangle className="h-3.5 w-3.5 text-red-500" />
                    ) : (
                      <Calendar className="h-3.5 w-3.5 text-muted-foreground" />
                    )}
                    <span className={renewal.daysUntilRenewal <= 7 ? 'text-red-600 font-medium' : 'text-muted-foreground'}>
                      Due {new Date(renewal.renewalDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                      {' '}({renewal.daysUntilRenewal} day{renewal.daysUntilRenewal !== 1 ? 's' : ''} away)
                    </span>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}
    </div>
  )
}
