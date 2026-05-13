'use client'

import { useState } from 'react'
import { Check, Clock, Pencil, Trash2, ChevronDown, ChevronRight, Zap, CalendarDays, Scissors } from 'lucide-react'
import type { Task } from '@/lib/types'
import { cn, formatDuration, getDueDateLabel, getDueDateColor } from '@/lib/utils'
import PriorityBadge from './PriorityBadge'
import StatusBadge from './StatusBadge'

interface Props {
  task: Task
  onComplete?: (id: string) => void
  onEdit?: (task: Task) => void
  onDelete?: (id: string) => void
  compact?: boolean
  className?: string
}

const energyConfig = {
  high:   { label: 'High energy',   dotClass: 'energy-high',   color: 'text-red-500'     },
  medium: { label: 'Medium energy', dotClass: 'energy-medium', color: 'text-amber-500'   },
  low:    { label: 'Low energy',    dotClass: 'energy-low',    color: 'text-emerald-500' },
}

export default function TaskCard({
  task,
  onComplete,
  onEdit,
  onDelete,
  compact = false,
  className,
}: Props) {
  const [showSubtasks, setShowSubtasks] = useState(false)
  const isDone = task.status === 'done'
  const isOverdue = task.status === 'overdue'
  const dueDateColor = task.due_date ? getDueDateColor(task.due_date) : 'text-slate-400'
  const dueDateLabel = task.due_date ? getDueDateLabel(task.due_date) : null
  const energy = task.energy_level ? energyConfig[task.energy_level] : null
  const completedSubtasks = task.subtasks.filter(s => s.completed).length

  return (
    <div
      className={cn(
        'group bg-white border border-black/[0.07] rounded-xl transition-all duration-150',
        'hover:shadow-md hover:border-indigo-200/60',
        isDone && 'opacity-60',
        isOverdue && 'border-l-2 border-l-red-400',
        compact ? 'p-3' : 'p-4',
        className,
      )}
    >
      <div className="flex items-start gap-3">
        {/* Checkbox */}
        <button
          onClick={() => onComplete?.(task.id)}
          className={cn(
            'flex-shrink-0 w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all duration-150 mt-0.5',
            isDone
              ? 'bg-emerald-500 border-emerald-500 text-white'
              : 'border-slate-300 hover:border-indigo-400 hover:bg-indigo-50',
          )}
          aria-label={isDone ? 'Mark incomplete' : 'Mark complete'}
        >
          {isDone && <Check size={11} strokeWidth={3} />}
        </button>

        {/* Content */}
        <div className="flex-1 min-w-0">
          {/* Title */}
          <p
            className={cn(
              'text-sm font-medium leading-snug',
              isDone
                ? 'line-through text-slate-400'
                : 'text-slate-800 group-hover:text-slate-900',
            )}
          >
            {task.title}
          </p>

          {/* Meta row */}
          {!compact && (
            <div className="flex flex-wrap items-center gap-2 mt-2">
              {/* Priority */}
              <PriorityBadge priority={task.priority} />

              {/* Status */}
              {!isDone && <StatusBadge status={task.status} />}

              {/* Due date */}
              {dueDateLabel && (
                <span className={cn('text-xs font-medium', dueDateColor)}>
                  {dueDateLabel}
                </span>
              )}

              {/* Duration */}
              {task.estimated_minutes && (
                <span className="flex items-center gap-1 text-xs text-slate-400">
                  <Clock size={11} />
                  {formatDuration(task.estimated_minutes)}
                </span>
              )}

              {/* Energy */}
              {energy && (
                <span className={cn('flex items-center gap-1 text-xs', energy.color)}>
                  <span className={cn('w-1.5 h-1.5 rounded-full', energy.dotClass)} />
                  <Zap size={10} />
                </span>
              )}
            </div>
          )}

          {compact && dueDateLabel && (
            <p className={cn('text-xs mt-1', dueDateColor)}>{dueDateLabel}</p>
          )}

          {/* Subtasks */}
          {!compact && task.subtasks.length > 0 && (
            <div className="mt-2.5">
              <button
                onClick={() => setShowSubtasks(v => !v)}
                className="flex items-center gap-1.5 text-xs text-slate-400 hover:text-slate-600 transition-colors"
              >
                {showSubtasks ? (
                  <ChevronDown size={12} />
                ) : (
                  <ChevronRight size={12} />
                )}
                <span>
                  {completedSubtasks}/{task.subtasks.length} subtasks
                </span>
              </button>

              {showSubtasks && (
                <div className="mt-2 space-y-1.5 pl-2 border-l border-slate-200">
                  {task.subtasks.map(sub => (
                    <div key={sub.id} className="flex items-center gap-2">
                      <div
                        className={cn(
                          'w-3.5 h-3.5 rounded border flex items-center justify-center flex-shrink-0',
                          sub.completed
                            ? 'bg-emerald-100 border-emerald-300 text-emerald-600'
                            : 'border-slate-300',
                        )}
                      >
                        {sub.completed && <Check size={9} strokeWidth={3} />}
                      </div>
                      <span
                        className={cn(
                          'text-xs',
                          sub.completed
                            ? 'line-through text-slate-400'
                            : 'text-slate-600',
                        )}
                      >
                        {sub.title}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Hover micro-actions */}
          {!compact && (
            <div className="flex items-center gap-1 mt-2.5 opacity-0 group-hover:opacity-100 transition-opacity duration-150">
              <button className="flex items-center gap-1 text-[11px] text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 px-2 py-1 rounded-md transition-colors">
                <CalendarDays size={11} />
                Schedule
              </button>
              <button className="flex items-center gap-1 text-[11px] text-slate-400 hover:text-violet-600 hover:bg-violet-50 px-2 py-1 rounded-md transition-colors">
                <Scissors size={11} />
                Break down
              </button>
              {onEdit && (
                <button
                  onClick={() => onEdit(task)}
                  className="flex items-center gap-1 text-[11px] text-slate-400 hover:text-slate-700 hover:bg-slate-100 px-2 py-1 rounded-md transition-colors"
                >
                  <Pencil size={11} />
                  Edit
                </button>
              )}
            </div>
          )}
        </div>

        {/* Delete button (visible on hover, compact mode or non-compact) */}
        {onDelete && (
          <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-150 flex-shrink-0">
            <button
              onClick={() => onDelete(task.id)}
              className="p-1.5 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-md transition-colors"
              aria-label="Delete task"
            >
              <Trash2 size={13} />
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
