'use client'

import { useState } from 'react'
import { mockNotes, mockCourses, mockTasks, mockDriveFiles } from '@/lib/mock-data'
import { summarizeNote } from '@/lib/ai-service'
import { ArrowLeft, Edit3, Save, X, Sparkles, Tag, BookOpen, HardDrive, Loader2, CheckSquare } from 'lucide-react'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { formatDate, cn } from '@/lib/utils'

interface AIResults {
  summary?: string
  key_concepts?: string[]
  possible_tasks?: string[]
  possible_flashcards?: { front: string; back: string }[]
}

export default function NoteDetailPage({ params }: { params: { id: string } }) {
  const note = mockNotes.find(n => n.id === params.id)
  if (!note) notFound()

  const course = mockCourses.find(c => c.id === note.course_id)
  const linkedTasks = mockTasks.filter(t => t.note_id === note.id)
  const linkedFiles = mockDriveFiles.filter(f => note.linked_drive_file_ids?.includes(f.id))

  const [editing, setEditing] = useState(false)
  const [content, setContent] = useState(note.content)
  const [title, setTitle] = useState(note.title)
  const [aiLoading, setAiLoading] = useState(false)
  const [aiResults, setAiResults] = useState<AIResults | null>(null)
  const [activeAiTool, setActiveAiTool] = useState<string | null>(null)

  const handleAiTool = async (tool: string) => {
    setActiveAiTool(tool)
    setAiLoading(true)
    const results = await summarizeNote(content)
    setAiResults(results)
    setAiLoading(false)
  }

  return (
    <div className="space-y-6">
      {/* Top bar */}
      <div className="flex items-center gap-4">
        <Link href="/notes" className="flex items-center gap-2 text-slate-400 hover:text-slate-200 text-sm transition-colors">
          <ArrowLeft size={14} /> Notes
        </Link>
        <div className="flex-1" />
        {editing ? (
          <div className="flex gap-2">
            <button onClick={() => setEditing(false)} className="flex items-center gap-1.5 px-3 py-1.5 text-slate-400 hover:text-slate-200 text-sm border border-slate-700 rounded-lg transition-all">
              <X size={14} /> Cancel
            </button>
            <button onClick={() => setEditing(false)} className="flex items-center gap-1.5 px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white text-sm rounded-lg transition-all">
              <Save size={14} /> Save
            </button>
          </div>
        ) : (
          <button onClick={() => setEditing(true)} className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 text-sm border border-slate-700 rounded-lg transition-all">
            <Edit3 size={14} /> Edit
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Main content */}
        <div className="lg:col-span-3 space-y-4">
          {/* Title */}
          {editing ? (
            <input value={title} onChange={e => setTitle(e.target.value)}
              className="w-full bg-transparent text-3xl font-bold text-slate-100 outline-none border-b border-slate-700 pb-2 focus:border-indigo-500 transition-colors" />
          ) : (
            <h1 className="text-3xl font-bold text-slate-100">{title}</h1>
          )}

          {/* Meta */}
          <div className="flex flex-wrap items-center gap-3">
            {course && (
              <span className="flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-full bg-indigo-500/20 text-indigo-400 border border-indigo-500/30">
                <BookOpen size={11} /> {course.name}
              </span>
            )}
            {note.tags?.map(tag => (
              <span key={tag} className="flex items-center gap-1 text-xs px-2 py-0.5 rounded-full bg-slate-700 text-slate-400">
                <Tag size={10} /> {tag}
              </span>
            ))}
            <span className="text-xs text-slate-500">Updated {formatDate(note.updated_at)}</span>
          </div>

          {/* Content */}
          <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-6 min-h-[400px]">
            {editing ? (
              <textarea value={content} onChange={e => setContent(e.target.value)}
                className="w-full h-full min-h-[380px] bg-transparent text-slate-200 text-sm leading-relaxed outline-none resize-none placeholder-slate-600"
                placeholder="Write your note here..." />
            ) : (
              <div className="text-slate-200 text-sm leading-relaxed whitespace-pre-wrap">{content}</div>
            )}
          </div>

          {/* AI Results */}
          {aiLoading && (
            <div className="flex items-center gap-3 p-4 bg-violet-500/10 border border-violet-500/20 rounded-xl">
              <Loader2 size={16} className="text-violet-400 animate-spin" />
              <span className="text-violet-400 text-sm">AI is analyzing your note...</span>
            </div>
          )}
          {aiResults && !aiLoading && (
            <div className="bg-slate-800/50 border border-violet-500/20 rounded-xl p-5 space-y-4">
              <div className="flex items-center gap-2 text-violet-400 text-sm font-semibold">
                <Sparkles size={14} /> AI Analysis
              </div>
              {activeAiTool === 'summarize' && aiResults.summary && (
                <div>
                  <div className="text-xs text-slate-500 uppercase tracking-wider mb-2">Summary</div>
                  <p className="text-slate-300 text-sm">{aiResults.summary}</p>
                </div>
              )}
              {aiResults.key_concepts && aiResults.key_concepts.length > 0 && (
                <div>
                  <div className="text-xs text-slate-500 uppercase tracking-wider mb-2">Key Concepts</div>
                  <div className="flex flex-wrap gap-2">
                    {aiResults.key_concepts.map(c => (
                      <span key={c} className="text-xs px-2.5 py-1 bg-indigo-500/20 text-indigo-400 rounded-full">{c}</span>
                    ))}
                  </div>
                </div>
              )}
              {activeAiTool === 'tasks' && aiResults.possible_tasks && (
                <div>
                  <div className="text-xs text-slate-500 uppercase tracking-wider mb-2">Extracted Tasks</div>
                  <ul className="space-y-1">
                    {aiResults.possible_tasks.map((t, i) => (
                      <li key={i} className="flex items-center gap-2 text-sm text-slate-300">
                        <CheckSquare size={13} className="text-indigo-400" /> {t}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
              {activeAiTool === 'flashcards' && aiResults.possible_flashcards && (
                <div>
                  <div className="text-xs text-slate-500 uppercase tracking-wider mb-2">Flashcards</div>
                  <div className="space-y-2">
                    {aiResults.possible_flashcards.map((f, i) => (
                      <div key={i} className="p-3 bg-slate-900 rounded-lg">
                        <div className="text-xs text-slate-500 mb-1">Q: {f.front}</div>
                        <div className="text-sm text-slate-300">A: {f.back}</div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              <button onClick={() => { setAiResults(null); setActiveAiTool(null) }}
                className="text-xs text-slate-500 hover:text-slate-400 transition-colors">Dismiss</button>
            </div>
          )}
        </div>

        {/* Right sidebar */}
        <div className="space-y-5">
          {/* AI Tools */}
          <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-4 space-y-2">
            <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3 flex items-center gap-2">
              <Sparkles size={12} className="text-violet-400" /> AI Tools
            </div>
            {[
              { id: 'summarize', label: 'Summarize' },
              { id: 'tasks', label: 'Extract Tasks' },
              { id: 'flashcards', label: 'Flashcards' },
              { id: 'questions', label: 'Study Questions' },
            ].map(tool => (
              <button key={tool.id} onClick={() => handleAiTool(tool.id)}
                className="w-full text-left px-3 py-2 text-sm text-slate-300 hover:bg-slate-700 rounded-lg transition-all">
                {tool.label}
              </button>
            ))}
          </div>

          {/* Key concepts */}
          {note.key_concepts && note.key_concepts.length > 0 && (
            <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-4">
              <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">Key Concepts</div>
              <div className="flex flex-wrap gap-2">
                {note.key_concepts.map(c => (
                  <span key={c} className="text-xs px-2 py-0.5 bg-indigo-500/20 text-indigo-400 rounded-full">{c}</span>
                ))}
              </div>
            </div>
          )}

          {/* Linked tasks */}
          {linkedTasks.length > 0 && (
            <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-4">
              <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">Linked Tasks</div>
              <div className="space-y-2">
                {linkedTasks.map(t => (
                  <div key={t.id} className="flex items-center gap-2 text-sm text-slate-300">
                    <CheckSquare size={13} className="text-indigo-400" /> {t.title}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Linked files */}
          {linkedFiles.length > 0 && (
            <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-4">
              <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">Drive Files</div>
              <div className="space-y-2">
                {linkedFiles.map(f => (
                  <div key={f.id} className="flex items-center gap-2 text-sm text-slate-300">
                    <HardDrive size={13} className="text-amber-400" /> {f.name}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Summary */}
          {note.summary && (
            <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-4">
              <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">AI Summary</div>
              <p className="text-xs text-slate-400 leading-relaxed">{note.summary}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
