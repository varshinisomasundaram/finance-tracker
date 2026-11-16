import { useState, useMemo, useRef, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { TrendingUp, TrendingDown, Minus, ArrowUpRight, ArrowDownRight, Wallet, Plus, ChevronLeft, ChevronRight } from 'lucide-react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { NetWorthChart } from '@/components/charts/NetWorthChart'
import { AssetAllocationChart } from '@/components/charts/AssetAllocationChart'
import { useNetWorthCurrent, useNetWorthHistory } from '@/hooks/useNetWorth'
import { useRecentTransactions, useMonthlySummary, useCreateTransaction } from '@/hooks/useTransactions'
import { useAuthStore } from '@/store/authStore'
import { useExchangeRates } from '@/hooks/useExchangeRates'
import { useQuery } from '@tanstack/react-query'
import { categoriesService } from '@/services/categories.service'
import { formatCurrency, formatDate, classifyAmount } from '@/lib/utils'
import { cn } from '@/lib/utils'
import { useToast } from '@/hooks/useToast'

const txSchema = z.object({
  type: z.enum(['INCOME', 'EXPENSE', 'TRANSFER']),
  amount: z.coerce.number().positive('Amount must be positive'),
  date: z.string().min(1, 'Date is required'),
  description: z.string().min(1, 'Description is required').max(200),
  categoryId: z.string().optional(),
  notes: z.string().optional(),
})
type TxFormValues = z.infer<typeof txSchema>

const MONTHS_SHORT = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']

function MonthYearPicker({
  year, month, onChange,
}: {
  year: number
  month: number
  onChange: (year: number, month: number) => void
}) {
  const [open, setOpen] = useState(false)
  const [pickerYear, setPickerYear] = useState(year)
  const containerRef = useRef<HTMLDivElement>(null)
  const today = new Date()

  // Sync picker year when external year changes
  useEffect(() => { setPickerYear(year) }, [year])

  // Close on outside click
  useEffect(() => {
    if (!open) return
    function onDown(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', onDown)
    return () => document.removeEventListener('mousedown', onDown)
  }, [open])

  const label = new Date(year, month - 1, 1).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })

  return (
    <div ref={containerRef} className="relative">
      <button
        onClick={() => setOpen((o) => !o)}
        className="min-w-[120px] text-center text-sm font-medium hover:text-primary transition-colors focus:outline-none"
      >
        {label}
      </button>

      {open && (
        <div className="absolute top-[calc(100%+6px)] left-1/2 -translate-x-1/2 z-50 w-56 rounded-xl border bg-popover p-3 shadow-lg">
          {/* Year navigation */}
          <div className="flex items-center justify-between mb-3">
            <button
              onClick={() => setPickerYear((y) => y - 1)}
              className="rounded p-1 hover:bg-muted transition-colors"
            >
              <ChevronLeft className="h-3.5 w-3.5" />
            </button>
            <span className="text-sm font-semibold">{pickerYear}</span>
            <button
              onClick={() => setPickerYear((y) => y + 1)}
              disabled={pickerYear >= today.getFullYear()}
              className="rounded p-1 hover:bg-muted transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
            >
              <ChevronRight className="h-3.5 w-3.5" />
            </button>
          </div>

          {/* Month grid */}
          <div className="grid grid-cols-3 gap-1">
            {MONTHS_SHORT.map((m, i) => {
              const iSelected = pickerYear === year && i + 1 === month
              const isCurrentMonth = pickerYear === today.getFullYear() && i + 1 === today.getMonth() + 1
              const isFuture =
                pickerYear > today.getFullYear() ||
                (pickerYear === today.getFullYear() && i + 1 > today.getMonth() + 1)
              return (
                <button
                  key={m}
                  disabled={isFuture}
                  onClick={() => { onChange(pickerYear, i + 1); setOpen(false) }}
                  className={cn(
                    'relative rounded-md py-1.5 text-xs font-medium transition-colors',
                    iSelected
                      ? 'bg-primary text-primary-foreground'
                      : 'hover:bg-muted text-foreground',
                    isFuture && 'opacity-30 cursor-not-allowed',
                  )}
                >
                  {m}
                  {isCurrentMonth && !iSelected && (
                    <span className="absolute bottom-0.5 left-1/2 -translate-x-1/2 h-1 w-1 rounded-full bg-primary" />
                  )}
                </button>
              )
            })}
          </div>

          {/* Jump to today */}
          {!(year === today.getFullYear() && month === today.getMonth() + 1) && (
            <button
              onClick={() => { onChange(today.getFullYear(), today.getMonth() + 1); setOpen(false) }}
              className="mt-2 w-full rounded-md py-1.5 text-xs font-medium text-primary hover:bg-primary/10 transition-colors"
            >
              ↩ Back to {today.toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}
            </button>
          )}
        </div>
      )}
    </div>
  )
}

function StatCard({
  title, value, subtitle, trend, currency,
}: {
  title: string
  value: number
  subtitle: string
  trend?: { amount: number; percent: number; direction: 'up' | 'down' | 'flat' }
  currency: string
}) {
  return (
    <Card>
      <CardHeader className="pb-2">
        <CardDescription>{title}</CardDescription>
        <CardTitle className="text-3xl font-bold">{formatCurrency(value, currency)}</CardTitle>
      </CardHeader>
      <CardContent>
        {trend ? (
          <div className="flex items-center gap-1 text-sm">
            {trend.direction === 'up' && <TrendingUp className="h-4 w-4 text-income" />}
            {trend.direction === 'down' && <TrendingDown className="h-4 w-4 text-expense" />}
            {trend.direction === 'flat' && <Minus className="h-4 w-4 text-muted-foreground" />}
            <span className={cn(
              trend.direction === 'up' && 'text-income',
              trend.direction === 'down' && 'text-expense',
              trend.direction === 'flat' && 'text-muted-foreground',
            )}>
              {trend.direction !== 'flat' && (trend.direction === 'up' ? '+' : '')}
              {formatCurrency(trend.amount, currency)} ({trend.percent > 0 ? '+' : ''}{trend.percent.toFixed(1)}%)
            </span>
            <span className="text-muted-foreground">vs last snapshot</span>
          </div>
        ) : (
          <p className="text-sm text-muted-foreground">{subtitle}</p>
        )}
      </CardContent>
    </Card>
  )
}

export function OverviewPage() {
  const user = useAuthStore((s) => s.user)
  const currency = user?.currency ?? 'INR'
  const now = new Date()
  const { toast } = useToast()

  // Global month/year filter
  const [selectedYear, setSelectedYear] = useState(now.getFullYear())
  const [selectedMonth, setSelectedMonth] = useState(now.getMonth() + 1)

  function prevMonth() {
    if (selectedMonth === 1) { setSelectedMonth(12); setSelectedYear((y) => y - 1) }
    else setSelectedMonth((m) => m - 1)
  }
  function nextMonth() {
    if (selectedMonth === 12) { setSelectedMonth(1); setSelectedYear((y) => y + 1) }
    else setSelectedMonth((m) => m + 1)
  }
  const selectedMonthLabel = new Date(selectedYear, selectedMonth - 1, 1)
    .toLocaleDateString('en-US', { month: 'long', year: 'numeric' })

  // Net worth trend period filter
  const [trendPeriod, setTrendPeriod] = useState<'3M' | '6M' | '1Y' | 'ALL'>('ALL')

  // Recent transactions type filter
  const [txTypeFilter, setTxTypeFilter] = useState<'ALL' | 'INCOME' | 'EXPENSE'>('ALL')

  // Add expense / transaction dialog
  const [quickExpenseOpen, setQuickExpenseOpen] = useState(false)

  const createTx = useCreateTransaction()
  const { data: categories } = useQuery({ queryKey: ['categories'], queryFn: categoriesService.getAll })

  const { register, handleSubmit, setValue, reset, watch, formState: { errors } } = useForm<TxFormValues>({
    resolver: zodResolver(txSchema),
    defaultValues: { type: 'EXPENSE', date: now.toISOString().split('T')[0] },
  })
  const txType = watch('type')
  const filteredCategories = categories?.filter((c) => c.type === txType) ?? []

  function onTxSubmit(data: TxFormValues) {
    createTx.mutate(
      { ...data, date: new Date(data.date).toISOString(), tags: [] },
      {
        onSuccess: () => {
          setQuickExpenseOpen(false)
          reset({ type: 'EXPENSE', date: new Date().toISOString().split('T')[0] })
          toast({ title: 'Transaction added' })
        },
        onError: () => toast({ title: 'Failed to add transaction', variant: 'destructive' }),
      },
    )
  }

  const { convert } = useExchangeRates()

  const { data: current, isLoading: loadingCurrent } = useNetWorthCurrent()
  const { data: history, isLoading: loadingHistory } = useNetWorthHistory()
  const { data: recent, isLoading: loadingRecent } = useRecentTransactions(8)
  const { data: summary } = useMonthlySummary(selectedYear, selectedMonth)

  const monthIncome = summary?.find((s) => s.type === 'INCOME')?.total ?? 0
  const monthExpense = summary?.find((s) => s.type === 'EXPENSE')?.total ?? 0

  // Filtered + converted snapshots for trend chart
  const filteredSnapshots = useMemo(() => {
    const snapshots = history?.snapshots ?? []
    const filtered = (() => {
      if (trendPeriod === 'ALL') return snapshots
      const cutoff = new Date()
      if (trendPeriod === '3M') cutoff.setMonth(cutoff.getMonth() - 3)
      else if (trendPeriod === '6M') cutoff.setMonth(cutoff.getMonth() - 6)
      else if (trendPeriod === '1Y') cutoff.setFullYear(cutoff.getFullYear() - 1)
      return snapshots.filter((s) => new Date(s.snapshotDate) >= cutoff)
    })()
    // Apply currency conversion to snapshot values
    return filtered.map((s) => ({
      ...s,
      netWorth: convert(s.netWorth),
      totalAssets: convert(s.totalAssets),
      totalLiabilities: convert(s.totalLiabilities),
    }))
  }, [history?.snapshots, trendPeriod, convert])

  // Filtered recent transactions
  const filteredRecent = useMemo(() => {
    if (!recent) return []
    if (txTypeFilter === 'ALL') return recent
    return recent.filter((tx) => tx.type === txTypeFilter)
  }, [recent, txTypeFilter])

  if (loadingCurrent) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-48" />
        <div className="grid gap-4 md:grid-cols-3">
          {[1, 2, 3].map((i) => <Skeleton key={i} className="h-32" />)}
        </div>
        <Skeleton className="h-64" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Overview</h1>
          <p className="text-sm text-muted-foreground">
            Welcome back, {user?.name?.split(' ')[0]}! Here's your financial snapshot.
          </p>
        </div>
        {/* Global month/year filter */}
        <div className="flex items-center gap-2">
          {!(selectedYear === now.getFullYear() && selectedMonth === now.getMonth() + 1) && (
            <button
              onClick={() => { setSelectedYear(now.getFullYear()); setSelectedMonth(now.getMonth() + 1) }}
              className="text-xs text-primary hover:underline font-medium"
            >
              ↩ {now.toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}
            </button>
          )}
          <div className="flex items-center gap-1 rounded-lg border bg-card px-2 py-1.5 shadow-sm">
            <Button variant="ghost" size="icon" className="h-7 w-7" onClick={prevMonth}>
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <MonthYearPicker
              year={selectedYear}
              month={selectedMonth}
              onChange={(y, m) => { setSelectedYear(y); setSelectedMonth(m) }}
            />
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7"
              onClick={nextMonth}
              disabled={selectedYear === now.getFullYear() && selectedMonth === now.getMonth() + 1}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* Net worth cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <StatCard
          title="Net Worth"
          value={convert(current?.netWorth ?? 0)}
          subtitle="Total assets minus liabilities"
          trend={history?.change ? {
            ...history.change,
            amount: convert(history.change.amount),
          } : undefined}
          currency={currency}
        />
        <StatCard
          title="Total Assets"
          value={convert(current?.totalAssets ?? 0)}
          subtitle={`${current?.assetsByType.length ?? 0} asset categories`}
          currency={currency}
        />
        <StatCard
          title="Total Liabilities"
          value={convert(current?.totalLiabilities ?? 0)}
          subtitle={`${current?.liabilitiesByType.length ?? 0} debt categories`}
          currency={currency}
        />
      </div>

      {/* This month */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardDescription>Income · {selectedMonthLabel}</CardDescription>
              <Link to="/money/income" className="text-xs text-primary hover:underline">
                Details →
              </Link>
            </div>
            <CardTitle className="text-2xl text-income">{formatCurrency(convert(monthIncome), currency)}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-1 text-sm text-muted-foreground">
              <ArrowUpRight className="h-4 w-4 text-income" />
              {selectedMonthLabel}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardDescription>Expenses · {selectedMonthLabel}</CardDescription>
              <Link to="/money/expenses" className="text-xs text-primary hover:underline">
                Details →
              </Link>
            </div>
            <CardTitle className="text-2xl text-expense">{formatCurrency(convert(monthExpense), currency)}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1 text-sm text-muted-foreground">
                <ArrowDownRight className="h-4 w-4 text-expense" />
                Savings: {formatCurrency(convert(monthIncome - monthExpense), currency)}
              </div>
              <Button
                size="sm"
                variant="outline"
                className="h-7 text-xs gap-1"
                onClick={() => setQuickExpenseOpen(true)}
              >
                <Plus className="h-3 w-3" /> Add Expense
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Add Transaction Dialog */}
      <Dialog open={quickExpenseOpen} onOpenChange={(o) => { setQuickExpenseOpen(o); if (!o) reset({ type: 'EXPENSE', date: new Date().toISOString().split('T')[0] }) }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Transaction</DialogTitle>
          </DialogHeader>
          <form id="overview-tx-form" onSubmit={handleSubmit(onTxSubmit)} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Type</Label>
                <Select defaultValue="EXPENSE" onValueChange={(v) => { setValue('type', v as TxFormValues['type']); setValue('categoryId', undefined) }}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="INCOME">Income</SelectItem>
                    <SelectItem value="EXPENSE">Expense</SelectItem>
                    <SelectItem value="TRANSFER">Transfer</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Date</Label>
                <Input type="date" {...register('date')} />
                {errors.date && <p className="text-xs text-destructive">{errors.date.message}</p>}
              </div>
              <div className="col-span-2 space-y-2">
                <Label>Description</Label>
                <Input placeholder="e.g. Big Basket groceries" {...register('description')} />
                {errors.description && <p className="text-xs text-destructive">{errors.description.message}</p>}
              </div>
              <div className="space-y-2">
                <Label>Amount</Label>
                <Input type="number" step="0.01" placeholder="0.00" {...register('amount')} />
                {errors.amount && <p className="text-xs text-destructive">{errors.amount.message}</p>}
              </div>
              <div className="space-y-2">
                <Label>Category (optional)</Label>
                <Select onValueChange={(v) => setValue('categoryId', v)}>
                  <SelectTrigger><SelectValue placeholder="Select..." /></SelectTrigger>
                  <SelectContent>
                    {filteredCategories.map((c) => (
                      <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="col-span-2 space-y-2">
                <Label>Notes (optional)</Label>
                <Input placeholder="Any additional notes..." {...register('notes')} />
              </div>
            </div>
          </form>
          <DialogFooter>
            <Button variant="outline" onClick={() => { setQuickExpenseOpen(false); reset({ type: 'EXPENSE', date: new Date().toISOString().split('T')[0] }) }}>Cancel</Button>
            <Button type="submit" form="overview-tx-form" disabled={createTx.isPending}>
              {createTx.isPending ? 'Adding…' : 'Add Transaction'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Charts row */}
      <div className="grid gap-4 lg:grid-cols-3">
        {/* Net worth trend */}
        <Card className="lg:col-span-2">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Net Worth Trend</CardTitle>
                <CardDescription>Monthly snapshots over time</CardDescription>
              </div>
              <div className="flex gap-1 rounded-lg border bg-muted/40 p-0.5">
                {(['3M', '6M', '1Y', 'ALL'] as const).map((p) => (
                  <button
                    key={p}
                    onClick={() => setTrendPeriod(p)}
                    className={cn(
                      'rounded-md px-2.5 py-1 text-xs font-medium transition-colors',
                      trendPeriod === p
                        ? 'bg-background shadow text-foreground'
                        : 'text-muted-foreground hover:text-foreground',
                    )}
                  >
                    {p}
                  </button>
                ))}
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {loadingHistory ? (
              <Skeleton className="h-64" />
            ) : filteredSnapshots.length > 0 ? (
              <NetWorthChart snapshots={filteredSnapshots} currency={currency} />
            ) : (
              <div className="flex h-64 items-center justify-center text-muted-foreground text-sm">
                No snapshot data yet — add assets and liabilities to track your net worth
              </div>
            )}
          </CardContent>
        </Card>

        {/* Asset allocation */}
        <Card>
          <CardHeader>
            <CardTitle>Asset Allocation</CardTitle>
            <CardDescription>Breakdown by type</CardDescription>
          </CardHeader>
          <CardContent>
            {current && current.assetsByType.length > 0 ? (
              <AssetAllocationChart
                data={current.assetsByType.map((a) => ({ ...a, total: convert(a.total) }))}
                currency={currency}
              />
            ) : (
              <div className="flex h-64 items-center justify-center text-muted-foreground text-sm text-center">
                No assets recorded yet
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Recent transactions */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Recent Transactions</CardTitle>
              <CardDescription>Your latest financial activity</CardDescription>
            </div>
            <div className="flex gap-1 rounded-lg border bg-muted/40 p-0.5">
              {(['ALL', 'INCOME', 'EXPENSE'] as const).map((f) => (
                <button
                  key={f}
                  onClick={() => setTxTypeFilter(f)}
                  className={cn(
                    'rounded-md px-2.5 py-1 text-xs font-medium transition-colors capitalize',
                    txTypeFilter === f
                      ? 'bg-background shadow text-foreground'
                      : 'text-muted-foreground hover:text-foreground',
                  )}
                >
                  {f === 'ALL' ? 'All' : f.charAt(0) + f.slice(1).toLowerCase()}
                </button>
              ))}
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {loadingRecent ? (
            <div className="space-y-3">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="flex items-center gap-3">
                  <Skeleton className="h-10 w-10 rounded-full" />
                  <div className="flex-1 space-y-2">
                    <Skeleton className="h-4 w-48" />
                    <Skeleton className="h-3 w-32" />
                  </div>
                  <Skeleton className="h-4 w-20" />
                </div>
              ))}
            </div>
          ) : filteredRecent.length > 0 ? (
            <div className="space-y-1">
              {filteredRecent.map((tx) => (
                <div key={tx.id} className="flex items-center justify-between rounded-lg px-2 py-2.5 hover:bg-muted/50 transition-colors">
                  <div className="flex items-center gap-3">
                    <div
                      className="flex h-9 w-9 items-center justify-center rounded-full text-xs font-semibold"
                      style={{
                        backgroundColor: tx.category?.color ? `${tx.category.color}20` : 'hsl(var(--muted))',
                        color: tx.category?.color ?? 'hsl(var(--muted-foreground))',
                      }}
                    >
                      {tx.category?.name?.slice(0, 2).toUpperCase() ?? 'TX'}
                    </div>
                    <div>
                      <p className="text-sm font-medium leading-none">{tx.description}</p>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        {formatDate(tx.date)} · {tx.category?.name ?? 'Uncategorised'}
                      </p>
                    </div>
                  </div>
                  <span className={cn('text-sm font-semibold', classifyAmount(tx.type))}>
                    {tx.type === 'INCOME' ? '+' : tx.type === 'EXPENSE' ? '-' : ''}
                    {formatCurrency(convert(tx.amount), currency)}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex h-32 items-center justify-center text-muted-foreground text-sm">
              <Wallet className="mr-2 h-5 w-5" />
              {txTypeFilter === 'ALL'
                ? 'No transactions yet — add your first transaction to get started'
                : `No ${txTypeFilter.toLowerCase()} transactions found`}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
