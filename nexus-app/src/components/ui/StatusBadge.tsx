import { cn } from '@/lib/utils'

const statusStyles: Record<string, string> = {
  todo:                   'bg-slate-100 text-slate-600',
  in_progress:            'bg-blue-50 text-blue-700',
  done:                   'bg-emerald-50 text-emerald-700',
  overdue:                'bg-red-50 text-red-700',
  pending:                'bg-amber-50 text-amber-700',
  approved:               'bg-emerald-50 text-emerald-700',
  rejected:               'bg-red-50 text-red-700',
  active:                 'bg-blue-50 text-blue-700',
  paused:                 'bg-slate-100 text-slate-500',
  completed:              'bg-emerald-50 text-emerald-700',
  planning:               'bg-violet-50 text-violet-700',
  saved:                  'bg-slate-100 text-slate-600',
  applying:               'bg-blue-50 text-blue-700',
  submitted:              'bg-violet-50 text-violet-700',
  interview:              'bg-amber-50 text-amber-700',
  accepted:               'bg-emerald-50 text-emerald-700',
  rejected_opp:           'bg-red-50 text-red-700',
  researching:            'bg-indigo-50 text-indigo-700',
  waiting_recommendation: 'bg-amber-50 text-amber-700',
  new:                    'bg-slate-100 text-slate-500',
  learning:               'bg-blue-50 text-blue-700',
  mastered:               'bg-emerald-50 text-emerald-700',
  indexed:                'bg-emerald-50 text-emerald-700',
  needs_review:           'bg-amber-50 text-amber-700',
  complete:               'bg-emerald-50 text-emerald-700',
  incomplete:             'bg-red-50 text-red-700',
  missing:                'bg-red-50 text-red-700',
  edited:                 'bg-violet-50 text-violet-700',
}

const statusLabels: Record<string, string> = {
  todo:                   'To Do',
  in_progress:            'In Progress',
  done:                   'Done',
  overdue:                'Overdue',
  pending:                'Pending',
  approved:               'Approved',
  rejected:               'Rejected',
  active:                 'Active',
  paused:                 'Paused',
  completed:              'Completed',
  planning:               'Planning',
  saved:                  'Saved',
  applying:               'Applying',
  submitted:              'Submitted',
  interview:              'Interview',
  accepted:               'Accepted',
  rejected_opp:           'Rejected',
  researching:            'Researching',
  waiting_recommendation: 'Waiting',
  new:                    'New',
  learning:               'Learning',
  mastered:               'Mastered',
  indexed:                'Indexed',
  needs_review:           'Needs Review',
  complete:               'Complete',
  incomplete:             'Incomplete',
  missing:                'Missing',
  edited:                 'Edited',
}

interface Props {
  status: string
  className?: string
}

export default function StatusBadge({ status, className }: Props) {
  return (
    <span
      className={cn(
        'inline-flex items-center text-xs px-2 py-0.5 rounded-full font-medium leading-none',
        statusStyles[status] ?? 'bg-slate-100 text-slate-600',
        className,
      )}
    >
      {statusLabels[status] ?? status}
    </span>
  )
}
