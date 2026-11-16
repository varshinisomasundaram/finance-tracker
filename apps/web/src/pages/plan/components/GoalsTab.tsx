import { useState, useMemo } from 'react'
import { Plus, Pencil, Trash2, Target, ChevronDown, ChevronUp, Calculator } from 'lucide-react'
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
import { Progress } from '@/components/ui/progress'
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from '@/components/ui/dialog'
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select'
import { Tooltip, TooltipTrigger, TooltipContent } from '@/components/ui/tooltip'
import { useGoals, useCreateGoal, useUpdateGoal, useDeleteGoal } from '@/hooks/useGoals'
import { InfoCallout } from '@/components/ui/info-callout'
import { useAuthStore } from '@/store/authStore'
import { formatCurrency, formatDate } from '@/lib/utils'
import { useToast } from '@/hooks/useToast'
import type { Goal, GoalType, GoalStatus } from '@/types'

const GOAL_TYPES: { value: GoalType; label: string }[] = [
  { value: 'SAVINGS', label: 'Savings' },
  { value: 'DEBT_PAYOFF', label: 'Debt Payoff' },
  { value: 'INVESTMENT', label: 'Investment' },
  { value: 'EMERGENCY_FUND', label: 'Emergency Fund' },
  { value: 'PURCHASE', label: 'Purchase / Buy' },
  { value: 'OTHER', label: 'Other' },
]

const GOAL_STATUSES: { value: GoalStatus; label: string }[] = [
  { value: 'ACTIVE', label: 'Active' },
  { value: 'COMPLETED', label: 'Completed' },
  { value: 'PAUSED', label: 'Paused' },
  { value: 'CANCELLED', label: 'Cancelled' },
]

const STATUS_COLORS: Record<GoalStatus, string> = {
  ACTIVE: 'bg-blue-100 text-blue-800',
  COMPLETED: 'bg-green-100 text-green-800',
  PAUSED: 'bg-yellow-100 text-yellow-800',
  CANCELLED: 'bg-red-100 text-red-800',
}

const schema = z.object({
  name: z.string().min(1, 'Name is required').max(100),
  type: z.enum(['SAVINGS', 'DEBT_PAYOFF', 'INVESTMENT', 'EMERGENCY_FUND', 'PURCHASE', 'OTHER']),
  targetAmount: z.coerce.number().positive('Target amount must be positive'),
  currentAmount: z.coerce.number().min(0).default(0),
  targetDate: z.string().optional(),
  status: z.enum(['ACTIVE', 'COMPLETED', 'PAUSED', 'CANCELLED']).default('ACTIVE'),
  color: z.string().optional(),
  notes: z.string().optional(),
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

export function GoalsTab() {
  const user = useAuthStore((s) => s.user)
  const currency = user?.currency ?? 'INR'
  const { toast } = useToast()

  const [isDialogOpen, setDialogOpen] = useState(false)
  const [editing, setEditing] = useState<Goal | null>(null)
  const [showInflation, setShowInflation] = useState(false)
  const [inflationPV, setInflationPV] = useState('')
  const [inflationRate, setInflationRate] = useState('6')
  const [inflationYears, setInflationYears] = useState('')

  // Standalone inflation calculator
  const [showCalc, setShowCalc] = useState(false)
  const [calcPV, setCalcPV] = useState('')
  const [calcRate, setCalcRate] = useState('6')
  const [calcYears, setCalcYears] = useState('')

  const { data: goals, isLoading } = useGoals()
  const createGoal = useCreateGoal()
  const updateGoal = useUpdateGoal()
  const deleteGoal = useDeleteGoal()

  const { register, handleSubmit, setValue, watch, reset, formState: { errors } } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { currentAmount: 0, status: 'ACTIVE' },
  })

  const watchedTargetDate = watch('targetDate')

  const calcFV = useMemo(() => {
    const pv = parseFloat(calcPV)
    const r = parseFloat(calcRate)
    const n = parseFloat(calcYears)
    if (!pv || !r || !n) return null
    return Math.round(pv * Math.pow(1 + r / 100, n))
  }, [calcPV, calcRate, calcYears])

  const inflationFV = useMemo(() => {
    const pv = parseFloat(inflationPV)
    const r = parseFloat(inflationRate)
    const n = inflationYears
      ? parseFloat(inflationYears)
      : watchedTargetDate
        ? Math.max(0, (new Date(watchedTargetDate).getFullYear() - new Date().getFullYear()))
        : 0
    if (!pv || !r || !n) return null
    return Math.round(pv * Math.pow(1 + r / 100, n))
  }, [inflationPV, inflationRate, inflationYears, watchedTargetDate])

  function openAdd(prefillAmount?: number) {
    setEditing(null)
    reset({ currentAmount: 0, status: 'ACTIVE', ...(prefillAmount ? { targetAmount: prefillAmount } : {}) })
    setShowInflation(false)
    setInflationPV('')
    setInflationRate('6')
    setInflationYears('')
    setDialogOpen(true)
  }

  function openEdit(goal: Goal) {
    setEditing(goal)
    reset({
      name: goal.name,
      type: goal.type,
      targetAmount: goal.targetAmount,
      currentAmount: goal.currentAmount,
      targetDate: goal.targetDate ? goal.targetDate.slice(0, 10) : '',
      status: goal.status,
      color: goal.color ?? '',
      notes: goal.notes ?? '',
    })
    setShowInflation(false)
    setInflationPV('')
    setInflationRate('6')
    setInflationYears('')
    setDialogOpen(true)
  }

  async function onSubmit(values: FormValues) {
    const payload = {
      ...values,
      targetDate: values.targetDate || undefined,
      color: values.color || undefined,
      notes: values.notes || undefined,
    }
    try {
      if (editing) {
        await updateGoal.mutateAsync({ id: editing.id, data: payload })
        toast({ title: 'Goal updated' })
      } else {
        await createGoal.mutateAsync(payload)
        toast({ title: 'Goal created' })
      }
      setDialogOpen(false)
    } catch {
      toast({ title: 'Error', description: 'Failed to save goal', variant: 'destructive' })
    }
  }

  async function handleDelete(id: string) {
    try {
      await deleteGoal.mutateAsync(id)
      toast({ title: 'Goal deleted' })
    } catch {
      toast({ title: 'Error', description: 'Failed to delete goal', variant: 'destructive' })
    }
  }

  const activeGoals = goals?.filter((g) => g.status === 'ACTIVE') ?? []
  const totalTarget = goals?.reduce((s, g) => s + g.targetAmount, 0) ?? 0
  const totalCurrent = goals?.reduce((s, g) => s + g.currentAmount, 0) ?? 0

  return (
    <div className="space-y-6">
      <InfoCallout
        title="What are Goals?"
        description="Set financial targets with deadlines and track your progress. Use the inflation calculator to find out how much money you'll actually need in the future."
        examples={['Emergency Fund ₹3L by Dec 2025', 'Goa Trip ₹50K by March', 'Pay off Credit Card ₹35K', 'Down payment ₹5L by 2027']}
      />
      {/* Standalone Inflation Calculator */}
      <Card>
        <CardHeader
          className="pb-2 cursor-pointer select-none"
          onClick={() => setShowCalc(!showCalc)}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Calculator className="h-5 w-5 text-primary" />
              <CardTitle className="text-base">Inflation Calculator</CardTitle>
            </div>
            {showCalc ? <ChevronUp className="h-4 w-4 text-muted-foreground" /> : <ChevronDown className="h-4 w-4 text-muted-foreground" />}
          </div>
          {!showCalc && (
            <p className="text-sm text-muted-foreground mt-1">
              Find out how much your goal will actually cost in the future — click to expand.
            </p>
          )}
        </CardHeader>
        {showCalc && (
          <CardContent className="space-y-4 pt-0">
            <p className="text-sm text-muted-foreground">
              Enter today's cost of your goal and see how much you'll actually need in the future due to inflation.
            </p>
            <div className="grid grid-cols-3 gap-3">
              <div className="space-y-1">
                <Label className="text-xs">Today's Cost (₹)</Label>
                <Input
                  type="number"
                  placeholder="100000"
                  value={calcPV}
                  onChange={(e) => setCalcPV(e.target.value)}
                />
              </div>
              <div className="space-y-1">
                <Label className="text-xs">Annual Inflation (%)</Label>
                <Input
                  type="number"
                  step="0.1"
                  value={calcRate}
                  onChange={(e) => setCalcRate(e.target.value)}
                />
              </div>
              <div className="space-y-1">
                <Label className="text-xs">Years from Now</Label>
                <Input
                  type="number"
                  placeholder="5"
                  value={calcYears}
                  onChange={(e) => setCalcYears(e.target.value)}
                />
              </div>
            </div>
            {calcFV !== null && (
              <div className="bg-primary/5 border border-primary/20 rounded-lg p-4 flex items-center justify-between gap-4">
                <div>
                  <p className="text-xs text-muted-foreground">
                    Future value in {calcYears} years @ {calcRate}% inflation
                  </p>
                  <p className="text-2xl font-bold text-primary mt-0.5">{formatCurrency(calcFV, currency)}</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Today's {formatCurrency(parseFloat(calcPV), currency)} will cost {formatCurrency(calcFV, currency)} in {calcYears} years
                  </p>
                </div>
                <Button size="sm" onClick={() => openAdd(calcFV)} className="shrink-0">
                  <Plus className="h-3 w-3 mr-1" /> Plan as Goal
                </Button>
              </div>
            )}
          </CardContent>
        )}
      </Card>

      {/* Summary */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base flex items-center">
            Goals Summary
            <InfoTooltip text="Financial targets with a deadline. Use the inflation calculator to find out how much money you'll actually need." />
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex gap-8"><Skeleton className="h-10 w-32" /><Skeleton className="h-10 w-32" /></div>
          ) : (
            <div className="flex flex-wrap gap-8">
              <div>
                <p className="text-sm text-muted-foreground">Active Goals</p>
                <p className="text-2xl font-bold">{activeGoals.length}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total Saved</p>
                <p className="text-2xl font-bold text-green-600">{formatCurrency(totalCurrent, currency)}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total Target</p>
                <p className="text-2xl font-bold">{formatCurrency(totalTarget, currency)}</p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Table header */}
      <div className="flex justify-between items-center">
        <h2 className="text-lg font-semibold">All Goals</h2>
        <Button onClick={openAdd} size="sm"><Plus className="h-4 w-4 mr-1" /> Add Goal</Button>
      </div>

      {isLoading ? (
        <div className="space-y-2">{Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-16 w-full" />)}</div>
      ) : !goals?.length ? (
        <div className="text-center py-12 text-muted-foreground">
          <Target className="h-12 w-12 mx-auto mb-3 opacity-30" />
          <p>No goals yet. Add your first financial goal!</p>
        </div>
      ) : (
        <div className="space-y-3">
          {goals.map((goal) => (
            <Card key={goal.id}>
              <CardContent className="pt-4">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap mb-1">
                      <span className="font-medium truncate">{goal.name}</span>
                      <Badge variant="outline" className="text-xs capitalize">
                        {goal.type.replace('_', ' ')}
                      </Badge>
                      <Badge className={`text-xs ${STATUS_COLORS[goal.status]}`}>
                        {goal.status}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-3 text-sm text-muted-foreground mb-2">
                      <span>{formatCurrency(goal.currentAmount, currency)} / {formatCurrency(goal.targetAmount, currency)}</span>
                      {goal.targetDate && <span>· Due {formatDate(goal.targetDate)}</span>}
                    </div>
                    <div className="flex items-center gap-2">
                      <Progress value={goal.progressPercent} className="h-2 flex-1" />
                      <span className="text-xs font-medium w-10 text-right">{goal.progressPercent}%</span>
                    </div>
                  </div>
                  <div className="flex gap-1 shrink-0">
                    <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => openEdit(goal)}>
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive hover:text-destructive" onClick={() => handleDelete(goal.id)}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Add/Edit Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editing ? 'Edit Goal' : 'Add Goal'}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-1">
              <Label>Name</Label>
              <Input {...register('name')} placeholder="e.g. Emergency Fund" />
              {errors.name && <p className="text-xs text-destructive">{errors.name.message}</p>}
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label>Type</Label>
                <Select defaultValue={editing?.type ?? 'SAVINGS'} onValueChange={(v) => setValue('type', v as GoalType)}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {GOAL_TYPES.map((t) => <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1">
                <Label>Status</Label>
                <Select defaultValue={editing?.status ?? 'ACTIVE'} onValueChange={(v) => setValue('status', v as GoalStatus)}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {GOAL_STATUSES.map((s) => <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label>Target Amount (₹)</Label>
                <Input type="number" step="0.01" {...register('targetAmount')} placeholder="500000" />
                {errors.targetAmount && <p className="text-xs text-destructive">{errors.targetAmount.message}</p>}
              </div>
              <div className="space-y-1">
                <Label>Current Amount (₹)</Label>
                <Input type="number" step="0.01" {...register('currentAmount')} placeholder="0" />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label>Target Date</Label>
                <Input type="date" {...register('targetDate')} />
              </div>
              <div className="space-y-1">
                <Label>Color (optional)</Label>
                <Input {...register('color')} placeholder="#6366f1" />
              </div>
            </div>

            <div className="space-y-1">
              <Label>Notes</Label>
              <Input {...register('notes')} placeholder="Optional notes" />
            </div>

            {/* Inflation Calculator */}
            <div className="border rounded-lg">
              <button
                type="button"
                className="w-full flex items-center justify-between px-4 py-3 text-sm font-medium hover:bg-muted/50 transition-colors"
                onClick={() => setShowInflation(!showInflation)}
              >
                <span>Inflation Calculator</span>
                {showInflation ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
              </button>
              {showInflation && (
                <div className="px-4 pb-4 space-y-3 border-t pt-3">
                  <p className="text-xs text-muted-foreground">
                    Calculate how much money you'll actually need in the future due to inflation.
                  </p>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <Label className="text-xs">Today's Cost (₹)</Label>
                      <Input
                        type="number"
                        placeholder="100000"
                        value={inflationPV}
                        onChange={(e) => setInflationPV(e.target.value)}
                      />
                    </div>
                    <div className="space-y-1">
                      <Label className="text-xs">Inflation Rate (%)</Label>
                      <Input
                        type="number"
                        step="0.1"
                        value={inflationRate}
                        onChange={(e) => setInflationRate(e.target.value)}
                      />
                    </div>
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs">Years (leave blank to use target date)</Label>
                    <Input
                      type="number"
                      placeholder={watchedTargetDate ? `Auto: ${Math.max(0, new Date(watchedTargetDate).getFullYear() - new Date().getFullYear())} yrs` : 'e.g. 5'}
                      value={inflationYears}
                      onChange={(e) => setInflationYears(e.target.value)}
                    />
                  </div>
                  {inflationFV !== null && (
                    <div className="bg-muted rounded-md p-3 flex items-center justify-between">
                      <div>
                        <p className="text-xs text-muted-foreground">Estimated future value</p>
                        <p className="text-lg font-bold">{formatCurrency(inflationFV, currency)}</p>
                      </div>
                      <Button
                        type="button"
                        size="sm"
                        variant="outline"
                        onClick={() => setValue('targetAmount', inflationFV)}
                      >
                        Use this amount
                      </Button>
                    </div>
                  )}
                </div>
              )}
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>Cancel</Button>
              <Button type="submit" disabled={createGoal.isPending || updateGoal.isPending}>
                {editing ? 'Save Changes' : 'Add Goal'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}
