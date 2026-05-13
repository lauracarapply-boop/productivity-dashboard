import { Sparkles, AlertTriangle, Lightbulb, ArrowRight } from 'lucide-react'
import { cn } from '@/lib/utils'

type CardType = 'recommendation' | 'warning' | 'insight'

interface Props {
  title?: string
  recommendation: string
  actionLabel?: string
  onAction?: () => void
  type?: CardType
  className?: string
}

const typeConfig: Record<CardType, {
  containerClass: string
  borderClass: string
  iconBg: string
  Icon: React.ElementType
  iconColor: string
  titleColor: string
  textColor: string
  buttonClass: string
  badgeClass: string
}> = {
  recommendation: {
    containerClass: 'bg-gradient-to-br from-indigo-50 to-violet-50',
    borderClass:    'border-indigo-200/60',
    iconBg:         'bg-indigo-100',
    Icon:           Sparkles,
    iconColor:      'text-indigo-600',
    titleColor:     'text-indigo-800',
    textColor:      'text-indigo-700',
    buttonClass:    'bg-indigo-600 hover:bg-indigo-700 text-white',
    badgeClass:     'bg-indigo-100 text-indigo-600',
  },
  warning: {
    containerClass: 'bg-amber-50',
    borderClass:    'border-amber-200',
    iconBg:         'bg-amber-100',
    Icon:           AlertTriangle,
    iconColor:      'text-amber-600',
    titleColor:     'text-amber-800',
    textColor:      'text-amber-700',
    buttonClass:    'bg-amber-600 hover:bg-amber-700 text-white',
    badgeClass:     'bg-amber-100 text-amber-600',
  },
  insight: {
    containerClass: 'bg-emerald-50',
    borderClass:    'border-emerald-200',
    iconBg:         'bg-emerald-100',
    Icon:           Lightbulb,
    iconColor:      'text-emerald-600',
    titleColor:     'text-emerald-800',
    textColor:      'text-emerald-700',
    buttonClass:    'bg-emerald-600 hover:bg-emerald-700 text-white',
    badgeClass:     'bg-emerald-100 text-emerald-600',
  },
}

export default function AIRecommendationCard({
  title,
  recommendation,
  actionLabel,
  onAction,
  type = 'recommendation',
  className,
}: Props) {
  const config = typeConfig[type]
  const { Icon } = config

  return (
    <div
      className={cn(
        'relative rounded-xl border p-4 overflow-hidden transition-all duration-200 hover:shadow-sm',
        config.containerClass,
        config.borderClass,
        className,
      )}
    >
      {/* Header */}
      <div className="flex items-start gap-3 mb-3">
        <div className={cn('w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0', config.iconBg)}>
          <Icon size={16} className={config.iconColor} />
        </div>

        <div className="flex-1 min-w-0 pt-0.5">
          {/* AI badge */}
          <span className={cn('ai-badge inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full mb-1', config.badgeClass)}>
            <Sparkles size={9} />
            AI
          </span>

          {title && (
            <h4 className={cn('text-sm font-semibold leading-tight', config.titleColor)}>
              {title}
            </h4>
          )}
        </div>
      </div>

      {/* Recommendation text */}
      <p className={cn('text-sm leading-relaxed', config.textColor)}>{recommendation}</p>

      {/* Action button */}
      {actionLabel && onAction && (
        <button
          onClick={onAction}
          className={cn(
            'mt-3 flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg transition-all duration-200',
            config.buttonClass,
          )}
        >
          {actionLabel}
          <ArrowRight size={12} />
        </button>
      )}
    </div>
  )
}
