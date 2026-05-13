'use client'

import { useState } from 'react'
import { Calendar, Plus, RefreshCw, ChevronLeft, ChevronRight, Clock, MapPin, Link2, Check, Loader2, X, Mail } from 'lucide-react'
import { useApp } from '@/lib/store'
import { cn } from '@/lib/utils'
import type { CalendarEvent } from '@/lib/types'

const HOURS = Array.from({ length: 15 }, (_, i) => i + 7)
const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
const WEEK_DATES = [
  new Date('2026-05-11'), new Date('2026-05-12'), new Date('2026-05-13'),
  new Date('2026-05-14'), new Date('2026-05-15'), new Date('2026-05-16'), new Date('2026-05-17'),
]

const EVENT_COLORS: Record<string, string> = {
  class: 'event-class', study: 'event-study', meeting: 'event-meeting',
  deadline: 'event-deadline', personal: 'event-personal',
  appointment: 'bg-cyan-50 border-cyan-400 text-cyan-800',
}
const EVENT_DOT_COLORS: Record<string, string> = {
  class: 'bg-indigo-500', study: 'bg-emerald-500', meeting: 'bg-violet-500',
  deadline: 'bg-red-500', personal: 'bg-amber-500', appointment: 'bg-cyan-500',
}
const EVENT_TYPE_LABEL: Record<string, string> = {
  class: 'bg-indigo-50 text-indigo-700 border-indigo-200',
  study: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  meeting: 'bg-violet-50 text-violet-700 border-violet-200',
  deadline: 'bg-red-50 text-red-700 border-red-200',
  personal: 'bg-amber-50 text-amber-700 border-amber-200',
  appointment: 'bg-cyan-50 text-cyan-700 border-cyan-200',
}
const CELL_HEIGHT = 64

function getEventStyle(event: CalendarEvent) {
  const start = new Date(event.start_time)
  const end = new Date(event.end_time)
  const startHour = start.getHours() + start.getMinutes() / 60
  const endHour = end.getHours() + end.getMinutes() / 60
  const top = (startHour - 7) * CELL_HEIGHT
  const height = Math.max((endHour - startHour) * CELL_HEIGHT, 24)
  return { top: `${top}px`, height: `${height}px` }
}

function getEventDay(event: CalendarEvent): number {
  return (new Date(event.start_time).getDay() + 6) % 7
}

interface NewEventForm {
  title: string
  type: string
  date: string
  startTime: string
  endTime: string
  location: string
  description: string
}

const EMPTY_FORM: NewEventForm = {
  title: '', type: 'meeting', date: '2026-05-12',
  startTime: '10:00', endTime: '11:00', location: '', description: '',
}

export default function CalendarPage() {
  const { calendarEvents, addCalendarEvent } = useApp()
  const [view, setView] = useState<'week' | 'day'>('week')
  const [selectedDayIndex, setSelectedDayIndex] = useState(() => (new Date().getDay() + 6) % 7)
  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(null)
  const [showAddModal, setShowAddModal] = useState(false)
  const [form, setForm] = useState<NewEventForm>(EMPTY_FORM)
  const [googleConnected, setGoogleConnected] = useState(false)
  const [connecting, setConnecting] = useState(false)
  const [syncing, setSyncing] = useState(false)
  const [syncDone, setSyncDone] = useState(false)
  const [addToGoogle, setAddToGoogle] = useState(true)

  const today = new Date()
  const todayDayIndex = (today.getDay() + 6) % 7

  const getEventsForDay = (dayIndex: number) => calendarEvents.filter(e => getEventDay(e) === dayIndex)

  async function handleConnect() {
    setConnecting(true)
    await new Promise(r => setTimeout(r, 1500))
    setGoogleConnected(true)
    setConnecting(false)
  }

  async function handleSync() {
    setSyncing(true)
    setSyncDone(false)
    await new Promise(r => setTimeout(r, 1500))
    setSyncing(false)
    setSyncDone(true)
    setTimeout(() => setSyncDone(false), 3000)
  }

  function handleAddEvent(e: React.FormEvent) {
    e.preventDefault()
    if (!form.title.trim()) return
    const startISO = `${form.date}T${form.startTime}:00`
    const endISO = `${form.date}T${form.endTime}:00`
    const newEvent: CalendarEvent = {
      id: `ev-${Date.now()}`,
      user_id: '1',
      title: form.title,
      description: form.description,
      start_time: startISO,
      end_time: endISO,
      type: form.type as CalendarEvent['type'],
      source: googleConnected && addToGoogle ? 'google' : 'platform',
      location: form.location,
      created_at: new Date().toISOString(),
    }
    addCalendarEvent(newEvent)
    setShowAddModal(false)
    setForm(EMPTY_FORM)
  }

  const dayEvents = getEventsForDay(selectedDayIndex)
  const selectedDate = WEEK_DATES[selectedDayIndex]

  return (
    <div className="space-y-4 h-full">

      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-3">
            <Calendar className="text-violet-600" size={24} />
            Calendar
          </h1>
          <p className="text-slate-500 text-sm mt-1">Week of May 11–17, 2026</p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          {/* View tabs */}
          <div className="flex bg-white border border-slate-200 rounded-xl p-1 shadow-sm">
            {(['week', 'day'] as const).map(v => (
              <button key={v} onClick={() => setView(v)}
                className={cn('px-3 py-1.5 rounded-lg text-sm font-medium transition-all capitalize',
                  view === v ? 'bg-indigo-600 text-white shadow-sm' : 'text-slate-500 hover:text-slate-700'
                )}>
                {v}
              </button>
            ))}
            <button className="px-3 py-1.5 rounded-lg text-sm font-medium text-slate-300 cursor-not-allowed">Month</button>
          </div>

          {/* Import from Email shortcut */}
          <a href="/capture?tab=email"
            className="flex items-center gap-1.5 px-3 py-2 bg-white hover:bg-slate-50 border border-slate-200 text-slate-600 rounded-xl text-sm font-medium transition-all shadow-sm">
            <Mail size={13} />
            From Email
          </a>

          {/* Sync */}
          <button onClick={handleSync} disabled={syncing}
            className="flex items-center gap-2 px-3 py-2 bg-white hover:bg-slate-50 border border-slate-200 text-slate-600 rounded-xl text-sm font-medium transition-all shadow-sm disabled:opacity-70">
            {syncing ? <Loader2 size={14} className="animate-spin" /> : syncDone ? <Check size={14} className="text-emerald-500" /> : <RefreshCw size={14} />}
            {syncDone ? 'Synced!' : 'Sync'}
          </button>

          {/* Add Event */}
          <button onClick={() => { setForm(EMPTY_FORM); setShowAddModal(true) }}
            className="flex items-center gap-2 px-3 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-sm font-semibold transition-all shadow-sm">
            <Plus size={14} />
            Add Event
          </button>
        </div>
      </div>

      {/* Google Calendar status */}
      {!googleConnected ? (
        <div className="flex items-center gap-3 px-4 py-3 bg-amber-50 border border-amber-200 rounded-xl">
          <div className="w-2 h-2 rounded-full bg-amber-400 flex-shrink-0" />
          <span className="text-sm text-amber-700 font-medium">Google Calendar not connected</span>
          <button onClick={handleConnect} disabled={connecting}
            className="ml-auto flex items-center gap-1.5 text-xs text-amber-700 hover:text-amber-800 border border-amber-300 hover:border-amber-400 bg-white px-3 py-1.5 rounded-lg transition-colors font-medium disabled:opacity-70">
            {connecting && <Loader2 size={11} className="animate-spin" />}
            {connecting ? 'Connecting…' : 'Connect Google Calendar'}
          </button>
        </div>
      ) : (
        <div className="flex items-center gap-3 px-4 py-3 bg-emerald-50 border border-emerald-200 rounded-xl">
          <div className="w-2 h-2 rounded-full bg-emerald-500 flex-shrink-0 animate-pulse" />
          <span className="text-sm text-emerald-700 font-medium">Google Calendar connected</span>
          <span className="text-xs text-emerald-600 ml-1">· Events sync in real-time</span>
          <button onClick={() => setGoogleConnected(false)}
            className="ml-auto text-xs text-slate-400 hover:text-slate-600 transition-colors">Disconnect</button>
        </div>
      )}

      {/* WEEK VIEW */}
      {view === 'week' && (
        <>
          <div className="flex items-center gap-3">
            <button className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-all">
              <ChevronLeft size={16} />
            </button>
            <span className="text-slate-900 font-semibold text-sm">May 11 – 17, 2026</span>
            <button className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-all">
              <ChevronRight size={16} />
            </button>
          </div>

          <div className="bg-white border border-black/[0.07] rounded-2xl shadow-sm overflow-hidden flex flex-col">
            <div className="grid bg-slate-50 border-b border-slate-100" style={{ gridTemplateColumns: '56px repeat(7, 1fr)' }}>
              <div className="border-r border-slate-100" />
              {DAYS.map((day, i) => {
                const date = WEEK_DATES[i]
                const isToday = date.toDateString() === today.toDateString()
                return (
                  <button key={day} onClick={() => { setSelectedDayIndex(i); setView('day') }}
                    className={cn('py-3 text-center border-r border-slate-100 last:border-r-0 hover:bg-slate-100 transition-colors',
                      isToday && 'bg-indigo-50/40')}>
                    <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider">{day}</div>
                    <div className={cn('text-sm font-bold mt-1', isToday ? 'text-indigo-600' : 'text-slate-700')}>
                      {date.getDate()}
                    </div>
                  </button>
                )
              })}
            </div>
            <div className="overflow-y-auto max-h-[560px]">
              <div className="relative grid" style={{ gridTemplateColumns: '56px repeat(7, 1fr)' }}>
                <div className="relative">
                  {HOURS.map(hour => (
                    <div key={hour} style={{ height: `${CELL_HEIGHT}px` }}
                      className="border-b border-slate-100/80 border-r border-slate-100 flex items-start pt-1 px-2">
                      <span className="text-xs text-slate-400">
                        {hour === 12 ? '12 PM' : hour > 12 ? `${hour - 12} PM` : `${hour} AM`}
                      </span>
                    </div>
                  ))}
                </div>
                {DAYS.map((day, dayIndex) => {
                  const dayEvs = getEventsForDay(dayIndex)
                  const isToday = dayIndex === todayDayIndex
                  return (
                    <div key={day} className={cn('relative border-r border-slate-100 last:border-r-0', isToday && 'bg-indigo-50/40')}>
                      {HOURS.map(hour => (
                        <div key={hour} style={{ height: `${CELL_HEIGHT}px` }} className="border-b border-slate-100/80" />
                      ))}
                      {dayEvs.map(event => (
                        <button key={event.id} onClick={() => setSelectedEvent(event)}
                          style={{ ...getEventStyle(event), position: 'absolute', left: '2px', right: '2px' }}
                          className={cn('rounded-md border-l-2 px-2 py-1 text-left overflow-hidden transition-all hover:opacity-80 hover:shadow-sm',
                            EVENT_COLORS[event.type] ?? 'bg-slate-100 border-slate-400 text-slate-700')}>
                          <div className="text-xs font-semibold truncate leading-tight">{event.title}</div>
                          <div className="text-xs opacity-70 truncate">
                            {new Date(event.start_time).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true })}
                          </div>
                        </button>
                      ))}
                    </div>
                  )
                })}
              </div>
            </div>
          </div>
        </>
      )}

      {/* DAY VIEW */}
      {view === 'day' && (
        <>
          <div className="flex items-center gap-3">
            <button onClick={() => setSelectedDayIndex(i => Math.max(0, i - 1))}
              className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-all">
              <ChevronLeft size={16} />
            </button>
            <div className="flex-1">
              <span className="text-slate-900 font-semibold text-sm">
                {DAYS[selectedDayIndex]}, {selectedDate?.toLocaleDateString('en-US', { month: 'long', day: 'numeric' })}
              </span>
              {selectedDayIndex === todayDayIndex && (
                <span className="ml-2 text-xs bg-indigo-100 text-indigo-700 px-2 py-0.5 rounded-full font-medium">Today</span>
              )}
            </div>
            <button onClick={() => setSelectedDayIndex(i => Math.min(6, i + 1))}
              className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-all">
              <ChevronRight size={16} />
            </button>
          </div>

          <div className="bg-white border border-black/[0.07] rounded-2xl shadow-sm overflow-hidden">
            <div className="overflow-y-auto max-h-[600px]">
              <div className="relative grid" style={{ gridTemplateColumns: '64px 1fr' }}>
                <div className="relative">
                  {HOURS.map(hour => (
                    <div key={hour} style={{ height: `${CELL_HEIGHT}px` }}
                      className="border-b border-slate-100/80 border-r border-slate-100 flex items-start pt-1 px-2">
                      <span className="text-xs text-slate-400">
                        {hour === 12 ? '12 PM' : hour > 12 ? `${hour - 12} PM` : `${hour} AM`}
                      </span>
                    </div>
                  ))}
                </div>
                <div className={cn('relative', selectedDayIndex === todayDayIndex && 'bg-indigo-50/20')}>
                  {HOURS.map(hour => (
                    <div key={hour} style={{ height: `${CELL_HEIGHT}px` }} className="border-b border-slate-100/80" />
                  ))}
                  {dayEvents.length === 0 && (
                    <div className="absolute inset-0 flex items-center justify-center text-slate-400 text-sm">
                      No events — <button onClick={() => setShowAddModal(true)} className="ml-1 text-indigo-600 hover:underline">Add one</button>
                    </div>
                  )}
                  {dayEvents.map(event => (
                    <button key={event.id} onClick={() => setSelectedEvent(event)}
                      style={{ ...getEventStyle(event), position: 'absolute', left: '4px', right: '4px' }}
                      className={cn('rounded-lg border-l-4 px-3 py-2 text-left overflow-hidden transition-all hover:opacity-80 hover:shadow-sm',
                        EVENT_COLORS[event.type] ?? 'bg-slate-100 border-slate-400 text-slate-700')}>
                      <div className="text-sm font-semibold leading-tight">{event.title}</div>
                      <div className="text-xs opacity-70 mt-0.5 flex items-center gap-1">
                        <Clock size={10} />
                        {new Date(event.start_time).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true })}
                        {' – '}
                        {new Date(event.end_time).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true })}
                      </div>
                      {event.location && <div className="text-xs opacity-60 mt-0.5 flex items-center gap-1"><MapPin size={10} />{event.location}</div>}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </>
      )}

      {/* Legend */}
      <div className="flex flex-wrap gap-4">
        {Object.entries({ Class: 'class', 'Study Block': 'study', Meeting: 'meeting', Deadline: 'deadline', Personal: 'personal' }).map(([label, type]) => (
          <div key={type} className="flex items-center gap-1.5">
            <div className={cn('w-2 h-2 rounded-full', EVENT_DOT_COLORS[type])} />
            <span className="text-xs text-slate-500">{label}</span>
          </div>
        ))}
      </div>

      {/* Event detail panel */}
      {selectedEvent && (
        <div className="fixed right-4 top-20 w-80 bg-white border border-black/[0.08] rounded-2xl shadow-xl p-5 z-40">
          <div className="flex items-start justify-between mb-3">
            <span className={cn('text-xs px-2.5 py-1 rounded-full border font-medium capitalize',
              EVENT_TYPE_LABEL[selectedEvent.type] ?? 'bg-slate-100 text-slate-600 border-slate-200')}>
              {selectedEvent.type}
            </span>
            <button onClick={() => setSelectedEvent(null)}
              className="text-slate-400 hover:text-slate-600 text-xl leading-none transition-colors">×</button>
          </div>
          <h3 className="font-semibold text-slate-900 mb-3 leading-snug">{selectedEvent.title}</h3>
          <div className="space-y-2 text-sm text-slate-500">
            <div className="flex items-center gap-2">
              <Clock size={13} className="text-slate-400 flex-shrink-0" />
              <span>
                {new Date(selectedEvent.start_time).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true })}
                {' – '}
                {new Date(selectedEvent.end_time).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true })}
              </span>
            </div>
            {selectedEvent.location && (
              <div className="flex items-center gap-2">
                <MapPin size={13} className="text-slate-400 flex-shrink-0" />
                <span>{selectedEvent.location}</span>
              </div>
            )}
            {selectedEvent.description && (
              <p className="text-slate-400 text-xs pt-1 leading-relaxed">{selectedEvent.description}</p>
            )}
            <div className="flex items-center gap-2 pt-1">
              <Link2 size={13} className="text-slate-400 flex-shrink-0" />
              <span className="text-xs">
                {selectedEvent.source === 'google' ? 'Google Calendar' : selectedEvent.source === 'ai' ? 'AI Scheduled' : 'Nexus'}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Add Event Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/30 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={e => { if (e.target === e.currentTarget) setShowAddModal(false) }}>
          <div className="bg-white rounded-2xl shadow-2xl border border-black/[0.08] p-6 w-full max-w-md animate-scale-in">
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-lg font-bold text-slate-900">New Event</h2>
              <button onClick={() => setShowAddModal(false)} className="p-1 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 transition-all">
                <X size={16} />
              </button>
            </div>
            <form onSubmit={handleAddEvent} className="space-y-4">
              <div>
                <label className="text-xs text-slate-500 mb-1 block">Title *</label>
                <input type="text" value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
                  placeholder="Event name" required
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:border-indigo-400 focus:ring-1 focus:ring-indigo-100 transition-all" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-slate-500 mb-1 block">Type</label>
                  <select value={form.type} onChange={e => setForm(f => ({ ...f, type: e.target.value }))}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-sm text-slate-700 focus:outline-none focus:border-indigo-400">
                    <option value="class">Class</option>
                    <option value="study">Study Block</option>
                    <option value="meeting">Meeting</option>
                    <option value="deadline">Deadline</option>
                    <option value="personal">Personal</option>
                    <option value="appointment">Appointment</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs text-slate-500 mb-1 block">Date</label>
                  <input type="date" value={form.date} onChange={e => setForm(f => ({ ...f, date: e.target.value }))}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-sm text-slate-700 focus:outline-none focus:border-indigo-400" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-slate-500 mb-1 block">Start Time</label>
                  <input type="time" value={form.startTime} onChange={e => setForm(f => ({ ...f, startTime: e.target.value }))}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-sm text-slate-700 focus:outline-none focus:border-indigo-400" />
                </div>
                <div>
                  <label className="text-xs text-slate-500 mb-1 block">End Time</label>
                  <input type="time" value={form.endTime} onChange={e => setForm(f => ({ ...f, endTime: e.target.value }))}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-sm text-slate-700 focus:outline-none focus:border-indigo-400" />
                </div>
              </div>
              <div>
                <label className="text-xs text-slate-500 mb-1 block">Location</label>
                <input type="text" value={form.location} onChange={e => setForm(f => ({ ...f, location: e.target.value }))}
                  placeholder="Room, Zoom link, etc."
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:border-indigo-400 transition-all" />
              </div>
              <div>
                <label className="text-xs text-slate-500 mb-1 block">Description</label>
                <textarea value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
                  placeholder="Optional notes"
                  rows={2}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:border-indigo-400 transition-all resize-none" />
              </div>
              {googleConnected && (
                <label className="flex items-center gap-2.5 cursor-pointer">
                  <input type="checkbox" checked={addToGoogle} onChange={e => setAddToGoogle(e.target.checked)}
                    className="w-4 h-4 rounded accent-indigo-600" />
                  <span className="text-xs text-slate-600">Also add to Google Calendar</span>
                </label>
              )}
              <div className="flex gap-3 pt-1">
                <button type="button" onClick={() => setShowAddModal(false)}
                  className="flex-1 py-2.5 border border-slate-200 rounded-xl text-sm text-slate-600 hover:bg-slate-50 transition-all">
                  Cancel
                </button>
                <button type="submit"
                  className="flex-1 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-sm font-semibold transition-all shadow-sm">
                  Add Event
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
