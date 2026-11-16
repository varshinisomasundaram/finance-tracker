import { useState } from 'react'
import { Plus, Pencil, Trash2, Wallet } from 'lucide-react'
import { Info } from 'lucide-react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from '@/components/ui/dialog'
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select'
import { Tooltip, TooltipTrigger, TooltipContent } from '@/components/ui/tooltip'
import { useBudgets, useCreateBudget, useUpdateBudget, useDeleteBudget } from '@/hooks/useBudgets'
import { InfoCallout } from '@/components/ui/info-callout'
import { useAuthStore } from '@/store/authStore'
import { useQuery } from '@tanstack/react-query'
import { categoriesService } from '@/services/categories.service'
import { formatCurrency } from '@/lib/utils'
import { useToast } from '@/hooks/useToast'
import type { Budget, BudgetPeriod } from '@/types'

const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
]

const schema = z.object({
  name: z.string().min(1, 'Name is required').max(100),
  amount: z.coerce.number().positive('Amount must be positive'),
  period: z.enum(['MONTHLY', 'ANNUAL']).default('MONTHLY'),
  categoryId: z.string().optional(),
  month: z.coerce.number().min(1).max(12).optional(),
  year: z.coerce.number().min(2000).max(2100).optional(),
})
type FormValues = z.infer<typeof schema>

function InfoTooltip({ text }: { text: string }) {
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Info className="h-4 w-4 text-muted-foreground cursor-help inline-block ml-1.5" />
      </TooltipTrigger>
      <TooltipContent className="max-w-xs text-xs">{text}</TooltipContent>
    </Tooltip>
  )
}

export function BudgetsTab() {
  const user = useAuthStore((s) => s.user)
  const currency = user?.currency ?? 'INR'
  const { toast } = useToast()

  const now = new Date()
  const [selectedMonth, setSelectedMonth] = useState(now.getMonth() + 1)
  const [selectedYear, setSelectedYear] = useState(now.getFullYear())
  const [isDialogOpen, setDialogOpen] = useState(false)
  const [editing, setEditing] = useState<Budget | null>(null)

  const { data: budgets, isLoading } = useBudgets()
  const { data: categories } = useQuery({
    queryKey: ['categories'],
    queryFn: categoriesService.getAll,
  })
  const createBudget = useCreateBudget()
  const updateBudget = useUpdateBudget()
  const deleteBudget = useDeleteBudget()

  const { register, handleSubmit, setValue, watch, reset, formState: { errors } } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { period: 'MONTHLY', month: now.getMonth() + 1, year: now.getFullYear() },
  })

  const watchedPeriod = watch('period')

  // Filter budgets for selected month/year
  const filteredBudgets = budgets?.filter((b) => {
    if (b.period === 'ANNUAL') return b.year === selectedYear
    return b.month === selectedMonth && b.year === selectedYear
  }) ?? []

  const totalBudgeted = filteredBudgets.reduce((s, b) => s + b.amount, 0)

  function getCategoryName(categoryId: string | null) {
    if (!categoryId) return null
    return categories?.find((c) => c.id === categoryId)?.name ?? null
  }

  function openAdd() {
    setEditing(null)
    reset({ period: 'MONTHLY', month: selectedMonth, year: selectedYear })
    setDialogOpen(true)
  }

  function openEdit(budget: Budget) {
    setEditing(budget)
    reset({
      name: budget.name,
      amount: budget.amount,
      period: budget.period,
      categoryId: budget.categoryId ?? '',
      month: budget.month ?? selectedMonth,
      year: budget.year ?? selectedYear,
    })
    setDialogOpen(true)
  }

  async function onSubmit(values: FormValues) {
    const payload = {
      ...values,
      categoryId: values.categoryId || undefined,
      month: values.period === 'MONTHLY' ? values.month : undefined,
      year: values.year,
    }
    try {
      if (editing) {
        await updateBudget.mutateAsync({ id: editing.id, data: payload })
        toast({ title: 'Budget updated' })
      } else {
        await createBudget.mutateAsync(payload)
        toast({ title: 'Budget created' })
      }
      setDialogOpen(false)
    } catch {
      toast({ title: 'Error', description: 'Failed to save budget', variant: 'destructive' })
    }
  }

  async function handleDelete(id: string) {
    try {
      await deleteBudget.mutateAsync(id)
      toast({ title: 'Budget deleted' })
    } catch {
      toast({ title: 'Error', description: 'Failed to delete budget', variant: 'destructive' })
    }
  }

  const years = Array.from({ length: 5 }, (_, i) => now.getFullYear() - 1 + i)

  return (
    <div className="space-y-6">
      <InfoCallout
        title="What is Budget?"
        description="Set monthly spending limits per category. At the end of the month, compare your budget vs actual spending to stay on track."
        examples={['Groceries ₹8K/month', 'Dining Out ₹3K/month', 'Entertainment ₹2K/month', 'Fuel ₹4K/month']}
      />
      {/* Month/Year selector */}
      <div className="flex items-center gap-3">
        <Select value={String(selectedMonth)} onValueChange={(v) => setSelectedMonth(Number(v))}>
          <SelectTrigger className="w-36">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {MONTHS.map((m, i) => <SelectItem key={i} value={String(i + 1)}>{m}</SelectItem>)}
          </SelectContent>
        </Select>
        <Select value={String(selectedYear)} onValueChange={(v) => setSelectedYear(Number(v))}>
          <SelectTrigger className="w-24">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {years.map((y) => <SelectItem key={y} value={String(y)}>{y}</SelectItem>)}
          </SelectContent>
        </Select>
      </div>

      {/* Summary */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base flex items-center">
            Budget Summary — {MONTHS[selectedMonth - 1]} {selectedYear}
            <InfoTooltip text="Set monthly spending limits per category. Helps you plan ahead and stay on track." />
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <Skeleton className="h-10 w-40" />
          ) : (
            <div className="flex flex-wrap gap-8">
              <div>
                <p className="text-sm text-muted-foreground">Budgets</p>
                <p className="text-2xl font-bold">{filteredBudgets.length}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total Budgeted</p>
                <p className="text-2xl font-bold">{formatCurrency(totalBudgeted, currency)}</p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Table header */}
      <div className="flex justify-between items-center">
        <h2 className="text-lg font-semibold">Budgets</h2>
        <Button onClick={openAdd} size="sm"><Plus className="h-4 w-4 mr-1" /> Add Budget</Button>
      </div>

      {isLoading ? (
        <div className="space-y-2">{Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-14 w-full" />)}</div>
      ) : !filteredBudgets.length ? (
        <div className="text-center py-12 text-muted-foreground">
          <Wallet className="h-12 w-12 mx-auto mb-3 opacity-30" />
          <p>No budgets for {MONTHS[selectedMonth - 1]} {selectedYear}. Add one!</p>
        </div>
      ) : (
        <div className="space-y-2">
          {filteredBudgets.map((budget) => {
            const catName = getCategoryName(budget.categoryId)
            return (
              <Card key={budget.id}>
                <CardContent className="py-3">
                  <div className="flex items-center justify-between gap-4">
                    <div className="flex items-center gap-3 flex-1 min-w-0">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-medium truncate">{budget.name}</span>
                          {catName && (
                            <Badge variant="outline" className="text-xs">{catName}</Badge>
                          )}
                          <Badge variant="secondary" className="text-xs">{budget.period}</Badge>
                        </div>
                      </div>
                      <span className="font-semibold text-right shrink-0">{formatCurrency(budget.amount, currency)}</span>
                    </div>
                    <div className="flex gap-1 shrink-0">
                      <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => openEdit(budget)}>
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive hover:text-destructive" onClick={() => handleDelete(budget.id)}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}

      {/* Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>{editing ? 'Edit Budget' : 'Add Budget'}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-1">
              <Label>Name</Label>
              <Input {...register('name')} placeholder="e.g. Groceries Budget" />
              {errors.name && <p className="text-xs text-destructive">{errors.name.message}</p>}
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label>Amount (₹)</Label>
                <Input type="number" step="0.01" {...register('amount')} placeholder="10000" />
                {errors.amount && <p className="text-xs text-destructive">{errors.amount.message}</p>}
              </div>
              <div className="space-y-1">
                <Label>Period</Label>
                <Select defaultValue={editing?.period ?? 'MONTHLY'} onValueChange={(v) => setValue('period', v as BudgetPeriod)}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="MONTHLY">Monthly</SelectItem>
                    <SelectItem value="ANNUAL">Annual</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              {watchedPeriod === 'MONTHLY' && (
                <div className="space-y-1">
                  <Label>Month</Label>
                  <Select defaultValue={String(editing?.month ?? selectedMonth)} onValueChange={(v) => setValue('month', Number(v))}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {MONTHS.map((m, i) => <SelectItem key={i} value={String(i + 1)}>{m}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
              )}
              <div className="space-y-1">
                <Label>Year</Label>
                <Select defaultValue={String(editing?.year ?? selectedYear)} onValueChange={(v) => setValue('year', Number(v))}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {years.map((y) => <SelectItem key={y} value={String(y)}>{y}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-1">
              <Label>Category (optional)</Label>
              <Select defaultValue={editing?.categoryId ?? ''} onValueChange={(v) => setValue('categoryId', v)}>
                <SelectTrigger><SelectValue placeholder="Select category" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="">None</SelectItem>
                  {categories?.filter((c) => c.type === 'EXPENSE').map((c) => (
                    <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>Cancel</Button>
              <Button type="submit" disabled={createBudget.isPending || updateBudget.isPending}>
                {editing ? 'Save Changes' : 'Add Budget'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}
