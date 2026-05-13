'use client'

import { useState, useRef, useEffect } from 'react'
import { X, Zap, Loader2, CheckSquare, Calendar, BookOpen, FileText, AlertCircle, ArrowRight, Sparkles } from 'lucide-react'
import { useApp } from '@/lib/store'
import type { AIInboxItem, AIInboxItemType } from '@/lib/types'

interface Props {
  onClose: () => void
}

interface ExtractedItem {
  type: AIInboxItemType
  title: string
  description: string
  confidence: number
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  data: Record<string, any>
}

function getTypeIcon(type: AIInboxItemType) {
  switch (type) {
    case 'task':     return CheckSquare
    case 'event':    return Calendar
    case 'deadline': return AlertCircle
    case 'note':     return FileText
    default:         return BookOpen
  }
}

function getTypeColor(type: AIInboxItemType): { icon: string; bg: string; border: string } {
  switch (type) {
    case 'task':     return { icon: 'text-indigo-600', bg: 'bg-indigo-50',  border: 'border-l-indigo-400' }
    case 'event':    return { icon: 'text-violet-600', bg: 'bg-violet-50',  border: 'border-l-violet-400' }
    case 'deadline': return { icon: 'text-amber-600',  bg: 'bg-amber-50',   border: 'border-l-amber-400'  }
    case 'note':     return { icon: 'text-sky-600',    bg: 'bg-sky-50',     border: 'border-l-sky-400'    }
    default:         return { icon: 'text-emerald-600',bg: 'bg-emerald-50', border: 'border-l-emerald-400'}
  }
}

function mockExtract(text: string): ExtractedItem[] {
  const items: ExtractedItem[] = []
  const lower = text.toLowerCase()

  if (lower.includes('essay') || lower.includes('write') || lower.includes('paper') || lower.includes('problem set') || lower.includes('assignment')) {
    items.push({
      type: 'task',
      title: 'Write / complete academic work',
      description: 'Extracted a writing or assignment task from your text.',
      confidence: 0.87,
      data: { priority: 'high', energy_level: 'high' },
    })
  }
  if (lower.includes('quiz') || lower.includes('exam') || lower.includes('test') || lower.includes('due') || lower.includes('deadline') || lower.includes('submit')) {
    items.push({
      type: 'deadline',
      title: 'Upcoming deadline detected',
      description: 'Found a deadline or exam reference in your text.',
      confidence: 0.91,
      data: { urgency: 'high' },
    })
  }
  if (lower.includes('meeting') || lower.includes('office hours') || lower.includes('session') || lower.includes('appointment') || lower.includes('tuesday') || lower.includes('monday') || lower.includes('wednesday') || lower.includes('thursday') || lower.includes('friday')) {
    items.push({
      type: 'event',
      title: 'Calendar event detected',
      description: 'Found a scheduled event or time-based commitment.',
      confidence: 0.78,
      data: { type: 'meeting' },
    })
  }
  if (lower.includes('idea') || lower.includes('note') || lower.includes('think') || lower.includes('concept') || lower.includes('research') || lower.includes('interesting')) {
    items.push({
      type: 'note',
      title: 'Idea / note captured',
      description: 'Extracted a note or idea worth saving.',
      confidence: 0.82,
      data: { tags: ['captured', 'idea'] },
    })
  }

  if (items.length === 0) {
    items.push({
      type: 'note',
      title: 'General capture',
      description: 'Saved as a note for review.',
      confidence: 0.65,
      data: { content: text.slice(0, 200) },
    })
  }

  return items
}

export default function QuickCaptureModal({ onClose }: Props) {
  const { addAIInboxItem } = useApp()
  const [text, setText] = useState('')
  const [loading, setLoading] = useState(false)
  const [extracted, setExtracted] = useState<ExtractedItem[] | null>(null)
  const [sent, setSent] = useState(false)
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  useEffect(() => {
    textareaRef.current?.focus()
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', handleKey)
    return () => window.removeEventListener('keydown', handleKey)
  }, [onClose])

  const handleExtract = async () => {
    if (!text.trim()) return
    setLoading(true)
    setExtracted(null)
    await new Promise(r => setTimeout(r, 1500))
    const items = mockExtract(text)
    setExtracted(items)
    setLoading(false)
  }

  const handleSendToInbox = () => {
    if (!extracted) return
    extracted.forEach((item, i) => {
      const inboxItem: AIInboxItem = {
        id: `capture-${Date.now()}-${i}`,
        user_id: '1',
        type: item.type,
        title: item.title,
        extracted_data: item.data,
        source_type: 'capture',
        source_text: text,
        confidence: item.confidence,
        status: 'pending',
        created_at: new Date().toISOString(),
      }
      addAIInboxItem(inboxItem)
    })
    setSent(true)
    setTimeout(() => onClose(), 1200)
  }

  return (
    <div
      className="fixed inset-0 bg-black/30 backdrop-blur-sm z-50 flex items-center justify-center px-4"
      onClick={e => { if (e.target === e.currentTarget) onClose() }}
    >
      <div className="w-full max-w-2xl bg-white border border-black/[0.08] rounded-2xl shadow-2xl overflow-hidden animate-scale-in">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-indigo-50 border border-indigo-100 flex items-center justify-center">
              <Zap size={16} className="text-indigo-600" />
            </div>
            <div>
              <h2 className="text-base font-semibold text-slate-900">Brain Dump</h2>
              <p className="text-xs text-slate-400">Paste anything — AI will extract structured items</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
            aria-label="Close"
          >
            <X size={18} />
          </button>
        </div>

        {/* Main content */}
        <div className="p-5 space-y-4">
          {/* Textarea */}
          <div>
            <textarea
              ref={textareaRef}
              value={text}
              onChange={e => { setText(e.target.value); setExtracted(null); setSent(false) }}
              placeholder="Paste a syllabus, message, email, or just brain dump… AI will extract tasks, deadlines, events, and notes automatically."
              rows={6}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3.5 text-sm text-slate-800 placeholder-slate-400 resize-none outline-none focus:border-indigo-300 focus:ring-2 focus:ring-indigo-100 transition-all leading-relaxed min-h-[140px]"
            />
            <div className="flex items-center justify-between mt-1.5 px-1">
              <span className="text-xs text-slate-400">{text.length} characters</span>
              <span className="text-xs text-slate-400">Press Esc to close</span>
            </div>
          </div>

          {/* Extract button */}
          {!extracted && !sent && (
            <button
              onClick={handleExtract}
              disabled={!text.trim() || loading}
              className="w-full flex items-center justify-center gap-2 py-2.5 text-white font-semibold text-sm rounded-xl transition-all duration-200 disabled:opacity-40 disabled:cursor-not-allowed hover:shadow-md"
              style={{ background: 'linear-gradient(135deg, #3F5F5A, #274743)' }}
            >
              {loading ? (
                <>
                  <Loader2 size={15} className="animate-spin" />
                  <span>Analyzing with AI...</span>
                </>
              ) : (
                <>
                  <Sparkles size={15} />
                  <span>Extract with AI</span>
                </>
              )}
            </button>
          )}

          {/* Sent confirmation */}
          {sent && (
            <div className="flex items-center justify-center gap-2 py-3 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-700 text-sm font-medium">
              <CheckSquare size={16} />
              <span>Sent to AI Inbox for review!</span>
            </div>
          )}

          {/* Extracted results */}
          {extracted && !sent && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-semibold text-slate-700 flex items-center gap-2">
                  <Sparkles size={14} className="text-violet-500" />
                  Extracted {extracted.length} item{extracted.length !== 1 ? 's' : ''}
                </h3>
                <button
                  onClick={() => setExtracted(null)}
                  className="text-xs text-slate-400 hover:text-slate-600 transition-colors"
                >
                  Re-extract
                </button>
              </div>

              <div className="space-y-2">
                {extracted.map((item, i) => {
                  const Icon = getTypeIcon(item.type)
                  const colors = getTypeColor(item.type)
                  return (
                    <div
                      key={i}
                      className={`flex items-start gap-3 p-3.5 bg-white border border-slate-200 border-l-4 ${colors.border} rounded-xl`}
                    >
                      <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${colors.bg}`}>
                        <Icon size={15} className={colors.icon} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${colors.bg} ${colors.icon}`}>
                            {item.type}
                          </span>
                          <span className="text-xs text-slate-400">
                            {Math.round(item.confidence * 100)}% confidence
                          </span>
                        </div>
                        <p className="text-sm font-medium text-slate-800">{item.title}</p>
                        <p className="text-xs text-slate-500 mt-0.5">{item.description}</p>
                        {/* Confidence bar */}
                        <div className="confidence-bar-track mt-2">
                          <div
                            className="confidence-bar-fill"
                            style={{ width: `${Math.round(item.confidence * 100)}%` }}
                          />
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>

              {/* Send to AI Inbox */}
              <button
                onClick={handleSendToInbox}
                className="w-full flex items-center justify-center gap-2 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-sm rounded-xl transition-all duration-200 hover:shadow-md"
              >
                <ArrowRight size={15} />
                <span>Send to AI Inbox for review</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
