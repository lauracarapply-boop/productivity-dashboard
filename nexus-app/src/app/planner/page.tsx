'use client'

import { useState } from 'react'
import { CalendarDays, AlertTriangle, CheckSquare, Sparkles, Clock, Target, CheckCircle, Circle, Plus, X } from 'lucide-react'
import { useApp } from '@/lib/store'
import { mockCalendarEvents, mockTasks } from '@/lib/mock-data'
import { cn, formatDate, daysUntil } from '@/lib/utils'
import AIRecommendationCard from '@/components/ui/AIRecommendationCard'

const WEEK_DAYS = [
  { day: 'Mon', date: 'May 11', events: 3, tasks: 2 },
  { day: 'Tue', date: 'May 12', events: 2, tasks: 3 },
  { day: 'Wed', date: 'May 13', events: 4, tasks: 3 },
  { day: 'Thu', date: 'May 14', events: 2, tasks: 1 },
  { day: 'Fri', date: 'May 15', events: 3, tasks: 2 },
  { day: 'Sat', date: 'May 16', events: 1, tasks: 1 },
  { day: 'Sun', date: 'May 17', events: 0, tasks: 0 },
]

const LANGUAGE_PLAN = {
  french: [
    { day: 'Mon', dur: 20 }, { day: 'Tue', dur: 0 }, { day: 'Wed', dur: 20 },
    { day: 'Thu', dur: 0 }, { day: 'Fri', dur: 30 }, { day: 'Sat', dur: 0 }, { day: 'Sun', dur: 15 },
  ],
  chinese: [
    { day: 'Mon', dur: 0 }, { day: 'Tue', dur: 20 }, { day: 'Wed', dur: 0 },
    { day: 'Thu', dur: 20 }, { day: 'Fri', dur: 0 }, { day: 'Sat', dur: 30 }, { day: 'Sun', dur: 10 },
  ],
}

export default function PlannerPage() {
  const { tasks } = useApp()
  const [goals, setGoals] = useState([
    { id: '1', text: 'Complete Tocqueville reading', done: false },
    { id: '2', text: 'Submit French grammar exercises', done: false },
    { id: '3', text: 'Attend all classes', done: true },
    { id: '4', text: 'Draft Mandato Aberto roadmap section', done: false },
  ])
  const [newGoal, setNewGoal] = useState('')
  const [scheduledTasks, setScheduledTasks] = useState<Set<string>>(new Set())
  const [planConfirmed, setPlanConfirmed] = useState(false)

  const unscheduled = tasks.filter(t => !t.calendar_event_id && t.status !== 'done')
  const upcoming = tasks.filter(t => t.due_date && daysUntil(t.due_date) >= 0 && daysUntil(t.due_date) <= 7 && t.status !== 'done')
    .sort((a, b) => daysUntil(a.due_date!) - daysUntil(b.due_date!))

  const getBusyness = (events: number, taskCount: number) => {
    const total = events + taskCount
    if (total >= 6) return 'high'
    if (total >= 4) return 'medium'
    return 'low'
  }

  const addGoal = () => {
    if (!newGoal.trim()) return
    setGoals(prev => [...prev, { id: Date.now().toString(), text: newGoal, done: false }])
    setNewGoal('')
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-3">
            <CalendarDays className="text-indigo-600" size={24} />
            Weekly Planner
          </h1>
          <p className="text-slate-500 text-sm mt-1">Plan and balance your week of May 11–17, 2026</p>
        </div>
        {!planConfirmed ? (
          <button onClick={() => setPlanConfirmed(true)}
            className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-sm font-medium transition-all">
            <CheckCircle size={14} /> Confirm Weekly Plan
          </button>
        ) : (
          <div className="flex items-center gap-2 text-emerald-600 text-sm font-medium">
            <CheckCircle size={16} /> Plan confirmed!
          </div>
        )}
      </div>

      {/* Week at a glance */}
      <div>
        <h2 className="text-sm font-semibold text-slate-700 mb-3">Week at a Glance</h2>
        <div className="grid grid-cols-7 gap-2">
          {WEEK_DAYS.map(day => {
            const busy = getBusyness(day.events, day.tasks)
            return (
              <div key={day.day} className={cn('p-3 rounded-xl border text-center space-y-1.5 transition-all',
                busy === 'high' ? 'bg-red-50 border-red-200' :
                busy === 'medium' ? 'bg-amber-50 border-amber-200' :
                'bg-white border-slate-200')}>
                <div className="text-xs font-bold text-slate-600">{day.day}</div>
                <div className="text-xs text-slate-400">{day.date.split(' ')[1]}</div>
                {day.events > 0 && (
                  <div className={cn('text-xs px-1.5 py-0.5 rounded-full',
                    busy === 'high' ? 'bg-red-100 text-red-600' :
                    busy === 'medium' ? 'bg-amber-100 text-amber-700' :
                    'bg-slate-100 text-slate-500')}>
                    {day.events} events
                  </div>
                )}
                {day.tasks > 0 && (
                  <div className="text-xs text-slate-400">{day.tasks} tasks</div>
                )}
                {busy === 'high' && (
                  <AlertTriangle size={12} className="text-red-500 mx-auto" />
                )}
              </div>
            )
          })}
        </div>
      </div>

      {/* AI Analysis */}
      <div className="bg-gradient-to-br from-amber-50 to-orange-50 border border-amber-200 rounded-2xl p-5">
        <AIRecommendationCard
          type="warning"
          title="AI Weekly Analysis"
          recommendation="Wednesday is overloaded: 3 classes, 2 deadlines, and 1 meeting. I suggest moving your French vocabulary review from Wednesday evening to Tuesday at 6 PM — you have a 90-minute free block. Friday afternoon looks ideal for deep work on Political Theory reading."
          actionLabel="Apply suggestions"
          onAction={() => {}}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          {/* Unscheduled tasks */}
          <div className="bg-white border border-black/[0.07] rounded-xl p-5">
            <h2 className="text-sm font-semibold text-slate-800 mb-4 flex items-center gap-2">
              <CheckSquare size={15} className="text-indigo-600" />
              Unscheduled Tasks
              <span className="text-xs text-slate-400">({unscheduled.length})</span>
            </h2>
            {unscheduled.length === 0 ? (
              <p className="text-sm text-slate-400 text-center py-4">All tasks are scheduled!</p>
            ) : (
              <div className="space-y-2">
                {unscheduled.slice(0, 6).map(task => (
                  <div key={task.id} className="flex items-center gap-3 py-2.5 border-b border-slate-100 last:border-0">
                    <div className={cn('w-2 h-2 rounded-full flex-shrink-0',
                      task.priority === 'urgent' ? 'bg-red-400' :
                      task.priority === 'high' ? 'bg-amber-400' : 'bg-blue-400')} />
                    <span className="text-sm text-slate-700 flex-1 truncate">{task.title}</span>
                    {task.estimated_minutes && (
                      <span className="text-xs text-slate-400 flex items-center gap-1">
                        <Clock size={10} /> {task.estimated_minutes}m
                      </span>
                    )}
                    {scheduledTasks.has(task.id) ? (
                      <span className="text-xs text-emerald-600 flex items-center gap-1">
                        <CheckCircle size={12} /> Scheduled
                      </span>
                    ) : (
                      <button onClick={() => setScheduledTasks(prev => new Set([...prev, task.id]))}
                        className="text-xs px-2.5 py-1 bg-indigo-50 hover:bg-indigo-100 text-indigo-600 rounded-lg transition-all border border-indigo-200">
                        Schedule
                      </button>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Upcoming deadlines */}
          <div className="bg-white border border-black/[0.07] rounded-xl p-5">
            <h2 className="text-sm font-semibold text-slate-800 mb-4 flex items-center gap-2">
              <Target size={15} className="text-red-500" /> Deadlines This Week
            </h2>
            <div className="space-y-2">
              {upcoming.slice(0, 5).map(task => {
                const days = daysUntil(task.due_date!)
                return (
                  <div key={task.id} className="flex items-center gap-3">
                    <div className={cn('w-10 h-10 rounded-lg flex flex-col items-center justify-center text-xs font-bold flex-shrink-0',
                      days === 0 ? 'bg-red-100 text-red-600' :
                      days <= 2 ? 'bg-amber-100 text-amber-700' : 'bg-slate-100 text-slate-500')}>
                      <span>{days === 0 ? 'NOW' : `${days}d`}</span>
                    </div>
                    <div className="flex-1">
                      <div className="text-sm text-slate-700">{task.title}</div>
                      <div className="text-xs text-slate-400">{formatDate(task.due_date!)}</div>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        </div>

        {/* Right column */}
        <div className="space-y-5">
          {/* Weekly goals */}
          <div className="bg-white border border-black/[0.07] rounded-xl p-5">
            <h2 className="text-sm font-semibold text-slate-800 mb-4">Weekly Goals</h2>
            <div className="space-y-2 mb-3">
              {goals.map(goal => (
                <div key={goal.id} className="flex items-start gap-2">
                  <button onClick={() => setGoals(prev => prev.map(g => g.id === goal.id ? { ...g, done: !g.done } : g))}
                    className="mt-0.5 flex-shrink-0">
                    {goal.done
                      ? <CheckCircle size={15} className="text-emerald-500" />
                      : <Circle size={15} className="text-slate-300" />}
                  </button>
                  <span className={cn('text-sm flex-1', goal.done ? 'text-slate-400 line-through' : 'text-slate-700')}>
                    {goal.text}
                  </span>
                  <button onClick={() => setGoals(prev => prev.filter(g => g.id !== goal.id))}
                    className="text-slate-300 hover:text-slate-500 transition-colors">
                    <X size={12} />
                  </button>
                </div>
              ))}
            </div>
            <div className="flex gap-2">
              <input value={newGoal} onChange={e => setNewGoal(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && addGoal()}
                placeholder="Add a goal..."
                className="flex-1 bg-slate-50 border border-slate-200 rounded-lg px-3 py-1.5 text-xs text-slate-700 placeholder-slate-400 outline-none focus:border-indigo-400 transition-colors" />
              <button onClick={addGoal} className="p-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg transition-all">
                <Plus size={14} />
              </button>
            </div>
          </div>

          {/* Language practice plan */}
          <div className="bg-white border border-black/[0.07] rounded-xl p-5">
            <h2 className="text-sm font-semibold text-slate-800 mb-3">Language Practice</h2>
            <div className="space-y-3">
              {(['french', 'chinese'] as const).map(lang => (
                <div key={lang}>
                  <div className="flex items-center gap-2 mb-1.5">
                    <span>{lang === 'french' ? '🇫🇷' : '🇨🇳'}</span>
                    <span className="text-xs text-slate-500 capitalize">{lang}</span>
                  </div>
                  <div className="grid grid-cols-7 gap-1">
                    {LANGUAGE_PLAN[lang].map(d => (
                      <div key={d.day}
                        className={cn('text-center py-1.5 rounded-md text-xs font-medium',
                          d.dur > 0
                            ? lang === 'french'
                              ? 'bg-violet-100 text-violet-700'
                              : 'bg-amber-100 text-amber-700'
                            : 'bg-slate-100 text-slate-400')}>
                        {d.dur > 0 ? `${d.dur}m` : '·'}
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
