import { useState } from 'react'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { ChevronDown, ChevronUp } from 'lucide-react'
import { cn } from '@/lib/utils'

interface Props {
  title: string
  description: string
  icon: React.ReactNode
  defaultOpen?: boolean
  children: React.ReactNode
  className?: string
}

export function CollapsibleCalculator({ title, description, icon, defaultOpen = false, children, className }: Props) {
  const [open, setOpen] = useState(defaultOpen)

  return (
    <Card className={cn(className)}>
      <CardHeader
        className="pb-2 cursor-pointer select-none"
        onClick={() => setOpen((v) => !v)}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {icon}
            <CardTitle className="text-base">{title}</CardTitle>
          </div>
          {open ? <ChevronUp className="h-4 w-4 text-muted-foreground" /> : <ChevronDown className="h-4 w-4 text-muted-foreground" />}
        </div>
        {!open && (
          <p className="text-sm text-muted-foreground mt-1">
            {description} — click to expand.
          </p>
        )}
      </CardHeader>
      {open && (
        <CardContent className="space-y-4 pt-0">
          {children}
        </CardContent>
      )}
    </Card>
  )
}
