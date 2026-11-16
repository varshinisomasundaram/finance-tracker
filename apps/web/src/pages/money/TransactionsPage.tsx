import { useState } from 'react'
import { Plus, Search, Filter, Pencil, Trash2, ArrowUpCircle, ArrowDownCircle, ArrowLeftRight, Info, Upload } from 'lucide-react'
import { ImportWizard } from '@/components/ImportWizard'
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
import { useTransactions, useCreateTransaction, useDeleteTransaction } from '@/hooks/useTransactions'
import { useAuthStore } from '@/store/authStore'
import { useQuery } from '@tanstack/react-query'
import { categoriesService } from '@/services/categories.service'
import { formatCurrency, formatDate, classifyAmount, cn } from '@/lib/utils'
import { useToast } from '@/hooks/useToast'
import { Tooltip, TooltipTrigger, TooltipContent } from '@/components/ui/tooltip'
import { InfoCallout } from '@/components/ui/info-callout'
import type { TransactionType } from '@/types'

const schema = z.object({
  type: z.enum(['INCOME', 'EXPENSE', 'TRANSFER']),
  amount: z.coerce.number().positive('Amount must be positive'),
  date: z.string().min(1, 'Date is required'),
  description: z.string().min(1, 'Description is required').max(200),
  categoryId: z.string().optional(),
  notes: z.string().optional(),
})
type FormValues = z.infer<typeof schema>

const TYPE_ICON = {
  INCOME: <ArrowUpCircle className="h-4 w-4 text-income" />,
  EXPENSE: <ArrowDownCircle className="h-4 w-4 text-expense" />,
  TRANSFER: <ArrowLeftRight className="h-4 w-4 text-muted-foreground" />,
}

export function TransactionsPage({ fixedType }: { fixedType?: TransactionType }) {
  const user = useAuthStore((s) => s.user)
  const currency = user?.currency ?? 'INR'
  const { toast } = useToast()

  const [search, setSearch] = useState('')
  const [typeFilter, setTypeFilter] = useState<string>(fixedType ?? '')
  const [page, setPage] = useState(1)
  const [isDialogOpen, setDialogOpen] = useState(false)
  const [isImportOpen, setImportOpen] = useState(false)

  const { data: txData, isLoading } = useTransactions({
    search: search || undefined,
    type: fixedType ?? (typeFilter || undefined),
    page,
    limit: 20,
  })

  const { data: categories } = useQuery({
    queryKey: ['categories'],
    queryFn: categoriesService.getAll,
  })

  const createTx = useCreateTransaction()
  const deleteTx = useDeleteTransaction()

  const { register, handleSubmit, setValue, reset, formState: { errors } } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      type: fixedType ?? 'EXPENSE',
      date: new Date().toISOString().split('T')[0],
    },
  })

  function onSubmit(data: FormValues) {
    createTx.mutate(
      { ...data, date: new Date(data.date).toISOString(), tags: [] },
      {
        onSuccess: () => {
          setDialogOpen(false)
          reset()
          toast({ title: 'Transaction added' })
        },
        onError: () => toast({ title: 'Failed to add transaction', variant: 'destructive' }),
      },
    )
  }

  const pageTitle = fixedType === 'INCOME' ? 'Income' : fixedType === 'EXPENSE' ? 'Expenses' : 'Transactions'
  const pageDesc = fixedType === 'INCOME'
    ? 'All your income entries — salary, freelance, investment returns and more.'
    : fixedType === 'EXPENSE'
      ? 'All your expenses — bills, shopping, EMIs and more.'
      : 'Every income, expense, and transfer.'
  const tooltipText = fixedType === 'INCOME'
    ? 'Every income entry. Search by name or description. Shows 20 per page.'
    : fixedType === 'EXPENSE'
      ? 'Every expense entry. Search by name or description. Shows 20 per page.'
      : 'Every income, expense, and transfer. Search by name or filter by type. Shows 20 per page.'

  const callout = fixedType === 'INCOME'
    ? { title: 'What is Income?', description: 'Income is money coming in. Add every source — salary, freelance, dividends, rent, interest. Use categories for trend analysis.', examples: ['March Salary ₹1.2L', 'Infosys Dividend ₹5.5K', 'Freelance Project ₹25K', 'Airbnb Rental ₹8K'] }
    : fixedType === 'EXPENSE'
      ? { title: 'What are Expenses?', description: 'Expenses are money going out. Record all spending — bills, EMIs, groceries, subscriptions. Tag recurring expenses for reminders.', examples: ['Home Loan EMI ₹28K', 'Big Basket ₹6.5K', 'Netflix ₹649', 'BESCOM Bill ₹2.4K'] }
      : { title: 'What are Transactions?', description: 'A transaction is any money movement — income, expense, or transfer between accounts. Use filters and search to find specific entries.', examples: ['Salary credited', 'Grocery purchase', 'Transfer to savings'] }

  return (
    <div className="space-y-6">
      <InfoCallout title={callout.title} description={callout.description} examples={callout.examples} />
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold flex items-center">
            {pageTitle}
            <Tooltip><TooltipTrigger asChild><Info className="h-4 w-4 text-muted-foreground cursor-help inline-block ml-1.5" /></TooltipTrigger><TooltipContent className="max-w-xs text-xs">{tooltipText}</TooltipContent></Tooltip>
          </h1>
          <p className="text-sm text-muted-foreground">{pageDesc}</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => setImportOpen(true)}>
            <Upload className="h-4 w-4" /> Import
          </Button>
          <Button onClick={() => setDialogOpen(true)}>
            <Plus className="h-4 w-4" /> Add {fixedType === 'INCOME' ? 'Income' : fixedType === 'EXPENSE' ? 'Expense' : 'Transaction'}
          </Button>
        </div>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="flex gap-4 pt-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder={`Search ${pageTitle.toLowerCase()}...`}
              className="pl-9"
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(1) }}
            />
          </div>
          {!fixedType && (
            <Select value={typeFilter} onValueChange={(v) => { setTypeFilter(v); setPage(1) }}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="All types" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">All types</SelectItem>
                <SelectItem value="INCOME">Income</SelectItem>
                <SelectItem value="EXPENSE">Expense</SelectItem>
                <SelectItem value="TRANSFER">Transfer</SelectItem>
              </SelectContent>
            </Select>
          )}
        </CardContent>
      </Card>

      {/* Transaction table */}
      <Card>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="p-6 space-y-4">
              {[1, 2, 3, 4, 5].map((i) => <Skeleton key={i} className="h-14" />)}
            </div>
          ) : !txData?.data.length ? (
            <div className="flex flex-col items-center justify-center py-16 gap-3 text-muted-foreground">
              <ArrowUpCircle className="h-10 w-10 opacity-30" />
              <p className="text-sm">No transactions found</p>
              <Button variant="outline" onClick={() => setDialogOpen(true)}>
                <Plus className="h-4 w-4 mr-1" /> Add your first transaction
              </Button>
            </div>
          ) : (
            <>
              <table className="w-full">
                <thead>
                  <tr className="border-b text-xs text-muted-foreground">
                    <th className="px-6 py-3 text-left font-medium">Date</th>
                    <th className="px-6 py-3 text-left font-medium">Description</th>
                    <th className="px-6 py-3 text-left font-medium">Category</th>
                    <th className="px-6 py-3 text-right font-medium">Amount</th>
                    <th className="px-6 py-3 text-right font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {txData.data.map((tx) => (
                    <tr key={tx.id} className="border-b last:border-0 hover:bg-muted/30 transition-colors">
                      <td className="px-6 py-3 text-sm text-muted-foreground whitespace-nowrap">
                        {formatDate(tx.date)}
                      </td>
                      <td className="px-6 py-3">
                        <div className="flex items-center gap-2">
                          {TYPE_ICON[tx.type]}
                          <span className="text-sm font-medium">{tx.description}</span>
                        </div>
                        {tx.notes && <p className="text-xs text-muted-foreground pl-6 mt-0.5">{tx.notes}</p>}
                      </td>
                      <td className="px-6 py-3">
                        {tx.category ? (
                          <Badge
                            variant="outline"
                            className="text-xs"
                            style={{ borderColor: tx.category.color, color: tx.category.color }}
                          >
                            {tx.category.name}
                          </Badge>
                        ) : (
                          <span className="text-xs text-muted-foreground">—</span>
                        )}
                      </td>
                      <td className={cn('px-6 py-3 text-right text-sm font-semibold', classifyAmount(tx.type))}>
                        {tx.type === 'INCOME' ? '+' : tx.type === 'EXPENSE' ? '-' : ''}
                        {formatCurrency(tx.amount, currency)}
                      </td>
                      <td className="px-6 py-3 text-right">
                        <Button
                          variant="ghost" size="icon"
                          className="text-destructive hover:text-destructive"
                          onClick={() => deleteTx.mutate(tx.id, {
                            onSuccess: () => toast({ title: 'Transaction deleted' }),
                          })}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {/* Pagination */}
              {txData.meta.totalPages > 1 && (
                <div className="flex items-center justify-between border-t px-6 py-3">
                  <p className="text-sm text-muted-foreground">
                    Showing {((page - 1) * 20) + 1}–{Math.min(page * 20, txData.meta.total)} of {txData.meta.total}
                  </p>
                  <div className="flex gap-2">
                    <Button
                      variant="outline" size="sm"
                      disabled={page <= 1}
                      onClick={() => setPage(p => p - 1)}
                    >
                      Previous
                    </Button>
                    <Button
                      variant="outline" size="sm"
                      disabled={page >= txData.meta.totalPages}
                      onClick={() => setPage(p => p + 1)}
                    >
                      Next
                    </Button>
                  </div>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>

      {/* Add Transaction Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Transaction</DialogTitle>
          </DialogHeader>
          <form id="tx-form" onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Type</Label>
                <Select defaultValue={fixedType ?? 'EXPENSE'} disabled={!!fixedType} onValueChange={(v) => setValue('type', v as TransactionType)}>
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
                <Input placeholder="e.g. Monthly salary" {...register('description')} />
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
                    {categories?.map((c) => (
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
            <Button variant="outline" onClick={() => { setDialogOpen(false); reset() }}>Cancel</Button>
            <Button type="submit" form="tx-form" disabled={createTx.isPending}>
              Add Transaction
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <ImportWizard open={isImportOpen} onClose={() => setImportOpen(false)} />
    </div>
  )
}
