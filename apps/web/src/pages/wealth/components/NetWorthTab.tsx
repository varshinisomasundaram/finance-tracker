import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { NetWorthChart } from '@/components/charts/NetWorthChart'
import { AssetAllocationChart } from '@/components/charts/AssetAllocationChart'
import { useNetWorthCurrent, useNetWorthHistory, useTakeSnapshot } from '@/hooks/useNetWorth'
import { useAuthStore } from '@/store/authStore'
import { formatCurrency, formatDate } from '@/lib/utils'
import { cn } from '@/lib/utils'
import { TrendingUp, TrendingDown, Minus, Camera, Info } from 'lucide-react'
import { useToast } from '@/hooks/useToast'
import { Tooltip, TooltipTrigger, TooltipContent } from '@/components/ui/tooltip'
import { InfoCallout } from '@/components/ui/info-callout'

export function NetWorthTab() {
  const user = useAuthStore((s) => s.user)
  const currency = user?.currency ?? 'INR'
  const { toast } = useToast()

  const { data: current, isLoading: loadingCurrent } = useNetWorthCurrent()
  const { data: history, isLoading: loadingHistory } = useNetWorthHistory()
  const takeSnapshot = useTakeSnapshot()

  const change = history?.change

  return (
    <div className="space-y-4">
      <InfoCallout
        title="What is Net Worth?"
        description="Net Worth = Total Assets − Total Liabilities. It's your real financial health score. Take monthly snapshots to track growth."
        examples={['Assets ₹60L − Liabilities ₹37L = Net Worth ₹23L', 'Grew from ₹18L to ₹23L in 6 months (+27%)']}
      />
      {/* Summary row */}
      <div className="grid gap-4 md:grid-cols-3">
        {loadingCurrent ? (
          [1, 2, 3].map((i) => <Skeleton key={i} className="h-32" />)
        ) : (
          <>
            <Card>
              <CardHeader className="pb-2">
                <CardDescription className="flex items-center">
                  Net Worth
                  <Tooltip><TooltipTrigger asChild><Info className="h-4 w-4 cursor-help inline-block ml-1.5" /></TooltipTrigger><TooltipContent className="max-w-xs text-xs">Net Worth = Total Assets − Total Liabilities. Snapshots track your wealth growth over time.</TooltipContent></Tooltip>
                </CardDescription>
                <CardTitle className={cn('text-3xl', (current?.netWorth ?? 0) >= 0 ? '' : 'text-expense')}>
                  {formatCurrency(current?.netWorth ?? 0, currency)}
                </CardTitle>
              </CardHeader>
              <CardContent>
                {change && (
                  <div className="flex items-center gap-1 text-sm">
                    {change.direction === 'up' && <TrendingUp className="h-4 w-4 text-income" />}
                    {change.direction === 'down' && <TrendingDown className="h-4 w-4 text-expense" />}
                    {change.direction === 'flat' && <Minus className="h-4 w-4 text-muted-foreground" />}
                    <span className={cn(
                      change.direction === 'up' && 'text-income',
                      change.direction === 'down' && 'text-expense',
                      change.direction === 'flat' && 'text-muted-foreground',
                    )}>
                      {change.direction === 'up' ? '+' : ''}{formatCurrency(change.amount, currency)} ({change.percent}%)
                    </span>
                  </div>
                )}
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardDescription>Total Assets</CardDescription>
                <CardTitle className="text-3xl">{formatCurrency(current?.totalAssets ?? 0, currency)}</CardTitle>
              </CardHeader>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardDescription>Total Liabilities</CardDescription>
                <CardTitle className="text-3xl text-expense">
                  {formatCurrency(current?.totalLiabilities ?? 0, currency)}
                </CardTitle>
              </CardHeader>
            </Card>
          </>
        )}
      </div>

      {/* Snapshot button */}
      <div className="flex justify-end">
        <Button
          variant="outline"
          onClick={() => takeSnapshot.mutate(undefined, {
            onSuccess: () => toast({ title: 'Snapshot saved' }),
          })}
          disabled={takeSnapshot.isPending}
        >
          <Camera className="h-4 w-4 mr-2" />
          Save Snapshot
        </Button>
      </div>

      {/* Charts */}
      <div className="grid gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Net Worth History</CardTitle>
            <CardDescription>Trend across saved snapshots</CardDescription>
          </CardHeader>
          <CardContent>
            {loadingHistory ? (
              <Skeleton className="h-64" />
            ) : history && history.snapshots.length > 1 ? (
              <NetWorthChart snapshots={history.snapshots} currency={currency} />
            ) : (
              <div className="flex h-64 flex-col items-center justify-center gap-3 text-muted-foreground text-sm">
                <p>Not enough data yet. Click "Save Snapshot" to record your current net worth.</p>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Asset Allocation</CardTitle>
          </CardHeader>
          <CardContent>
            {current && current.assetsByType.length > 0 ? (
              <AssetAllocationChart data={current.assetsByType} currency={currency} />
            ) : (
              <div className="flex h-64 items-center justify-center text-muted-foreground text-sm">
                No assets yet
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Snapshot history table */}
      {history && history.snapshots.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Snapshot History</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <table className="w-full">
              <thead>
                <tr className="border-b text-xs text-muted-foreground">
                  <th className="px-6 py-3 text-left font-medium">Date</th>
                  <th className="px-6 py-3 text-right font-medium">Assets</th>
                  <th className="px-6 py-3 text-right font-medium">Liabilities</th>
                  <th className="px-6 py-3 text-right font-medium">Net Worth</th>
                </tr>
              </thead>
              <tbody>
                {[...history.snapshots].reverse().map((s) => (
                  <tr key={s.id} className="border-b last:border-0 hover:bg-muted/30">
                    <td className="px-6 py-3 text-sm">{formatDate(s.snapshotDate, 'long')}</td>
                    <td className="px-6 py-3 text-right text-sm">{formatCurrency(s.totalAssets, currency)}</td>
                    <td className="px-6 py-3 text-right text-sm text-expense">{formatCurrency(s.totalLiabilities, currency)}</td>
                    <td className="px-6 py-3 text-right text-sm font-semibold">{formatCurrency(s.netWorth, currency)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
