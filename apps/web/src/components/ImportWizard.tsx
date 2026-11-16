import { useState, useRef, useCallback } from 'react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Checkbox } from '@/components/ui/checkbox'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { usePreviewImport, useConfirmImport } from '@/hooks/useImport'
import { useAccounts } from '@/hooks/useAccounts'
import { useQuery } from '@tanstack/react-query'
import { categoriesService } from '@/services/categories.service'
import { formatCurrency, cn } from '@/lib/utils'
import type { ImportParsedRow, ImportPreviewResult } from '@/types'
import { Upload, AlertTriangle, CheckCircle2, FileText, Loader2, Sparkles } from 'lucide-react'

type Step = 'upload' | 'preview' | 'done'

interface Props {
  open: boolean
  onClose: () => void
}

const BANK_LABELS: Record<string, string> = {
  HDFC: 'HDFC Bank',
  ICICI: 'ICICI Bank',
  SBI: 'State Bank of India',
  AXIS: 'Axis Bank',
  KOTAK: 'Kotak Mahindra',
  GENERIC: 'Generic / Unknown',
}

const NO_CATEGORY = '__none__'

export function ImportWizard({ open, onClose }: Props) {
  const [step, setStep] = useState<Step>('upload')
  const [file, setFile] = useState<File | null>(null)
  const [password, setPassword] = useState('')
  const [preview, setPreview] = useState<ImportPreviewResult | null>(null)
  const [selected, setSelected] = useState<Set<number>>(new Set())
  const [rowCategories, setRowCategories] = useState<Record<number, string>>({})
  const [rowTypes, setRowTypes] = useState<Record<number, 'INCOME' | 'EXPENSE'>>({})
  const [accountId, setAccountId] = useState<string>('')
  const [doneResult, setDoneResult] = useState<{ imported: number; skipped: number; duplicatesSkipped: number } | null>(null)
  const [dragOver, setDragOver] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const previewMutation = usePreviewImport()
  const confirmMutation = useConfirmImport()

  const { data: accounts } = useAccounts()
  const { data: categories } = useQuery({
    queryKey: ['categories'],
    queryFn: categoriesService.getAll,
  })

  const isPdf = file?.name.toLowerCase().endsWith('.pdf') ?? false

  function resetWizard() {
    setStep('upload')
    setFile(null)
    setPassword('')
    setPreview(null)
    setSelected(new Set())
    setRowCategories({})
    setRowTypes({})
    setAccountId('')
    setDoneResult(null)
    previewMutation.reset()
    confirmMutation.reset()
  }

  function handleClose() {
    resetWizard()
    onClose()
  }

  function handleFileChange(f: File | null) {
    if (!f) return
    setFile(f)
    setPassword('')
    previewMutation.reset()
  }

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setDragOver(false)
    const f = e.dataTransfer.files[0]
    if (f) handleFileChange(f)
  }, [])

  async function handleParse() {
    if (!file) return
    const result = await previewMutation.mutateAsync({
      file,
      password: password || undefined,
    })
    setPreview(result)
    // Pre-select all non-duplicate rows
    const nonDup = new Set(result.rows.filter((r) => !r.isDuplicate).map((r) => r.rowIndex))
    setSelected(nonDup)
    // Pre-fill suggested categories and types from parsed rows
    const suggestedCats: Record<number, string> = {}
    const initialTypes: Record<number, 'INCOME' | 'EXPENSE'> = {}
    for (const row of result.rows) {
      if (row.suggestedCategoryId) suggestedCats[row.rowIndex] = row.suggestedCategoryId
      initialTypes[row.rowIndex] = row.type
    }
    setRowCategories(suggestedCats)
    setRowTypes(initialTypes)
    setStep('preview')
  }

  function toggleRow(rowIndex: number) {
    setSelected((prev) => {
      const next = new Set(prev)
      if (next.has(rowIndex)) next.delete(rowIndex)
      else next.add(rowIndex)
      return next
    })
  }

  function toggleAll() {
    if (!preview) return
    if (selected.size === preview.rows.length) {
      setSelected(new Set())
    } else {
      setSelected(new Set(preview.rows.map((r) => r.rowIndex)))
    }
  }

  function setRowCategory(rowIndex: number, catId: string) {
    setRowCategories((prev) => {
      if (!catId || catId === NO_CATEGORY) {
        const { [rowIndex]: _, ...rest } = prev
        return rest
      }
      return { ...prev, [rowIndex]: catId }
    })
  }

  function toggleType(rowIndex: number) {
    setRowTypes((prev) => ({
      ...prev,
      [rowIndex]: prev[rowIndex] === 'INCOME' ? 'EXPENSE' : 'INCOME',
    }))
  }

  async function handleConfirm() {
    if (!preview) return
    const result = await confirmMutation.mutateAsync({
      sessionId: preview.sessionId,
      selectedRowIndices: [...selected],
      rowCategories: Object.keys(rowCategories).length > 0 ? rowCategories : undefined,
      rowTypes: Object.keys(rowTypes).length > 0 ? rowTypes : undefined,
      accountId: accountId || undefined,
    })
    setDoneResult(result)
    setStep('done')
  }

  const allCategories = categories ?? []
  const duplicateCount = preview?.rows.filter((r) => r.isDuplicate).length ?? 0
  const aiCatCount = preview?.rows.filter((r) => r.suggestedCategoryId).length ?? 0

  return (
    <Dialog open={open} onOpenChange={(v) => { if (!v) handleClose() }}>
      <DialogContent className="max-w-5xl max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Upload className="h-5 w-5" />
            Import Bank Statement
          </DialogTitle>
        </DialogHeader>

        {/* Step indicators */}
        <div className="flex items-center gap-2 text-sm text-muted-foreground px-1">
          {(['upload', 'preview', 'done'] as Step[]).map((s, i) => (
            <div key={s} className="flex items-center gap-1.5">
              {i > 0 && <span className="text-muted-foreground/40">›</span>}
              <span className={cn(step === s ? 'text-foreground font-medium' : '')}>
                {i + 1}. {s === 'upload' ? 'Upload' : s === 'preview' ? 'Review' : 'Done'}
              </span>
            </div>
          ))}
        </div>

        <div className="flex-1 overflow-y-auto min-h-0">
          {/* ── Step 1: Upload ── */}
          {step === 'upload' && (
            <div className="space-y-5 py-2">
              <div
                className={cn(
                  'border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors',
                  dragOver ? 'border-primary bg-primary/5' : 'border-muted-foreground/30 hover:border-primary/50',
                )}
                onClick={() => fileInputRef.current?.click()}
                onDragOver={(e) => { e.preventDefault(); setDragOver(true) }}
                onDragLeave={() => setDragOver(false)}
                onDrop={handleDrop}
              >
                <FileText className="h-10 w-10 mx-auto mb-3 text-muted-foreground" />
                {file ? (
                  <div>
                    <p className="font-medium">{file.name}</p>
                    <p className="text-sm text-muted-foreground mt-1">
                      {(file.size / 1024).toFixed(1)} KB — click to change
                    </p>
                  </div>
                ) : (
                  <div>
                    <p className="font-medium">Drop your bank statement here</p>
                    <p className="text-sm text-muted-foreground mt-1">
                      Supports CSV and PDF — HDFC, ICICI, SBI, Axis, Kotak
                    </p>
                  </div>
                )}
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".csv,.pdf"
                  className="hidden"
                  onChange={(e) => handleFileChange(e.target.files?.[0] ?? null)}
                />
              </div>

              {isPdf && (
                <div className="space-y-1.5">
                  <Label>PDF Password (if protected)</Label>
                  <Input
                    type="password"
                    placeholder="Leave blank if not password-protected"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    autoComplete="off"
                  />
                  <p className="text-xs text-muted-foreground">
                    Bank-issued PDFs are typically protected with your date of birth (e.g. 01011990)
                  </p>
                </div>
              )}

              {previewMutation.isError && (
                <div className="flex items-center gap-2 text-sm text-destructive bg-destructive/10 rounded p-3">
                  <AlertTriangle className="h-4 w-4 shrink-0" />
                  {(previewMutation.error as Error)?.message ?? 'Failed to parse file'}
                </div>
              )}
            </div>
          )}

          {/* ── Step 2: Preview ── */}
          {step === 'preview' && preview && (
            <div className="space-y-4 py-2">
              {/* Summary bar */}
              <div className="flex flex-wrap items-center gap-3 text-sm">
                <Badge variant="secondary">{BANK_LABELS[preview.bank] ?? preview.bank}</Badge>
                <span>{preview.totalRows} transactions found</span>
                {duplicateCount > 0 && (
                  <span className="text-amber-600 dark:text-amber-400 flex items-center gap-1">
                    <AlertTriangle className="h-3.5 w-3.5" />
                    {duplicateCount} possible duplicate{duplicateCount !== 1 ? 's' : ''} (pre-deselected)
                  </span>
                )}
                {aiCatCount > 0 && (
                  <span className="text-blue-600 dark:text-blue-400 flex items-center gap-1">
                    <Sparkles className="h-3.5 w-3.5" />
                    {aiCatCount} categories auto-assigned
                  </span>
                )}
              </div>

              {/* Account selector */}
              <div className="w-56">
                <Label className="text-xs text-muted-foreground mb-1 block">Account (optional)</Label>
                <Select value={accountId} onValueChange={setAccountId}>
                  <SelectTrigger>
                    <SelectValue placeholder="Unassigned" />
                  </SelectTrigger>
                  <SelectContent>
                    {(accounts ?? []).map((a) => (
                      <SelectItem key={a.id} value={a.id}>{a.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Transaction table */}
              <div className="border rounded-lg overflow-hidden">
                <table className="w-full text-sm">
                  <thead className="bg-muted/50">
                    <tr>
                      <th className="p-2 w-8">
                        <Checkbox
                          checked={selected.size === preview.rows.length && preview.rows.length > 0}
                          onCheckedChange={toggleAll}
                        />
                      </th>
                      <th className="p-2 text-left font-medium text-muted-foreground whitespace-nowrap">Date</th>
                      <th className="p-2 text-left font-medium text-muted-foreground">Description</th>
                      <th className="p-2 text-left font-medium text-muted-foreground">Category</th>
                      <th className="p-2 text-right font-medium text-muted-foreground whitespace-nowrap">Amount</th>
                      <th className="p-2 text-center font-medium text-muted-foreground">Type</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {preview.rows.map((row: ImportParsedRow) => (
                      <tr
                        key={row.rowIndex}
                        className={cn(
                          'hover:bg-muted/30 transition-colors',
                          row.isDuplicate && !selected.has(row.rowIndex) ? 'opacity-50' : '',
                        )}
                        onClick={() => toggleRow(row.rowIndex)}
                      >
                        <td className="p-2 text-center" onClick={(e) => e.stopPropagation()}>
                          <Checkbox
                            checked={selected.has(row.rowIndex)}
                            onCheckedChange={() => toggleRow(row.rowIndex)}
                          />
                        </td>
                        <td className="p-2 whitespace-nowrap text-muted-foreground">
                          {new Date(row.date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
                        </td>
                        <td className="p-2 max-w-[180px]">
                          <span className="line-clamp-1">{row.description}</span>
                          {row.isDuplicate && (
                            <span className="text-xs text-amber-600 dark:text-amber-400 block">(possible duplicate)</span>
                          )}
                        </td>
                        <td className="p-2 min-w-[140px]" onClick={(e) => e.stopPropagation()}>
                          <Select
                            value={rowCategories[row.rowIndex] ?? NO_CATEGORY}
                            onValueChange={(v) => setRowCategory(row.rowIndex, v)}
                          >
                            <SelectTrigger className="h-7 text-xs">
                              <SelectValue placeholder="Unassigned">
                                {rowCategories[row.rowIndex]
                                  ? <span className="flex items-center gap-1">
                                      {row.suggestedCategoryId === rowCategories[row.rowIndex] && (
                                        <Sparkles className="h-3 w-3 text-blue-500 shrink-0" />
                                      )}
                                      {allCategories.find((c) => c.id === rowCategories[row.rowIndex])?.name ?? 'Unassigned'}
                                    </span>
                                  : 'Unassigned'
                                }
                              </SelectValue>
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value={NO_CATEGORY}>Unassigned</SelectItem>
                              {allCategories.map((c) => (
                                <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </td>
                        <td className={cn(
                          'p-2 text-right font-mono font-medium whitespace-nowrap',
                          (rowTypes[row.rowIndex] ?? row.type) === 'INCOME' ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400',
                        )}>
                          {(rowTypes[row.rowIndex] ?? row.type) === 'INCOME' ? '+' : '-'}{formatCurrency(row.amount, 'INR')}
                        </td>
                        <td className="p-2 text-center" onClick={(e) => e.stopPropagation()}>
                          <button
                            onClick={() => toggleType(row.rowIndex)}
                            title="Click to toggle Income / Expense"
                            className={cn(
                              'inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ring-1 ring-inset transition-colors cursor-pointer',
                              (rowTypes[row.rowIndex] ?? row.type) === 'INCOME'
                                ? 'bg-green-50 text-green-700 ring-green-600/20 dark:bg-green-900/20 dark:text-green-400 dark:ring-green-500/30'
                                : 'bg-red-50 text-red-700 ring-red-600/20 dark:bg-red-900/20 dark:text-red-400 dark:ring-red-500/30',
                            )}
                          >
                            {(rowTypes[row.rowIndex] ?? row.type) === 'INCOME' ? '↑ Income' : '↓ Expense'}
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {confirmMutation.isError && (
                <div className="flex items-center gap-2 text-sm text-destructive bg-destructive/10 rounded p-3">
                  <AlertTriangle className="h-4 w-4 shrink-0" />
                  {(confirmMutation.error as Error)?.message ?? 'Import failed'}
                </div>
              )}
            </div>
          )}

          {/* ── Step 3: Done ── */}
          {step === 'done' && doneResult && (
            <div className="flex flex-col items-center justify-center py-12 gap-4 text-center">
              <CheckCircle2 className="h-16 w-16 text-green-500" />
              <h3 className="text-xl font-semibold">Import Complete!</h3>
              <div className="space-y-1 text-muted-foreground">
                <p>
                  <span className="text-foreground font-semibold text-lg">{doneResult.imported}</span> transaction
                  {doneResult.imported !== 1 ? 's' : ''} imported
                </p>
                {doneResult.duplicatesSkipped > 0 && (
                  <p>{doneResult.duplicatesSkipped} duplicate{doneResult.duplicatesSkipped !== 1 ? 's' : ''} skipped</p>
                )}
                {doneResult.skipped > 0 && (
                  <p>{doneResult.skipped} row{doneResult.skipped !== 1 ? 's' : ''} deselected</p>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <DialogFooter className="shrink-0 border-t pt-4">
          {step === 'upload' && (
            <>
              <Button variant="outline" onClick={handleClose}>Cancel</Button>
              <Button onClick={handleParse} disabled={!file || previewMutation.isPending}>
                {previewMutation.isPending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                {previewMutation.isPending ? 'Analysing...' : 'Parse File'}
              </Button>
            </>
          )}
          {step === 'preview' && (
            <>
              <Button variant="outline" onClick={() => setStep('upload')}>Back</Button>
              <Button
                onClick={handleConfirm}
                disabled={selected.size === 0 || confirmMutation.isPending}
              >
                {confirmMutation.isPending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                {confirmMutation.isPending
                  ? 'Importing...'
                  : `Import ${selected.size} Transaction${selected.size !== 1 ? 's' : ''}`}
              </Button>
            </>
          )}
          {step === 'done' && (
            <>
              <Button variant="outline" onClick={resetWizard}>Import Another</Button>
              <Button onClick={handleClose}>Done</Button>
            </>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
