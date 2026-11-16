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
import type { StockReference } from '@/data/indian-stocks'

interface Props {
  data: StockReference[]
  title: string
}

function formatNum(n: number, currency: 'INR' | 'USD'): string {
  return currency === 'USD'
    ? `$${n.toLocaleString('en-US')}`
    : `${n.toLocaleString('en-IN')}`
}

function pbColor(pb: number): string {
  if (pb < 1) return 'text-green-600 dark:text-green-400'
  if (pb <= 2) return 'text-yellow-600 dark:text-yellow-400'
  return 'text-red-600 dark:text-red-400'
}

function roeColor(roe: number): string {
  if (roe >= 15) return 'text-green-600 dark:text-green-400'
  if (roe >= 10) return 'text-yellow-600 dark:text-yellow-400'
  return 'text-red-600 dark:text-red-400'
}

const ALL_SECTORS = '__all__'

export function StockReferenceTable({ data, title }: Props) {
  const navigate = useNavigate()
  const [search, setSearch] = useState('')
  const [sectorFilter, setSectorFilter] = useState(ALL_SECTORS)

  const sectors = useMemo(
    () => [...new Set(data.map((s) => s.sector))].sort(),
    [data],
  )

  const filtered = useMemo(() => {
    let list = data
    if (search) {
      const q = search.toLowerCase()
      list = list.filter((s) => s.name.toLowerCase().includes(q) || s.symbol.toLowerCase().includes(q))
    }
    if (sectorFilter !== ALL_SECTORS) {
      list = list.filter((s) => s.sector === sectorFilter)
    }
    return list
  }, [data, search, sectorFilter])

  function handleAddToPortfolio(stock: StockReference) {
    const type = 'EQUITY'
    const params = new URLSearchParams({
      prefill: '1',
      name: stock.name,
      type,
      value: String(stock.priceApprox),
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
            placeholder="Search by name or symbol..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
        <Select value={sectorFilter} onValueChange={setSectorFilter}>
          <SelectTrigger className="w-44">
            <SelectValue placeholder="All Sectors" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={ALL_SECTORS}>All Sectors</SelectItem>
            {sectors.map((s) => (
              <SelectItem key={s} value={s}>{s}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <p className="text-xs text-muted-foreground">
        Approximate data for educational purposes. Values are indicative and may differ from live prices.
      </p>

      <div className="border rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-muted/50">
              <tr>
                <th className="p-2 text-left font-medium text-muted-foreground">Stock</th>
                <th className="p-2 text-left font-medium text-muted-foreground">Sector</th>
                <th className="p-2 text-right font-medium text-muted-foreground">Price</th>
                <th className="p-2 text-right font-medium text-muted-foreground">Book Value</th>
                <th className="p-2 text-right font-medium text-muted-foreground">P/B</th>
                <th className="p-2 text-right font-medium text-muted-foreground">P/E</th>
                <th className="p-2 text-right font-medium text-muted-foreground">ROE %</th>
                <th className="p-2 text-right font-medium text-muted-foreground">Mkt Cap</th>
                <th className="p-2 w-8"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filtered.map((stock) => (
                <tr key={stock.symbol} className="hover:bg-muted/30 transition-colors">
                  <td className="p-2">
                    <div className="font-medium">{stock.name}</div>
                    <Badge variant="outline" className="text-xs mt-0.5">{stock.symbol}</Badge>
                  </td>
                  <td className="p-2 text-muted-foreground whitespace-nowrap">{stock.sector}</td>
                  <td className="p-2 text-right font-mono">{formatNum(stock.priceApprox, stock.currency)}</td>
                  <td className="p-2 text-right font-mono">{formatNum(stock.bookValuePerShare, stock.currency)}</td>
                  <td className={cn('p-2 text-right font-mono font-medium', pbColor(stock.pb))}>{stock.pb.toFixed(1)}</td>
                  <td className="p-2 text-right font-mono">{stock.pe.toFixed(1)}</td>
                  <td className={cn('p-2 text-right font-mono font-medium', roeColor(stock.roe))}>{stock.roe}%</td>
                  <td className="p-2 text-right text-muted-foreground whitespace-nowrap text-xs">
                    {stock.currency === 'USD'
                      ? `$${(stock.marketCapBillionINR / 1000).toFixed(0)}T`
                      : `${(stock.marketCapBillionINR / 100).toFixed(0)}K Cr`
                    }
                  </td>
                  <td className="p-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-7 w-7 p-0"
                      title="Add to Portfolio"
                      onClick={() => handleAddToPortfolio(stock)}
                    >
                      <Plus className="h-3.5 w-3.5" />
                    </Button>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={9} className="p-8 text-center text-muted-foreground">
                    No stocks match your search.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
      <p className="text-xs text-muted-foreground text-right">{filtered.length} of {data.length} stocks shown</p>
    </div>
  )
}
