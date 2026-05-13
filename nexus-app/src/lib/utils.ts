import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

// ── Class name utility ────────────────────────────────────────
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// ── Date helpers ─────────────────────────────────────────────

function toDate(date: string | Date): Date {
  return typeof date === 'string' ? new Date(date) : date
}

/**
 * Formats a date as "May 12"
 */
export function formatDate(date: string | Date): string {
  return toDate(date).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
  })
}

/**
 * Formats a date as "May 12, 2:00 PM"
 */
export function formatDateTime(date: string | Date): string {
  return toDate(date).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  })
}

/**
 * Formats a time as "2:00 PM"
 */
export function formatTime(date: string | Date): string {
  return toDate(date).toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  })
}

/**
 * Returns true if the date falls on today (calendar day)
 */
export function isToday(date: string | Date): boolean {
  const d = toDate(date)
  const now = new Date()
  return (
    d.getFullYear() === now.getFullYear() &&
    d.getMonth() === now.getMonth() &&
    d.getDate() === now.getDate()
  )
}

/**
 * Returns true if the date is strictly in the past (before start of today)
 */
export function isPast(date: string | Date): boolean {
  const d = toDate(date)
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  return d < today
}

/**
 * Returns the number of whole calendar days until the date.
 * Negative if the date is in the past.
 */
export function daysUntil(date: string | Date): number {
  const d = toDate(date)
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  d.setHours(0, 0, 0, 0)
  return Math.round((d.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))
}

// ── Color utilities ───────────────────────────────────────────

/**
 * Returns Tailwind CSS classes for a task priority level.
 */
export function getPriorityColor(priority: string): string {
  switch (priority) {
    case 'urgent':
      return 'bg-red-100 text-red-700 border-red-200 dark:bg-red-900/20 dark:text-red-400 dark:border-red-800'
    case 'high':
      return 'bg-orange-100 text-orange-700 border-orange-200 dark:bg-orange-900/20 dark:text-orange-400 dark:border-orange-800'
    case 'medium':
      return 'bg-yellow-100 text-yellow-700 border-yellow-200 dark:bg-yellow-900/20 dark:text-yellow-400 dark:border-yellow-800'
    case 'low':
      return 'bg-slate-100 text-slate-600 border-slate-200 dark:bg-slate-800 dark:text-slate-400 dark:border-slate-700'
    default:
      return 'bg-slate-100 text-slate-600 border-slate-200 dark:bg-slate-800 dark:text-slate-400 dark:border-slate-700'
  }
}

/**
 * Returns Tailwind CSS classes for a task/project status.
 */
export function getStatusColor(status: string): string {
  switch (status) {
    case 'done':
    case 'completed':
    case 'mastered':
      return 'bg-emerald-100 text-emerald-700 border-emerald-200 dark:bg-emerald-900/20 dark:text-emerald-400 dark:border-emerald-800'
    case 'in_progress':
    case 'active':
    case 'learning':
    case 'applying':
      return 'bg-blue-100 text-blue-700 border-blue-200 dark:bg-blue-900/20 dark:text-blue-400 dark:border-blue-800'
    case 'todo':
    case 'planning':
    case 'new':
    case 'saved':
    case 'researching':
      return 'bg-slate-100 text-slate-600 border-slate-200 dark:bg-slate-800 dark:text-slate-400 dark:border-slate-700'
    case 'overdue':
    case 'rejected':
      return 'bg-red-100 text-red-700 border-red-200 dark:bg-red-900/20 dark:text-red-400 dark:border-red-800'
    case 'paused':
    case 'waiting_recommendation':
      return 'bg-amber-100 text-amber-700 border-amber-200 dark:bg-amber-900/20 dark:text-amber-400 dark:border-amber-800'
    case 'submitted':
    case 'interview':
      return 'bg-purple-100 text-purple-700 border-purple-200 dark:bg-purple-900/20 dark:text-purple-400 dark:border-purple-800'
    case 'accepted':
      return 'bg-emerald-100 text-emerald-700 border-emerald-200 dark:bg-emerald-900/20 dark:text-emerald-400 dark:border-emerald-800'
    case 'archived':
      return 'bg-slate-100 text-slate-400 border-slate-200 dark:bg-slate-900 dark:text-slate-500 dark:border-slate-800'
    default:
      return 'bg-slate-100 text-slate-600 border-slate-200 dark:bg-slate-800 dark:text-slate-400 dark:border-slate-700'
  }
}

// ── String utilities ──────────────────────────────────────────

/**
 * Truncates a string to a given length, adding "…" if truncated.
 */
export function truncate(str: string, length: number): string {
  if (str.length <= length) return str
  return str.slice(0, length).trimEnd() + '…'
}

// ── Greeting ─────────────────────────────────────────────────

/**
 * Returns a time-appropriate greeting string.
 */
export function getGreeting(): string {
  const hour = new Date().getHours()
  if (hour < 12) return 'Good morning'
  if (hour < 17) return 'Good afternoon'
  return 'Good evening'
}

// ── Misc ──────────────────────────────────────────────────────

/**
 * Converts an estimated duration in minutes to a human-readable string.
 * e.g. 90 → "1h 30m", 45 → "45m", 120 → "2h"
 */
export function formatDuration(minutes: number): string {
  if (minutes < 60) return `${minutes}m`
  const h = Math.floor(minutes / 60)
  const m = minutes % 60
  return m === 0 ? `${h}h` : `${h}h ${m}m`
}

/**
 * Returns a relative time label for a due date:
 * "Overdue", "Due today", "Due tomorrow", "Due in N days", or a formatted date.
 */
export function getDueDateLabel(dueDate: string | Date): string {
  const days = daysUntil(dueDate)
  if (days < 0) return 'Overdue'
  if (days === 0) return 'Due today'
  if (days === 1) return 'Due tomorrow'
  if (days <= 7) return `Due in ${days} days`
  return `Due ${formatDate(dueDate)}`
}

/**
 * Returns Tailwind text-color class based on how urgent a due date is.
 */
export function getDueDateColor(dueDate: string | Date): string {
  const days = daysUntil(dueDate)
  if (days < 0) return 'text-red-600 dark:text-red-400'
  if (days === 0) return 'text-red-500 dark:text-red-400'
  if (days <= 2) return 'text-orange-500 dark:text-orange-400'
  if (days <= 5) return 'text-amber-500 dark:text-amber-400'
  return 'text-slate-500 dark:text-slate-400'
}
