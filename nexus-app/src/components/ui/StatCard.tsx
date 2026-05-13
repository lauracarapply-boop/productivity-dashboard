import { cn } from '@/lib/utils'
import type { LucideIcon } from 'lucide-react'
import { TrendingUp, TrendingDown, Minus } from 'lucide-react'

type Color = 'indigo' | 'violet' | 'emerald' | 'amber' | 'red' | 'blue' | 'slate'
type Trend = 'up' | 'down' | 'neutral'

interface Props {
  label: string
  value: string | number
  subtext?: string
  icon?: LucideIcon
  color?: Color
  trend?: Trend
  className?: string
}

const colorMap: Record<Color, { icon: string; iconBg: string }> = {
  indigo:  { icon: 'text-indigo-600',  iconBg: 'bg-indigo-50'  },
  violet:  { icon: 'text-violet-600',  iconBg: 'bg-violet-50'  },
  emerald: { icon: 'text-emerald-600', iconBg: 'bg-emerald-50' },
  amber:   { icon: 'text-amber-600',   iconBg: 'bg-amber-50'   },
  red:     { icon: 'text-red-600',     iconBg: 'bg-red-50'     },
  blue:    { icon: 'text-blue-600',    iconBg: 'bg-blue-50'    },
  slate:   { icon: 'text-slate-600',   iconBg: 'bg-slate-100'  },
}

const trendConfig: Record<Trend, { Icon: LucideIcon; color: string; label: string }> = {
  up:      { Icon: TrendingUp,   color: 'text-emerald-600', label: 'Increasing' },
  down:    { Icon: TrendingDown, color: 'text-red-600',     label: 'Decreasing' },
  neutral: { Icon: Minus,        color: 'text-slate-400',   label: 'Stable'     },
}

export default function StatCard({
  label,
  value,
  subtext,
  icon: Icon,
  color = 'indigo',
  trend,
  className,
}: Props) {
  const colors = colorMap[color]

  return (
    <div
      className={cn(
        'bg-white border border-black/[0.07] rounded-2xl p-5 flex flex-col gap-3 transition-all duration-200 hover:shadow-md',
        'shadow-[var(--shadow-card,0_1px_3px_rgba(0,0,0,0.06))]',
        className,
      )}
    >
      <div className="flex items-start justify-between">
        {Icon && (
          <div className={cn('w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0', colors.iconBg)}>
            <Icon size={18} className={colors.icon} />
          </div>
        )}
        {trend && (
          <div className={cn('flex items-center gap-1 text-xs font-medium', trendConfig[trend].color)}>
            {(() => {
              const { Icon: TrendIcon } = trendConfig[trend]
              return <TrendIcon size={14} aria-label={trendConfig[trend].label} />
            })()}
          </div>
        )}
      </div>

      <div>
        <div className="text-2xl font-bold text-slate-900 leading-none tracking-tight">
          {value}
        </div>
        <div className="text-sm font-medium text-slate-500 mt-1">{label}</div>
        {subtext && (
          <div className="text-xs text-slate-400 mt-0.5">{subtext}</div>
        )}
      </div>
    </div>
  )
}
