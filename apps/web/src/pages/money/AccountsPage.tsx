import { useState } from 'react'
import { Plus, Pencil, Trash2, CreditCard } from 'lucide-react'
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
import { useAccounts, useCreateAccount, useUpdateAccount, useDeleteAccount } from '@/hooks/useAccounts'
import { InfoCallout } from '@/components/ui/info-callout'
import { useAuthStore } from '@/store/authStore'
import { formatCurrency } from '@/lib/utils'
import { useToast } from '@/hooks/useToast'
import type { Account, AccountType } from '@/types'

const ACCOUNT_TYPES: { value: AccountType; label: string }[] = [
  { value: 'SAVINGS', label: 'Savings Account' },
  { value: 'CHECKING', label: 'Checking Account' },
  { value: 'INVESTMENT', label: 'Investment Account' },
  { value: 'CASH', label: 'Cash / Wallet' },
  { value: 'CRYPTO', label: 'Crypto Account' },
  { value: 'OTHER', label: 'Other' },
]

const TYPE_COLORS: Record<AccountType, string> = {
  SAVINGS: 'bg-green-100 text-green-800',
  CHECKING: 'bg-blue-100 text-blue-800',
  INVESTMENT: 'bg-purple-100 text-purple-800',
  CASH: 'bg-yellow-100 text-yellow-800',
  CRYPTO: 'bg-orange-100 text-orange-800',
  OTHER: 'bg-gray-100 text-gray-800',
}

const schema = z.object({
  name: z.string().min(1, 'Name is required').max(100),
  type: z.enum(['CHECKING', 'SAVINGS', 'INVESTMENT', 'CRYPTO', 'CASH', 'OTHER']),
  institution: z.string().optional(),
  balance: z.coerce.number().default(0),
  currency: z.string().default('INR'),
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

export function AccountsPage() {
  const user = useAuthStore((s) => s.user)
  const currency = user?.currency ?? 'INR'
  const { toast } = useToast()

  const [isDialogOpen, setDialogOpen] = useState(false)
  const [editing, setEditing] = useState<Account | null>(null)

  const { data: accounts, isLoading } = useAccounts()
  const createAccount = useCreateAccount()
  const updateAccount = useUpdateAccount()
  const deleteAccount = useDeleteAccount()

  const { register, handleSubmit, setValue, reset, formState: { errors } } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { balance: 0, currency: 'INR' },
  })

  const totalBalance = accounts?.filter((a) => a.isActive).reduce((s, a) => s + a.balance, 0) ?? 0

  function openAdd() {
    setEditing(null)
    reset({ balance: 0, currency: 'INR' })
    setDialogOpen(true)
  }

  function openEdit(account: Account) {
    setEditing(account)
    reset({
      name: account.name,
      type: account.type,
      institution: account.institution ?? '',
      balance: account.balance,
      currency: account.currency,
      color: account.color ?? '',
      notes: account.notes ?? '',
    })
    setDialogOpen(true)
  }

  async function onSubmit(values: FormValues) {
    const payload = {
      ...values,
      institution: values.institution || undefined,
      color: values.color || undefined,
      notes: values.notes || undefined,
    }
    try {
      if (editing) {
        await updateAccount.mutateAsync({ id: editing.id, data: payload })
        toast({ title: 'Account updated' })
      } else {
        await createAccount.mutateAsync(payload)
        toast({ title: 'Account created' })
      }
      setDialogOpen(false)
    } catch {
      toast({ title: 'Error', description: 'Failed to save account', variant: 'destructive' })
    }
  }

  async function handleDelete(id: string) {
    try {
      await deleteAccount.mutateAsync(id)
      toast({ title: 'Account deleted' })
    } catch {
      toast({ title: 'Error', description: 'Failed to delete account', variant: 'destructive' })
    }
  }

  return (
    <div className="space-y-6">
      <InfoCallout
        title="What are Accounts?"
        description="Accounts represent where your money lives. Update balances manually to keep your net worth calculation accurate."
        examples={['HDFC Savings ₹85K', 'Zerodha Demat ₹1.7L', 'Cash Wallet ₹12K', 'ICICI Salary Account']}
      />
      <div>
        <h1 className="text-2xl font-bold flex items-center">
          Accounts
          <InfoTooltip text="Your bank accounts, investment accounts, and wallets. Balance is manually maintained — update it when your account changes." />
        </h1>
        <p className="text-sm text-muted-foreground">
          Manage your bank accounts, investment accounts, and wallets
        </p>
      </div>

      {/* Summary */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base">Summary</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex gap-8"><Skeleton className="h-10 w-32" /><Skeleton className="h-10 w-32" /></div>
          ) : (
            <div className="flex flex-wrap gap-8">
              <div>
                <p className="text-sm text-muted-foreground">Total Accounts</p>
                <p className="text-2xl font-bold">{accounts?.filter((a) => a.isActive).length ?? 0}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total Balance</p>
                <p className="text-2xl font-bold text-green-600">{formatCurrency(totalBalance, currency)}</p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Table header */}
      <div className="flex justify-between items-center">
        <h2 className="text-lg font-semibold">All Accounts</h2>
        <Button onClick={openAdd} size="sm"><Plus className="h-4 w-4 mr-1" /> Add Account</Button>
      </div>

      {isLoading ? (
        <div className="space-y-2">{Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-16 w-full" />)}</div>
      ) : !accounts?.length ? (
        <div className="text-center py-12 text-muted-foreground">
          <CreditCard className="h-12 w-12 mx-auto mb-3 opacity-30" />
          <p>No accounts yet. Add your first account!</p>
        </div>
      ) : (
        <div className="space-y-2">
          {accounts.map((account) => (
            <Card key={account.id} className={!account.isActive ? 'opacity-50' : ''}>
              <CardContent className="py-3">
                <div className="flex items-center justify-between gap-4">
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap mb-0.5">
                        <span className="font-medium truncate">{account.name}</span>
                        <Badge className={`text-xs ${TYPE_COLORS[account.type]}`}>
                          {ACCOUNT_TYPES.find((t) => t.value === account.type)?.label ?? account.type}
                        </Badge>
                        {!account.isActive && <Badge variant="outline" className="text-xs">Inactive</Badge>}
                      </div>
                      {account.institution && (
                        <p className="text-xs text-muted-foreground">{account.institution}</p>
                      )}
                    </div>
                    <div className="text-right shrink-0">
                      <p className="font-semibold">{formatCurrency(account.balance, account.currency)}</p>
                      {account.currency !== currency && (
                        <p className="text-xs text-muted-foreground">{account.currency}</p>
                      )}
                    </div>
                  </div>
                  <div className="flex gap-1 shrink-0">
                    <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => openEdit(account)}>
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive hover:text-destructive" onClick={() => handleDelete(account.id)}>
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
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>{editing ? 'Edit Account' : 'Add Account'}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-1">
              <Label>Account Name</Label>
              <Input {...register('name')} placeholder="e.g. HDFC Savings" />
              {errors.name && <p className="text-xs text-destructive">{errors.name.message}</p>}
            </div>

            <div className="space-y-1">
              <Label>Type</Label>
              <Select defaultValue={editing?.type ?? 'SAVINGS'} onValueChange={(v) => setValue('type', v as AccountType)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {ACCOUNT_TYPES.map((t) => <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label>Balance</Label>
                <Input type="number" step="0.01" {...register('balance')} placeholder="0" />
              </div>
              <div className="space-y-1">
                <Label>Currency</Label>
                <Input {...register('currency')} placeholder="INR" />
              </div>
            </div>

            <div className="space-y-1">
              <Label>Institution (optional)</Label>
              <Input {...register('institution')} placeholder="e.g. HDFC Bank" />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label>Color (optional)</Label>
                <Input {...register('color')} placeholder="#6366f1" />
              </div>
            </div>

            <div className="space-y-1">
              <Label>Notes (optional)</Label>
              <Input {...register('notes')} placeholder="Optional notes" />
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>Cancel</Button>
              <Button type="submit" disabled={createAccount.isPending || updateAccount.isPending}>
                {editing ? 'Save Changes' : 'Add Account'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}
