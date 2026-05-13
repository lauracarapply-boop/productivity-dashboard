'use client'

import { useState } from 'react'
import {
  Mail, Link2, Loader2, RefreshCw, Check, AlertTriangle, Clock,
  Reply, Forward, Archive, Star, Trash2, ChevronRight, Sparkles,
  Inbox, Send, CheckSquare, Calendar, X,
} from 'lucide-react'
import { useApp } from '@/lib/store'
import { parseEmailForCalendar } from '@/lib/ai-service'
import { cn } from '@/lib/utils'
import type { CalendarEvent, AIInboxItem } from '@/lib/types'

// ── Mock email data ────────────────────────────────────────────

interface MockEmail {
  id: string
  from: string
  fromEmail: string
  subject: string
  preview: string
  body: string
  time: string
  unread: boolean
  starred: boolean
  important: boolean
  hasTask?: boolean
  hasEvent?: boolean
  needsReply?: boolean
  account: 'gmail' | 'outlook'
}

const MOCK_EMAILS: MockEmail[] = [
  {
    id: 'e1', from: 'Prof. Silva', fromEmail: 'silva@university.edu',
    subject: 'Office Hours Change – May 14',
    preview: 'Hi Laura, I\'m moving my office hours this week to Wednesday at 2pm instead of Thursday.',
    body: 'Hi Laura,\n\nI\'m moving my office hours this week to Wednesday May 14 at 2pm in Room 310 instead of Thursday.\n\nPlease let me know if you need to reschedule.\n\nBest,\nProf. Silva',
    time: '9:32 AM', unread: true, starred: false, important: true, hasEvent: true, needsReply: true, account: 'gmail',
  },
  {
    id: 'e2', from: 'Internship Program', fromEmail: 'internships@corp.com',
    subject: 'Application Update – Data Science Intern',
    preview: 'Congratulations! We would like to invite you to a virtual interview on May 20 at 10am.',
    body: 'Dear Laura,\n\nCongratulations! We reviewed your application for the Data Science Internship and would like to invite you to a virtual interview.\n\nDate: May 20, 2026\nTime: 10:00 AM\nPlatform: Zoom (link will be sent separately)\n\nPlease confirm your availability.\n\nBest regards,\nThe Recruitment Team',
    time: '8:15 AM', unread: true, starred: true, important: true, hasEvent: true, needsReply: true, account: 'gmail',
  },
  {
    id: 'e3', from: 'Prof. Thompson', fromEmail: 'thompson@university.edu',
    subject: 'Problem Set 3 Grades Posted',
    preview: 'Problem Set 3 grades have been posted on the course portal. Class average was 84%.',
    body: 'Hi class,\n\nProblem Set 3 grades have been posted on the course portal. The class average was 84%. Solutions will be reviewed in Thursday\'s class.\n\nProf. Thompson',
    time: 'Yesterday', unread: false, starred: false, important: false, account: 'gmail',
  },
  {
    id: 'e4', from: 'Study Group', fromEmail: 'studygroup@university.edu',
    subject: 'Study Session Friday 4pm – Library Room B',
    preview: 'Hey everyone, study session for the ML midterm on Friday at 4pm in Library Room B.',
    body: 'Hey everyone,\n\nStudy session for the ML midterm on Friday May 16 at 4pm in Library Room B.\n\nBring your notes and problem sets!\n\nCheers',
    time: 'Yesterday', unread: true, starred: false, important: false, hasEvent: true, account: 'outlook',
  },
  {
    id: 'e5', from: 'Campus Bursar', fromEmail: 'bursar@university.edu',
    subject: 'Tuition Payment Reminder – Due May 30',
    preview: 'This is a reminder that your tuition payment is due on May 30, 2026.',
    body: 'Dear Laura,\n\nThis is a reminder that your tuition payment for Spring 2026 is due on May 30, 2026.\n\nPlease log into the student portal to complete your payment.\n\nBursar\'s Office',
    time: 'May 10', unread: false, starred: false, important: false, hasTask: true, account: 'gmail',
  },
  {
    id: 'e6', from: 'Advisor Dr. Matos', fromEmail: 'matos@university.edu',
    subject: 'Semester Review Meeting',
    preview: 'Laura, let\'s schedule a 30-min check-in. How\'s May 15 at 11am?',
    body: 'Laura,\n\nLet\'s schedule a 30-min check-in to review your academic progress.\n\nHow\'s Thursday May 15 at 11am in my office (Hall 205)?\n\nDr. Matos',
    time: 'May 9', unread: false, starred: true, important: true, hasEvent: true, needsReply: true, account: 'outlook',
  },
]

const ACCOUNT_COLORS = { gmail: 'text-red-500 bg-red-50', outlook: 'text-blue-500 bg-blue-50' }

export default function EmailPage() {
  const { addCalendarEvent, addAIInboxItem } = useApp()

  const [gmailConnected, setGmailConnected] = useState(false)
  const [outlookConnected, setOutlookConnected] = useState(false)
  const [connectingGmail, setConnectingGmail] = useState(false)
  const [connectingOutlook, setConnectingOutlook] = useState(false)
  const [syncing, setSyncing] = useState(false)
  const [syncDone, setSyncDone] = useState(false)

  const [emails, setEmails] = useState<MockEmail[]>(MOCK_EMAILS)
  const [selected, setSelected] = useState<MockEmail | null>(null)
  const [filter, setFilter] = useState<'all' | 'unread' | 'important' | 'starred'>('all')
  const [parsedEvent, setParsedEvent] = useState<Awaited<ReturnType<typeof parseEmailForCalendar>> | null>(null)
  const [parsing, setParsing] = useState(false)
  const [addedToCalendar, setAddedToCalendar] = useState<Set<string>>(new Set())
  const [sentToInbox, setSentToInbox] = useState<Set<string>>(new Set())

  const anyConnected = gmailConnected || outlookConnected

  async function connectGmail() {
    setConnectingGmail(true)
    await new Promise(r => setTimeout(r, 1600))
    setGmailConnected(true)
    setConnectingGmail(false)
  }

  async function connectOutlook() {
    setConnectingOutlook(true)
    await new Promise(r => setTimeout(r, 1600))
    setOutlookConnected(true)
    setConnectingOutlook(false)
  }

  async function handleSync() {
    setSyncing(true)
    await new Promise(r => setTimeout(r, 1500))
    setSyncing(false)
    setSyncDone(true)
    setTimeout(() => setSyncDone(false), 3000)
  }

  async function handleExtractEvent(email: MockEmail) {
    setParsing(true)
    setParsedEvent(null)
    const result = await parseEmailForCalendar(`Subject: ${email.subject}\n\n${email.body}`)
    setParsedEvent(result)
    setParsing(false)
  }

  function handleAddToCalendar(email: MockEmail) {
    if (!parsedEvent) return
    const event: CalendarEvent = {
      id: `ev-email-${Date.now()}`,
      user_id: '1',
      title: parsedEvent.title,
      description: parsedEvent.description,
      start_time: `${parsedEvent.date}T${parsedEvent.startTime}:00`,
      end_time: `${parsedEvent.date}T${parsedEvent.endTime}:00`,
      type: parsedEvent.type as CalendarEvent['type'],
      source: 'email',
      location: parsedEvent.location,
      created_at: new Date().toISOString(),
    }
    addCalendarEvent(event)
    setAddedToCalendar(prev => new Set([...prev, email.id]))
    setParsedEvent(null)
  }

  function handleSendToInbox(email: MockEmail) {
    const item: AIInboxItem = {
      id: `ai-email-${Date.now()}`,
      user_id: '1',
      type: email.hasEvent ? 'event' : email.hasTask ? 'task' : 'note',
      title: email.subject,
      extracted_data: { from: email.from, preview: email.preview },
      source_type: 'email',
      source_text: email.body,
      confidence: 0.88,
      status: 'pending',
      created_at: new Date().toISOString(),
    }
    addAIInboxItem(item)
    setSentToInbox(prev => new Set([...prev, email.id]))
  }

  function toggleStar(id: string) {
    setEmails(prev => prev.map(e => e.id === id ? { ...e, starred: !e.starred } : e))
  }

  function markRead(id: string) {
    setEmails(prev => prev.map(e => e.id === id ? { ...e, unread: false } : e))
  }

  const filtered = emails.filter(e => {
    if (filter === 'unread') return e.unread
    if (filter === 'important') return e.important
    if (filter === 'starred') return e.starred
    return true
  })

  const unreadCount = emails.filter(e => e.unread).length
  const importantCount = emails.filter(e => e.important).length
  const needsReplyCount = emails.filter(e => e.needsReply && !e.unread === false).length

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-3">
            <Mail className="text-violet-600" size={24} />
            Email Hub
          </h1>
          <p className="text-slate-500 text-sm mt-1">Connected inbox — send emails directly to Nexus</p>
        </div>
        {anyConnected && (
          <button onClick={handleSync} disabled={syncing}
            className="flex items-center gap-2 px-3 py-2 bg-white hover:bg-slate-50 border border-slate-200 text-slate-600 rounded-xl text-sm font-medium transition-all shadow-sm disabled:opacity-70">
            {syncing ? <Loader2 size={14} className="animate-spin" /> : syncDone ? <Check size={14} className="text-emerald-500" /> : <RefreshCw size={14} />}
            {syncDone ? 'Synced!' : 'Sync Now'}
          </button>
        )}
      </div>

      {/* Connection cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Gmail */}
        <div className={cn('rounded-2xl border p-5 shadow-sm', gmailConnected ? 'bg-emerald-50 border-emerald-200' : 'bg-white border-black/[0.07]')}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-red-50 border border-red-100 flex items-center justify-center text-xl">📧</div>
              <div>
                <p className="font-semibold text-slate-900 text-sm">Gmail</p>
                {gmailConnected
                  ? <p className="text-xs text-emerald-600">Connected · laura@university.edu</p>
                  : <p className="text-xs text-slate-400">Not connected</p>}
              </div>
            </div>
            {gmailConnected ? (
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
                <button onClick={() => setGmailConnected(false)} className="text-xs text-slate-400 hover:text-slate-600 transition-colors">Disconnect</button>
              </div>
            ) : (
              <button onClick={connectGmail} disabled={connectingGmail}
                className="flex items-center gap-1.5 px-4 py-2 bg-red-500 hover:bg-red-600 disabled:opacity-70 text-white rounded-xl text-xs font-medium transition-all shadow-sm">
                {connectingGmail ? <Loader2 size={12} className="animate-spin" /> : <Link2 size={12} />}
                {connectingGmail ? 'Connecting…' : 'Connect Gmail'}
              </button>
            )}
          </div>
          {gmailConnected && (
            <div className="mt-3 grid grid-cols-3 gap-2 pt-3 border-t border-emerald-200">
              <div className="text-center"><p className="text-lg font-bold text-slate-900">{emails.filter(e => e.account === 'gmail' && e.unread).length}</p><p className="text-xs text-slate-400">Unread</p></div>
              <div className="text-center"><p className="text-lg font-bold text-slate-900">{emails.filter(e => e.account === 'gmail' && e.needsReply).length}</p><p className="text-xs text-slate-400">Need reply</p></div>
              <div className="text-center"><p className="text-lg font-bold text-slate-900">{emails.filter(e => e.account === 'gmail' && e.important).length}</p><p className="text-xs text-slate-400">Important</p></div>
            </div>
          )}
        </div>

        {/* Outlook */}
        <div className={cn('rounded-2xl border p-5 shadow-sm', outlookConnected ? 'bg-emerald-50 border-emerald-200' : 'bg-white border-black/[0.07]')}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-blue-50 border border-blue-100 flex items-center justify-center text-xl">📮</div>
              <div>
                <p className="font-semibold text-slate-900 text-sm">Outlook</p>
                {outlookConnected
                  ? <p className="text-xs text-emerald-600">Connected · laura@student.edu</p>
                  : <p className="text-xs text-slate-400">Not connected</p>}
              </div>
            </div>
            {outlookConnected ? (
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
                <button onClick={() => setOutlookConnected(false)} className="text-xs text-slate-400 hover:text-slate-600 transition-colors">Disconnect</button>
              </div>
            ) : (
              <button onClick={connectOutlook} disabled={connectingOutlook}
                className="flex items-center gap-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-70 text-white rounded-xl text-xs font-medium transition-all shadow-sm">
                {connectingOutlook ? <Loader2 size={12} className="animate-spin" /> : <Link2 size={12} />}
                {connectingOutlook ? 'Connecting…' : 'Connect Outlook'}
              </button>
            )}
          </div>
          {outlookConnected && (
            <div className="mt-3 grid grid-cols-3 gap-2 pt-3 border-t border-emerald-200">
              <div className="text-center"><p className="text-lg font-bold text-slate-900">{emails.filter(e => e.account === 'outlook' && e.unread).length}</p><p className="text-xs text-slate-400">Unread</p></div>
              <div className="text-center"><p className="text-lg font-bold text-slate-900">{emails.filter(e => e.account === 'outlook' && e.needsReply).length}</p><p className="text-xs text-slate-400">Need reply</p></div>
              <div className="text-center"><p className="text-lg font-bold text-slate-900">{emails.filter(e => e.account === 'outlook' && e.important).length}</p><p className="text-xs text-slate-400">Important</p></div>
            </div>
          )}
        </div>
      </div>

      {/* Smart stats bar */}
      {anyConnected && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {[
            { icon: Inbox, value: unreadCount, label: 'Unread', color: 'bg-indigo-50 text-indigo-600', border: 'border-indigo-100' },
            { icon: AlertTriangle, value: importantCount, label: 'Important', color: 'bg-amber-50 text-amber-600', border: 'border-amber-100' },
            { icon: Reply, value: emails.filter(e => e.needsReply).length, label: 'Need Reply', color: 'bg-red-50 text-red-600', border: 'border-red-100' },
            { icon: Star, value: emails.filter(e => e.starred).length, label: 'Starred', color: 'bg-violet-50 text-violet-600', border: 'border-violet-100' },
          ].map(({ icon: Icon, value, label, color, border }) => (
            <div key={label} className={cn('bg-white border rounded-2xl p-4 shadow-sm flex items-center gap-3', border)}>
              <div className={cn('w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0', color)}>
                <Icon size={16} />
              </div>
              <div>
                <p className="text-xl font-bold text-slate-900">{value}</p>
                <p className="text-xs text-slate-500">{label}</p>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Inbox — only show if connected */}
      {!anyConnected ? (
        <div className="bg-white border border-dashed border-slate-300 rounded-2xl p-12 text-center shadow-sm">
          <div className="w-14 h-14 rounded-2xl bg-violet-50 border border-violet-100 flex items-center justify-center mx-auto mb-4">
            <Mail size={28} className="text-violet-500" />
          </div>
          <h2 className="text-lg font-semibold text-slate-800 mb-1">Connect your inbox</h2>
          <p className="text-slate-500 text-sm max-w-md mx-auto">
            Link Gmail or Outlook to see unread emails, get notified about important messages, and send emails directly to your Nexus calendar and task list.
          </p>
        </div>
      ) : (
        <div className="bg-white border border-black/[0.07] rounded-2xl shadow-sm overflow-hidden">
          {/* Filter tabs */}
          <div className="flex items-center gap-1 p-2 border-b border-slate-100 bg-slate-50">
            {(['all', 'unread', 'important', 'starred'] as const).map(f => (
              <button key={f} onClick={() => setFilter(f)}
                className={cn('px-3 py-1.5 rounded-lg text-xs font-medium capitalize transition-all',
                  filter === f ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700')}>
                {f}
                {f === 'unread' && unreadCount > 0 && (
                  <span className="ml-1.5 bg-indigo-500 text-white text-[9px] font-bold px-1.5 py-0.5 rounded-full">{unreadCount}</span>
                )}
              </button>
            ))}
          </div>

          <div className="divide-y divide-slate-100">
            {filtered.map(email => (
              <div key={email.id}
                onClick={() => { setSelected(email === selected ? null : email); markRead(email.id); setParsedEvent(null) }}
                className={cn('px-5 py-4 cursor-pointer transition-colors hover:bg-slate-50', selected?.id === email.id && 'bg-indigo-50/40', email.unread && 'bg-white')}>
                <div className="flex items-start gap-3">
                  {/* Unread dot */}
                  <div className={cn('w-2 h-2 rounded-full mt-2 flex-shrink-0', email.unread ? 'bg-indigo-500' : 'bg-transparent')} />

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2 mb-0.5">
                      <div className="flex items-center gap-2">
                        <span className={cn('text-sm font-semibold truncate', email.unread ? 'text-slate-900' : 'text-slate-600')}>
                          {email.from}
                        </span>
                        <span className={cn('text-[10px] px-1.5 py-0.5 rounded-full font-medium', ACCOUNT_COLORS[email.account])}>
                          {email.account}
                        </span>
                        {email.important && <AlertTriangle size={11} className="text-amber-500 flex-shrink-0" />}
                        {email.needsReply && <Reply size={11} className="text-red-400 flex-shrink-0" />}
                      </div>
                      <span className="text-xs text-slate-400 flex-shrink-0">{email.time}</span>
                    </div>
                    <p className={cn('text-sm truncate', email.unread ? 'text-slate-800 font-medium' : 'text-slate-600')}>{email.subject}</p>
                    <p className="text-xs text-slate-400 truncate mt-0.5">{email.preview}</p>

                    {/* Quick action badges */}
                    <div className="flex items-center gap-2 mt-2">
                      {email.hasEvent && <span className="text-[10px] px-2 py-0.5 bg-violet-50 text-violet-700 border border-violet-200 rounded-full font-medium flex items-center gap-1"><Calendar size={9} /> Has event</span>}
                      {email.hasTask && <span className="text-[10px] px-2 py-0.5 bg-indigo-50 text-indigo-700 border border-indigo-200 rounded-full font-medium flex items-center gap-1"><CheckSquare size={9} /> Has task</span>}
                      {email.needsReply && <span className="text-[10px] px-2 py-0.5 bg-red-50 text-red-700 border border-red-200 rounded-full font-medium flex items-center gap-1"><Reply size={9} /> Needs reply</span>}
                      {addedToCalendar.has(email.id) && <span className="text-[10px] px-2 py-0.5 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-full font-medium">✓ Added to calendar</span>}
                      {sentToInbox.has(email.id) && <span className="text-[10px] px-2 py-0.5 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-full font-medium">✓ Sent to AI Inbox</span>}
                    </div>
                  </div>

                  <button onClick={e => { e.stopPropagation(); toggleStar(email.id) }}
                    className={cn('p-1 rounded transition-colors flex-shrink-0', email.starred ? 'text-amber-400' : 'text-slate-200 hover:text-slate-400')}>
                    <Star size={14} fill={email.starred ? 'currentColor' : 'none'} />
                  </button>
                </div>

                {/* Expanded email detail */}
                {selected?.id === email.id && (
                  <div className="mt-4 pt-4 border-t border-slate-100 space-y-4" onClick={e => e.stopPropagation()}>
                    <div className="text-xs text-slate-500 space-y-1">
                      <p><span className="font-medium">From:</span> {email.from} &lt;{email.fromEmail}&gt;</p>
                      <p><span className="font-medium">Subject:</span> {email.subject}</p>
                    </div>
                    <div className="bg-slate-50 rounded-xl p-4 text-sm text-slate-600 leading-relaxed whitespace-pre-wrap font-sans">
                      {email.body}
                    </div>

                    {/* Action buttons */}
                    <div className="flex flex-wrap items-center gap-2">
                      {email.hasEvent && !addedToCalendar.has(email.id) && (
                        <>
                          {!parsedEvent ? (
                            <button onClick={() => handleExtractEvent(email)} disabled={parsing}
                              className="flex items-center gap-1.5 px-3 py-2 bg-violet-600 hover:bg-violet-700 disabled:opacity-70 text-white rounded-xl text-xs font-semibold transition-all shadow-sm">
                              {parsing ? <Loader2 size={12} className="animate-spin" /> : <Sparkles size={12} />}
                              {parsing ? 'Extracting…' : 'Extract Event'}
                            </button>
                          ) : (
                            <button onClick={() => handleAddToCalendar(email)}
                              className="flex items-center gap-1.5 px-3 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-semibold transition-all shadow-sm">
                              <Calendar size={12} /> Add to Calendar
                            </button>
                          )}
                        </>
                      )}
                      {!sentToInbox.has(email.id) && (
                        <button onClick={() => handleSendToInbox(email)}
                          className="flex items-center gap-1.5 px-3 py-2 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 rounded-xl text-xs font-semibold transition-all">
                          <Send size={12} /> Send to AI Inbox
                        </button>
                      )}
                      <button className="flex items-center gap-1.5 px-3 py-2 bg-white hover:bg-slate-50 text-slate-600 border border-slate-200 rounded-xl text-xs font-medium transition-all">
                        <Reply size={12} /> Reply
                      </button>
                      <button className="flex items-center gap-1.5 px-3 py-2 bg-white hover:bg-slate-50 text-slate-600 border border-slate-200 rounded-xl text-xs font-medium transition-all">
                        <Forward size={12} /> Forward
                      </button>
                      <button onClick={() => setEmails(prev => prev.filter(e => e.id !== email.id))}
                        className="flex items-center gap-1.5 px-3 py-2 bg-white hover:bg-red-50 text-slate-400 hover:text-red-500 border border-slate-200 hover:border-red-200 rounded-xl text-xs font-medium transition-all ml-auto">
                        <Trash2 size={12} /> Archive
                      </button>
                    </div>

                    {/* Parsed event preview */}
                    {parsedEvent && !addedToCalendar.has(email.id) && (
                      <div className="bg-violet-50 border border-violet-200 rounded-xl p-4 space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-semibold text-violet-700 flex items-center gap-1.5"><Sparkles size={11} /> Extracted Event</span>
                          <button onClick={() => setParsedEvent(null)} className="text-violet-400 hover:text-violet-600"><X size={13} /></button>
                        </div>
                        <p className="text-sm font-semibold text-slate-800">{parsedEvent.title}</p>
                        <div className="flex items-center gap-3 text-xs text-slate-500">
                          <span><Clock size={10} className="inline mr-1" />{parsedEvent.date} · {parsedEvent.startTime}–{parsedEvent.endTime}</span>
                          {parsedEvent.location && <span>{parsedEvent.location}</span>}
                        </div>
                        <p className="text-xs text-violet-600">Confidence: {Math.round(parsedEvent.confidence * 100)}% · <button onClick={() => handleAddToCalendar(email)} className="underline hover:text-violet-800 font-medium">Confirm & Add →</button></p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))}

            {filtered.length === 0 && (
              <div className="py-12 text-center text-slate-400 text-sm">
                No {filter === 'all' ? '' : filter} emails to show
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
