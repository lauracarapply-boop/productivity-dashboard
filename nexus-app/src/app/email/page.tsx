'use client'

import { useState, useEffect } from 'react'
import {
  Mail, Link2, Loader2, RefreshCw, Check, AlertTriangle, Clock,
  Reply, Forward, Archive, Star, Trash2, Sparkles,
  Inbox, Send, CheckSquare, Calendar, X,
} from 'lucide-react'
import { useApp } from '@/lib/store'
import { parseEmailForCalendar } from '@/lib/ai-service'
import { cn } from '@/lib/utils'
import type { CalendarEvent, AIInboxItem } from '@/lib/types'

interface GmailMessage {
  id: string
  threadId: string
  labelIds?: string[]
  snippet?: string
  payload?: {
    headers?: { name: string; value: string }[]
  }
  internalDate?: string
}

interface Email {
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

function parseGmailMessage(msg: GmailMessage): Email {
  const headers = msg.payload?.headers ?? []
  const get = (name: string) => headers.find(h => h.name.toLowerCase() === name.toLowerCase())?.value ?? ''

  const from = get('From')
  const emailMatch = from.match(/<(.+?)>/)
  const fromEmail = emailMatch ? emailMatch[1] : from
  const fromName = from.replace(/<.+?>/, '').trim().replace(/^"|"$/g, '') || fromEmail

  const subject = get('Subject') || '(no subject)'
  const date = msg.internalDate ? new Date(parseInt(msg.internalDate)) : new Date()
  const now = new Date()
  const isToday = date.toDateString() === now.toDateString()
  const time = isToday
    ? date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })
    : date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })

  const labels = msg.labelIds ?? []
  const unread = labels.includes('UNREAD')
  const important = labels.includes('IMPORTANT')

  return {
    id: msg.id,
    from: fromName,
    fromEmail,
    subject,
    preview: msg.snippet ?? '',
    body: msg.snippet ?? '',
    time,
    unread,
    starred: labels.includes('STARRED'),
    important,
    hasTask: subject.toLowerCase().includes('action') || subject.toLowerCase().includes('task') || subject.toLowerCase().includes('todo'),
    hasEvent: subject.toLowerCase().includes('invite') || subject.toLowerCase().includes('meeting') || subject.toLowerCase().includes('event') || subject.toLowerCase().includes('zoom'),
    needsReply: unread && important,
    account: 'gmail',
  }
}

const ACCOUNT_COLORS = { gmail: 'text-red-500 bg-red-50', outlook: 'text-blue-500 bg-blue-50' }

export default function EmailPage() {
  const { addCalendarEvent, addAIInboxItem } = useApp()

  const [gmailConnected, setGmailConnected] = useState(false)
  const [outlookConnected, setOutlookConnected] = useState(false)
  const [loadingGmail, setLoadingGmail] = useState(true)
  const [syncing, setSyncing] = useState(false)
  const [syncDone, setSyncDone] = useState(false)
  const [gmailEmail, setGmailEmail] = useState('')

  const [emails, setEmails] = useState<Email[]>([])
  const [selected, setSelected] = useState<Email | null>(null)
  const [filter, setFilter] = useState<'all' | 'unread' | 'important' | 'starred'>('all')
  const [parsedEvent, setParsedEvent] = useState<Awaited<ReturnType<typeof parseEmailForCalendar>> | null>(null)
  const [parsing, setParsing] = useState(false)
  const [addedToCalendar, setAddedToCalendar] = useState<Set<string>>(new Set())
  const [sentToInbox, setSentToInbox] = useState<Set<string>>(new Set())

  const anyConnected = gmailConnected || outlookConnected

  async function fetchGmail() {
    const res = await fetch('/api/google/gmail?maxResults=30')
    if (!res.ok) return null
    const data = await res.json()
    return data.messages as GmailMessage[] | null
  }

  useEffect(() => {
    setLoadingGmail(true)
    fetchGmail().then(messages => {
      if (messages) {
        setGmailConnected(true)
        setEmails(messages.map(parseGmailMessage))
        // Try to get email from cookie (non-httpOnly)
        const cookieEmail = document.cookie.split('; ').find(r => r.startsWith('google_email='))?.split('=')[1]
        if (cookieEmail) setGmailEmail(decodeURIComponent(cookieEmail))
      }
    }).finally(() => setLoadingGmail(false))
  }, [])

  async function handleSync() {
    setSyncing(true)
    const messages = await fetchGmail()
    if (messages) {
      setGmailConnected(true)
      setEmails(messages.map(parseGmailMessage))
    }
    setSyncing(false)
    setSyncDone(true)
    setTimeout(() => setSyncDone(false), 3000)
  }

  async function connectOutlook() {
    // Outlook OAuth not wired yet — placeholder
    setOutlookConnected(false)
    alert('Outlook connection coming soon. Add your Outlook iCal URL in Settings to sync your Outlook calendar.')
  }

  async function handleExtractEvent(email: Email) {
    setParsing(true)
    setParsedEvent(null)
    const result = await parseEmailForCalendar(`Subject: ${email.subject}\n\n${email.body}`)
    setParsedEvent(result)
    setParsing(false)
  }

  function handleAddToCalendar(email: Email) {
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

  function handleSendToInbox(email: Email) {
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
                {loadingGmail
                  ? <p className="text-xs text-slate-400">Checking connection…</p>
                  : gmailConnected
                    ? <p className="text-xs text-emerald-600">Connected{gmailEmail ? ` · ${gmailEmail}` : ''}</p>
                    : <p className="text-xs text-slate-400">Not connected — sign in with Google to link Gmail</p>}
              </div>
            </div>
            {loadingGmail ? (
              <Loader2 size={16} className="animate-spin text-slate-400" />
            ) : gmailConnected ? (
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
              </div>
            ) : (
              <a href="/login"
                className="flex items-center gap-1.5 px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-xl text-xs font-medium transition-all shadow-sm">
                <Link2 size={12} />
                Sign in with Google
              </a>
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
                  ? <p className="text-xs text-emerald-600">Connected</p>
                  : <p className="text-xs text-slate-400">Use iCal URL in Settings for Outlook calendar</p>}
              </div>
            </div>
            {outlookConnected ? (
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
                <button onClick={() => setOutlookConnected(false)} className="text-xs text-slate-400 hover:text-slate-600 transition-colors">Disconnect</button>
              </div>
            ) : (
              <a href="/settings"
                className="flex items-center gap-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-medium transition-all shadow-sm">
                <Link2 size={12} />
                Add iCal URL
              </a>
            )}
          </div>
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

      {/* Inbox */}
      {loadingGmail ? (
        <div className="bg-white border border-black/[0.07] rounded-2xl p-12 text-center shadow-sm">
          <Loader2 size={28} className="animate-spin text-indigo-400 mx-auto mb-3" />
          <p className="text-slate-500 text-sm">Checking Gmail connection…</p>
        </div>
      ) : !anyConnected ? (
        <div className="bg-white border border-dashed border-slate-300 rounded-2xl p-12 text-center shadow-sm">
          <div className="w-14 h-14 rounded-2xl bg-violet-50 border border-violet-100 flex items-center justify-center mx-auto mb-4">
            <Mail size={28} className="text-violet-500" />
          </div>
          <h2 className="text-lg font-semibold text-slate-800 mb-1">Connect your inbox</h2>
          <p className="text-slate-500 text-sm max-w-md mx-auto mb-4">
            Sign in with Google to automatically connect Gmail, or add an Outlook iCal URL in Settings to sync your calendar.
          </p>
          <a href="/login" className="inline-flex items-center gap-2 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-sm font-semibold transition-all shadow-sm">
            Sign in with Google
          </a>
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

                    <div className="flex flex-wrap items-center gap-2">
                      {(email.hasEvent || email.hasTask) && !addedToCalendar.has(email.id) && (
                        <>
                          {!parsedEvent ? (
                            <button onClick={() => handleExtractEvent(email)} disabled={parsing}
                              className="flex items-center gap-1.5 px-3 py-2 bg-violet-600 hover:bg-violet-700 disabled:opacity-70 text-white rounded-xl text-xs font-semibold transition-all shadow-sm">
                              {parsing ? <Loader2 size={12} className="animate-spin" /> : <Sparkles size={12} />}
                              {parsing ? 'Extracting with AI…' : 'Extract Event with AI'}
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
                          <span className="text-xs font-semibold text-violet-700 flex items-center gap-1.5"><Sparkles size={11} /> AI Extracted Event</span>
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
