import { Bell, LogOut, Moon, Sun, User, Info, RefreshCw } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'
import { useAuthStore } from '@/store/authStore'
import { useLogout } from '@/hooks/useAuth'
import { getInitials } from '@/lib/utils'
import { useThemeStore } from '@/store/themeStore'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { usersService } from '@/services/users.service'
import { useExchangeRates, formatRelativeTime } from '@/hooks/useExchangeRates'

const CURRENCIES = [
  { code: 'INR', label: '₹ INR' },
  { code: 'USD', label: '$ USD' },
  { code: 'EUR', label: '€ EUR' },
  { code: 'GBP', label: '£ GBP' },
  { code: 'JPY', label: '¥ JPY' },
  { code: 'AUD', label: '$ AUD' },
  { code: 'SGD', label: '$ SGD' },
  { code: 'AED', label: 'د.إ AED' },
]

export function Header() {
  const user = useAuthStore((s) => s.user)
  const updateUser = useAuthStore((s) => s.updateUser)
  const logout = useLogout()
  const { theme, toggleTheme } = useThemeStore()
  const queryClient = useQueryClient()
  const { rate, fetchedAt, isLoading: ratesLoading, isError: ratesError, displayCurrency } = useExchangeRates()

  const currencyMutation = useMutation({
    mutationFn: (currency: string) => usersService.updateMe({ currency }),
    onSuccess: (data) => {
      updateUser({ currency: data.currency })
      // Trigger a fresh rate fetch when currency changes
      queryClient.invalidateQueries({ queryKey: ['exchange-rates'] })
    },
  })

  return (
    <header className="flex h-16 items-center justify-between border-b bg-card px-6">
      <div className="flex items-center gap-2">
        <span className="text-sm text-muted-foreground">
          {new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
        </span>
      </div>

      <div className="flex items-center gap-3">
        {/* Currency selector + rate info */}
        <div className="flex items-center gap-1.5">
          <select
            value={user?.currency ?? 'INR'}
            onChange={(e) => currencyMutation.mutate(e.target.value)}
            disabled={currencyMutation.isPending}
            className="h-9 rounded-md border border-input bg-background px-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring disabled:opacity-50"
            title="Select currency"
          >
            {CURRENCIES.map((c) => (
              <option key={c.code} value={c.code}>{c.label}</option>
            ))}
          </select>

          {/* Rate info icon — only shown when currency ≠ INR */}
          {displayCurrency !== 'INR' && (
            <Tooltip>
              <TooltipTrigger asChild>
                <button className="flex items-center text-muted-foreground hover:text-foreground transition-colors">
                  {ratesLoading ? (
                    <RefreshCw className="h-4 w-4 animate-spin" />
                  ) : (
                    <Info className="h-4 w-4" />
                  )}
                </button>
              </TooltipTrigger>
              <TooltipContent side="bottom" className="max-w-[220px] space-y-1 text-xs">
                {ratesError ? (
                  <p className="text-destructive">Failed to load exchange rates. Showing INR values.</p>
                ) : rate !== null ? (
                  <>
                    <p className="font-semibold">1 INR = {rate.toFixed(6)} {displayCurrency}</p>
                    <p className="text-muted-foreground">
                      {fetchedAt ? `Rates updated ${formatRelativeTime(fetchedAt)}` : 'Fetching rates…'}
                    </p>
                    <p className="text-muted-foreground/70">Source: open.er-api.com · Updates daily</p>
                  </>
                ) : (
                  <p>Fetching live rates…</p>
                )}
              </TooltipContent>
            </Tooltip>
          )}
        </div>

        {/* Dark / Light mode toggle */}
        <Button
          variant="ghost"
          size="icon"
          onClick={toggleTheme}
          title={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
        >
          {theme === 'dark' ? (
            <Sun className="h-5 w-5 text-yellow-400" />
          ) : (
            <Moon className="h-5 w-5" />
          )}
        </Button>

        <Button variant="ghost" size="icon">
          <Bell className="h-5 w-5" />
        </Button>

        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-xs font-semibold text-primary-foreground">
            {user ? getInitials(user.name) : <User className="h-4 w-4" />}
          </div>
          <div className="hidden md:block">
            <p className="text-sm font-medium leading-none">{user?.name}</p>
            <p className="text-xs text-muted-foreground">{user?.email}</p>
          </div>
        </div>

        <Button
          variant="ghost"
          size="icon"
          onClick={() => logout.mutate()}
          disabled={logout.isPending}
          title="Logout"
        >
          <LogOut className="h-5 w-5" />
        </Button>
      </div>
    </header>
  )
}
