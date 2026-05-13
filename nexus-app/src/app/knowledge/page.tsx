'use client'

import { useState } from 'react'
import { Brain, Search, Tag, FileText, Sparkles, Hash, Loader2, BookOpen, HardDrive } from 'lucide-react'
import { mockNotes, mockDriveFiles, mockTasks, mockCourses } from '@/lib/mock-data'
import { cn, formatDate, truncate } from '@/lib/utils'
import { askKnowledgeBase } from '@/lib/ai-service'
import Link from 'next/link'

const TOPICS = [
  { name: 'Misinformation', notes: 2, files: 1, color: 'text-red-600', bg: 'bg-white border border-black/[0.07]', leftBorder: 'border-l-4 border-red-400' },
  { name: 'Political behavior', notes: 3, files: 2, color: 'text-indigo-700', bg: 'bg-white border border-black/[0.07]', leftBorder: 'border-l-4 border-indigo-400' },
  { name: 'French grammar', notes: 3, files: 2, color: 'text-violet-700', bg: 'bg-white border border-black/[0.07]', leftBorder: 'border-l-4 border-violet-400' },
  { name: 'Chinese characters', notes: 2, files: 4, color: 'text-amber-700', bg: 'bg-white border border-black/[0.07]', leftBorder: 'border-l-4 border-amber-400' },
  { name: 'Data science', notes: 2, files: 1, color: 'text-emerald-700', bg: 'bg-white border border-black/[0.07]', leftBorder: 'border-l-4 border-emerald-400' },
  { name: 'Civic technology', notes: 1, files: 1, color: 'text-teal-700', bg: 'bg-white border border-black/[0.07]', leftBorder: 'border-l-4 border-teal-400' },
  { name: 'College writing', notes: 2, files: 0, color: 'text-blue-700', bg: 'bg-white border border-black/[0.07]', leftBorder: 'border-l-4 border-blue-400' },
  { name: 'Research methods', notes: 1, files: 2, color: 'text-pink-700', bg: 'bg-white border border-black/[0.07]', leftBorder: 'border-l-4 border-pink-400' },
]

const EXAMPLE_QUERIES = [
  'What do I know about misinformation?',
  'Summarize my French grammar notes',
  'What are the main theories in Political Theory?',
  'Find everything related to data visualization',
]

interface AIAnswer {
  synthesized_answer: string
  relevant_notes: string[]
  relevant_files: string[]
  relevant_tasks: string[]
}

export default function KnowledgePage() {
  const [query, setQuery] = useState('')
  const [loading, setLoading] = useState(false)
  const [aiAnswer, setAiAnswer] = useState<AIAnswer | null>(null)

  const allTags = Array.from(new Set(mockNotes.flatMap(n => n.tags ?? [])))

  const handleAsk = async (q?: string) => {
    const text = q ?? query
    if (!text.trim()) return
    setQuery(text)
    setLoading(true)
    const result = await askKnowledgeBase(text)
    setAiAnswer(result)
    setLoading(false)
  }

  const recentNotes = [...mockNotes].sort((a, b) =>
    new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime()
  ).slice(0, 6)

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-3">
          <Brain className="text-indigo-600" size={24} />
          Knowledge Hub
        </h1>
        <p className="text-slate-500 text-sm mt-1">Your second brain — everything connected and searchable</p>
      </div>

      {/* Ask my knowledge base */}
      <div className="bg-gradient-to-br from-indigo-50 to-violet-50 border border-indigo-200/50 rounded-2xl p-6 space-y-4">
        <div className="flex items-center gap-2">
          <Sparkles size={18} className="text-indigo-600" />
          <h2 className="text-base font-semibold text-slate-800">Ask my knowledge base</h2>
        </div>
        <div className="flex gap-2">
          <input value={query} onChange={e => setQuery(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleAsk()}
            placeholder="What do you want to know about your notes and files?"
            className="flex-1 bg-white border border-slate-200 rounded-xl px-4 py-2.5 text-slate-700 placeholder-slate-400 outline-none focus:border-indigo-400 text-sm transition-colors shadow-sm" />
          <button onClick={() => handleAsk()}
            className="flex items-center gap-2 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-sm font-medium transition-all">
            {loading ? <Loader2 size={14} className="animate-spin" /> : <Brain size={14} />}
            Ask
          </button>
        </div>

        {/* Example queries */}
        <div className="flex flex-wrap gap-2">
          {EXAMPLE_QUERIES.map(q => (
            <button key={q} onClick={() => handleAsk(q)}
              className="text-xs px-3 py-1.5 bg-white border border-slate-200 text-slate-500 hover:border-indigo-300 hover:text-indigo-600 rounded-full transition-all">
              {q}
            </button>
          ))}
        </div>

        {/* AI Answer */}
        {aiAnswer && !loading && (
          <div className="bg-white rounded-xl p-5 space-y-4 border border-indigo-100 shadow-sm">
            <p className="text-sm text-slate-700 leading-relaxed">{aiAnswer.synthesized_answer}</p>
            {mockNotes.slice(0, 2).length > 0 && (
              <div>
                <div className="text-xs text-slate-400 uppercase tracking-wider mb-2">Relevant Notes</div>
                <div className="flex flex-wrap gap-2">
                  {mockNotes.slice(0, 2).map(n => (
                    <Link key={n.id} href={`/notes/${n.id}`}
                      className="flex items-center gap-1.5 text-xs px-2.5 py-1 bg-indigo-100 text-indigo-700 rounded-full hover:bg-indigo-200 transition-all">
                      <FileText size={10} /> {n.title}
                    </Link>
                  ))}
                </div>
              </div>
            )}
            <button onClick={() => setAiAnswer(null)} className="text-xs text-slate-400 hover:text-slate-600 transition-colors">Clear</button>
          </div>
        )}
      </div>

      {/* Topics */}
      <div>
        <h2 className="text-base font-semibold text-slate-800 mb-4 flex items-center gap-2">
          <Hash size={16} className="text-slate-400" /> Topics
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {TOPICS.map(topic => (
            <button key={topic.name}
              className={cn('text-left p-4 rounded-xl transition-all hover:shadow-md hover:border-indigo-200', topic.bg, topic.leftBorder)}>
              <div className={cn('text-sm font-semibold mb-2', topic.color)}>{topic.name}</div>
              <div className="flex gap-3 text-xs text-slate-400">
                <span className="flex items-center gap-1"><FileText size={10} /> {topic.notes}</span>
                <span className="flex items-center gap-1"><HardDrive size={10} /> {topic.files}</span>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Recent Knowledge */}
      <div>
        <h2 className="text-base font-semibold text-slate-800 mb-4 flex items-center gap-2">
          <FileText size={16} className="text-slate-400" /> Recent Notes
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {recentNotes.map(note => (
            <Link key={note.id} href={`/notes/${note.id}`}
              className="bg-white border border-black/[0.07] rounded-xl p-4 hover:shadow-md hover:border-indigo-200 transition-all group">
              <h3 className="text-sm font-semibold text-slate-800 group-hover:text-indigo-600 transition-colors">{note.title}</h3>
              <p className="text-xs text-slate-500 mt-2 line-clamp-3 leading-relaxed">{truncate(note.content, 120)}</p>
              <div className="flex flex-wrap gap-1.5 mt-3">
                {note.tags?.slice(0, 3).map(tag => (
                  <span key={tag} className="flex items-center gap-1 text-xs px-2 py-0.5 bg-slate-100 text-slate-500 rounded-full border border-slate-200">
                    <Tag size={9} /> {tag}
                  </span>
                ))}
              </div>
              <div className="text-xs text-slate-400 mt-2">{formatDate(note.updated_at)}</div>
            </Link>
          ))}
        </div>
      </div>

      {/* Tag Cloud */}
      <div>
        <h2 className="text-base font-semibold text-slate-800 mb-4 flex items-center gap-2">
          <Tag size={16} className="text-slate-400" /> Tags
        </h2>
        <div className="flex flex-wrap gap-2">
          {allTags.map((tag, i) => (
            <button key={tag}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-white border border-slate-200 text-slate-500 hover:border-indigo-300 hover:text-indigo-600 rounded-full text-sm transition-all"
              style={{ fontSize: `${0.7 + (i % 3) * 0.1}rem` }}>
              <Tag size={10} /> {tag}
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}
