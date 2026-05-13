'use client'

import { useState, useEffect, useCallback } from 'react'
import { Calendar, Plus, RefreshCw, ChevronLeft, ChevronRight, Clock, MapPin, Link2, Check, Loader2, X, Mail } from 'lucide-react'
import { useApp } from '@/lib/store'
import { cn } from '@/lib/utils'
import type { CalendarEvent } from '@/lib/types'

const HOURS = Array.from({ length: 15 }, (_, i) => i + 7)
const DAY_LABELS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
const CELL_HEIGHT = 64

const EVENT_COLORS: Record<string, string> = {
  class: 'event-class', study: 'event-study', meeting: 'event-meeting',
  deadline: 'event-deadline', personal: 'event-personal',
  appointment: 'bg-cyan-50 border-cyan-400 text-cyan-800',
  outlook: 'bg-blue-50 border-blue-400 text-blue-800',
}
const EVENT_DOT_COLORS: Record<string, string> = {
  class: 'bg-indigo-500', study: 'bg-emerald-500', meeting: 'bg-violet-500',
  deadline: 'bg-red-500', personal: 'bg-amber-500', appointment: 'bg-cyan-500',
  outlook: 'bg-blue-500',
}
const EVENT_TYPE_LABEL: Record<string, string> = {
  class: 'bg-indigo-50 text-indigo-700 border-indigo-200',
  study: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  meeting: 'bg-violet-50 text-violet-700 border-violet-200',
  deadline: 'bg-red-50 text-red-700 border-red-200',
  personal: 'bg-amber-50 text-amber-700 border-amber-200',
  appointment: 'bg-cyan-50 text-cyan-700 border-cyan-200',
  outlook: 'bg-blue-50 text-blue-700 border-blue-200',
}

function getMonday(d: Date): Date {
  const day = d.getDay()
  const diff = (day === 0 ? -6 : 1 - day)
  const mon = new Date(d)
  mon.setDate(d.getDate() + diff)
  mon.setHours(0, 0, 0, 0)
  return mon
}

function getWeekDates(monday: Date): Date[] {
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date(monday)
    d.setDate(monday.getDate() + i)
    return d
  })
}

function formatWeekLabel(monday: Date): string {
  const sunday = new Date(monday)
  sunday.setDate(monday.getDate() + 6)
  const opts: Intl.DateTimeFormatOptions = { month: 'short', day: 'numeric' }
  if (monday.getFullYear() !== sunday.getFullYear()) {
    return `${monday.toLocaleDateString('en-US', { ...opts, year: 'numeric' })} – ${sunday.toLocaleDateString('en-US', { ...opts, year: 'numeric' })}`
  }
  if (monday.getMonth() !== sunday.getMonth()) {
    return `${monday.toLocaleDateString('en-US', opts)} – ${sunday.toLocaleDateString('en-US', { ...opts, year: 'numeric' })}`
  }
  return `${monday.toLocaleDateString('en-US', opts)} – ${sunday.getDate()}, ${sunday.getFullYear()}`
}

function getEventStyle(startISO: string, endISO: string) {
  const start = new Date(startISO)
  const end = new Date(endISO)
  const startHour = start.getHours() + start.getMinutes() / 60
  const endHour = end.getHours() + end.getMinutes() / 60
  const top = (startHour - 7) * CELL_HEIGHT
  const height = Math.max((endHour - startHour) * CELL_HEIGHT, 24)
  return { top: `${top}px`, height: `${height}px` }
}

function isSameDay(a: Date, b: Date) {
  return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate()
}

interface ICalEvent {
  id: string
  title: string
  start: string
  end: string
  location: string
  description: string
  allDay: boolean
}

interface NewEventForm {
  title: string; type: string; date: string
  startTime: string; endTime: string; location: string; description: string
}
const EMPTY_FORM: NewEventForm = {
  title: '', type: 'meeting', date: new Date().toISOString().slice(0, 10),
  startTime: '10:00', endTime: '11:00', location: '', description: '',
}

export default function CalendarPage() {
  const { calendarEvents, addCalendarEvent } = useApp()

  const [monday, setMonday] = useState(() => getMonday(new Date()))
  const weekDates = getWeekDates(monday)
  const today = new Date()
  const todayDayIndex = weekDates.findIndex(d => isSameDay(d, today))

  const [view, setView] = useState<'week' | 'day'>('week')
  const [selectedDayIndex, setSelectedDayIndex] = useState(() => Math.max(0, (new Date().getDay() + 6) % 7))
  const [selectedEvent, setSelectedEvent] = useState<(CalendarEvent | ICalEvent & { type: string; source: string }) | null>(null)
  const [showAddModal, setShowAddModal] = useState(false)
  const [form, setForm] = useState<NewEventForm>(EMPTY_FORM)

  // iCal / Outlook
  const [icalEvents, setIcalEvents] = useState<ICalEvent[]>([])
  const [icalUrl, setIcalUrl] = useState<string | null>(null)
  const [icalLoading, setIcalLoading] = useState(false)
  const [icalError, setIcalError] = useState<string | null>(null)
  const [icalConnected, setIcalConnected] = useState(false)
  const [syncing, setSyncing] = useState(false)
  const [syncDone, setSyncDone] = useState(false)

  useEffect(() => {
    const stored = localStorage.getItem('ical_url')
    if (stored) setIcalUrl(stored)
  }, [])

  const fetchIcal = useCallback(async (url: string) => {
    setIcalLoading(true)
    setIcalError(null)
    try {
      const res = await fetch(`/api/ical?url=${encodeURIComponent(url)}`)
      const data = await res.json()
      if (!res.ok) throw new Error(data.error ?? 'Failed to load calendar')
      setIcalEvents(data.events ?? [])
      setIcalConnected(true)
    } catch (e) {
      setIcalError(String(e))
      setIcalConnected(false)
    } finally {
      setIcalLoading(false)
    }
  }, [])

  useEffect(() => {
    if (icalUrl) fetchIcal(icalUrl)
  }, [icalUrl, fetchIcal])

  async function handleSync() {
    setSyncing(true)
    setSyncDone(false)
    if (icalUrl) await fetchIcal(icalUrl)
    setSyncing(false)
    setSyncDone(true)
    setTimeout(() => setSyncDone(false), 3000)
  }

  function getEventsForDay(dayDate: Date): CalendarEvent[] {
    return calendarEvents.filter(e => isSameDay(new Date(e.start_time), dayDate))
  }

  function getIcalEventsForDay(dayDate: Date): ICalEvent[] {
    return icalEvents.filter(e => isSameDay(new Date(e.start), dayDate) && !e.allDay)
  }

  function getAllDayEventsForDay(dayDate: Date): ICalEvent[] {
    return icalEvents.filter(e => {
      if (!e.allDay) return false
      const s = new Date(e.start)
      const en = new Date(e.end)
      return dayDate >= s && dayDate < en
    })
  }

  function handleAddEvent(e: React.FormEvent) {
    e.preventDefault()
    if (!form.title.trim()) return
    const newEvent: CalendarEvent = {
      id: `ev-${Date.now()}`,
      user_id: '1',
      title: form.title,
      description: form.description,
      start_time: `${form.date}T${form.startTime}:00`,
      end_time: `${form.date}T${form.endTime}:00`,
      type: form.type as CalendarEvent['type'],
      source: 'platform',
      location: form.location,
      created_at: new Date().toISOString(),
    }
    addCalendarEvent(newEvent)
    setShowAddModal(false)
    setForm(EMPTY_FORM)
  }

  const selectedDate = weekDates[selectedDayIndex] ?? today
  const dayLocalEvents = getEventsForDay(selectedDate)
  const dayIcalEvents = getIcalEventsForDay(selectedDate)

  return (
    <div className="space-y-4 h-full">

      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-3">
            <Calendar className="text-violet-600" size={24} />
            Calendar
          </h1>
          <p className="text-slate-500 text-sm mt-1">{formatWeekLabel(monday)}</p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <div className="flex bg-white border border-slate-200 rounded-xl p-1 shadow-sm">
            {(['week', 'day'] as const).map(v => (
              <button key={v} onClick={() => setView(v)}
                className={cn('px-3 py-1.5 rounded-lg text-sm font-medium transition-all capitalize',
                  view === v ? 'bg-indigo-600 text-white shadow-sm' : 'text-slate-500 hover:text-slate-700')}>
                {v}
              </button>
            ))}
            <button className="px-3 py-1.5 rounded-lg text-sm font-medium text-slate-300 cursor-not-allowed">Month</button>
          </div>

          <a href="/capture?tab=email"
            className="flex items-center gap-1.5 px-3 py-2 bg-white hover:bg-slate-50 border border-slate-200 text-slate-600 rounded-xl text-sm font-medium transition-all shadow-sm">
            <Mail size={13} />
            From Email
          </a>

          <button onClick={handleSync} disabled={syncing || icalLoading}
            className="flex items-center gap-2 px-3 py-2 bg-white hover:bg-slate-50 border border-slate-200 text-slate-600 rounded-xl text-sm font-medium transition-all shadow-sm disabled:opacity-70">
            {syncing || icalLoading ? <Loader2 size={14} className="animate-spin" /> : syncDone ? <Check size={14} className="text-emerald-500" /> : <RefreshCw size={14} />}
            {syncDone ? 'Synced!' : 'Sync'}
          </button>

          <button onClick={() => { setForm({ ...EMPTY_FORM, date: selectedDate.toISOString().slice(0, 10) }); setShowAddModal(true) }}
            className="flex items-center gap-2 px-3 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-sm font-semibold transition-all shadow-sm">
            <Plus size={14} />
            Add Event
          </button>
        </div>
      </div>

      {/* Outlook status banner */}
      {icalLoading && (
        <div className="flex items-center gap-3 px-4 py-3 bg-blue-50 border border-blue-200 rounded-xl">
          <Loader2 size={14} className="text-blue-500 animate-spin flex-shrink-0" />
          <span className="text-sm text-blue-700 font-medium">Loading Bowdoin Outlook calendar…</span>
        </div>
      )}
      {!icalLoading && icalConnected && (
        <div className="flex items-center gap-3 px-4 py-3 bg-emerald-50 border border-emerald-200 rounded-xl">
          <div className="w-2 h-2 rounded-full bg-emerald-500 flex-shrink-0 animate-pulse" />
          <span className="text-sm text-emerald-700 font-medium">Bowdoin Outlook calendar connected</span>
          <span className="text-xs text-emerald-600 ml-1">· {icalEvents.length} events loaded</span>
        </div>
      )}
      {!icalLoading && icalError && (
        <div className="flex items-center gap-3 px-4 py-3 bg-red-50 border border-red-200 rounded-xl">
          <div className="w-2 h-2 rounded-full bg-red-500 flex-shrink-0" />
          <span className="text-sm text-red-700 font-medium">Could not load Outlook calendar — {icalError}</span>
        </div>
      )}
      {!icalLoading && !icalConnected && !icalError && !icalUrl && (
        <div className="flex items-center gap-3 px-4 py-3 bg-amber-50 border border-amber-200 rounded-xl">
          <div className="w-2 h-2 rounded-full bg-amber-400 flex-shrink-0" />
          <span className="text-sm text-amber-700 font-medium">Outlook calendar not connected</span>
          <a href="/settings" className="ml-auto text-xs text-amber-700 hover:text-amber-800 border border-amber-300 hover:border-amber-400 bg-white px-3 py-1.5 rounded-lg transition-colors font-medium">
            Connect in Settings
          </a>
        </div>
      )}

      {/* WEEK VIEW */}
      {view === 'week' && (
        <>
          <div className="flex items-center gap-3">
            <button onClick={() => { const m = new Date(monday); m.setDate(m.getDate() - 7); setMonday(m) }}
              className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-all">
              <ChevronLeft size={16} />
            </button>
            <span className="text-slate-900 font-semibold text-sm">{formatWeekLabel(monday)}</span>
            <button onClick={() => { const m = new Date(monday); m.setDate(m.getDate() + 7); setMonday(m) }}
              className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-all">
              <ChevronRight size={16} />
            </button>
            <button onClick={() => setMonday(getMonday(new Date()))}
              className="text-xs text-indigo-600 hover:text-indigo-800 px-2 py-1 rounded-lg hover:bg-indigo-50 transition-all font-medium">
              Today
            </button>
          </div>

          <div className="bg-white border border-black/[0.07] rounded-2xl shadow-sm overflow-hidden flex flex-col">
            {/* Day headers */}
            <div className="grid bg-slate-50 border-b border-slate-100" style={{ gridTemplateColumns: '56px repeat(7, 1fr)' }}>
              <div className="border-r border-slate-100" />
              {DAY_LABELS.map((day, i) => {
                const date = weekDates[i]
                const isToday = isSameDay(date, today)
                const allDay = getAllDayEventsForDay(date)
                return (
                  <button key={day} onClick={() => { setSelectedDayIndex(i); setView('day') }}
                    className={cn('py-2 text-center border-r border-slate-100 last:border-r-0 hover:bg-slate-100 transition-colors', isToday && 'bg-indigo-50/40')}>
                    <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider">{day}</div>
                    <div className={cn('text-sm font-bold mt-0.5', isToday ? 'text-indigo-600' : 'text-slate-700')}>
                      {date.getDate()}
                    </div>
                    {allDay.length > 0 && (
                      <div className="mt-1 px-1 space-y-0.5">
                        {allDay.slice(0, 2).map(e => (
                          <div key={e.id} className="text-xs bg-blue-100 text-blue-700 rounded px-1 truncate">{e.title}</div>
                        ))}
                        {allDay.length > 2 && <div className="text-xs text-slate-400">+{allDay.length - 2}</div>}
                      </div>
                    )}
                  </button>
                )
              })}
            </div>

            {/* Time grid */}
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
                {DAY_LABELS.map((day, dayIndex) => {
                  const dayDate = weekDates[dayIndex]
                  const localEvs = getEventsForDay(dayDate)
                  const icEvs = getIcalEventsForDay(dayDate)
                  const isToday = isSameDay(dayDate, today)
                  return (
                    <div key={day} className={cn('relative border-r border-slate-100 last:border-r-0', isToday && 'bg-indigo-50/20')}>
                      {HOURS.map(hour => (
                        <div key={hour} style={{ height: `${CELL_HEIGHT}px` }} className="border-b border-slate-100/80" />
                      ))}
                      {localEvs.map(event => (
                        <button key={event.id} onClick={() => setSelectedEvent(event)}
                          style={{ ...getEventStyle(event.start_time, event.end_time), position: 'absolute', left: '2px', right: '2px' }}
                          className={cn('rounded-md border-l-2 px-2 py-1 text-left overflow-hidden transition-all hover:opacity-80 hover:shadow-sm',
                            EVENT_COLORS[event.type] ?? 'bg-slate-100 border-slate-400 text-slate-700')}>
                          <div className="text-xs font-semibold truncate leading-tight">{event.title}</div>
                          <div className="text-xs opacity-70 truncate">
                            {new Date(event.start_time).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true })}
                          </div>
                        </button>
                      ))}
                      {icEvs.map(event => (
                        <button key={event.id} onClick={() => setSelectedEvent({ ...event, type: 'outlook', source: 'outlook' })}
                          style={{ ...getEventStyle(event.start, event.end), position: 'absolute', left: '2px', right: '2px' }}
                          className="rounded-md border-l-2 bg-blue-50 border-blue-400 text-blue-800 px-2 py-1 text-left overflow-hidden transition-all hover:opacity-80 hover:shadow-sm">
                          <div className="text-xs font-semibold truncate leading-tight">{event.title}</div>
                          <div className="text-xs opacity-70 truncate">
                            {new Date(event.start).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true })}
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
                {DAY_LABELS[selectedDayIndex]}, {selectedDate.toLocaleDateString('en-US', { month: 'long', day: 'numeric' })}
              </span>
              {todayDayIndex === selectedDayIndex && (
                <span className="ml-2 text-xs bg-indigo-100 text-indigo-700 px-2 py-0.5 rounded-full font-medium">Today</span>
              )}
            </div>
            <button onClick={() => setSelectedDayIndex(i => Math.min(6, i + 1))}
              className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-all">
              <ChevronRight size={16} />
            </button>
          </div>

          {/* All-day events */}
          {getAllDayEventsForDay(selectedDate).length > 0 && (
            <div className="bg-blue-50 border border-blue-200 rounded-xl px-4 py-2 flex flex-wrap gap-2">
              {getAllDayEventsForDay(selectedDate).map(e => (
                <span key={e.id} className="text-xs bg-blue-100 text-blue-700 border border-blue-200 rounded-full px-3 py-1">{e.title}</span>
              ))}
            </div>
          )}

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
                <div className={cn('relative', todayDayIndex === selectedDayIndex && 'bg-indigo-50/20')}>
                  {HOURS.map(hour => (
                    <div key={hour} style={{ height: `${CELL_HEIGHT}px` }} className="border-b border-slate-100/80" />
                  ))}
                  {dayLocalEvents.length === 0 && dayIcalEvents.length === 0 && (
                    <div className="absolute inset-0 flex items-center justify-center text-slate-400 text-sm">
                      No events — <button onClick={() => setShowAddModal(true)} className="ml-1 text-indigo-600 hover:underline">Add one</button>
                    </div>
                  )}
                  {dayLocalEvents.map(event => (
                    <button key={event.id} onClick={() => setSelectedEvent(event)}
                      style={{ ...getEventStyle(event.start_time, event.end_time), position: 'absolute', left: '4px', right: '4px' }}
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
                  {dayIcalEvents.map(event => (
                    <button key={event.id} onClick={() => setSelectedEvent({ ...event, type: 'outlook', source: 'outlook' })}
                      style={{ ...getEventStyle(event.start, event.end), position: 'absolute', left: '4px', right: '4px' }}
                      className="rounded-lg border-l-4 bg-blue-50 border-blue-400 text-blue-800 px-3 py-2 text-left overflow-hidden transition-all hover:opacity-80 hover:shadow-sm">
                      <div className="text-sm font-semibold leading-tight">{event.title}</div>
                      <div className="text-xs opacity-70 mt-0.5 flex items-center gap-1">
                        <Clock size={10} />
                        {new Date(event.start).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true })}
                        {' – '}
                        {new Date(event.end).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true })}
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
        {Object.entries({ Class: 'class', 'Study Block': 'study', Meeting: 'meeting', Deadline: 'deadline', Personal: 'personal', Outlook: 'outlook' }).map(([label, type]) => (
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
              EVENT_TYPE_LABEL[('type' in selectedEvent ? selectedEvent.type : 'outlook')] ?? 'bg-slate-100 text-slate-600 border-slate-200')}>
              {'source' in selectedEvent && selectedEvent.source === 'outlook' ? 'Outlook' : ('type' in selectedEvent ? selectedEvent.type : 'event')}
            </span>
            <button onClick={() => setSelectedEvent(null)}
              className="text-slate-400 hover:text-slate-600 text-xl leading-none transition-colors">×</button>
          </div>
          <h3 className="font-semibold text-slate-900 mb-3 leading-snug">{selectedEvent.title}</h3>
          <div className="space-y-2 text-sm text-slate-500">
            <div className="flex items-center gap-2">
              <Clock size={13} className="text-slate-400 flex-shrink-0" />
              <span>
                {'start_time' in selectedEvent
                  ? `${new Date(selectedEvent.start_time).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true })} – ${new Date(selectedEvent.end_time).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true })}`
                  : `${new Date(selectedEvent.start).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true })} – ${new Date(selectedEvent.end).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true })}`
                }
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
                {'source' in selectedEvent && selectedEvent.source === 'outlook' ? 'Bowdoin Outlook' :
                 'source' in selectedEvent && selectedEvent.source === 'google' ? 'Google Calendar' :
                 'source' in selectedEvent && selectedEvent.source === 'ai' ? 'AI Scheduled' : 'Nexus'}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Add Event Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/30 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          onClick={e => { if (e.target === e.currentTarget) setShowAddModal(false) }}>
          <div className="bg-white rounded-2xl shadow-2xl border border-black/[0.08] p-6 w-full max-w-md">
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
                  placeholder="Optional notes" rows={2}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:border-indigo-400 transition-all resize-none" />
              </div>
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
