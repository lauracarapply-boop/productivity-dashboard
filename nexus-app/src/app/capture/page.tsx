'use client'

import { useState } from 'react'
import {
  Zap, FileText, CheckSquare, Calendar, Upload, HardDrive,
  Sparkles, ArrowRight, Loader2, AlertTriangle, X, Clock, Flag, Mail, Check,
} from 'lucide-react'
import { extractStructuredItemsFromText, parseEmailForCalendar } from '@/lib/ai-service'
import { useApp } from '@/lib/store'
import { mockCourses, mockWorkspaces } from '@/lib/mock-data'
import type { AIInboxItem, CalendarEvent } from '@/lib/types'

// ── Types ──────────────────────────────────────────────────────

type InputTab = 'braindump' | 'quick-task' | 'quick-event' | 'email' | 'file-upload' | 'drive'

interface ExtractedCardItem {
  id: string
  type: 'task' | 'event' | 'deadline' | 'note'
  title: string
  confidence: number
  details?: Record<string, string>
  workspaceId?: string
  courseId?: string
}

// ── Helpers ────────────────────────────────────────────────────

function ConfidenceBar({ value }: { value: number }) {
  const pct = Math.round(value * 100)
  const color =
    pct >= 80 ? 'bg-emerald-500' : pct >= 60 ? 'bg-amber-500' : 'bg-red-500'
  const textColor =
    pct >= 80 ? 'text-emerald-600' : pct >= 60 ? 'text-amber-600' : 'text-red-600'

  return (
    <div className="flex items-center gap-2">
      <div className="flex-1 h-1.5 bg-slate-200 rounded-full overflow-hidden">
        <div
          className={`h-full rounded-full transition-all ${color}`}
          style={{ width: `${pct}%` }}
        />
      </div>
      <span className={`text-xs font-medium tabular-nums ${textColor}`}>{pct}%</span>
    </div>
  )
}

function TypeBadge({ type }: { type: ExtractedCardItem['type'] }) {
  const map: Record<ExtractedCardItem['type'], { label: string; cls: string }> = {
    task: { label: 'Task', cls: 'bg-indigo-100 text-indigo-700 border-indigo-200' },
    event: { label: 'Event', cls: 'bg-violet-100 text-violet-700 border-violet-200' },
    deadline: { label: 'Deadline', cls: 'bg-amber-100 text-amber-700 border-amber-200' },
    note: { label: 'Note', cls: 'bg-emerald-100 text-emerald-700 border-emerald-200' },
  }
  const { label, cls } = map[type]
  return (
    <span className={`px-2 py-0.5 rounded-full text-xs font-medium border ${cls}`}>
      {label}
    </span>
  )
}

// ── Main Component ─────────────────────────────────────────────

export default function CapturePage() {
  const { aiInboxItems, addAIInboxItem, addCalendarEvent } = useApp()

  // Tab state
  const [activeTab, setActiveTab] = useState<InputTab>('braindump')

  // Brain dump state
  const [dumpText, setDumpText] = useState('')
  const [isExtracting, setIsExtracting] = useState(false)
  const [extractedItems, setExtractedItems] = useState<ExtractedCardItem[]>([])
  const [hasSentToInbox, setHasSentToInbox] = useState(false)

  // Per-card editable state: { [id]: title }
  const [editableTitles, setEditableTitles] = useState<Record<string, string>>({})
  // Per-card workspace/course selection
  const [cardWorkspace, setCardWorkspace] = useState<Record<string, string>>({})
  const [cardCourse, setCardCourse] = useState<Record<string, string>>({})

  // Quick Task form
  const [qtTitle, setQtTitle] = useState('')
  const [qtPriority, setQtPriority] = useState('medium')
  const [qtDue, setQtDue] = useState('')
  const [qtCourse, setQtCourse] = useState('')
  const [qtDuration, setQtDuration] = useState('')
  const [qtAdded, setQtAdded] = useState(false)

  // Email → Calendar state
  const [emailText, setEmailText] = useState('')
  const [emailParsing, setEmailParsing] = useState(false)
  const [parsedEvent, setParsedEvent] = useState<Awaited<ReturnType<typeof parseEmailForCalendar>> | null>(null)
  const [emailAdded, setEmailAdded] = useState(false)
  const [emailEditTitle, setEmailEditTitle] = useState('')
  const [emailEditDate, setEmailEditDate] = useState('')
  const [emailEditStart, setEmailEditStart] = useState('')
  const [emailEditEnd, setEmailEditEnd] = useState('')
  const [emailEditLocation, setEmailEditLocation] = useState('')

  async function handleParseEmail() {
    if (!emailText.trim()) return
    setEmailParsing(true)
    setParsedEvent(null)
    setEmailAdded(false)
    const result = await parseEmailForCalendar(emailText)
    setParsedEvent(result)
    setEmailEditTitle(result.title)
    setEmailEditDate(result.date)
    setEmailEditStart(result.startTime)
    setEmailEditEnd(result.endTime)
    setEmailEditLocation(result.location)
    setEmailParsing(false)
  }

  function handleAddParsedEventToCalendar() {
    if (!parsedEvent) return
    const event: CalendarEvent = {
      id: `ev-email-${Date.now()}`,
      user_id: '1',
      title: emailEditTitle || parsedEvent.title,
      description: parsedEvent.description,
      start_time: `${emailEditDate}T${emailEditStart}:00`,
      end_time: `${emailEditDate}T${emailEditEnd}:00`,
      type: parsedEvent.type as CalendarEvent['type'],
      source: 'email',
      location: emailEditLocation,
      created_at: new Date().toISOString(),
    }
    addCalendarEvent(event)
    setEmailAdded(true)
    setParsedEvent(null)
    setEmailText('')
  }

  // Quick Event form
  const [qeTitle, setQeTitle] = useState('')
  const [qeDate, setQeDate] = useState('')
  const [qeStart, setQeStart] = useState('')
  const [qeEnd, setQeEnd] = useState('')
  const [qeType, setQeType] = useState('meeting')
  const [qeLocation, setQeLocation] = useState('')
  const [qeAdded, setQeAdded] = useState(false)

  const EXAMPLES = [
    "Read chapter 3 by Friday, email professor about office hours tomorrow, and review session Monday at 4 PM",
    "Essay draft due next Thursday 2000 words, French vocab quiz Friday, Chinese character practice daily",
  ]

  // ── Extract handler ───────────────────────────────────────────

  async function handleExtract() {
    if (!dumpText.trim()) return
    setIsExtracting(true)
    setExtractedItems([])
    setHasSentToInbox(false)
    setEditableTitles({})
    setCardWorkspace({})
    setCardCourse({})

    try {
      const result = await extractStructuredItemsFromText(dumpText)
      const items: ExtractedCardItem[] = []

      result.tasks.forEach((t, i) => {
        items.push({
          id: `extracted-task-${i}`,
          type: 'task',
          title: t.title ?? 'Captured task',
          confidence: result.confidence,
          details: {
            priority: t.priority ?? 'medium',
            status: t.status ?? 'todo',
          },
        })
      })

      result.events.forEach((e, i) => {
        items.push({
          id: `extracted-event-${i}`,
          type: 'event',
          title: e.title ?? 'Captured event',
          confidence: result.confidence,
          details: {
            type: e.type ?? 'meeting',
          },
        })
      })

      result.deadlines.forEach((d, i) => {
        items.push({
          id: `extracted-deadline-${i}`,
          type: 'deadline',
          title: d.title ?? 'Deadline',
          confidence: result.confidence,
          details: { date: d.date },
        })
      })

      result.notes.forEach((n, i) => {
        items.push({
          id: `extracted-note-${i}`,
          type: 'note',
          title: n.title ?? 'Captured note',
          confidence: result.confidence,
        })
      })

      setExtractedItems(items)
    } finally {
      setIsExtracting(false)
    }
  }

  // ── Send to Inbox ─────────────────────────────────────────────

  function handleSendToInbox() {
    extractedItems.forEach(item => {
      const title = editableTitles[item.id] ?? item.title
      const newItem: AIInboxItem = {
        id: `ai-capture-${Date.now()}-${item.id}`,
        user_id: '1',
        type: item.type === 'deadline' ? 'deadline' : item.type === 'note' ? 'note' : item.type === 'event' ? 'event' : 'task',
        title,
        extracted_data: item.details ?? {},
        source_type: 'capture',
        source_text: dumpText,
        suggested_workspace_id: cardWorkspace[item.id] || undefined,
        suggested_course_id: cardCourse[item.id] || undefined,
        confidence: item.confidence,
        status: 'pending',
        created_at: new Date().toISOString(),
      }
      addAIInboxItem(newItem)
    })
    setHasSentToInbox(true)
    setExtractedItems([])
    setDumpText('')
  }

  function handleDiscard() {
    setExtractedItems([])
    setHasSentToInbox(false)
  }

  // ── Quick Task submit ─────────────────────────────────────────

  function handleAddQuickTask(e: React.FormEvent) {
    e.preventDefault()
    if (!qtTitle.trim()) return
    const newItem: AIInboxItem = {
      id: `ai-qt-${Date.now()}`,
      user_id: '1',
      type: 'task',
      title: qtTitle,
      extracted_data: {
        priority: qtPriority,
        due_date: qtDue,
        estimated_minutes: qtDuration ? parseInt(qtDuration) * 60 : undefined,
      },
      source_type: 'capture',
      suggested_course_id: qtCourse || undefined,
      confidence: 1,
      status: 'pending',
      created_at: new Date().toISOString(),
    }
    addAIInboxItem(newItem)
    setQtTitle(''); setQtDue(''); setQtCourse(''); setQtDuration(''); setQtPriority('medium')
    setQtAdded(true)
    setTimeout(() => setQtAdded(false), 3000)
  }

  // ── Quick Event submit ────────────────────────────────────────

  function handleAddQuickEvent(e: React.FormEvent) {
    e.preventDefault()
    if (!qeTitle.trim()) return
    const newItem: AIInboxItem = {
      id: `ai-qe-${Date.now()}`,
      user_id: '1',
      type: 'event',
      title: qeTitle,
      extracted_data: {
        date: qeDate,
        start_time: qeStart,
        end_time: qeEnd,
        type: qeType,
        location: qeLocation,
      },
      source_type: 'capture',
      confidence: 1,
      status: 'pending',
      created_at: new Date().toISOString(),
    }
    addAIInboxItem(newItem)
    setQeTitle(''); setQeDate(''); setQeStart(''); setQeEnd(''); setQeType('meeting'); setQeLocation('')
    setQeAdded(true)
    setTimeout(() => setQeAdded(false), 3000)
  }

  // ── Grouped icons per type ────────────────────────────────────

  const typeIcon = {
    task: <CheckSquare size={15} className="text-indigo-500" />,
    event: <Calendar size={15} className="text-violet-500" />,
    deadline: <AlertTriangle size={15} className="text-amber-500" />,
    note: <FileText size={15} className="text-emerald-500" />,
  }

  const recentCaptures = [...aiInboxItems]
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
    .slice(0, 3)

  // ── Tab config ────────────────────────────────────────────────

  const tabs: { id: InputTab; label: string; icon: React.ReactNode }[] = [
    { id: 'braindump', label: 'Text / Brain Dump', icon: <Sparkles size={14} /> },
    { id: 'quick-task', label: 'Quick Task', icon: <CheckSquare size={14} /> },
    { id: 'quick-event', label: 'Quick Event', icon: <Calendar size={14} /> },
    { id: 'email', label: 'Email → Calendar', icon: <Mail size={14} /> },
    { id: 'file-upload', label: 'File Upload', icon: <Upload size={14} /> },
    { id: 'drive', label: 'Drive Import', icon: <HardDrive size={14} /> },
  ]

  return (
    <div className="space-y-8 max-w-4xl">
      {/* ── Header ── */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
          <Zap size={22} className="text-indigo-600" />
          Capture
        </h1>
        <p className="text-slate-500 text-sm mt-1">Turn messy thoughts into structured knowledge</p>
      </div>

      {/* ── Input method tabs ── */}
      <div className="flex flex-wrap gap-1 p-1 bg-slate-100 border border-slate-200 rounded-xl w-fit">
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-all duration-150 ${
              activeTab === tab.id
                ? 'bg-white text-slate-900 shadow-sm'
                : 'text-slate-500 hover:text-slate-700 hover:bg-white/60'
            }`}
          >
            {tab.icon}
            {tab.label}
          </button>
        ))}
      </div>

      {/* ── Tab: Brain Dump ── */}
      {activeTab === 'braindump' && (
        <div className="space-y-5">
          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-4">
            <textarea
              value={dumpText}
              onChange={e => setDumpText(e.target.value)}
              placeholder="Paste a syllabus, email, class announcement, WhatsApp message, assignment, messy thought…"
              className="w-full min-h-[180px] bg-transparent text-slate-700 placeholder-slate-300 text-base leading-relaxed resize-none focus:outline-none"
            />

            {/* Character count */}
            <div className="flex items-center justify-between">
              <p className="text-xs text-slate-400">
                {dumpText.length} characters
              </p>
            </div>

            {/* Example prompt chips */}
            <div>
              <p className="text-xs text-slate-400 mb-2">Try an example:</p>
              <div className="flex flex-col gap-2">
                {EXAMPLES.map((ex, i) => (
                  <button
                    key={i}
                    onClick={() => setDumpText(ex)}
                    className="text-left px-3 py-2 rounded-full border border-slate-200 bg-slate-100 text-xs text-slate-500 hover:bg-indigo-50 hover:text-indigo-700 hover:border-indigo-200 transition-all"
                  >
                    <ArrowRight size={11} className="inline mr-1.5 text-indigo-500" />
                    {ex}
                  </button>
                ))}
              </div>
            </div>

            {/* Submit button */}
            <button
              onClick={handleExtract}
              disabled={!dumpText.trim() || isExtracting}
              className="flex items-center justify-center gap-2 px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed text-white text-sm font-semibold rounded-xl transition-all duration-200"
            >
              {isExtracting ? (
                <>
                  <Loader2 size={15} className="animate-spin" />
                  Analyzing your text with AI...
                </>
              ) : (
                <>
                  <Sparkles size={15} />
                  Extract with AI
                </>
              )}
            </button>
          </div>

          {/* ── Loading skeleton ── */}
          {isExtracting && (
            <div className="bg-slate-50 rounded-xl p-6 space-y-3">
              <p className="text-sm text-slate-500 flex items-center gap-2">
                <Loader2 size={14} className="animate-spin text-indigo-500" />
                Analyzing your text with AI...
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {[1, 2, 3].map(n => (
                  <div key={n} className="bg-white border border-slate-200 rounded-xl p-4 space-y-3 animate-pulse">
                    <div className="h-3 bg-slate-200 rounded w-20" />
                    <div className="h-4 bg-slate-200 rounded w-3/4" />
                    <div className="h-2 bg-slate-200 rounded w-full" />
                    <div className="h-2 bg-slate-200 rounded w-1/2" />
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ── Success message ── */}
          {hasSentToInbox && !isExtracting && (
            <div className="flex items-center gap-3 p-4 bg-emerald-50 border border-emerald-200 rounded-xl">
              <div className="w-8 h-8 rounded-full bg-emerald-100 flex items-center justify-center flex-shrink-0">
                <Sparkles size={14} className="text-emerald-600" />
              </div>
              <div>
                <p className="text-sm font-semibold text-emerald-700">Sent to AI Inbox!</p>
                <p className="text-xs text-emerald-600 mt-0.5">
                  All extracted items are now in your AI Inbox for review.{' '}
                  <a href="/ai-inbox" className="underline hover:text-emerald-800">Go to AI Inbox →</a>
                </p>
              </div>
            </div>
          )}

          {/* ── Extraction results ── */}
          {extractedItems.length > 0 && !isExtracting && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-sm font-semibold text-slate-800">
                  I found these possible actions in your text.
                  <span className="ml-2 px-2 py-0.5 rounded-full bg-indigo-100 text-indigo-700 text-xs border border-indigo-200">
                    {extractedItems.length}
                  </span>
                </h2>
                <p className="text-xs text-slate-400">Review and edit before sending</p>
              </div>

              {/* Group by type */}
              {(['task', 'event', 'deadline', 'note'] as const).map(type => {
                const group = extractedItems.filter(item => item.type === type)
                if (group.length === 0) return null
                const groupStyle: Record<string, string> = {
                  task: 'bg-indigo-50/80 border border-indigo-200/60 rounded-xl p-4',
                  event: 'bg-violet-50/80 border border-violet-200/60 rounded-xl p-4',
                  deadline: 'bg-amber-50/80 border border-amber-200/60 rounded-xl p-4',
                  note: 'bg-emerald-50/80 border border-emerald-200/60 rounded-xl p-4',
                }
                const leftBorder: Record<string, string> = {
                  task: 'border-l-4 border-indigo-400 pl-3',
                  event: 'border-l-4 border-violet-400 pl-3',
                  deadline: 'border-l-4 border-amber-400 pl-3',
                  note: 'border-l-4 border-emerald-400 pl-3',
                }
                return (
                  <div key={type} className={groupStyle[type]}>
                    <div className="flex items-center gap-2 mb-3">
                      {typeIcon[type]}
                      <span className="text-xs font-semibold text-slate-600 uppercase tracking-wider">{type}s</span>
                    </div>
                    <div className="space-y-3">
                      {group.map(item => (
                        <div key={item.id} className={`bg-white rounded-lg p-3 shadow-sm ${leftBorder[type]}`}>
                          <div className="flex items-center justify-between gap-2 mb-2">
                            <TypeBadge type={item.type} />
                          </div>
                          {/* Editable title */}
                          <input
                            type="text"
                            value={editableTitles[item.id] ?? item.title}
                            onChange={e =>
                              setEditableTitles(prev => ({ ...prev, [item.id]: e.target.value }))
                            }
                            className="w-full bg-transparent text-sm font-semibold text-slate-800 border-b border-slate-200 pb-1 focus:outline-none focus:border-indigo-400 transition-colors"
                          />
                          {/* Confidence */}
                          <div className="mt-2">
                            <p className="text-xs text-slate-400 mb-1">Confidence</p>
                            <ConfidenceBar value={item.confidence} />
                          </div>
                          {/* Details */}
                          {item.details && Object.keys(item.details).length > 0 && (
                            <div className="flex flex-wrap gap-2 mt-2">
                              {Object.entries(item.details).map(([k, v]) => (
                                <span
                                  key={k}
                                  className="text-xs px-2 py-0.5 rounded-md bg-slate-100 border border-slate-200 text-slate-500"
                                >
                                  <span className="text-slate-400">{k}:</span> {v}
                                </span>
                              ))}
                            </div>
                          )}
                          {/* Workspace / Course selectors */}
                          <div className="flex gap-2 mt-2">
                            <select
                              value={cardWorkspace[item.id] ?? ''}
                              onChange={e =>
                                setCardWorkspace(prev => ({ ...prev, [item.id]: e.target.value }))
                              }
                              className="flex-1 text-xs bg-slate-50 border border-slate-200 rounded-lg px-2 py-1 text-slate-500 focus:outline-none focus:border-indigo-400"
                            >
                              <option value="">Workspace...</option>
                              {mockWorkspaces.map(ws => (
                                <option key={ws.id} value={ws.id}>{ws.name}</option>
                              ))}
                            </select>
                            <select
                              value={cardCourse[item.id] ?? ''}
                              onChange={e =>
                                setCardCourse(prev => ({ ...prev, [item.id]: e.target.value }))
                              }
                              className="flex-1 text-xs bg-slate-50 border border-slate-200 rounded-lg px-2 py-1 text-slate-500 focus:outline-none focus:border-indigo-400"
                            >
                              <option value="">Course...</option>
                              {mockCourses.map(c => (
                                <option key={c.id} value={c.id}>{c.code}</option>
                              ))}
                            </select>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )
              })}

              {/* Action buttons */}
              <div className="flex items-center gap-3 pt-1">
                <button
                  onClick={handleSendToInbox}
                  className="flex items-center gap-2 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold rounded-xl transition-all duration-200"
                >
                  <ArrowRight size={14} />
                  Send to AI Inbox
                </button>
                <button
                  onClick={handleDiscard}
                  className="flex items-center gap-2 px-4 py-2.5 text-slate-500 hover:text-slate-700 text-sm font-medium rounded-xl border border-slate-200 hover:border-slate-300 transition-all duration-200"
                >
                  <X size={14} />
                  Discard
                </button>
              </div>
            </div>
          )}

          {/* ── No results notice ── */}
          {!isExtracting && extractedItems.length === 0 && dumpText.trim() && hasSentToInbox === false && (
            <div className="text-center py-6 text-slate-400 text-sm">
              No items extracted yet — click <span className="text-indigo-600 font-medium">Extract with AI</span> to analyse your text.
            </div>
          )}
        </div>
      )}

      {/* ── Tab: Quick Task ── */}
      {activeTab === 'quick-task' && (
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
          <h2 className="text-sm font-semibold text-slate-800 mb-4 flex items-center gap-2">
            <CheckSquare size={15} className="text-indigo-600" />
            Quick Task
          </h2>
          <form onSubmit={handleAddQuickTask} className="space-y-4">
            <div>
              <label className="text-xs text-slate-500 mb-1 block">Title</label>
              <input
                type="text"
                value={qtTitle}
                onChange={e => setQtTitle(e.target.value)}
                placeholder="What needs to get done?"
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:border-indigo-400 focus:ring-1 focus:ring-indigo-200 transition-all"
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs text-slate-500 mb-1 block flex items-center gap-1">
                  <Flag size={11} /> Priority
                </label>
                <select
                  value={qtPriority}
                  onChange={e => setQtPriority(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-sm text-slate-700 focus:outline-none focus:border-indigo-400"
                >
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                  <option value="urgent">Urgent</option>
                </select>
              </div>
              <div>
                <label className="text-xs text-slate-500 mb-1 block flex items-center gap-1">
                  <Calendar size={11} /> Due Date
                </label>
                <input
                  type="date"
                  value={qtDue}
                  onChange={e => setQtDue(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-sm text-slate-700 focus:outline-none focus:border-indigo-400"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs text-slate-500 mb-1 block">Course</label>
                <select
                  value={qtCourse}
                  onChange={e => setQtCourse(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-sm text-slate-700 focus:outline-none focus:border-indigo-400"
                >
                  <option value="">No course</option>
                  {mockCourses.map(c => (
                    <option key={c.id} value={c.id}>{c.code} — {c.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-xs text-slate-500 mb-1 block flex items-center gap-1">
                  <Clock size={11} /> Estimated Duration (hrs)
                </label>
                <input
                  type="number"
                  min="0.5"
                  step="0.5"
                  value={qtDuration}
                  onChange={e => setQtDuration(e.target.value)}
                  placeholder="e.g. 1.5"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-sm text-slate-700 placeholder-slate-400 focus:outline-none focus:border-indigo-400"
                />
              </div>
            </div>

            <button
              type="submit"
              className="w-full flex items-center justify-center gap-2 px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold rounded-xl transition-all duration-200"
            >
              <CheckSquare size={14} />
              Add Task
            </button>

            {qtAdded && (
              <p className="text-center text-xs text-emerald-600">
                Task added to AI Inbox for review!{' '}
                <a href="/ai-inbox" className="underline hover:text-emerald-700">View →</a>
              </p>
            )}
          </form>
        </div>
      )}

      {/* ── Tab: Quick Event ── */}
      {activeTab === 'quick-event' && (
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
          <h2 className="text-sm font-semibold text-slate-800 mb-4 flex items-center gap-2">
            <Calendar size={15} className="text-violet-600" />
            Quick Event
          </h2>
          <form onSubmit={handleAddQuickEvent} className="space-y-4">
            <div>
              <label className="text-xs text-slate-500 mb-1 block">Title</label>
              <input
                type="text"
                value={qeTitle}
                onChange={e => setQeTitle(e.target.value)}
                placeholder="Event name"
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:border-indigo-400 focus:ring-1 focus:ring-indigo-200 transition-all"
                required
              />
            </div>

            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className="text-xs text-slate-500 mb-1 block">Date</label>
                <input
                  type="date"
                  value={qeDate}
                  onChange={e => setQeDate(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-sm text-slate-700 focus:outline-none focus:border-indigo-400"
                />
              </div>
              <div>
                <label className="text-xs text-slate-500 mb-1 block">Start Time</label>
                <input
                  type="time"
                  value={qeStart}
                  onChange={e => setQeStart(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-sm text-slate-700 focus:outline-none focus:border-indigo-400"
                />
              </div>
              <div>
                <label className="text-xs text-slate-500 mb-1 block">End Time</label>
                <input
                  type="time"
                  value={qeEnd}
                  onChange={e => setQeEnd(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-sm text-slate-700 focus:outline-none focus:border-indigo-400"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs text-slate-500 mb-1 block">Type</label>
                <select
                  value={qeType}
                  onChange={e => setQeType(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-sm text-slate-700 focus:outline-none focus:border-indigo-400"
                >
                  <option value="class">Class</option>
                  <option value="study">Study Session</option>
                  <option value="meeting">Meeting</option>
                  <option value="deadline">Deadline</option>
                  <option value="personal">Personal</option>
                  <option value="appointment">Appointment</option>
                </select>
              </div>
              <div>
                <label className="text-xs text-slate-500 mb-1 block">Location</label>
                <input
                  type="text"
                  value={qeLocation}
                  onChange={e => setQeLocation(e.target.value)}
                  placeholder="Room, Zoom link, etc."
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-sm text-slate-700 placeholder-slate-400 focus:outline-none focus:border-indigo-400"
                />
              </div>
            </div>

            <button
              type="submit"
              className="w-full flex items-center justify-center gap-2 px-6 py-2.5 bg-violet-600 hover:bg-violet-700 text-white text-sm font-semibold rounded-xl transition-all duration-200"
            >
              <Calendar size={14} />
              Add Event
            </button>

            {qeAdded && (
              <p className="text-center text-xs text-emerald-600">
                Event added to AI Inbox for review!{' '}
                <a href="/ai-inbox" className="underline hover:text-emerald-700">View →</a>
              </p>
            )}
          </form>
        </div>
      )}

      {/* ── Tab: Email → Calendar ── */}
      {activeTab === 'email' && (
        <div className="space-y-5 max-w-2xl">
          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-4">
            <div className="flex items-center gap-2 mb-1">
              <Mail size={16} className="text-violet-600" />
              <h2 className="text-sm font-semibold text-slate-800">Email → Calendar</h2>
            </div>
            <p className="text-xs text-slate-500">Paste an email containing an event (invitation, class announcement, meeting request) and AI will extract the details and add it directly to your calendar.</p>
            <textarea
              value={emailText}
              onChange={e => setEmailText(e.target.value)}
              placeholder={'Paste email text here…\n\nExample:\nSubject: Team Meeting – May 15 at 3pm\n\nHi Laura,\n\nLet\'s meet Thursday May 15 at 3pm in Room 204 to discuss the project milestone.\n\nBest,\nProf. Thompson'}
              rows={8}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm text-slate-700 placeholder-slate-300 focus:outline-none focus:border-indigo-400 focus:ring-1 focus:ring-indigo-100 transition-all resize-none font-mono leading-relaxed"
            />
            <button onClick={handleParseEmail} disabled={!emailText.trim() || emailParsing}
              className="flex items-center justify-center gap-2 px-6 py-2.5 bg-violet-600 hover:bg-violet-700 disabled:opacity-50 disabled:cursor-not-allowed text-white text-sm font-semibold rounded-xl transition-all">
              {emailParsing ? <><Loader2 size={14} className="animate-spin" /> Parsing email with AI…</> : <><Sparkles size={14} /> Extract Event from Email</>}
            </button>
          </div>

          {emailParsing && (
            <div className="bg-slate-50 rounded-xl p-5 flex items-center gap-3 text-slate-500 text-sm">
              <Loader2 size={16} className="animate-spin text-violet-500" />
              AI is reading the email and extracting event details…
            </div>
          )}

          {emailAdded && (
            <div className="flex items-center gap-3 px-4 py-3 bg-emerald-50 border border-emerald-200 rounded-xl">
              <Check size={16} className="text-emerald-600 flex-shrink-0" />
              <div>
                <p className="text-sm font-semibold text-emerald-700">Event added to your calendar!</p>
                <p className="text-xs text-emerald-600 mt-0.5">Go to <a href="/calendar" className="underline hover:text-emerald-800">Calendar →</a> to see it</p>
              </div>
            </div>
          )}

          {parsedEvent && !emailParsing && (
            <div className="bg-white border border-violet-200 rounded-2xl p-5 shadow-sm space-y-4">
              <div className="flex items-center gap-2">
                <Sparkles size={14} className="text-violet-600" />
                <span className="text-sm font-semibold text-slate-800">Extracted Event — review & confirm</span>
                <span className="ml-auto text-xs text-slate-400">Confidence: {Math.round(parsedEvent.confidence * 100)}%</span>
              </div>
              <div className="space-y-3">
                <div>
                  <label className="text-xs text-slate-500 mb-1 block">Title</label>
                  <input type="text" value={emailEditTitle} onChange={e => setEmailEditTitle(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm text-slate-800 focus:outline-none focus:border-indigo-400 transition-all" />
                </div>
                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <label className="text-xs text-slate-500 mb-1 block">Date</label>
                    <input type="date" value={emailEditDate} onChange={e => setEmailEditDate(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-sm text-slate-700 focus:outline-none focus:border-indigo-400" />
                  </div>
                  <div>
                    <label className="text-xs text-slate-500 mb-1 block">Start</label>
                    <input type="time" value={emailEditStart} onChange={e => setEmailEditStart(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-sm text-slate-700 focus:outline-none focus:border-indigo-400" />
                  </div>
                  <div>
                    <label className="text-xs text-slate-500 mb-1 block">End</label>
                    <input type="time" value={emailEditEnd} onChange={e => setEmailEditEnd(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-sm text-slate-700 focus:outline-none focus:border-indigo-400" />
                  </div>
                </div>
                <div>
                  <label className="text-xs text-slate-500 mb-1 block">Location</label>
                  <input type="text" value={emailEditLocation} onChange={e => setEmailEditLocation(e.target.value)}
                    placeholder="Location (optional)"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:border-indigo-400 transition-all" />
                </div>
                <div className="flex items-start gap-2 p-3 bg-slate-50 rounded-xl">
                  <FileText size={13} className="text-slate-400 flex-shrink-0 mt-0.5" />
                  <p className="text-xs text-slate-500 leading-relaxed line-clamp-3">{parsedEvent.description}</p>
                </div>
              </div>
              <div className="flex gap-3">
                <button onClick={() => setParsedEvent(null)}
                  className="flex items-center gap-1.5 px-4 py-2.5 border border-slate-200 rounded-xl text-sm text-slate-600 hover:bg-slate-50 transition-all">
                  <X size={13} /> Discard
                </button>
                <button onClick={handleAddParsedEventToCalendar}
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-sm font-semibold transition-all shadow-sm">
                  <Calendar size={14} /> Add to Calendar
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ── Tab: File Upload (coming soon) ── */}
      {activeTab === 'file-upload' && (
        <div className="bg-white border-2 border-dashed border-slate-200 rounded-2xl p-10 text-center">
          <Upload size={36} className="text-slate-300 mx-auto mb-3" />
          <h3 className="text-base font-semibold text-slate-700 mb-1">File Upload</h3>
          <p className="text-sm text-slate-400">Coming soon — upload syllabi, PDFs, or documents to extract tasks and deadlines automatically.</p>
          <span className="mt-4 inline-block px-3 py-1 rounded-full bg-amber-100 border border-amber-200 text-xs text-amber-700 font-medium">Coming Soon</span>
        </div>
      )}

      {/* ── Tab: Drive Import (coming soon) ── */}
      {activeTab === 'drive' && (
        <div className="bg-white border-2 border-dashed border-slate-200 rounded-2xl p-10 text-center">
          <HardDrive size={36} className="text-slate-300 mx-auto mb-3" />
          <h3 className="text-base font-semibold text-slate-700 mb-1">Google Drive Import</h3>
          <p className="text-sm text-slate-400">Coming soon — connect your Drive to automatically scan and classify your files into tasks, deadlines, and notes.</p>
          <span className="mt-4 inline-block px-3 py-1 rounded-full bg-amber-100 border border-amber-200 text-xs text-amber-700 font-medium">Coming Soon</span>
        </div>
      )}

      {/* ── Recent Captures ── */}
      {recentCaptures.length > 0 && (
        <div>
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-sm font-semibold text-slate-700">Recent Captures</h2>
            <a href="/ai-inbox" className="text-xs text-indigo-600 hover:text-indigo-700 transition-colors">
              View AI Inbox →
            </a>
          </div>
          <div className="space-y-2">
            {recentCaptures.map(item => (
              <div
                key={item.id}
                className="flex items-center gap-3 p-3 bg-white border border-slate-200 rounded-xl shadow-sm"
              >
                <div className="flex-shrink-0 text-slate-400">
                  {item.type === 'task' && <CheckSquare size={14} className="text-indigo-500" />}
                  {item.type === 'event' && <Calendar size={14} className="text-violet-500" />}
                  {item.type === 'deadline' && <AlertTriangle size={14} className="text-amber-500" />}
                  {item.type === 'note' && <FileText size={14} className="text-emerald-500" />}
                  {(item.type === 'drive_file' || item.type === 'course_info') && <HardDrive size={14} className="text-slate-400" />}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-slate-800 truncate font-medium">{item.title}</p>
                  <p className="text-xs text-slate-400 mt-0.5">
                    {item.source_type} ·{' '}
                    <span className={`${item.status === 'approved' ? 'text-emerald-600' : item.status === 'rejected' ? 'text-red-600' : 'text-amber-600'}`}>
                      {item.status}
                    </span>
                  </p>
                </div>
                <span className="text-xs text-slate-400 flex-shrink-0">
                  {Math.round((Date.now() - new Date(item.created_at).getTime()) / 60000)} min ago
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
