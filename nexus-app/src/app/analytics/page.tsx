'use client'

import { BarChart2, TrendingUp, Clock, CheckSquare, Flame, Target, FileText, Brain } from 'lucide-react'
import { useApp } from '@/lib/store'
import { mockTasks, mockNotes } from '@/lib/mock-data'
import StatCard from '@/components/ui/StatCard'
import { cn } from '@/lib/utils'

const WORKSPACE_TIME = [
  { name: 'College', pct: 45, color: 'bg-indigo-500' },
  { name: 'French', pct: 20, color: 'bg-violet-500' },
  { name: 'Chinese', pct: 15, color: 'bg-red-500' },
  { name: 'Mandato Aberto', pct: 12, color: 'bg-amber-500' },
  { name: 'Personal', pct: 8, color: 'bg-emerald-500' },
]

const DAILY_ACTIVITY = [
  { day: 'Mon', tasks: 3, notes: 1, hours: 4.5 },
  { day: 'Tue', tasks: 5, notes: 2, hours: 6 },
  { day: 'Wed', tasks: 2, notes: 0, hours: 3 },
  { day: 'Thu', tasks: 4, notes: 3, hours: 5.5 },
  { day: 'Fri', tasks: 6, notes: 1, hours: 7 },
  { day: 'Sat', tasks: 1, notes: 2, hours: 2 },
  { day: 'Sun', tasks: 0, notes: 1, hours: 1 },
]

const maxTasks = Math.max(...DAILY_ACTIVITY.map(d => d.tasks))
const maxHours = Math.max(...DAILY_ACTIVITY.map(d => d.hours))

const BALANCE_METRICS = [
  { label: 'Academics', score: 8, color: 'text-indigo-600', bar: 'bg-indigo-500' },
  { label: 'Languages', score: 6, color: 'text-violet-600', bar: 'bg-violet-500' },
  { label: 'Projects', score: 4, color: 'text-amber-600', bar: 'bg-amber-500' },
  { label: 'Personal', score: 3, color: 'text-emerald-600', bar: 'bg-emerald-500' },
  { label: 'Rest', score: 5, color: 'text-blue-600', bar: 'bg-blue-500' },
]

export default function AnalyticsPage() {
  const { tasks } = useApp()
  const doneTasks = tasks.filter(t => t.status === 'done')
  const overdueTasks = tasks.filter(t => t.status === 'overdue')

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-3">
          <BarChart2 className="text-indigo-600" size={24} />
          Analytics
        </h1>
        <p className="text-slate-500 text-sm mt-1">Your productivity insights for this week</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard label="Tasks completed" value={doneTasks.length} subtext="This week" icon={CheckSquare} color="emerald" trend="up" />
        <StatCard label="Study hours" value="12.5h" subtext="This week" icon={Clock} color="indigo" />
        <StatCard label="Focus sessions" value={4} subtext="Avg 32 min each" icon={Target} color="violet" />
        <StatCard label="Notes created" value={mockNotes.length} subtext="Total" icon={FileText} color="blue" />
      </div>

      {/* Streaks */}
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-white border border-black/[0.07] rounded-xl p-5 shadow-sm flex items-center gap-4">
          <div className="text-3xl">🔥</div>
          <div>
            <div className="text-2xl font-bold text-amber-500">7</div>
            <div className="text-sm text-slate-500">French streak (days)</div>
          </div>
        </div>
        <div className="bg-white border border-black/[0.07] rounded-xl p-5 shadow-sm flex items-center gap-4">
          <div className="text-3xl">🔥</div>
          <div>
            <div className="text-2xl font-bold text-red-500">4</div>
            <div className="text-sm text-slate-500">Chinese streak (days)</div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Daily activity bar chart */}
        <div className="bg-white border border-black/[0.07] rounded-xl p-5 shadow-sm">
          <h2 className="text-sm font-semibold text-slate-800 mb-5">Daily Task Completion</h2>
          <div className="flex items-end gap-2 h-32 bg-slate-50 rounded-lg px-2 pt-2 pb-1">
            {DAILY_ACTIVITY.map(day => (
              <div key={day.day} className="flex-1 flex flex-col items-center gap-1">
                <div className="text-xs text-indigo-600 font-medium">{day.tasks > 0 ? day.tasks : ''}</div>
                <div className="w-full rounded-t-md bg-indigo-500/80 transition-all hover:bg-indigo-500"
                  style={{ height: `${maxTasks > 0 ? (day.tasks / maxTasks) * 100 : 0}%`, minHeight: day.tasks > 0 ? '4px' : '0' }} />
                <div className="text-xs text-slate-400">{day.day}</div>
              </div>
            ))}
          </div>
          <div className="flex gap-2 mt-3">
            <div className="flex items-center gap-1.5 text-xs text-slate-400"><div className="w-3 h-3 rounded-sm bg-indigo-500/80" /> Tasks</div>
          </div>
        </div>

        {/* Study hours */}
        <div className="bg-white border border-black/[0.07] rounded-xl p-5 shadow-sm">
          <h2 className="text-sm font-semibold text-slate-800 mb-5">Daily Study Hours</h2>
          <div className="flex items-end gap-2 h-32 bg-slate-50 rounded-lg px-2 pt-2 pb-1">
            {DAILY_ACTIVITY.map(day => (
              <div key={day.day} className="flex-1 flex flex-col items-center gap-1">
                <div className="text-xs text-emerald-600 font-medium">{day.hours > 0 ? day.hours : ''}</div>
                <div className="w-full rounded-t-md bg-emerald-500/70 transition-all hover:bg-emerald-500"
                  style={{ height: `${maxHours > 0 ? (day.hours / maxHours) * 100 : 0}%`, minHeight: day.hours > 0 ? '4px' : '0' }} />
                <div className="text-xs text-slate-400">{day.day}</div>
              </div>
            ))}
          </div>
          <div className="flex gap-2 mt-3">
            <div className="flex items-center gap-1.5 text-xs text-slate-400"><div className="w-3 h-3 rounded-sm bg-emerald-500/70" /> Hours</div>
          </div>
        </div>

        {/* Time by workspace */}
        <div className="bg-slate-50 rounded-xl p-5">
          <h2 className="text-sm font-semibold text-slate-800 mb-5">Time by Workspace</h2>
          <div className="space-y-3">
            {WORKSPACE_TIME.map(ws => (
              <div key={ws.name}>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-slate-600">{ws.name}</span>
                  <span className="text-slate-400">{ws.pct}%</span>
                </div>
                <div className="h-2 bg-slate-200 rounded-full overflow-hidden">
                  <div className={cn('h-full rounded-full transition-all', ws.color)} style={{ width: `${ws.pct}%` }} />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Weekly balance */}
        <div className="bg-slate-50 rounded-xl p-5">
          <h2 className="text-sm font-semibold text-slate-800 mb-5">Weekly Balance</h2>
          <div className="space-y-3">
            {BALANCE_METRICS.map(metric => (
              <div key={metric.label} className="flex items-center gap-3">
                <span className="text-xs text-slate-500 w-20 flex-shrink-0">{metric.label}</span>
                <div className="flex-1 h-3 bg-slate-200 rounded-full overflow-hidden">
                  <div className={cn('h-full rounded-full', metric.bar)} style={{ width: `${metric.score * 10}%` }} />
                </div>
                <span className={cn('text-xs font-bold w-8 text-right', metric.color)}>{metric.score}/10</span>
              </div>
            ))}
          </div>
          <div className="mt-4 p-3 bg-white rounded-lg border border-slate-200">
            <p className="text-xs text-slate-500 leading-relaxed">
              <strong className="text-slate-700">Insight:</strong> Academic performance is strong this week. Consider adding more rest and personal time — you've been consistently overworked on Wednesdays.
            </p>
          </div>
        </div>
      </div>

      {/* Productivity Insights */}
      <div className="bg-gradient-to-br from-indigo-50 to-violet-50 border border-indigo-100 rounded-2xl p-6">
        <div className="flex items-center gap-3 mb-2">
          <Brain size={18} className="text-indigo-600" />
          <h2 className="text-base font-semibold text-slate-800">Productivity Insights</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4 text-sm text-slate-500">
          <div className="p-3 bg-white rounded-xl border border-indigo-100 shadow-sm">
            <div className="text-slate-800 font-medium mb-1">Peak productivity</div>
            <p>Tuesday and Thursday afternoons (2–5 PM). Schedule your hardest tasks here.</p>
          </div>
          <div className="p-3 bg-white rounded-xl border border-indigo-100 shadow-sm">
            <div className="text-slate-800 font-medium mb-1">Best study days</div>
            <p>Tuesday, Thursday, Friday. You consistently complete more tasks and study longer.</p>
          </div>
          <div className="p-3 bg-white rounded-xl border border-indigo-100 shadow-sm">
            <div className="text-slate-800 font-medium mb-1">Deadlines met</div>
            <p>2 of 3 this week (67%). Improving from last week. One French exercise was late.</p>
          </div>
        </div>
      </div>
    </div>
  )
}
