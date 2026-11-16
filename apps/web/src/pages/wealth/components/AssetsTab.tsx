import { useState, useEffect } from 'react'
import { useSearchParams } from 'react-router-dom'
import { Plus, Pencil, Trash2, TrendingUp, Info } from 'lucide-react'
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
import { useAssets, useCreateAsset, useUpdateAsset, useDeleteAsset } from '@/hooks/useAssets'
import { InfoCallout } from '@/components/ui/info-callout'
import { Tooltip, TooltipTrigger, TooltipContent } from '@/components/ui/tooltip'
import { useAuthStore } from '@/store/authStore'
import { formatCurrency } from '@/lib/utils'
import { useToast } from '@/hooks/useToast'
import type { Asset, AssetType, InvestmentStrategy } from '@/types'

const ASSET_TYPES: { value: AssetType; label: string }[] = [
  { value: 'REAL_ESTATE', label: 'Real Estate / Land' },
  { value: 'VEHICLE', label: 'Vehicle' },
  { value: 'EQUITY', label: 'Stocks / Equity' },
  { value: 'MUTUAL_FUND', label: 'Mutual Fund' },
  { value: 'GOLD', label: 'Gold' },
  { value: 'PROVIDENT_FUND', label: 'Provident Fund (PPF/GPF)' },
  { value: 'GOVERNMENT_SCHEME', label: 'Government Scheme (SSY/NSC)' },
  { value: 'RETIREMENT', label: 'Retirement (NPS/EPF)' },
  { value: 'SAVINGS', label: 'Savings (FD/RD)' },
  { value: 'CASH', label: 'Cash' },
  { value: 'INSURANCE_POLICY', label: 'Insurance Policy (Endowment/ULIP)' },
  { value: 'CRYPTO', label: 'Cryptocurrency' },
  { value: 'BUSINESS', label: 'Business' },
  { value: 'OTHER', label: 'Other' },
]

const STRATEGY_OPTIONS: { value: InvestmentStrategy; label: string }[] = [
  { value: 'LONG_TERM', label: 'Long Term (> 3 years)' },
  { value: 'SHORT_TERM', label: 'Short Term (< 1 year)' },
  { value: 'HOLD_FOREVER', label: 'Hold Forever' },
]

// Types where quantity is meaningful
const QUANTITY_TYPES: AssetType[] = ['EQUITY', 'MUTUAL_FUND', 'GOLD', 'CRYPTO']
const STRATEGY_TYPES: AssetType[] = ['MUTUAL_FUND', 'EQUITY']

const schema = z.object({
  name: z.string().min(1, 'Name is required').max(100),
  type: z.enum(['REAL_ESTATE', 'VEHICLE', 'EQUITY', 'MUTUAL_FUND', 'RETIREMENT', 'PROVIDENT_FUND', 'GOVERNMENT_SCHEME', 'SAVINGS', 'CASH', 'GOLD', 'CRYPTO', 'INSURANCE_POLICY', 'BUSINESS', 'OTHER']),
  value: z.coerce.number().min(0, 'Value must be positive'),
  purchasePrice: z.coerce.number().min(0).optional(),
  investmentStrategy: z.enum(['LONG_TERM', 'SHORT_TERM', 'HOLD_FOREVER']).optional(),
  targetDate: z.string().optional(),
  quantity: z.coerce.number().min(0).optional(),
  notes: z.string().optional(),
})
type FormValues = z.infer<typeof schema>

function AssetForm({
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
    defaultValues: { type: 'OTHER', ...defaultValues },
  })

  const watchedType = watch('type') as AssetType
  const showStrategy = STRATEGY_TYPES.includes(watchedType)
  const showQuantity = QUANTITY_TYPES.includes(watchedType)

  const quantityLabel = watchedType === 'GOLD'
    ? 'Quantity (grams)'
    : watchedType === 'MUTUAL_FUND'
      ? 'Units'
      : 'Shares / Units'

  return (
    <form id="asset-form" onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div className="col-span-2 space-y-2">
          <Label>Name</Label>
          <Input placeholder="e.g. SBI Blue Chip Fund" {...register('name')} />
          {errors.name && <p className="text-xs text-destructive">{errors.name.message}</p>}
        </div>

        <div className="space-y-2">
          <Label>Type</Label>
          <Select defaultValue={defaultValues?.type ?? 'OTHER'} onValueChange={(v) => setValue('type', v as AssetType)}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              {ASSET_TYPES.map((t) => (
                <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label>Current Value (₹)</Label>
          <Input type="number" step="0.01" placeholder="0.00" {...register('value')} />
          {errors.value && <p className="text-xs text-destructive">{errors.value.message}</p>}
        </div>

        <div className="space-y-2">
          <Label>Purchase / Invested Amount (optional)</Label>
          <Input type="number" step="0.01" placeholder="0.00" {...register('purchasePrice')} />
        </div>

        {showQuantity && (
          <div className="space-y-2">
            <Label>{quantityLabel} (optional)</Label>
            <Input type="number" step="0.000001" placeholder="0" {...register('quantity')} />
          </div>
        )}

        {showStrategy && (
          <>
            <div className="space-y-2">
              <Label>Investment Strategy (optional)</Label>
              <Select
                defaultValue={defaultValues?.investmentStrategy ?? ''}
                onValueChange={(v) => setValue('investmentStrategy', v as InvestmentStrategy)}
              >
                <SelectTrigger><SelectValue placeholder="Select strategy" /></SelectTrigger>
                <SelectContent>
                  {STRATEGY_OPTIONS.map((s) => (
                    <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Target / Exit Date (optional)</Label>
              <Input type="date" {...register('targetDate')} />
            </div>
          </>
        )}

        <div className="col-span-2 space-y-2">
          <Label>Notes (optional)</Label>
          <Input placeholder="Any notes..." {...register('notes')} />
        </div>
      </div>
    </form>
  )
}

export function AssetsTab() {
  const user = useAuthStore((s) => s.user)
  const currency = user?.currency ?? 'INR'
  const { toast } = useToast()

  const { data: assets, isLoading } = useAssets()
  const createAsset = useCreateAsset()
  const updateAsset = useUpdateAsset()
  const deleteAsset = useDeleteAsset()

  const [isDialogOpen, setDialogOpen] = useState(false)
  const [editing, setEditing] = useState<Asset | null>(null)
  const [searchParams, setSearchParams] = useSearchParams()
  const [prefillData, setPrefillData] = useState<Partial<FormValues> | null>(null)

  // Handle "Add to Portfolio" pre-fill from Investments tab
  useEffect(() => {
    if (searchParams.get('prefill') === '1') {
      const name = searchParams.get('name') ?? ''
      const type = (searchParams.get('type') ?? 'OTHER') as AssetType
      const value = Number(searchParams.get('value') ?? 0)
      const quantity = Number(searchParams.get('quantity') ?? 0)
      setPrefillData({ name, type, value, quantity: quantity || undefined })
      setEditing(null)
      setDialogOpen(true)
      setSearchParams({}, { replace: true })
    }
  }, [searchParams, setSearchParams])

  const totalValue = assets?.reduce((sum, a) => sum + a.value, 0) ?? 0

  function handleSubmit(data: FormValues) {
    const payload = {
      ...data,
      targetDate: data.targetDate ? new Date(data.targetDate).toISOString() : undefined,
    }
    if (editing) {
      updateAsset.mutate(
        { id: editing.id, data: payload },
        {
          onSuccess: () => { setDialogOpen(false); setEditing(null); toast({ title: 'Asset updated' }) },
          onError: () => toast({ title: 'Failed to update asset', variant: 'destructive' }),
        },
      )
    } else {
      createAsset.mutate(payload, {
        onSuccess: () => { setDialogOpen(false); toast({ title: 'Asset added' }) },
        onError: () => toast({ title: 'Failed to add asset', variant: 'destructive' }),
      })
    }
  }

  function handleDelete(id: string) {
    deleteAsset.mutate(id, {
      onSuccess: () => toast({ title: 'Asset deleted' }),
      onError: () => toast({ title: 'Failed to delete asset', variant: 'destructive' }),
    })
  }

  return (
    <div className="space-y-4">
      <InfoCallout
        title="What are Assets?"
        description="Assets are everything you own that has monetary value. Track them here to know your total wealth."
        examples={['HDFC FD ₹2L', 'Infosys shares 50 qty', '2BHK Flat Whitefield', 'Physical Gold 50g', 'NPS Tier-I']}
      />
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle className="text-base text-muted-foreground font-normal flex items-center">
                Total Assets
                <Tooltip><TooltipTrigger asChild><Info className="h-4 w-4 cursor-help inline-block ml-1.5" /></TooltipTrigger><TooltipContent className="max-w-xs text-xs">Things you own that have monetary value — property, investments, gold, savings. Adding purchase price enables gain/loss tracking.</TooltipContent></Tooltip>
              </CardTitle>
            <p className="text-3xl font-bold mt-1">{formatCurrency(totalValue, currency)}</p>
          </div>
          <Button onClick={() => { setEditing(null); setDialogOpen(true) }}>
            <Plus className="h-4 w-4" /> Add Asset
          </Button>
        </CardHeader>
      </Card>

      <Card>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="p-6 space-y-4">
              {[1, 2, 3].map((i) => <Skeleton key={i} className="h-16" />)}
            </div>
          ) : !assets?.length ? (
            <div className="flex flex-col items-center justify-center py-16 text-muted-foreground gap-3">
              <TrendingUp className="h-10 w-10 opacity-30" />
              <p className="text-sm">No assets yet. Add your first asset to start tracking your wealth.</p>
              <Button variant="outline" onClick={() => { setEditing(null); setDialogOpen(true) }}>
                <Plus className="h-4 w-4 mr-1" /> Add Asset
              </Button>
            </div>
          ) : (
            <table className="w-full">
              <thead>
                <tr className="border-b text-xs text-muted-foreground">
                  <th className="px-6 py-3 text-left font-medium">Asset</th>
                  <th className="px-6 py-3 text-left font-medium">Type</th>
                  <th className="px-6 py-3 text-right font-medium">Value</th>
                  <th className="px-6 py-3 text-right font-medium">Gain/Loss</th>
                  <th className="px-6 py-3 text-right font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {assets.map((asset) => {
                  const gainLoss = asset.purchasePrice != null ? asset.value - asset.purchasePrice : null
                  const typeLabel = ASSET_TYPES.find((t) => t.value === asset.type)?.label ?? asset.type
                  return (
                    <tr key={asset.id} className="border-b last:border-0 hover:bg-muted/30 transition-colors">
                      <td className="px-6 py-4">
                        <p className="font-medium text-sm">{asset.name}</p>
                        <div className="flex gap-2 mt-0.5">
                          {asset.investmentStrategy && (
                            <span className="text-xs text-muted-foreground">
                              {asset.investmentStrategy.replace(/_/g, ' ')}
                            </span>
                          )}
                          {asset.quantity != null && (
                            <span className="text-xs text-muted-foreground">
                              {asset.quantity} units
                            </span>
                          )}
                          {asset.notes && <span className="text-xs text-muted-foreground">{asset.notes}</span>}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <Badge variant="secondary" className="text-xs">{typeLabel}</Badge>
                      </td>
                      <td className="px-6 py-4 text-right font-semibold">
                        {formatCurrency(asset.value, currency)}
                      </td>
                      <td className="px-6 py-4 text-right text-sm">
                        {gainLoss != null ? (
                          <span className={gainLoss >= 0 ? 'text-income' : 'text-expense'}>
                            {gainLoss >= 0 ? '+' : ''}{formatCurrency(gainLoss, currency)}
                          </span>
                        ) : '—'}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex justify-end gap-1">
                          <Button variant="ghost" size="icon" onClick={() => { setEditing(asset); setDialogOpen(true) }}>
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost" size="icon"
                            className="text-destructive hover:text-destructive"
                            onClick={() => handleDelete(asset.id)}
                            disabled={deleteAsset.isPending}
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

      <Dialog open={isDialogOpen} onOpenChange={(v) => { setDialogOpen(v); if (!v) setPrefillData(null) }}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editing ? 'Edit Asset' : 'Add Asset'}</DialogTitle>
          </DialogHeader>
          <AssetForm
            defaultValues={editing ? {
              name: editing.name,
              type: editing.type,
              value: editing.value,
              purchasePrice: editing.purchasePrice ?? undefined,
              investmentStrategy: editing.investmentStrategy ?? undefined,
              targetDate: editing.targetDate ? editing.targetDate.slice(0, 10) : undefined,
              quantity: editing.quantity ?? undefined,
              notes: editing.notes ?? undefined,
            } : prefillData ?? undefined}
            onSubmit={handleSubmit}
            isLoading={createAsset.isPending || updateAsset.isPending}
          />
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>Cancel</Button>
            <Button
              type="submit"
              form="asset-form"
              disabled={createAsset.isPending || updateAsset.isPending}
            >
              {editing ? 'Save Changes' : 'Add Asset'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
