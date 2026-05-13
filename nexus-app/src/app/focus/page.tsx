'use client'

import { useState, useEffect, useRef } from 'react'
import { Target, Play, Pause, Square, CheckSquare, Circle, CheckCircle, Sparkles, FileText, Clock, X } from 'lucide-react'
import { useApp } from '@/lib/store'
import { mockNotes, mockDriveFiles } from '@/lib/mock-data'
import { cn } from '@/lib/utils'

const RING_RADIUS = 80
const RING_CIRCUMFERENCE = 2 * Math.PI * RING_RADIUS

type SessionPhase = 'select' | 'active' | 'ended'

export default function FocusPage() {
  const { tasks, updateTask } = useApp()
  const activeTasks = tasks.filter(t => t.status !== 'done')

  const [phase, setPhase] = useState<SessionPhase>('select')
  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null)
  const [duration, setDuration] = useState(25)
  const [timeLeft, setTimeLeft] = useState(25 * 60)
  const [running, setRunning] = useState(false)
  const [sessionNotes, setSessionNotes] = useState('')
  const [subtasksDone, setSubtasksDone] = useState<Set<string>>(new Set())
  const [showEndModal, setShowEndModal] = useState(false)
  const [progressNote, setProgressNote] = useState('')
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)

  const selectedTask = tasks.find(t => t.id === selectedTaskId)
  const elapsed = duration * 60 - timeLeft
  const progress = elapsed / (duration * 60)
  const strokeDash = RING_CIRCUMFERENCE * (1 - progress)

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60).toString().padStart(2, '0')
    const s = (seconds % 60).toString().padStart(2, '0')
    return `${m}:${s}`
  }

  useEffect(() => {
    if (running && timeLeft > 0) {
      intervalRef.current = setInterval(() => {
        setTimeLeft(prev => {
          if (prev <= 1) { setRunning(false); setShowEndModal(true); return 0 }
          return prev - 1
        })
      }, 1000)
    } else if (intervalRef.current) {
      clearInterval(intervalRef.current)
    }
    return () => { if (intervalRef.current) clearInterval(intervalRef.current) }
  }, [running])

  const startSession = () => {
    if (!selectedTaskId) return
    setTimeLeft(duration * 60)
    setPhase('active')
    setRunning(true)
  }

  const handleEnd = (outcome: 'complete' | 'partial' | 'continue') => {
    setRunning(false)
    if (outcome === 'complete' && selectedTaskId) {
      updateTask(selectedTaskId, { status: 'done' })
    }
    setShowEndModal(false)
    setPhase('select')
    setSelectedTaskId(null)
    setTimeLeft(25 * 60)
    setSessionNotes('')
    setSubtasksDone(new Set())
  }

  if (phase === 'select') {
    return (
      <div className="max-w-md mx-auto pt-8 space-y-6">
        <div className="bg-white border border-black/[0.07] rounded-2xl p-8 shadow-lg text-center space-y-2">
          <div className="w-16 h-16 rounded-2xl bg-indigo-100 flex items-center justify-center mx-auto mb-4">
            <Target size={32} className="text-indigo-600" />
          </div>
          <h1 className="text-2xl font-bold text-slate-900">Focus Mode</h1>
          <p className="text-slate-500 text-sm">Single-task, distraction-free work</p>
        </div>

        <div className="bg-white border border-black/[0.07] rounded-2xl p-6 shadow-sm space-y-4">
          <h2 className="text-sm font-semibold text-slate-700">What are you working on?</h2>
          <div className="space-y-2 max-h-64 overflow-y-auto">
            {activeTasks.slice(0, 8).map(task => (
              <button key={task.id} onClick={() => setSelectedTaskId(task.id)}
                className={cn('w-full text-left flex items-center gap-3 p-3 rounded-xl border transition-all',
                  selectedTaskId === task.id
                    ? 'border-indigo-500 bg-indigo-50 text-slate-800'
                    : 'border-slate-200 hover:border-indigo-300 hover:bg-indigo-50 text-slate-600 hover:text-slate-800')}>
                <div className={cn('w-3 h-3 rounded-full flex-shrink-0',
                  task.priority === 'urgent' ? 'bg-red-400' :
                  task.priority === 'high' ? 'bg-amber-400' : 'bg-blue-400')} />
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium truncate">{task.title}</div>
                  {task.estimated_minutes && (
                    <div className="text-xs text-slate-400">~{task.estimated_minutes} min</div>
                  )}
                </div>
                {selectedTaskId === task.id && <CheckCircle size={16} className="text-indigo-600 flex-shrink-0" />}
              </button>
            ))}
          </div>

          <div className="pt-2 space-y-2">
            <label className="text-xs text-slate-500">Session duration</label>
            <div className="flex gap-2">
              {[15, 25, 45, 60, 90].map(d => (
                <button key={d} onClick={() => setDuration(d)}
                  className={cn('flex-1 py-2 rounded-xl text-sm font-medium transition-all',
                    duration === d
                      ? 'bg-indigo-600 text-white'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200')}>
                  {d}m
                </button>
              ))}
            </div>
          </div>

          <button onClick={startSession} disabled={!selectedTaskId}
            className="w-full flex items-center justify-center gap-2 py-3 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-40 disabled:cursor-not-allowed text-white font-semibold rounded-xl transition-all">
            <Play size={16} /> Start Focus Session
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-2xl mx-auto pt-4 space-y-6">
      {/* Task header */}
      <div className="text-center space-y-1">
        <div className="text-xs text-indigo-600 uppercase tracking-widest font-medium">Focus Session</div>
        <h2 className="text-xl font-bold text-slate-900">{selectedTask?.title}</h2>
      </div>

      {/* Timer ring */}
      <div className="flex flex-col items-center gap-6">
        <div className="relative w-52 h-52">
          <svg className="w-full h-full -rotate-90" viewBox="0 0 200 200">
            {/* Track */}
            <circle cx="100" cy="100" r={RING_RADIUS} fill="none" stroke="#e2e8f0" strokeWidth="8" />
            {/* Progress */}
            <circle cx="100" cy="100" r={RING_RADIUS} fill="none"
              stroke="#4f46e5" strokeWidth="8" strokeLinecap="round"
              strokeDasharray={RING_CIRCUMFERENCE}
              strokeDashoffset={strokeDash}
              className="transition-all duration-1000" />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <div className="text-4xl font-bold text-slate-900 tabular-nums">{formatTime(timeLeft)}</div>
            <div className="text-xs text-slate-400 mt-1">{running ? 'remaining' : 'paused'}</div>
          </div>
        </div>

        {/* Controls */}
        <div className="flex items-center gap-3">
          <button onClick={() => setRunning(p => !p)}
            className="flex items-center gap-2 px-6 py-3 bg-white border border-slate-200 shadow-sm hover:shadow text-slate-700 hover:text-slate-900 rounded-xl font-medium transition-all">
            {running ? <><Pause size={16} /> Pause</> : <><Play size={16} /> Resume</>}
          </button>
          <button onClick={() => setShowEndModal(true)}
            className="flex items-center gap-2 px-4 py-3 border border-red-200 text-red-600 hover:bg-red-50 rounded-xl transition-all">
            <Square size={16} /> End
          </button>
        </div>
      </div>

      {/* Content area */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {/* Subtasks */}
        {selectedTask?.subtasks && selectedTask.subtasks.length > 0 && (
          <div className="bg-white border border-black/[0.07] rounded-xl p-5">
            <h3 className="text-sm font-semibold text-slate-700 mb-3 flex items-center gap-2">
              <CheckSquare size={14} className="text-indigo-600" /> Subtasks
            </h3>
            <div className="space-y-2">
              {selectedTask.subtasks.map(sub => (
                <button key={sub.id} onClick={() => setSubtasksDone(prev => {
                  const next = new Set(prev)
                  if (next.has(sub.id)) next.delete(sub.id)
                  else next.add(sub.id)
                  return next
                })}
                  className="w-full flex items-center gap-3 text-sm text-left">
                  {subtasksDone.has(sub.id)
                    ? <CheckCircle size={15} className="text-emerald-500 flex-shrink-0" />
                    : <Circle size={15} className="text-slate-300 flex-shrink-0" />}
                  <span className={cn(subtasksDone.has(sub.id) ? 'text-slate-400 line-through' : 'text-slate-700')}>
                    {sub.title}
                  </span>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* AI Suggestion + Session Notes */}
        <div className="space-y-4">
          <div className="bg-gradient-to-br from-indigo-50 to-violet-50 border border-indigo-100 rounded-xl p-4">
            <div className="flex items-center gap-2 mb-2">
              <Sparkles size={13} className="text-indigo-600" />
              <span className="text-xs font-semibold text-slate-700">AI Suggestion</span>
            </div>
            <p className="text-xs text-slate-600 leading-relaxed">
              Start by reviewing your previous notes on this topic to establish context before diving into new material. Take brief notes as you go — they'll help with retention.
            </p>
          </div>

          <div className="bg-white border border-slate-200 rounded-xl p-4">
            <h3 className="text-xs font-semibold text-slate-500 mb-2 flex items-center gap-2">
              <FileText size={12} /> Session Notes
            </h3>
            <textarea value={sessionNotes} onChange={e => setSessionNotes(e.target.value)}
              placeholder="Jot quick notes as you work..."
              className="w-full h-24 bg-transparent text-xs text-slate-700 placeholder-slate-300 outline-none resize-none leading-relaxed" />
          </div>
        </div>
      </div>

      {/* End session modal */}
      {showEndModal && (
        <div className="fixed inset-0 bg-black/20 backdrop-blur-sm z-50 flex items-center justify-center">
          <div className="bg-white rounded-2xl shadow-2xl p-6 w-full max-w-md space-y-4 mx-4">
            <h3 className="text-lg font-bold text-slate-900">End Session</h3>
            <div className="flex items-center gap-3 text-sm text-slate-500">
              <Clock size={14} className="text-indigo-600" />
              <span>Duration: {Math.round(elapsed / 60)} minutes</span>
            </div>
            <textarea value={progressNote} onChange={e => setProgressNote(e.target.value)}
              placeholder="What did you accomplish? Any blockers?"
              className="w-full h-24 bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-sm text-slate-700 placeholder-slate-400 outline-none resize-none" />
            <div className="text-xs text-slate-500 mb-1">Mark task as:</div>
            <div className="grid grid-cols-3 gap-2">
              {[
                { id: 'complete', label: '✓ Complete', color: 'bg-emerald-600 hover:bg-emerald-700 text-white' },
                { id: 'partial', label: '◑ Partial', color: 'bg-amber-500 hover:bg-amber-600 text-white' },
                { id: 'continue', label: '→ Continue', color: 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-50' },
              ].map(opt => (
                <button key={opt.id} onClick={() => handleEnd(opt.id as any)}
                  className={cn('py-2.5 text-sm rounded-xl font-medium transition-all', opt.color)}>
                  {opt.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
