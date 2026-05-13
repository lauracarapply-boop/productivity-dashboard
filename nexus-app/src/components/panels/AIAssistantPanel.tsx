'use client'

import { useState, useRef, useEffect } from 'react'
import { Bot, X, Sparkles, Send, User, Loader2 } from 'lucide-react'
import { useApp } from '@/lib/store'
import { mockTasks, mockCalendarEvents, mockNotes } from '@/lib/mock-data'
import { formatDate, daysUntil } from '@/lib/utils'

const SUGGESTED_PROMPTS = [
  'What should I do next?',
  'Plan my week',
  'What deadlines are coming up?',
  'Which notes need review?',
  'Summarize my week',
]

interface Message {
  id: string
  role: 'user' | 'assistant'
  content: string
  timestamp: Date
}

function generateResponse(prompt: string): string {
  const lower = prompt.toLowerCase()

  if (lower.includes('what should i do next') || lower.includes('next task') || lower.includes('priority')) {
    const urgentTasks = mockTasks
      .filter(t => t.status !== 'done' && (t.priority === 'urgent' || t.priority === 'high'))
      .slice(0, 3)
    if (urgentTasks.length === 0) return "You're all caught up! No urgent tasks right now."
    const lines = urgentTasks.map(t => `• **${t.title}** (${t.priority}, due ${t.due_date ?? 'no date'})`)
    return `Your top priority tasks right now:\n\n${lines.join('\n')}\n\nI'd suggest starting with the essay on Hobbes — it's due May 13 and you've already started the outline. Aim for a 2–3 hour focused session.`
  }

  if (lower.includes('plan my week') || lower.includes('weekly plan') || lower.includes('schedule')) {
    const events = mockCalendarEvents
      .filter(e => {
        const d = daysUntil(e.start_time)
        return d >= 0 && d <= 7
      })
      .slice(0, 4)
    const eventLines = events.map(e => `• ${formatDate(e.start_time)} — ${e.title}`)
    return `Here's a summary of your week ahead:\n\n${eventLines.join('\n')}\n\nYou have 5 classes, 1 team meeting, and 2 study blocks scheduled. I'd recommend blocking time Wednesday afternoon for the POL101 essay draft — your most urgent deliverable.`
  }

  if (lower.includes('deadline') || lower.includes('due')) {
    const upcoming = mockTasks
      .filter(t => t.status !== 'done' && t.due_date)
      .sort((a, b) => {
        const da = new Date(a.due_date!).getTime()
        const db = new Date(b.due_date!).getTime()
        return da - db
      })
      .slice(0, 5)
    const lines = upcoming.map(t => {
      const days = daysUntil(t.due_date!)
      const label = days < 0 ? 'OVERDUE' : days === 0 ? 'TODAY' : `in ${days} day${days === 1 ? '' : 's'}`
      return `• **${t.title}** — due ${t.due_date} (${label})`
    })
    return `Upcoming deadlines:\n\n${lines.join('\n')}\n\nThe Tocqueville reading is already overdue — tackle it first before it falls further behind.`
  }

  if (lower.includes('notes') || lower.includes('review') || lower.includes('study')) {
    const reviewNotes = mockNotes.slice(0, 3)
    const lines = reviewNotes.map(n => `• **${n.title}** — updated ${formatDate(n.updated_at)}`)
    return `Notes that might need your attention:\n\n${lines.join('\n')}\n\nYour Hobbes lecture notes are well-developed. The Chinese tones note was updated recently — consider a quick review before your next CHI101 class.`
  }

  if (lower.includes('summarize') || lower.includes('summary') || lower.includes('overview')) {
    const doneTasks = mockTasks.filter(t => t.status === 'done').length
    const inProgress = mockTasks.filter(t => t.status === 'in_progress').length
    const overdue = mockTasks.filter(t => t.status === 'overdue').length
    return `**This week's snapshot:**\n\n${doneTasks} task${doneTasks !== 1 ? 's' : ''} completed\n${inProgress} in progress\n${overdue} overdue\n\nYou're juggling 5 courses plus project work — solid effort. Main focus areas: finish the Hobbes essay (due Tue), submit the research abstract (due Mon), and prepare for the French quiz (Thu). You've got this!`
  }

  return `I'm Nexus AI, your academic assistant. I can help you:\n\n• Prioritize your tasks and workload\n• Plan your week and schedule study time\n• Track upcoming deadlines\n• Review your notes and knowledge gaps\n• Analyze your productivity patterns\n\nTry asking: "What should I do next?" or "What deadlines are coming up?"`
}

export default function AIAssistantPanel() {
  const { toggleAIPanel } = useApp()
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'welcome',
      role: 'assistant',
      content: "Hi Laura! I'm your Nexus AI assistant. I have full context of your courses, tasks, notes, and schedule. What can I help you with today?",
      timestamp: new Date(),
    },
  ])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const bottomRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const sendMessage = async (text: string) => {
    if (!text.trim() || loading) return

    const userMsg: Message = {
      id: `u-${Date.now()}`,
      role: 'user',
      content: text.trim(),
      timestamp: new Date(),
    }

    setMessages(prev => [...prev, userMsg])
    setInput('')
    setLoading(true)

    await new Promise(r => setTimeout(r, 800 + Math.random() * 600))

    const response = generateResponse(text)
    const assistantMsg: Message = {
      id: `a-${Date.now()}`,
      role: 'assistant',
      content: response,
      timestamp: new Date(),
    }

    setMessages(prev => [...prev, assistantMsg])
    setLoading(false)
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    sendMessage(input)
  }

  const renderContent = (content: string) => {
    const parts = content.split(/\*\*(.+?)\*\*/g)
    return parts.map((part, i) =>
      i % 2 === 1 ? (
        <strong key={i} className="font-semibold text-slate-800">
          {part}
        </strong>
      ) : (
        <span key={i}>{part}</span>
      )
    )
  }

  return (
    <aside className="fixed right-0 top-14 bottom-0 w-80 bg-white border-l border-black/[0.06] shadow-[-4px_0_20px_rgba(0,0,0,0.06)] z-20 flex flex-col animate-slide-in-right">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3.5 border-b border-slate-100 flex-shrink-0">
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-lg bg-violet-50 border border-violet-100 flex items-center justify-center">
            <Bot size={15} className="text-violet-600" />
          </div>
          <div>
            <h2 className="text-sm font-semibold text-slate-800">AI Assistant</h2>
            <p className="text-[10px] text-slate-400 leading-none mt-0.5">Powered by Nexus AI</p>
          </div>
        </div>
        <button
          onClick={toggleAIPanel}
          className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
          aria-label="Close AI panel"
        >
          <X size={16} />
        </button>
      </div>

      {/* Suggested prompts */}
      {messages.length <= 1 && (
        <div className="px-3 pt-3 pb-2 flex-shrink-0">
          <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-2 px-1">
            Quick prompts
          </p>
          <div className="flex flex-wrap gap-1.5">
            {SUGGESTED_PROMPTS.map(prompt => (
              <button
                key={prompt}
                onClick={() => sendMessage(prompt)}
                className="text-xs px-2.5 py-1.5 bg-violet-50 hover:bg-violet-100 text-violet-700 rounded-lg transition-colors border border-violet-100 leading-none"
              >
                {prompt}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-3 py-3 space-y-3">
        {messages.map(msg => (
          <div
            key={msg.id}
            className={`flex gap-2.5 ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}
          >
            {/* Avatar */}
            <div
              className={`w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5 ${
                msg.role === 'assistant'
                  ? 'bg-violet-100'
                  : 'bg-indigo-100'
              }`}
            >
              {msg.role === 'assistant' ? (
                <Sparkles size={12} className="text-violet-600" />
              ) : (
                <User size={12} className="text-indigo-600" />
              )}
            </div>

            {/* Bubble */}
            <div
              className={`max-w-[85%] rounded-xl px-3 py-2.5 text-xs leading-relaxed ${
                msg.role === 'assistant'
                  ? 'bg-white text-slate-600 border border-black/[0.07] shadow-sm'
                  : 'text-white'
              }`}
              style={
                msg.role === 'user'
                  ? { background: 'linear-gradient(135deg, #3F5F5A, #274743)' }
                  : undefined
              }
            >
              <p className="whitespace-pre-wrap">{renderContent(msg.content)}</p>
              <p className={`text-[10px] mt-1.5 ${msg.role === 'assistant' ? 'text-slate-400' : 'text-white/60'}`}>
                {msg.timestamp.toLocaleTimeString('en-US', {
                  hour: 'numeric',
                  minute: '2-digit',
                  hour12: true,
                })}
              </p>
            </div>
          </div>
        ))}

        {/* Loading indicator */}
        {loading && (
          <div className="flex gap-2.5">
            <div className="w-6 h-6 rounded-full bg-violet-100 flex items-center justify-center flex-shrink-0 mt-0.5">
              <Sparkles size={12} className="text-violet-600" />
            </div>
            <div className="bg-white border border-black/[0.07] shadow-sm rounded-xl px-3 py-2.5 flex items-center gap-1.5">
              <Loader2 size={12} className="text-slate-400 animate-spin" />
              <span className="text-xs text-slate-400">Thinking...</span>
            </div>
          </div>
        )}

        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div className="flex-shrink-0 p-3 border-t border-slate-100">
        {messages.length > 1 && (
          <div className="flex flex-wrap gap-1 mb-2">
            {SUGGESTED_PROMPTS.slice(0, 3).map(prompt => (
              <button
                key={prompt}
                onClick={() => sendMessage(prompt)}
                className="text-[10px] px-2 py-1 bg-violet-50 hover:bg-violet-100 text-violet-600 rounded-md transition-colors border border-violet-100 leading-none"
              >
                {prompt}
              </button>
            ))}
          </div>
        )}
        <form onSubmit={handleSubmit} className="flex items-center gap-2">
          <input
            ref={inputRef}
            value={input}
            onChange={e => setInput(e.target.value)}
            placeholder="Ask anything..."
            disabled={loading}
            className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 placeholder-slate-400 outline-none focus:border-indigo-300 focus:ring-2 focus:ring-indigo-100 transition-all disabled:opacity-50"
          />
          <button
            type="submit"
            disabled={!input.trim() || loading}
            className="p-2 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-40 disabled:cursor-not-allowed text-white rounded-xl transition-colors flex-shrink-0"
            aria-label="Send message"
          >
            <Send size={14} />
          </button>
        </form>
      </div>
    </aside>
  )
}
