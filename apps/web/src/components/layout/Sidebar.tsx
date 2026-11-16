import { NavLink } from 'react-router-dom'
import {
  LayoutDashboard, TrendingUp, Wallet, Settings,
  ChevronLeft, ChevronRight, BarChart3, Target,
  Package2, CreditCard, Shield, BarChart2,
  Flag, PieChart, ArrowUpCircle, ArrowDownCircle,
  Landmark, Info,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Tooltip, TooltipTrigger, TooltipContent } from '@/components/ui/tooltip'
import { useState } from 'react'
import type { LucideIcon } from 'lucide-react'

interface NavChild {
  label: string
  href: string
  icon: LucideIcon
  tooltip: string
}

interface NavItem {
  label: string
  href: string
  icon: LucideIcon
  children?: NavChild[]
}

const navItems: NavItem[] = [
  { label: 'Overview', href: '/overview', icon: LayoutDashboard },
  {
    label: 'Wealth',
    href: '/wealth',
    icon: TrendingUp,
    children: [
      {
        label: 'Assets',
        href: '/wealth/assets',
        icon: Package2,
        tooltip: 'Things you own with monetary value — property, stocks, gold, FDs, vehicles. Adding purchase price tracks gain/loss.',
      },
      {
        label: 'Liabilities',
        href: '/wealth/liabilities',
        icon: CreditCard,
        tooltip: 'Money you owe — home loan, car loan, credit card dues, personal loans. Track interest rates and minimum payments.',
      },
      {
        label: 'Insurance',
        href: '/wealth/insurance',
        icon: Shield,
        tooltip: 'Life, health & vehicle policies. Track sum insured, premiums, and renewal dates. Orange = due within 30 days.',
      },
      {
        label: 'Net Worth',
        href: '/wealth/networth',
        icon: BarChart2,
        tooltip: 'Net Worth = Total Assets − Total Liabilities. Take monthly snapshots to track your wealth growth over time.',
      },
    ],
  },
  {
    label: 'Plan',
    href: '/plan',
    icon: Target,
    children: [
      {
        label: 'Goals',
        href: '/plan/goals',
        icon: Flag,
        tooltip: 'Set financial targets with deadlines. Use the built-in inflation calculator to know how much you\'ll actually need.',
      },
      {
        label: 'Budget',
        href: '/plan/budget',
        icon: PieChart,
        tooltip: 'Set monthly or annual spending limits per category. Helps you plan ahead and avoid overspending.',
      },
    ],
  },
  {
    label: 'Money',
    href: '/money',
    icon: Wallet,
    children: [
      {
        label: 'Income',
        href: '/money/income',
        icon: ArrowUpCircle,
        tooltip: 'All inflows — salary, freelance, dividends, rental income, side hustles. Add categories for better insights.',
      },
      {
        label: 'Expenses',
        href: '/money/expenses',
        icon: ArrowDownCircle,
        tooltip: 'All outflows — bills, EMIs, groceries, shopping, subscriptions. Search and filter to spot spending patterns.',
      },
      {
        label: 'Accounts',
        href: '/money/accounts',
        icon: Landmark,
        tooltip: 'Bank accounts, investment accounts, wallets and cash. Update balances manually to keep your net worth accurate.',
      },
    ],
  },
  {
    label: 'Analytics',
    href: '/analytics',
    icon: BarChart3,
    children: [
      {
        label: 'Spending',
        href: '/analytics/spending',
        icon: PieChart,
        tooltip: 'Category-wise expense breakdown with pie chart. See where your money goes each month.',
      },
      {
        label: 'Trends',
        href: '/analytics/trends',
        icon: TrendingUp,
        tooltip: 'Income vs expense over time, savings rate percentage, and daily average spend trends.',
      },
      {
        label: 'Budget Analysis',
        href: '/analytics/budgets',
        icon: Target,
        tooltip: 'Compare budgeted amounts against actual spending. Track which budgets are on track or overspent.',
      },
      {
        label: 'Renewals',
        href: '/analytics/renewals',
        icon: Shield,
        tooltip: 'Upcoming insurance renewals sorted by urgency. Never miss a premium payment again.',
      },
    ],
  },
  { label: 'Settings', href: '/settings', icon: Settings },
]

export function Sidebar() {
  const [collapsed, setCollapsed] = useState(false)

  return (
    <aside
      className={cn(
        'relative flex h-screen flex-col border-r bg-card transition-all duration-300',
        collapsed ? 'w-16' : 'w-64',
      )}
    >
      {/* Logo */}
      <div className={cn('flex h-16 items-center border-b px-4', collapsed && 'justify-center')}>
        <BarChart3 className="h-6 w-6 text-primary shrink-0" />
        {!collapsed && (
          <span className="ml-2 text-lg font-bold tracking-tight">FinTracker</span>
        )}
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto py-4">
        {navItems.map((item) => (
          <div key={item.href}>
            <NavLink
              to={item.href}
              end={item.href === '/overview'}
              className={({ isActive }) =>
                cn(
                  'flex items-center gap-3 px-4 py-2.5 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground',
                  isActive && 'bg-primary/10 text-primary',
                  collapsed && 'justify-center px-2',
                )
              }
            >
              <item.icon className="h-5 w-5 shrink-0" />
              {!collapsed && <span>{item.label}</span>}
            </NavLink>

            {!collapsed && item.children?.map((child) => (
              <NavLink
                key={child.href}
                to={child.href}
                className={({ isActive }) =>
                  cn(
                    'group flex items-center gap-2.5 py-2 pl-10 pr-3 text-sm text-muted-foreground transition-colors hover:text-foreground',
                    isActive && 'text-primary font-medium',
                  )
                }
              >
                <child.icon className="h-4 w-4 shrink-0 opacity-70" />
                <span className="flex-1">{child.label}</span>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Info className="h-3.5 w-3.5 shrink-0 opacity-0 group-hover:opacity-60 transition-opacity cursor-help" />
                  </TooltipTrigger>
                  <TooltipContent side="right" className="max-w-[220px] text-xs leading-relaxed">
                    {child.tooltip}
                  </TooltipContent>
                </Tooltip>
              </NavLink>
            ))}
          </div>
        ))}
      </nav>

      {/* Collapse button */}
      <Button
        variant="ghost"
        size="icon"
        className="absolute -right-3 top-20 h-6 w-6 rounded-full border bg-background shadow-sm"
        onClick={() => setCollapsed(!collapsed)}
      >
        {collapsed ? <ChevronRight className="h-3 w-3" /> : <ChevronLeft className="h-3 w-3" />}
      </Button>
    </aside>
  )
}
