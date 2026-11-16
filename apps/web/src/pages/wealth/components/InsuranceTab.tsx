import { useState } from 'react'
import { Plus, Pencil, Trash2, Shield, Info } from 'lucide-react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
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
import { useInsurance, useCreateInsurance, useUpdateInsurance, useDeleteInsurance } from '@/hooks/useInsurance'
import { InfoCallout } from '@/components/ui/info-callout'
import { Tooltip, TooltipTrigger, TooltipContent } from '@/components/ui/tooltip'
import { useAuthStore } from '@/store/authStore'
import { formatCurrency } from '@/lib/utils'
import { useToast } from '@/hooks/useToast'
import type { Insurance, InsuranceType, PremiumFrequency, InsuranceStatus } from '@/types'

const INSURANCE_TYPES: { value: InsuranceType; label: string }[] = [
  { value: 'TERM_LIFE', label: 'Term Life Insurance' },
  { value: 'HEALTH', label: 'Health Insurance' },
  { value: 'VEHICLE_TWO_WHEELER', label: 'Two Wheeler Insurance' },
  { value: 'VEHICLE_FOUR_WHEELER', label: 'Four Wheeler Insurance' },
  { value: 'ENDOWMENT', label: 'Endowment / Money Back' },
  { value: 'ULIP', label: 'ULIP' },
  { value: 'HOME', label: 'Home Insurance' },
  { value: 'OTHER', label: 'Other' },
]

const PREMIUM_FREQUENCIES: { value: PremiumFrequency; label: string }[] = [
  { value: 'MONTHLY', label: 'Monthly' },
  { value: 'QUARTERLY', label: 'Quarterly' },
  { value: 'HALF_YEARLY', label: 'Half Yearly' },
  { value: 'ANNUALLY', label: 'Annually' },
  { value: 'SINGLE_PREMIUM', label: 'Single Premium' },
]

const STATUS_OPTIONS: { value: InsuranceStatus; label: string }[] = [
  { value: 'ACTIVE', label: 'Active' },
  { value: 'EXPIRED', label: 'Expired' },
  { value: 'LAPSED', label: 'Lapsed' },
  { value: 'CANCELLED', label: 'Cancelled' },
]

const VEHICLE_TYPES: InsuranceType[] = ['VEHICLE_TWO_WHEELER', 'VEHICLE_FOUR_WHEELER']

const schema = z.object({
  name: z.string().min(1, 'Name is required').max(100),
  type: z.enum(['TERM_LIFE', 'HEALTH', 'VEHICLE_TWO_WHEELER', 'VEHICLE_FOUR_WHEELER', 'ENDOWMENT', 'ULIP', 'HOME', 'OTHER']),
  provider: z.string().min(1, 'Provider is required').max(100),
  policyNumber: z.string().optional(),
  premiumAmount: z.coerce.number().min(0, 'Premium must be positive'),
  premiumFrequency: z.enum(['MONTHLY', 'QUARTERLY', 'HALF_YEARLY', 'ANNUALLY', 'SINGLE_PREMIUM']),
  sumInsured: z.coerce.number().min(0, 'Sum insured must be positive'),
  startDate: z.string().min(1, 'Start date is required'),
  renewalDate: z.string().min(1, 'Renewal date is required'),
  status: z.enum(['ACTIVE', 'EXPIRED', 'LAPSED', 'CANCELLED']).default('ACTIVE'),
  vehicleRegistration: z.string().optional(),
  nominees: z.string().optional(),
  notes: z.string().optional(),
})
type FormValues = z.infer<typeof schema>

const STATUS_COLORS: Record<InsuranceStatus, string> = {
  ACTIVE: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300',
  EXPIRED: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300',
  LAPSED: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300',
  CANCELLED: 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400',
}

function toDateInput(isoString: string | null | undefined): string {
  if (!isoString) return ''
  return isoString.slice(0, 10)
}

function toIso(dateInput: string): string {
  return dateInput ? new Date(dateInput).toISOString() : ''
}

function InsuranceForm({
  defaultValues,
  onSubmit,
  isLoading,
}: {
  defaultValues?: Partial<FormValues>
  onSubmit: (data: FormValues) => void
  isLoading: boolean
}) {
  const { register, handleSubmit, setValue, watch, formState: { errors } } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { type: 'TERM_LIFE', premiumFrequency: 'ANNUALLY', status: 'ACTIVE', ...defaultValues },
  })

  const watchedType = watch('type')
  const isVehicle = VEHICLE_TYPES.includes(watchedType as InsuranceType)

  return (
    <form id="insurance-form" onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div className="col-span-2 space-y-2">
          <Label>Policy Name</Label>
          <Input placeholder="e.g. LIC Jeevan Anand" {...register('name')} />
          {errors.name && <p className="text-xs text-destructive">{errors.name.message}</p>}
        </div>

        <div className="space-y-2">
          <Label>Type</Label>
          <Select defaultValue={defaultValues?.type ?? 'TERM_LIFE'} onValueChange={(v) => setValue('type', v as InsuranceType)}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              {INSURANCE_TYPES.map((t) => (
                <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label>Provider</Label>
          <Input placeholder="e.g. LIC, Star Health" {...register('provider')} />
          {errors.provider && <p className="text-xs text-destructive">{errors.provider.message}</p>}
        </div>

        <div className="space-y-2">
          <Label>Policy Number (optional)</Label>
          <Input placeholder="e.g. 123456789" {...register('policyNumber')} />
        </div>

        <div className="space-y-2">
          <Label>Status</Label>
          <Select defaultValue={defaultValues?.status ?? 'ACTIVE'} onValueChange={(v) => setValue('status', v as InsuranceStatus)}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              {STATUS_OPTIONS.map((s) => (
                <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label>Premium Amount (₹)</Label>
          <Input type="number" step="0.01" placeholder="0.00" {...register('premiumAmount')} />
          {errors.premiumAmount && <p className="text-xs text-destructive">{errors.premiumAmount.message}</p>}
        </div>

        <div className="space-y-2">
          <Label>Premium Frequency</Label>
          <Select defaultValue={defaultValues?.premiumFrequency ?? 'ANNUALLY'} onValueChange={(v) => setValue('premiumFrequency', v as PremiumFrequency)}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              {PREMIUM_FREQUENCIES.map((f) => (
                <SelectItem key={f.value} value={f.value}>{f.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="col-span-2 space-y-2">
          <Label>Sum Insured / Coverage (₹)</Label>
          <Input type="number" step="0.01" placeholder="e.g. 1000000" {...register('sumInsured')} />
          {errors.sumInsured && <p className="text-xs text-destructive">{errors.sumInsured.message}</p>}
        </div>

        <div className="space-y-2">
          <Label>Start Date</Label>
          <Input type="date" {...register('startDate')} />
          {errors.startDate && <p className="text-xs text-destructive">{errors.startDate.message}</p>}
        </div>

        <div className="space-y-2">
          <Label>Renewal Date</Label>
          <Input type="date" {...register('renewalDate')} />
          {errors.renewalDate && <p className="text-xs text-destructive">{errors.renewalDate.message}</p>}
        </div>

        {isVehicle && (
          <div className="col-span-2 space-y-2">
            <Label>Vehicle Registration (optional)</Label>
            <Input placeholder="e.g. TN01AB1234" {...register('vehicleRegistration')} />
          </div>
        )}

        <div className="col-span-2 space-y-2">
          <Label>Nominees (optional)</Label>
          <Input placeholder="e.g. Spouse, Father" {...register('nominees')} />
        </div>

        <div className="col-span-2 space-y-2">
          <Label>Notes (optional)</Label>
          <Input placeholder="Any additional notes..." {...register('notes')} />
        </div>
      </div>
    </form>
  )
}

export function InsuranceTab() {
  const user = useAuthStore((s) => s.user)
  const currency = user?.currency ?? 'INR'
  const { toast } = useToast()

  const { data: policies, isLoading } = useInsurance()
  const createInsurance = useCreateInsurance()
  const updateInsurance = useUpdateInsurance()
  const deleteInsurance = useDeleteInsurance()

  const [isDialogOpen, setDialogOpen] = useState(false)
  const [editing, setEditing] = useState<Insurance | null>(null)

  const activePolicies = policies?.filter((p) => p.status === 'ACTIVE') ?? []
  const totalAnnualPremium = activePolicies.reduce((sum, p) => sum + p.annualPremium, 0)
  const totalCoverage = activePolicies.reduce((sum, p) => sum + p.sumInsured, 0)

  function handleSubmit(data: FormValues) {
    const payload = {
      ...data,
      startDate: toIso(data.startDate),
      renewalDate: toIso(data.renewalDate),
    }

    if (editing) {
      updateInsurance.mutate(
        { id: editing.id, data: payload },
        {
          onSuccess: () => { setDialogOpen(false); setEditing(null); toast({ title: 'Policy updated' }) },
          onError: () => toast({ title: 'Failed to update', variant: 'destructive' }),
        },
      )
    } else {
      createInsurance.mutate(payload, {
        onSuccess: () => { setDialogOpen(false); toast({ title: 'Policy added' }) },
        onError: () => toast({ title: 'Failed to add policy', variant: 'destructive' }),
      })
    }
  }

  function openEdit(policy: Insurance) {
    setEditing(policy)
    setDialogOpen(true)
  }

  return (
    <div className="space-y-4">
      <InfoCallout
        title="What is Insurance?"
        description="Track all your insurance policies in one place — life, health, vehicles. Get renewal reminders before policies lapse."
        examples={['HDFC Life Term Plan ₹1Cr', 'Star Health Family Floater ₹5L', 'Bajaj Allianz Car Insurance', 'Bike Insurance']}
      />
      {/* Summary cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="pb-2">
            <p className="text-sm text-muted-foreground flex items-center">
                Active Policies
                <Tooltip><TooltipTrigger asChild><Info className="h-4 w-4 cursor-help inline-block ml-1.5" /></TooltipTrigger><TooltipContent className="max-w-xs text-xs">Active policies for life, health, and vehicles. Policies due within 30 days are highlighted in orange.</TooltipContent></Tooltip>
              </p>
            <p className="text-3xl font-bold">{activePolicies.length}</p>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <p className="text-sm text-muted-foreground">Total Annual Premium</p>
            <p className="text-3xl font-bold">{formatCurrency(totalAnnualPremium, currency)}</p>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2 flex flex-row items-start justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Total Coverage</p>
              <p className="text-3xl font-bold">{formatCurrency(totalCoverage, currency)}</p>
            </div>
            <Button onClick={() => { setEditing(null); setDialogOpen(true) }}>
              <Plus className="h-4 w-4 mr-1" /> Add Policy
            </Button>
          </CardHeader>
        </Card>
      </div>

      {/* Policy list */}
      <Card>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="p-6 space-y-4">
              {[1, 2, 3].map((i) => <Skeleton key={i} className="h-16" />)}
            </div>
          ) : !policies?.length ? (
            <div className="flex flex-col items-center justify-center py-16 text-muted-foreground gap-3">
              <Shield className="h-10 w-10 opacity-30" />
              <p className="text-sm">No insurance policies yet. Add your first policy to track your coverage.</p>
              <Button variant="outline" onClick={() => { setEditing(null); setDialogOpen(true) }}>
                <Plus className="h-4 w-4 mr-1" /> Add Policy
              </Button>
            </div>
          ) : (
            <table className="w-full">
              <thead>
                <tr className="border-b text-xs text-muted-foreground">
                  <th className="px-6 py-3 text-left font-medium">Policy</th>
                  <th className="px-6 py-3 text-left font-medium">Type</th>
                  <th className="px-6 py-3 text-right font-medium">Premium / yr</th>
                  <th className="px-6 py-3 text-right font-medium">Sum Insured</th>
                  <th className="px-6 py-3 text-left font-medium">Renewal</th>
                  <th className="px-6 py-3 text-left font-medium">Status</th>
                  <th className="px-6 py-3 text-right font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {policies.map((p) => {
                  const renewalDate = new Date(p.renewalDate)
                  const daysUntilRenewal = Math.ceil((renewalDate.getTime() - Date.now()) / 86400000)
                  const isRenewingSoon = daysUntilRenewal <= 30 && daysUntilRenewal >= 0 && p.status === 'ACTIVE'

                  return (
                    <tr key={p.id} className="border-b last:border-0 hover:bg-muted/30 transition-colors">
                      <td className="px-6 py-4">
                        <p className="font-medium text-sm">{p.name}</p>
                        <p className="text-xs text-muted-foreground">{p.provider}{p.policyNumber ? ` · ${p.policyNumber}` : ''}</p>
                      </td>
                      <td className="px-6 py-4">
                        <Badge variant="secondary" className="text-xs">
                          {INSURANCE_TYPES.find((t) => t.value === p.type)?.label ?? p.type}
                        </Badge>
                      </td>
                      <td className="px-6 py-4 text-right font-semibold text-sm">
                        {formatCurrency(p.annualPremium, currency)}
                      </td>
                      <td className="px-6 py-4 text-right text-sm">
                        {formatCurrency(p.sumInsured, currency)}
                      </td>
                      <td className="px-6 py-4 text-sm">
                        <span className={isRenewingSoon ? 'text-yellow-600 font-medium' : ''}>
                          {renewalDate.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                        </span>
                        {isRenewingSoon && (
                          <p className="text-xs text-yellow-600">Due in {daysUntilRenewal}d</p>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${STATUS_COLORS[p.status]}`}>
                          {p.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex justify-end gap-1">
                          <Button variant="ghost" size="icon" onClick={() => openEdit(p)}>
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost" size="icon"
                            className="text-destructive hover:text-destructive"
                            onClick={() => deleteInsurance.mutate(p.id, {
                              onSuccess: () => toast({ title: 'Policy deleted' }),
                            })}
                            disabled={deleteInsurance.isPending}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          )}
        </CardContent>
      </Card>

      {/* Add/Edit Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editing ? 'Edit Policy' : 'Add Insurance Policy'}</DialogTitle>
          </DialogHeader>
          <InsuranceForm
            defaultValues={editing ? {
              name: editing.name,
              type: editing.type,
              provider: editing.provider,
              policyNumber: editing.policyNumber ?? undefined,
              premiumAmount: editing.premiumAmount,
              premiumFrequency: editing.premiumFrequency,
              sumInsured: editing.sumInsured,
              startDate: toDateInput(editing.startDate),
              renewalDate: toDateInput(editing.renewalDate),
              status: editing.status,
              vehicleRegistration: editing.vehicleRegistration ?? undefined,
              nominees: editing.nominees ?? undefined,
              notes: editing.notes ?? undefined,
            } : undefined}
            onSubmit={handleSubmit}
            isLoading={createInsurance.isPending || updateInsurance.isPending}
          />
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>Cancel</Button>
            <Button
              type="submit"
              form="insurance-form"
              disabled={createInsurance.isPending || updateInsurance.isPending}
            >
              {editing ? 'Save Changes' : 'Add Policy'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
