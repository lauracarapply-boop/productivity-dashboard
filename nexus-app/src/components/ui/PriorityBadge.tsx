import { cn } from '@/lib/utils'

const priorityConfig: Record<string, { label: string; dotColor: string; textColor: string; bgColor: string; borderColor: string }> = {
  urgent: {
    label:       'Urgent',
    dotColor:    'bg-red-500',
    textColor:   'text-red-700',
    bgColor:     'bg-red-50',
    borderColor: 'border-red-200',
  },
  high: {
    label:       'High',
    dotColor:    'bg-amber-500',
    textColor:   'text-amber-700',
    bgColor:     'bg-amber-50',
    borderColor: 'border-amber-200',
  },
  medium: {
    label:       'Medium',
    dotColor:    'bg-blue-400',
    textColor:   'text-blue-700',
    bgColor:     'bg-blue-50',
    borderColor: 'border-blue-200',
  },
  low: {
    label:       'Low',
    dotColor:    'bg-slate-400',
    textColor:   'text-slate-600',
    bgColor:     'bg-slate-100',
    borderColor: 'border-slate-200',
  },
}

interface Props {
  priority: string
  showLabel?: boolean
  className?: string
}

export default function PriorityBadge({ priority, showLabel = true, className }: Props) {
  const config = priorityConfig[priority] ?? {
    label:       priority,
    dotColor:    'bg-slate-400',
    textColor:   'text-slate-600',
    bgColor:     'bg-slate-100',
    borderColor: 'border-slate-200',
  }

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 text-xs px-2 py-0.5 rounded-full font-medium leading-none border',
        config.bgColor,
        config.textColor,
        config.borderColor,
        className,
      )}
    >
      <span className={cn('w-1.5 h-1.5 rounded-full flex-shrink-0', config.dotColor)} />
      {showLabel && <span>{config.label}</span>}
    </span>
  )
}
