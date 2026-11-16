import { useState, useMemo } from 'react'
import { Plus, Pencil, Trash2, CreditCard, Info, Calculator, ChevronDown, ChevronUp } from 'lucide-react'
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
import { useLiabilities, useCreateLiability, useUpdateLiability, useDeleteLiability } from '@/hooks/useLiabilities'
import { InfoCallout } from '@/components/ui/info-callout'
import { Tooltip, TooltipTrigger, TooltipContent } from '@/components/ui/tooltip'
import { useAuthStore } from '@/store/authStore'
import { formatCurrency } from '@/lib/utils'
import { useToast } from '@/hooks/useToast'
import type { Liability } from '@/types'

const LIABILITY_TYPES: { value: string; label: string }[] = [
  { value: 'MORTGAGE', label: 'House Loan / Mortgage' },
  { value: 'CAR_LOAN', label: 'Car Loan' },
  { value: 'TWO_WHEELER_LOAN', label: 'Two Wheeler Loan' },
  { value: 'GOLD_LOAN', label: 'Gold Loan' },
  { value: 'STUDENT_LOAN', label: 'Student Loan' },
  { value: 'PERSONAL_LOAN', label: 'Personal Loan' },
  { value: 'INFORMAL_DEBT', label: 'Informal Debt (Friends/Family)' },
  { value: 'CREDIT_CARD', label: 'Credit Card' },
  { value: 'MEDICAL', label: 'Medical Debt' },
  { value: 'OTHER', label: 'Other' },
]

const schema = z.object({
  name: z.string().min(1, 'Name is required').max(100),
  type: z.enum(['MORTGAGE', 'CAR_LOAN', 'TWO_WHEELER_LOAN', 'GOLD_LOAN', 'STUDENT_LOAN', 'PERSONAL_LOAN', 'INFORMAL_DEBT', 'CREDIT_CARD', 'MEDICAL', 'OTHER']),
  balance: z.coerce.number().min(0, 'Balance must be positive'),
  interestRate: z.coerce.number().min(0).max(100).optional(),
  minimumPayment: z.coerce.number().min(0).optional(),
  notes: z.string().optional(),
})
type FormValues = z.infer<typeof schema>

function LiabilityForm({
  defaultValues,
  onSubmit,
  isLoading,
}: {
  defaultValues?: Partial<FormValues>
  onSubmit: (data: FormValues) => void
  isLoading: boolean
}) {
  const { register, handleSubmit, setValue, formState: { errors } } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { type: 'OTHER', ...defaultValues },
  })

  return (
    <form id="liability-form" onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div className="col-span-2 space-y-2">
          <Label>Name</Label>
          <Input placeholder="e.g. Home Mortgage" {...register('name')} />
          {errors.name && <p className="text-xs text-destructive">{errors.name.message}</p>}
        </div>
        <div className="space-y-2">
          <Label>Type</Label>
          <Select defaultValue={defaultValues?.type ?? 'OTHER'} onValueChange={(v) => setValue('type', v as any)}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              {LIABILITY_TYPES.map((t) => (
                <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label>Outstanding Balance</Label>
          <Input type="number" step="0.01" placeholder="0.00" {...register('balance')} />
          {errors.balance && <p className="text-xs text-destructive">{errors.balance.message}</p>}
        </div>
        <div className="space-y-2">
          <Label>Interest Rate % (optional)</Label>
          <Input type="number" step="0.01" placeholder="e.g. 5.5" {...register('interestRate')} />
        </div>
        <div className="space-y-2">
          <Label>Minimum Payment (optional)</Label>
          <Input type="number" step="0.01" placeholder="0.00" {...register('minimumPayment')} />
        </div>
        <div className="col-span-2 space-y-2">
          <Label>Notes (optional)</Label>
          <Input placeholder="Any notes..." {...register('notes')} />
        </div>
      </div>
    </form>
  )
}

export function LiabilitiesTab() {
  const user = useAuthStore((s) => s.user)
  const currency = user?.currency ?? 'INR'
  const { toast } = useToast()

  const { data: liabilities, isLoading } = useLiabilities()
  const createLiability = useCreateLiability()
  const updateLiability = useUpdateLiability()
  const deleteLiability = useDeleteLiability()

  const [isDialogOpen, setDialogOpen] = useState(false)
  const [editing, setEditing] = useState<Liability | null>(null)

  // Loan EMI calculator state
  const [showEmiCalc, setShowEmiCalc] = useState(false)
  const [loanPrincipal, setLoanPrincipal] = useState('')
  const [loanRate, setLoanRate] = useState('')
  const [loanTenureYears, setLoanTenureYears] = useState('')

  const emiResult = useMemo(() => {
    const P = parseFloat(loanPrincipal)
    const r = parseFloat(loanRate) / 12 / 100
    const n = parseFloat(loanTenureYears) * 12
    if (!P || !r || !n) return null
    const emi = (P * r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1)
    const totalPayable = emi * n
    const totalInterest = totalPayable - P
    return { emi: Math.round(emi), totalPayable: Math.round(totalPayable), totalInterest: Math.round(totalInterest) }
  }, [loanPrincipal, loanRate, loanTenureYears])

  const totalBalance = liabilities?.reduce((sum, l) => sum + l.balance, 0) ?? 0

  function handleSubmit(data: FormValues) {
    if (editing) {
      updateLiability.mutate(
        { id: editing.id, data },
        {
          onSuccess: () => { setDialogOpen(false); setEditing(null); toast({ title: 'Liability updated' }) },
          onError: () => toast({ title: 'Failed to update', variant: 'destructive' }),
        },
      )
    } else {
      createLiability.mutate(data, {
        onSuccess: () => { setDialogOpen(false); toast({ title: 'Liability added' }) },
        onError: () => toast({ title: 'Failed to add liability', variant: 'destructive' }),
      })
    }
  }

  return (
    <div className="space-y-4">
      <InfoCallout
        title="What are Liabilities?"
        description="Liabilities are debts you owe to banks, NBFCs, or individuals. Track them to understand your total debt burden."
        examples={['HDFC Home Loan ₹32L @ 8.5%', 'ICICI Personal Loan ₹1.5L', 'HDFC Credit Card ₹35K', 'Car Loan ₹3.5L']}
      />
      {/* Loan EMI Calculator */}
      <Card>
        <CardHeader
          className="pb-2 cursor-pointer select-none"
          onClick={() => setShowEmiCalc(!showEmiCalc)}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Calculator className="h-5 w-5 text-primary" />
              <CardTitle className="text-base">Loan EMI Calculator</CardTitle>
            </div>
            {showEmiCalc ? <ChevronUp className="h-4 w-4 text-muted-foreground" /> : <ChevronDown className="h-4 w-4 text-muted-foreground" />}
          </div>
          {!showEmiCalc && (
            <p className="text-sm text-muted-foreground mt-1">
              Calculate your monthly EMI before taking a loan — click to expand.
            </p>
          )}
        </CardHeader>
        {showEmiCalc && (
          <CardContent className="space-y-4 pt-0">
            <p className="text-sm text-muted-foreground">
              Enter loan details to calculate monthly EMI, total interest payable, and total amount.
            </p>
            <div className="grid grid-cols-3 gap-3">
              <div className="space-y-1">
                <Label>Loan Amount (₹)</Label>
                <Input
                  type="number"
                  placeholder="500000"
                  value={loanPrincipal}
                  onChange={(e) => setLoanPrincipal(e.target.value)}
                />
              </div>
              <div className="space-y-1">
                <Label>Annual Interest (%)</Label>
                <Input
                  type="number"
                  step="0.1"
                  placeholder="8.5"
                  value={loanRate}
                  onChange={(e) => setLoanRate(e.target.value)}
                />
              </div>
              <div className="space-y-1">
                <Label>Tenure (Years)</Label>
                <Input
                  type="number"
                  placeholder="5"
                  value={loanTenureYears}
                  onChange={(e) => setLoanTenureYears(e.target.value)}
                />
              </div>
            </div>
            {emiResult !== null && (
              <div className="bg-primary/5 border border-primary/20 rounded-lg p-4 space-y-3">
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <p className="text-xs text-muted-foreground">Monthly EMI</p>
                    <p className="text-xl font-bold text-primary">{formatCurrency(emiResult.emi, currency)}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Total Payable</p>
                    <p className="text-xl font-bold">{formatCurrency(emiResult.totalPayable, currency)}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Total Interest</p>
                    <p className="text-xl font-bold text-expense">{formatCurrency(emiResult.totalInterest, currency)}</p>
                  </div>
                </div>
                <div className="pt-2 border-t flex justify-end">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => {
                      setEditing(null)
                      setDialogOpen(true)
                    }}
                  >
                    <Plus className="h-3 w-3 mr-1" /> Add this Loan
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        )}
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <p className="text-base text-muted-foreground font-normal flex items-center">
                Total Liabilities
                <Tooltip><TooltipTrigger asChild><Info className="h-4 w-4 cursor-help inline-block ml-1.5" /></TooltipTrigger><TooltipContent className="max-w-xs text-xs">Money you owe — loans, credit cards, mortgages. Track balances and interest rates to see your total debt.</TooltipContent></Tooltip>
              </p>
            <p className="text-3xl font-bold mt-1 text-expense">{formatCurrency(totalBalance, currency)}</p>
          </div>
          <Button onClick={() => { setEditing(null); setDialogOpen(true) }}>
            <Plus className="h-4 w-4" /> Add Liability
          </Button>
        </CardHeader>
      </Card>

      <Card>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="p-6 space-y-4">
              {[1, 2, 3].map((i) => <Skeleton key={i} className="h-16" />)}
            </div>
          ) : !liabilities?.length ? (
            <div className="flex flex-col items-center justify-center py-16 text-muted-foreground gap-3">
              <CreditCard className="h-10 w-10 opacity-30" />
              <p className="text-sm">No liabilities recorded. Great news, or add your debts to track them.</p>
              <Button variant="outline" onClick={() => { setEditing(null); setDialogOpen(true) }}>
                <Plus className="h-4 w-4 mr-1" /> Add Liability
              </Button>
            </div>
          ) : (
            <table className="w-full">
              <thead>
                <tr className="border-b text-xs text-muted-foreground">
                  <th className="px-6 py-3 text-left font-medium">Liability</th>
                  <th className="px-6 py-3 text-left font-medium">Type</th>
                  <th className="px-6 py-3 text-right font-medium">Balance</th>
                  <th className="px-6 py-3 text-right font-medium">Rate</th>
                  <th className="px-6 py-3 text-right font-medium">Min. Payment</th>
                  <th className="px-6 py-3 text-right font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {liabilities.map((l) => (
                  <tr key={l.id} className="border-b last:border-0 hover:bg-muted/30">
                    <td className="px-6 py-4">
                      <p className="font-medium text-sm">{l.name}</p>
                      {l.notes && <p className="text-xs text-muted-foreground">{l.notes}</p>}
                    </td>
                    <td className="px-6 py-4">
                      <Badge variant="secondary" className="text-xs">
                          {LIABILITY_TYPES.find((t) => t.value === l.type)?.label ?? l.type}
                        </Badge>
                    </td>
                    <td className="px-6 py-4 text-right font-semibold text-expense">
                      {formatCurrency(l.balance, currency)}
                    </td>
                    <td className="px-6 py-4 text-right text-sm text-muted-foreground">
                      {l.interestRate != null ? `${l.interestRate}%` : '—'}
                    </td>
                    <td className="px-6 py-4 text-right text-sm">
                      {l.minimumPayment != null ? formatCurrency(l.minimumPayment, currency) : '—'}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex justify-end gap-1">
                        <Button variant="ghost" size="icon" onClick={() => { setEditing(l); setDialogOpen(true) }}>
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost" size="icon"
                          className="text-destructive hover:text-destructive"
                          onClick={() => deleteLiability.mutate(l.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </CardContent>
      </Card>

      <Dialog open={isDialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editing ? 'Edit Liability' : 'Add Liability'}</DialogTitle>
          </DialogHeader>
          <LiabilityForm
            defaultValues={editing ? {
              name: editing.name,
              type: editing.type,
              balance: editing.balance,
              interestRate: editing.interestRate ?? undefined,
              minimumPayment: editing.minimumPayment ?? undefined,
              notes: editing.notes ?? undefined,
            } : undefined}
            onSubmit={handleSubmit}
            isLoading={createLiability.isPending || updateLiability.isPending}
          />
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>Cancel</Button>
            <Button type="submit" form="liability-form" disabled={createLiability.isPending || updateLiability.isPending}>
              {editing ? 'Save Changes' : 'Add Liability'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
