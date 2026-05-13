'use client'

import { mockWorkspaces, mockTasks, mockNotes, mockDriveFiles, mockCalendarEvents } from '@/lib/mock-data'
import { notFound } from 'next/navigation'
import { CheckSquare, FileText, HardDrive, ArrowLeft, Calendar, Bot, Send } from 'lucide-react'
import Link from 'next/link'
import { useState } from 'react'
import { cn, formatDate } from '@/lib/utils'

const WORKSPACE_ICONS: Record<string, string> = {
  College: '🎓', French: '🇫🇷', Chinese: '🇨🇳', 'Social Media': '📱',
  Personal: '🌱', 'Mandato Aberto': '⚡', Research: '🔬', 'Applications/Fellowships': '🏆',
}

export default function WorkspaceDetailPage({ params }: { params: { id: string } }) {
  const ws = mockWorkspaces.find(w => w.id === params.id)
  if (!ws) notFound()

  const tasks = mockTasks.filter(t => t.workspace_id === ws.id && t.status !== 'done')
  const notes = mockNotes.filter(n => n.workspace_id === ws.id)
  const files = mockDriveFiles.filter(f => f.detected_workspace_id === ws.id)
  const events = mockCalendarEvents.filter(e => e.workspace_id === ws.id)

  const [aiQuery, setAiQuery] = useState('')
  const [aiResponse, setAiResponse] = useState<string | null>(null)

  const handleAskAI = () => {
    setAiResponse(`Based on your ${ws.name} workspace, here's a summary: You have ${tasks.length} active tasks and ${notes.length} notes. ${tasks[0] ? `Most urgent: "${tasks[0].title}". ` : ''}Your recent notes cover key topics in this area. I recommend focusing on the highest-priority tasks first.`)
  }

  const emoji = WORKSPACE_ICONS[ws.name] ?? '📁'

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link href="/workspaces" className="flex items-center gap-2 text-slate-400 hover:text-slate-200 text-sm transition-colors">
          <ArrowLeft size={14} /> Workspaces
        </Link>
      </div>

      <div className="flex items-center gap-4 pb-4 border-b border-slate-800">
        <div className="w-14 h-14 rounded-2xl flex items-center justify-center text-3xl"
          style={{ backgroundColor: ws.color + '22' }}>
          {emoji}
        </div>
        <div>
          <h1 className="text-2xl font-bold text-slate-100">{ws.name}</h1>
          <p className="text-slate-400 text-sm mt-0.5">{ws.description}</p>
        </div>
        <div className="ml-auto w-3 h-12 rounded-full" style={{ backgroundColor: ws.color }} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          {/* Tasks */}
          <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-5">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-sm font-semibold text-slate-200 flex items-center gap-2">
                <CheckSquare size={15} className="text-indigo-400" /> Active Tasks
              </h2>
              <Link href="/tasks" className="text-xs text-indigo-400 hover:text-indigo-300 transition-colors">View all →</Link>
            </div>
            {tasks.length === 0 ? (
              <p className="text-slate-500 text-sm text-center py-4">No active tasks</p>
            ) : (
              <div className="space-y-2">
                {tasks.slice(0, 5).map(task => (
                  <div key={task.id} className="flex items-center gap-3 py-2 border-b border-slate-700/50 last:border-0">
                    <div className={cn('w-2 h-2 rounded-full flex-shrink-0',
                      task.priority === 'urgent' ? 'bg-red-400' :
                      task.priority === 'high' ? 'bg-amber-400' :
                      task.priority === 'medium' ? 'bg-blue-400' : 'bg-slate-500')} />
                    <span className="text-sm text-slate-300 flex-1">{task.title}</span>
                    {task.due_date && <span className="text-xs text-slate-500">{formatDate(task.due_date)}</span>}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Notes */}
          <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-5">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-sm font-semibold text-slate-200 flex items-center gap-2">
                <FileText size={15} className="text-violet-400" /> Notes
              </h2>
              <Link href="/notes" className="text-xs text-indigo-400 hover:text-indigo-300 transition-colors">View all →</Link>
            </div>
            {notes.length === 0 ? (
              <p className="text-slate-500 text-sm text-center py-4">No notes yet</p>
            ) : (
              <div className="grid grid-cols-2 gap-3">
                {notes.slice(0, 4).map(note => (
                  <Link key={note.id} href={`/notes/${note.id}`}
                    className="p-3 bg-slate-900/50 rounded-lg hover:bg-slate-700/50 transition-all">
                    <div className="text-sm font-medium text-slate-300 truncate">{note.title}</div>
                    <div className="text-xs text-slate-600 mt-1">{formatDate(note.updated_at)}</div>
                  </Link>
                ))}
              </div>
            )}
          </div>

          {/* Files */}
          {files.length > 0 && (
            <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-5">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-sm font-semibold text-slate-200 flex items-center gap-2">
                  <HardDrive size={15} className="text-amber-400" /> Drive Files
                </h2>
                <Link href="/drive" className="text-xs text-indigo-400 hover:text-indigo-300 transition-colors">View all →</Link>
              </div>
              <div className="space-y-2">
                {files.slice(0, 3).map(file => (
                  <div key={file.id} className="flex items-center gap-3 text-sm">
                    <span>📄</span>
                    <span className="text-slate-300 flex-1 truncate">{file.name}</span>
                    <span className="text-xs text-slate-600">{file.detected_type}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Right sidebar */}
        <div className="space-y-5">
          {/* AI Assistant */}
          <div className="bg-gradient-to-br from-indigo-950/50 to-violet-950/50 border border-indigo-500/20 rounded-xl p-5">
            <div className="flex items-center gap-2 mb-3">
              <Bot size={16} className="text-violet-400" />
              <span className="text-sm font-semibold text-slate-200">AI Assistant</span>
            </div>
            <p className="text-xs text-slate-400 mb-3">Ask anything about your {ws.name} workspace</p>
            <div className="space-y-2">
              <textarea value={aiQuery} onChange={e => setAiQuery(e.target.value)}
                placeholder={`Summarize my ${ws.name} progress...`}
                className="w-full h-20 bg-slate-900/80 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-200 placeholder-slate-600 outline-none focus:border-indigo-500 resize-none transition-colors" />
              <button onClick={handleAskAI}
                className="w-full flex items-center justify-center gap-2 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-sm rounded-lg transition-all">
                <Send size={13} /> Ask AI
              </button>
            </div>
            {aiResponse && (
              <div className="mt-3 p-3 bg-slate-900/80 rounded-lg text-xs text-slate-300 leading-relaxed">
                {aiResponse}
              </div>
            )}
          </div>

          {/* Upcoming events */}
          {events.length > 0 && (
            <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-5">
              <h2 className="text-sm font-semibold text-slate-200 flex items-center gap-2 mb-3">
                <Calendar size={14} className="text-violet-400" /> Events
              </h2>
              <div className="space-y-2">
                {events.slice(0, 3).map(e => (
                  <div key={e.id} className="text-sm text-slate-400">{e.title}</div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
