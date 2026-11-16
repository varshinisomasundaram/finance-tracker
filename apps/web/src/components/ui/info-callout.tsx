import { Info } from 'lucide-react'
import { cn } from '@/lib/utils'

interface InfoCalloutProps {
  title: string
  description: string
  examples?: string[]
  className?: string
}

export function InfoCallout({ title, description, examples, className }: InfoCalloutProps) {
  return (
    <div className={cn(
      'flex gap-3 rounded-lg border border-blue-100 bg-blue-50/60 px-4 py-3 text-sm',
      className,
    )}>
      <Info className="h-4 w-4 text-blue-500 shrink-0 mt-0.5" />
      <div className="space-y-1">
        <p className="font-medium text-blue-900">{title}</p>
        <p className="text-blue-700/80">{description}</p>
        {examples && examples.length > 0 && (
          <p className="text-blue-600/70 text-xs">
            <span className="font-medium">e.g.</span> {examples.join(' · ')}
          </p>
        )}
      </div>
    </div>
  )
}
