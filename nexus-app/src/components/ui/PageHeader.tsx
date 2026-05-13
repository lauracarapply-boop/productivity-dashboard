import { cn } from '@/lib/utils'
import type { LucideIcon } from 'lucide-react'

interface PageHeaderProps {
  title: string
  subtitle?: string
  icon?: LucideIcon
  iconColor?: string
  action?: React.ReactNode
  secondaryAction?: React.ReactNode
  className?: string
}

export default function PageHeader({
  title,
  subtitle,
  icon: Icon,
  iconColor = 'text-indigo-600',
  action,
  secondaryAction,
  className,
}: PageHeaderProps) {
  return (
    <div className={cn('flex items-start justify-between gap-4 mb-6', className)}>
      <div className="flex items-center gap-4">
        {Icon && (
          <div className="w-10 h-10 rounded-xl bg-indigo-50 flex items-center justify-center flex-shrink-0 border border-indigo-100">
            <Icon size={20} className={iconColor} />
          </div>
        )}
        <div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight">{title}</h1>
          {subtitle && (
            <p className="text-sm text-slate-500 mt-0.5">{subtitle}</p>
          )}
        </div>
      </div>
      {(action || secondaryAction) && (
        <div className="flex items-center gap-2 flex-shrink-0">
          {secondaryAction}
          {action}
        </div>
      )}
    </div>
  )
}
