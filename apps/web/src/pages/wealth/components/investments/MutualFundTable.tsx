import { useState, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Search, Plus } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { MutualFundReference } from '@/data/mutual-funds'

interface Props {
  data: MutualFundReference[]
}

const ALL_CATEGORIES = '__all__'

const RISK_COLORS: Record<string, string> = {
  Low: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300',
  Moderate: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300',
  High: 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300',
  'Very High': 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300',
}

function returnColor(r: number): string {
  if (r >= 15) return 'text-green-600 dark:text-green-400'
  if (r >= 10) return 'text-yellow-600 dark:text-yellow-400'
  if (r >= 0) return 'text-muted-foreground'
  return 'text-red-600 dark:text-red-400'
}

export function MutualFundTable({ data }: Props) {
  const navigate = useNavigate()
  const [search, setSearch] = useState('')
  const [categoryFilter, setCategoryFilter] = useState(ALL_CATEGORIES)

  const categories = useMemo(
    () => [...new Set(data.map((f) => f.category))].sort(),
    [data],
  )

  const filtered = useMemo(() => {
    let list = data
    if (search) {
      const q = search.toLowerCase()
      list = list.filter((f) => f.name.toLowerCase().includes(q) || f.amc.toLowerCase().includes(q))
    }
    if (categoryFilter !== ALL_CATEGORIES) {
      list = list.filter((f) => f.category === categoryFilter)
    }
    return list
  }, [data, search, categoryFilter])

  function handleAddToPortfolio(fund: MutualFundReference) {
    const params = new URLSearchParams({
      prefill: '1',
      name: fund.name,
      type: 'MUTUAL_FUND',
      value: '10000',
      quantity: '1',
    })
    navigate(`/wealth/assets?${params.toString()}`)
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <div className="relative flex-1 max-w-xs">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search by name or AMC..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
        <Select value={categoryFilter} onValueChange={setCategoryFilter}>
          <SelectTrigger className="w-44">
            <SelectValue placeholder="All Categories" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={ALL_CATEGORIES}>All Categories</SelectItem>
            {categories.map((c) => (
              <SelectItem key={c} value={c}>{c}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <p className="text-xs text-muted-foreground">
        Approximate returns (CAGR) for educational purposes. Past performance does not guarantee future returns.
      </p>

      <div className="border rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-muted/50">
              <tr>
                <th className="p-2 text-left font-medium text-muted-foreground">Fund Name</th>
                <th className="p-2 text-left font-medium text-muted-foreground">Category</th>
                <th className="p-2 text-right font-medium text-muted-foreground">1Y</th>
                <th className="p-2 text-right font-medium text-muted-foreground">3Y</th>
                <th className="p-2 text-right font-medium text-muted-foreground">5Y</th>
                <th className="p-2 text-right font-medium text-muted-foreground">Expense %</th>
                <th className="p-2 text-right font-medium text-muted-foreground">AUM</th>
                <th className="p-2 text-center font-medium text-muted-foreground">Risk</th>
                <th className="p-2 w-8"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filtered.map((fund, i) => (
                <tr key={i} className="hover:bg-muted/30 transition-colors">
                  <td className="p-2">
                    <div className="font-medium">{fund.name}</div>
                    <span className="text-xs text-muted-foreground">{fund.amc}</span>
                  </td>
                  <td className="p-2 whitespace-nowrap">
                    <Badge variant="outline" className="text-xs">{fund.category}</Badge>
                  </td>
                  <td className={cn('p-2 text-right font-mono font-medium', returnColor(fund.return1Y))}>{fund.return1Y}%</td>
                  <td className={cn('p-2 text-right font-mono font-medium', returnColor(fund.return3Y))}>{fund.return3Y}%</td>
                  <td className={cn('p-2 text-right font-mono font-medium', returnColor(fund.return5Y))}>{fund.return5Y}%</td>
                  <td className="p-2 text-right font-mono text-muted-foreground">{fund.expenseRatio}%</td>
                  <td className="p-2 text-right text-muted-foreground whitespace-nowrap text-xs">{fund.aumBillionINR} Bn</td>
                  <td className="p-2 text-center">
                    <span className={cn('inline-block px-2 py-0.5 rounded text-xs font-medium', RISK_COLORS[fund.riskLevel] ?? '')}>
                      {fund.riskLevel}
                    </span>
                  </td>
                  <td className="p-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-7 w-7 p-0"
                      title="Add to Portfolio"
                      onClick={() => handleAddToPortfolio(fund)}
                    >
                      <Plus className="h-3.5 w-3.5" />
                    </Button>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={9} className="p-8 text-center text-muted-foreground">
                    No funds match your search.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
      <p className="text-xs text-muted-foreground text-right">{filtered.length} of {data.length} funds shown</p>
    </div>
  )
}
