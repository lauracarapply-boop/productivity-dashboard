'use client'

import { useApp } from '@/lib/store'
import { mockUser, mockCourses, mockNotes, mockDriveFiles } from '@/lib/mock-data'
import { getGreeting, formatDate, daysUntil } from '@/lib/utils'
import StatCard from '@/components/ui/StatCard'
import TaskCard from '@/components/ui/TaskCard'
import AIRecommendationCard from '@/components/ui/AIRecommendationCard'
import {
  CheckSquare,
  BookOpen,
  Inbox,
  AlertTriangle,
  Calendar,
  TrendingUp,
  FileText,
  HardDrive,
  Clock,
} from 'lucide-react'

const EVENT_TYPE_COLORS: Record<string, string> = {
  class:       'bg-indigo-500',
  study:       'bg-emerald-500',
  meeting:     'bg-violet-500',
  deadline:    'bg-red-500',
  personal:    'bg-amber-500',
  appointment: 'bg-cyan-500',
}

const BALANCE_BARS = [
  { label: 'Academics',  pct: 45, color: 'bg-indigo-500' },
  { label: 'Languages',  pct: 25, color: 'bg-violet-500' },
  { label: 'Projects',   pct: 15, color: 'bg-amber-500'  },
  { label: 'Personal',   pct: 10, color: 'bg-emerald-500'},
  { label: 'Rest',       pct: 5,  color: 'bg-slate-400'  },
]

export default function DashboardPage() {
  const { tasks, aiInboxItems, calendarEvents, updateTask, deleteTask } = useApp()

  const todayTasks = tasks.filter(
    t => t.status !== 'done' && t.due_date && daysUntil(t.due_date) === 0,
  )
  const overdueTasks = tasks.filter(
    t => t.status === 'overdue' || (t.due_date && daysUntil(t.due_date) < 0 && t.status !== 'done'),
  )
  const pendingInbox = aiInboxItems.filter(i => i.status === 'pending')
  const doneTasks = tasks.filter(t => t.status === 'done')

  const upcomingEvents = calendarEvents
    .filter(e => {
      const d = daysUntil(e.start_time)
      return d >= 0 && d <= 3
    })
    .sort((a, b) => new Date(a.start_time).getTime() - new Date(b.start_time).getTime())
    .slice(0, 5)

  const upcomingDeadlines = tasks
    .filter(t => t.status !== 'done' && t.due_date && daysUntil(t.due_date) >= 0 && daysUntil(t.due_date) <= 7)
    .sort((a, b) => daysUntil(a.due_date!) - daysUntil(b.due_date!))
    .slice(0, 4)

  const urgentTasks = tasks
    .filter(t => t.status !== 'done' && (t.priority === 'urgent' || t.priority === 'high'))
    .slice(0, 5)

  const recentNotes = mockNotes.slice(0, 2)
  const recentFiles = mockDriveFiles.slice(0, 2)

  const handleComplete = (id: string) => {
    updateTask(id, { status: 'done' })
  }

  const dateLabel = new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
  })

  return (
    <div className="space-y-8">

      {/* ── Section 1: Greeting header ── */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
            {getGreeting()}, {mockUser.name}
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            {dateLabel} · Spring 2026
          </p>
        </div>
        {overdueTasks.length > 0 && (
          <a
            href="/tasks"
            className="flex items-center gap-2 px-3 py-1.5 bg-amber-50 border border-amber-200 text-amber-700 text-xs font-semibold rounded-full hover:bg-amber-100 transition-colors flex-shrink-0 mt-1"
          >
            <AlertTriangle size={12} />
            {overdueTasks.length} overdue task{overdueTasks.length !== 1 ? 's' : ''} need attention →
          </a>
        )}
      </div>

      {/* ── Section 2: Stats row ── */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard
          label="Due Today"
          value={todayTasks.length}
          subtext="Tasks due today"
          icon={CheckSquare}
          color="indigo"
        />
        <StatCard
          label="Overdue"
          value={overdueTasks.length}
          subtext={overdueTasks.length > 0 ? 'Need attention' : 'All caught up'}
          icon={AlertTriangle}
          color={overdueTasks.length > 0 ? 'red' : 'emerald'}
          trend={overdueTasks.length > 0 ? 'down' : 'neutral'}
        />
        <StatCard
          label="AI Inbox"
          value={pendingInbox.length}
          subtext="Awaiting review"
          icon={Inbox}
          color="violet"
        />
        <StatCard
          label="Completed"
          value={doneTasks.length}
          subtext="Total tasks done"
          icon={TrendingUp}
          color="emerald"
          trend="up"
        />
      </div>

      {/* ── Section 3: AI Recommendation ── */}
      <AIRecommendationCard
        type="recommendation"
        title="Smart Suggestion"
        recommendation="You have a 90-minute free block this afternoon. I recommend working on your Political Theory reading — it unlocks tomorrow's discussion and has been pending for 3 days. A focused session now will put you ahead for the week."
        actionLabel="Open Tasks"
        onAction={() => { window.location.href = '/tasks' }}
      />

      {/* ── Section 4: Two-column grid ── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* Left 2/3: Priority Tasks */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-semibold text-slate-900 flex items-center gap-2">
              <CheckSquare size={16} className="text-indigo-600" />
              Priority Tasks
            </h2>
            <a href="/tasks" className="text-xs text-indigo-600 hover:text-indigo-700 font-medium transition-colors">
              View all →
            </a>
          </div>

          <div className="space-y-2">
            {urgentTasks.length === 0 ? (
              <div className="bg-white border border-black/[0.07] rounded-2xl p-10 text-center shadow-sm">
                <CheckSquare size={28} className="text-slate-300 mx-auto mb-2" />
                <p className="text-slate-500 text-sm font-medium">No urgent tasks right now</p>
                <p className="text-slate-400 text-xs mt-1">You're in great shape. Add a task when ready.</p>
              </div>
            ) : (
              urgentTasks.map(task => (
                <TaskCard
                  key={task.id}
                  task={task}
                  onComplete={handleComplete}
                  onDelete={deleteTask}
                />
              ))
            )}
          </div>
        </div>

        {/* Right 1/3: Sidebar */}
        <div className="space-y-6">

          {/* Today's Schedule */}
          <div className="bg-white border border-black/[0.07] rounded-2xl shadow-sm p-4">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-sm font-semibold text-slate-900 flex items-center gap-2">
                <Clock size={14} className="text-violet-600" />
                Today's Schedule
              </h2>
              <a href="/calendar" className="text-xs text-indigo-600 hover:text-indigo-700 font-medium transition-colors">
                Calendar →
              </a>
            </div>
            <div className="space-y-2">
              {upcomingEvents.length === 0 ? (
                <p className="text-sm text-slate-400 text-center py-4">No events today</p>
              ) : (
                upcomingEvents.map(event => (
                  <div key={event.id} className="flex items-center gap-3 py-1.5">
                    <div
                      className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${EVENT_TYPE_COLORS[event.type] ?? 'bg-slate-400'}`}
                    />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-slate-700 truncate">{event.title}</p>
                      <p className="text-xs text-slate-400">
                        {new Date(event.start_time).toLocaleTimeString('en-US', {
                          hour: 'numeric',
                          minute: '2-digit',
                          hour12: true,
                        })}
                      </p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Upcoming Deadlines */}
          <div className="bg-white border border-black/[0.07] rounded-2xl shadow-sm p-4">
            <h2 className="text-sm font-semibold text-slate-900 flex items-center gap-2 mb-3">
              <AlertTriangle size={14} className="text-amber-500" />
              Upcoming Deadlines
            </h2>
            <div className="space-y-2">
              {upcomingDeadlines.length === 0 ? (
                <p className="text-xs text-slate-400 text-center py-3">No deadlines this week</p>
              ) : (
                upcomingDeadlines.map(task => {
                  const days = daysUntil(task.due_date!)
                  return (
                    <div key={task.id} className="flex items-center justify-between gap-2">
                      <p className="text-xs text-slate-700 truncate flex-1">{task.title}</p>
                      <span className={`text-xs font-semibold flex-shrink-0 ${
                        days === 0 ? 'text-red-600' : days <= 2 ? 'text-amber-600' : 'text-slate-500'
                      }`}>
                        {days === 0 ? 'Today' : days === 1 ? 'Tomorrow' : `${days}d`}
                      </span>
                    </div>
                  )
                })
              )}
            </div>
          </div>

          {/* Active Courses */}
          <div className="bg-white border border-black/[0.07] rounded-2xl shadow-sm p-4">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-sm font-semibold text-slate-900 flex items-center gap-2">
                <BookOpen size={14} className="text-emerald-600" />
                Active Courses
              </h2>
              <a href="/courses" className="text-xs text-indigo-600 hover:text-indigo-700 font-medium transition-colors">
                View all →
              </a>
            </div>
            <div className="flex flex-col gap-2">
              {mockCourses.slice(0, 3).map(course => (
                <div
                  key={course.id}
                  className="flex items-center gap-2.5 px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl"
                >
                  <div
                    className="w-2 h-2 rounded-full flex-shrink-0"
                    style={{ backgroundColor: course.color }}
                  />
                  <div className="min-w-0">
                    <p className="text-xs font-semibold text-slate-700 truncate">{course.code}</p>
                    <p className="text-xs text-slate-400 truncate">{course.professor}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* ── Section 5: Bottom row ── */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

        {/* Recent Notes */}
        <div className="bg-white border border-black/[0.07] rounded-2xl shadow-sm p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-semibold text-slate-900 flex items-center gap-2">
              <FileText size={14} className="text-indigo-600" />
              Recent Notes
            </h2>
            <a href="/notes" className="text-xs text-indigo-600 hover:text-indigo-700 font-medium transition-colors">
              View all →
            </a>
          </div>
          <div className="space-y-3">
            {recentNotes.map(note => (
              <div key={note.id} className="group cursor-pointer">
                <p className="text-sm font-medium text-slate-800 group-hover:text-indigo-700 transition-colors leading-snug line-clamp-1">
                  {note.title}
                </p>
                <p className="text-xs text-slate-400 mt-0.5 line-clamp-2 leading-relaxed">
                  {note.summary}
                </p>
                <p className="text-xs text-slate-300 mt-1">{formatDate(note.updated_at)}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Drive Activity */}
        <div className="bg-white border border-black/[0.07] rounded-2xl shadow-sm p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-semibold text-slate-900 flex items-center gap-2">
              <HardDrive size={14} className="text-violet-600" />
              Drive Activity
            </h2>
            <a href="/drive" className="text-xs text-indigo-600 hover:text-indigo-700 font-medium transition-colors">
              View all →
            </a>
          </div>
          <div className="space-y-3">
            {recentFiles.map(file => (
              <div key={file.id} className="group cursor-pointer">
                <p className="text-sm font-medium text-slate-800 group-hover:text-violet-700 transition-colors leading-snug line-clamp-1">
                  {file.name}
                </p>
                <p className="text-xs text-slate-400 mt-0.5 line-clamp-2 leading-relaxed">
                  {file.summary}
                </p>
                <p className="text-xs text-slate-300 mt-1">{formatDate(file.last_modified)}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Weekly Balance */}
        <div className="bg-white border border-black/[0.07] rounded-2xl shadow-sm p-5">
          <h2 className="text-sm font-semibold text-slate-900 flex items-center gap-2 mb-4">
            <TrendingUp size={14} className="text-emerald-600" />
            Weekly Balance
          </h2>
          <div className="space-y-3">
            {BALANCE_BARS.map(bar => (
              <div key={bar.label}>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs text-slate-600 font-medium">{bar.label}</span>
                  <span className="text-xs text-slate-400">{bar.pct}%</span>
                </div>
                <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full ${bar.color} transition-all duration-500`}
                    style={{ width: `${bar.pct}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
