'use client'
import { useState } from 'react'
import { FileText, Plus, Search, Tag, Brain, Clock, BookOpen, Filter, X, Loader2, ChevronDown, Sparkles } from 'lucide-react'
import { useApp } from '@/lib/store'
import { mockCourses, mockWorkspaces, mockNotes } from '@/lib/mock-data'
import { formatDate, cn, truncate } from '@/lib/utils'
import EmptyState from '@/components/ui/EmptyState'
import type { Note } from '@/lib/types'
import { summarizeNote } from '@/lib/ai-service'

type FilterTab = 'all' | 'recent' | 'course' | 'tag'

interface NewNoteForm {
  title: string
  content: string
  course_id: string
  workspace_id: string
  tagsRaw: string
}

const EMPTY_FORM: NewNoteForm = {
  title: '',
  content: '',
  course_id: '',
  workspace_id: '',
  tagsRaw: '',
}

export default function NotesPage() {
  const { notes, addNote } = useApp()

  const [search, setSearch] = useState('')
  const [filterTab, setFilterTab] = useState<FilterTab>('all')
  const [activeTag, setActiveTag] = useState<string | null>(null)
  const [selectedNote, setSelectedNote] = useState<Note | null>(null)
  const [showNewForm, setShowNewForm] = useState(false)
  const [form, setForm] = useState<NewNoteForm>(EMPTY_FORM)

  // AI Tools state
  const [aiPanelOpen, setAIPanelOpen] = useState(false)
  const [aiLoading, setAILoading] = useState(false)
  const [aiResult, setAIResult] = useState<{
    type: string
    summary?: string
    tasks?: string[]
    flashcards?: { front: string; back: string }[]
    questions?: string[]
  } | null>(null)

  // Collect all unique tags from all notes
  const allTags = Array.from(new Set(notes.flatMap(n => n.tags))).sort()

  // Filtered notes
  const filteredNotes = notes.filter(note => {
    const matchesSearch =
      !search ||
      note.title.toLowerCase().includes(search.toLowerCase()) ||
      note.content.toLowerCase().includes(search.toLowerCase()) ||
      note.tags.some(t => t.toLowerCase().includes(search.toLowerCase()))

    const matchesTag = !activeTag || note.tags.includes(activeTag)

    if (filterTab === 'recent') {
      const recent = new Date()
      recent.setDate(recent.getDate() - 7)
      const updatedAt = new Date(note.updated_at)
      return matchesSearch && matchesTag && updatedAt >= recent
    }
    if (filterTab === 'course') {
      return matchesSearch && matchesTag && !!note.course_id
    }
    return matchesSearch && matchesTag
  })

  // Sort: most recently updated first
  const sortedNotes = [...filteredNotes].sort(
    (a, b) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime()
  )

  function getCourseForNote(note: Note) {
    return mockCourses.find(c => c.id === note.course_id)
  }

  function getWorkspaceForNote(note: Note) {
    return mockWorkspaces.find(w => w.id === note.workspace_id)
  }

  async function handleAITool(tool: 'summarize' | 'tasks' | 'flashcards' | 'questions') {
    if (!selectedNote) return
    setAILoading(true)
    setAIResult(null)
    try {
      const result = await summarizeNote(selectedNote.content)
      if (tool === 'summarize') {
        setAIResult({ type: 'summarize', summary: result.summary })
      } else if (tool === 'tasks') {
        setAIResult({ type: 'tasks', tasks: result.possible_tasks })
      } else if (tool === 'flashcards') {
        setAIResult({ type: 'flashcards', flashcards: result.possible_flashcards })
      } else if (tool === 'questions') {
        setAIResult({
          type: 'questions',
          questions: [
            'What are the main arguments presented in this note?',
            'How do these concepts connect to broader course themes?',
            'What evidence or examples support the key claims?',
            'What questions remain unanswered?',
          ],
        })
      }
    } finally {
      setAILoading(false)
    }
  }

  function handleSubmitNewNote(e: React.FormEvent) {
    e.preventDefault()
    const now = new Date().toISOString()
    const tags = form.tagsRaw
      .split(',')
      .map(t => t.trim())
      .filter(Boolean)
    const note: Note = {
      id: `n-${Date.now()}`,
      user_id: '1',
      title: form.title,
      content: form.content,
      workspace_id: form.workspace_id || undefined,
      course_id: form.course_id || undefined,
      tags,
      linked_drive_file_ids: [],
      key_concepts: [],
      created_at: now,
      updated_at: now,
    }
    addNote(note)
    setForm(EMPTY_FORM)
    setShowNewForm(false)
    setSelectedNote(note)
  }

  return (
    <div className="flex h-[calc(100vh-4rem)] -m-6 overflow-hidden">
      {/* ── Left Sidebar ── */}
      <aside className="w-72 flex-shrink-0 border-r border-slate-200 flex flex-col bg-white overflow-hidden">
        {/* Header */}
        <div className="p-4 border-b border-slate-200">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <FileText className="w-5 h-5 text-indigo-600" />
              <h1 className="text-base font-bold text-slate-900">Notes</h1>
              <span className="text-xs text-slate-500 bg-slate-100 border border-slate-200 px-1.5 py-0.5 rounded-full">
                {notes.length}
              </span>
            </div>
            <button
              onClick={() => { setShowNewForm(true); setSelectedNote(null) }}
              className="w-7 h-7 rounded-lg bg-indigo-600 hover:bg-indigo-700 flex items-center justify-center transition-colors shadow-sm"
              title="New note"
            >
              <Plus className="w-4 h-4 text-white" />
            </button>
          </div>

          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search notes..."
              className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-3 py-2 text-sm text-slate-700 placeholder-slate-400 focus:outline-none focus:border-indigo-400 focus:ring-1 focus:ring-indigo-400/30"
            />
          </div>
        </div>

        {/* Filter tabs */}
        <div className="px-4 pt-3 pb-2 border-b border-slate-100">
          <div className="flex gap-1 flex-wrap">
            {(
              [
                { key: 'all', label: 'All', icon: FileText },
                { key: 'recent', label: 'Recent', icon: Clock },
                { key: 'course', label: 'By Course', icon: BookOpen },
                { key: 'tag', label: 'By Tag', icon: Tag },
              ] as const
            ).map(({ key, label, icon: Icon }) => (
              <button
                key={key}
                onClick={() => setFilterTab(key)}
                className={cn(
                  'flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-medium transition-colors',
                  filterTab === key
                    ? 'bg-indigo-50 text-indigo-700 border border-indigo-200'
                    : 'text-slate-500 hover:text-slate-700 hover:bg-slate-100'
                )}
              >
                <Icon className="w-3 h-3" />
                {label}
              </button>
            ))}
          </div>
        </div>

        {/* Tag filter chips */}
        {allTags.length > 0 && (
          <div className="px-4 py-2 border-b border-slate-100 flex flex-wrap gap-1.5 max-h-24 overflow-y-auto">
            {allTags.map(tag => (
              <button
                key={tag}
                onClick={() => setActiveTag(activeTag === tag ? null : tag)}
                className={cn(
                  'px-2 py-0.5 rounded-full text-xs border transition-colors',
                  activeTag === tag
                    ? 'bg-indigo-100 text-indigo-700 border-indigo-300'
                    : 'bg-slate-50 text-slate-500 border-slate-200 hover:border-slate-300 hover:text-slate-700'
                )}
              >
                #{tag}
              </button>
            ))}
          </div>
        )}

        {/* Note list */}
        <div className="flex-1 overflow-y-auto">
          {sortedNotes.length === 0 ? (
            <div className="p-4 text-center text-slate-400 text-sm mt-8">
              No notes found
            </div>
          ) : (
            sortedNotes.map(note => {
              const course = getCourseForNote(note)
              const workspace = getWorkspaceForNote(note)
              const isSelected = selectedNote?.id === note.id
              const contentPreview = note.content.replace(/[#*`|]/g, '').trim()

              return (
                <button
                  key={note.id}
                  onClick={() => { setSelectedNote(note); setShowNewForm(false); setAIResult(null); setAIPanelOpen(false) }}
                  className={cn(
                    'w-full text-left p-3 border-b border-slate-100 hover:bg-slate-50 transition-colors',
                    isSelected && 'bg-indigo-50/60 border-l-2 border-l-indigo-500'
                  )}
                >
                  <div className="flex items-start gap-2 mb-1">
                    {/* Workspace / course color dot */}
                    <span
                      className="mt-1 w-2 h-2 rounded-full flex-shrink-0"
                      style={{ backgroundColor: course?.color ?? workspace?.color ?? '#6366f1' }}
                    />
                    <span className="text-sm font-medium text-slate-800 line-clamp-2 leading-tight">
                      {note.title}
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 line-clamp-2 ml-4 mb-2">
                    {truncate(contentPreview, 80)}
                  </p>
                  <div className="ml-4 flex items-center justify-between">
                    <div className="flex items-center gap-1 flex-wrap">
                      {note.tags.slice(0, 2).map(tag => (
                        <span
                          key={tag}
                          className="px-1.5 py-0.5 bg-slate-100 text-slate-500 rounded text-xs border border-slate-200"
                        >
                          #{tag}
                        </span>
                      ))}
                    </div>
                    <span className="text-xs text-slate-400 flex-shrink-0">
                      {formatDate(note.updated_at)}
                    </span>
                  </div>
                </button>
              )
            })
          )}
        </div>
      </aside>

      {/* ── Right Panel ── */}
      <main className="flex-1 overflow-y-auto bg-[#F5F4F1]">
        {showNewForm ? (
          /* New Note Form */
          <div className="p-6 max-w-2xl mx-auto">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-slate-900">New Note</h2>
              <button
                onClick={() => setShowNewForm(false)}
                className="text-slate-400 hover:text-slate-700 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmitNewNote} className="space-y-4">
              {/* Title */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">Title</label>
                <input
                  required
                  value={form.title}
                  onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
                  placeholder="Note title..."
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:border-indigo-400 focus:ring-1 focus:ring-indigo-400/30"
                />
              </div>

              {/* Course */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">Course</label>
                <select
                  value={form.course_id}
                  onChange={e => setForm(f => ({ ...f, course_id: e.target.value }))}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm text-slate-800 focus:outline-none focus:border-indigo-400 focus:ring-1 focus:ring-indigo-400/30"
                >
                  <option value="">No course</option>
                  {mockCourses.map(c => (
                    <option key={c.id} value={c.id}>
                      {c.code} — {c.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Workspace */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">Workspace</label>
                <select
                  value={form.workspace_id}
                  onChange={e => setForm(f => ({ ...f, workspace_id: e.target.value }))}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm text-slate-800 focus:outline-none focus:border-indigo-400 focus:ring-1 focus:ring-indigo-400/30"
                >
                  <option value="">No workspace</option>
                  {mockWorkspaces.map(w => (
                    <option key={w.id} value={w.id}>
                      {w.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Tags */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">
                  Tags <span className="text-slate-400 font-normal">(comma-separated)</span>
                </label>
                <input
                  value={form.tagsRaw}
                  onChange={e => setForm(f => ({ ...f, tagsRaw: e.target.value }))}
                  placeholder="e.g. political theory, hobbes, essay"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:border-indigo-400 focus:ring-1 focus:ring-indigo-400/30"
                />
              </div>

              {/* Content */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">Content</label>
                <textarea
                  required
                  value={form.content}
                  onChange={e => setForm(f => ({ ...f, content: e.target.value }))}
                  placeholder="Write your note here... Markdown supported."
                  rows={14}
                  style={{ minHeight: 300 }}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:border-indigo-400 focus:ring-1 focus:ring-indigo-400/30 resize-y font-mono leading-relaxed"
                />
              </div>

              {/* Actions */}
              <div className="flex gap-3 pt-1">
                <button
                  type="submit"
                  className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold rounded-xl transition-colors shadow-sm"
                >
                  Create Note
                </button>
                <button
                  type="button"
                  onClick={() => { setShowNewForm(false); setForm(EMPTY_FORM) }}
                  className="px-5 py-2.5 bg-white hover:bg-slate-50 text-slate-600 text-sm font-medium rounded-xl transition-colors border border-slate-200"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        ) : selectedNote ? (
          /* Note Viewer */
          <NoteViewer
            note={selectedNote}
            aiPanelOpen={aiPanelOpen}
            setAIPanelOpen={setAIPanelOpen}
            aiLoading={aiLoading}
            aiResult={aiResult}
            onAITool={handleAITool}
            onBack={() => setSelectedNote(null)}
          />
        ) : (
          /* Empty state */
          <div className="flex items-center justify-center h-full">
            <EmptyState
              icon={<FileText className="w-7 h-7" />}
              title="Select a note to view"
              description="Choose a note from the list, or create a new one to get started."
              action={{ label: 'New Note', onClick: () => setShowNewForm(true) }}
            />
          </div>
        )}
      </main>
    </div>
  )
}

// ── Note Viewer Sub-component ────────────────────────────────────

interface NoteViewerProps {
  note: Note
  aiPanelOpen: boolean
  setAIPanelOpen: (v: boolean) => void
  aiLoading: boolean
  aiResult: {
    type: string
    summary?: string
    tasks?: string[]
    flashcards?: { front: string; back: string }[]
    questions?: string[]
  } | null
  onAITool: (tool: 'summarize' | 'tasks' | 'flashcards' | 'questions') => void
  onBack: () => void
}

function NoteViewer({
  note,
  aiPanelOpen,
  setAIPanelOpen,
  aiLoading,
  aiResult,
  onAITool,
  onBack,
}: NoteViewerProps) {
  const course = mockCourses.find(c => c.id === note.course_id)
  const workspace = mockWorkspaces.find(w => w.id === note.workspace_id)

  return (
    <div className="flex flex-col h-full">
      {/* Top bar */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 bg-white/80 backdrop-blur-sm sticky top-0 z-10">
        <div className="flex items-center gap-3">
          <button
            onClick={onBack}
            className="text-slate-500 hover:text-slate-900 text-sm flex items-center gap-1.5 transition-colors"
          >
            <span>←</span>
            <span>Notes</span>
          </button>
          <span className="text-slate-300">|</span>
          <div className="flex items-center gap-2">
            {course && (
              <span
                className="px-2 py-0.5 rounded-full text-xs font-medium"
                style={{ backgroundColor: course.color + '22', color: course.color }}
              >
                {course.code}
              </span>
            )}
            {workspace && !course && (
              <span
                className="px-2 py-0.5 rounded-full text-xs font-medium"
                style={{ backgroundColor: workspace.color + '22', color: workspace.color }}
              >
                {workspace.name}
              </span>
            )}
            <span className="text-xs text-slate-400">
              {note.tags.length} tag{note.tags.length !== 1 ? 's' : ''}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* AI Tools dropdown */}
          <div className="relative">
            <button
              onClick={() => setAIPanelOpen(!aiPanelOpen)}
              className={cn(
                'flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors border',
                aiPanelOpen
                  ? 'bg-violet-50 text-violet-700 border-violet-200'
                  : 'bg-white text-slate-600 border-slate-200 hover:border-slate-300 hover:bg-slate-50'
              )}
            >
              <Brain className="w-4 h-4" />
              AI Tools
              <ChevronDown className={cn('w-3.5 h-3.5 transition-transform', aiPanelOpen && 'rotate-180')} />
            </button>

            {aiPanelOpen && (
              <div className="absolute right-0 top-full mt-2 w-52 bg-white border border-slate-200 rounded-xl shadow-lg z-20 p-2 space-y-1">
                {[
                  { key: 'summarize' as const, label: 'Summarize this note', icon: Sparkles },
                  { key: 'tasks' as const, label: 'Extract tasks', icon: Filter },
                  { key: 'flashcards' as const, label: 'Generate flashcards', icon: BookOpen },
                  { key: 'questions' as const, label: 'Study questions', icon: Brain },
                  { key: 'link' as const, label: 'Link to course', icon: Tag },
                ].map(({ key, label, icon: Icon }) => (
                  <button
                    key={key}
                    onClick={() => key !== 'link' && onAITool(key)}
                    disabled={aiLoading}
                    className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm text-slate-600 hover:bg-slate-50 hover:shadow-sm hover:text-slate-900 transition-all text-left disabled:opacity-50"
                  >
                    <Icon className="w-4 h-4 text-violet-500" />
                    {label}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Content area */}
      <div className="flex-1 overflow-y-auto p-6">
        <div className="max-w-3xl mx-auto space-y-6">
          {/* Title & meta */}
          <div>
            <h1 className="text-2xl font-bold text-slate-900 mb-2">{note.title}</h1>
            <div className="flex items-center gap-3 text-sm text-slate-400">
              {course && <span>{course.name}</span>}
              <span>·</span>
              <span>Last edited {formatDate(note.updated_at)}</span>
            </div>
          </div>

          {/* AI Loading */}
          {aiLoading && (
            <div className="flex items-center gap-3 p-4 bg-violet-50 border border-violet-200 rounded-xl text-violet-700 text-sm">
              <Loader2 className="w-4 h-4 animate-spin" />
              Processing with AI...
            </div>
          )}

          {/* AI Result */}
          {aiResult && !aiLoading && (
            <div className="p-4 bg-violet-50 border border-violet-200 rounded-xl space-y-3">
              <div className="flex items-center gap-2 mb-3">
                <Brain className="w-4 h-4 text-violet-600" />
                <span className="text-sm font-semibold text-violet-700">
                  {aiResult.type === 'summarize' && 'AI Summary'}
                  {aiResult.type === 'tasks' && 'Extracted Tasks'}
                  {aiResult.type === 'flashcards' && 'Flashcards'}
                  {aiResult.type === 'questions' && 'Study Questions'}
                </span>
              </div>

              {aiResult.summary && (
                <p className="text-sm text-slate-700 leading-relaxed">{aiResult.summary}</p>
              )}
              {aiResult.tasks && (
                <ul className="space-y-1.5">
                  {aiResult.tasks.map((t, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm text-slate-700">
                      <span className="text-violet-500 mt-0.5">•</span>
                      {t}
                    </li>
                  ))}
                </ul>
              )}
              {aiResult.flashcards && (
                <div className="space-y-2">
                  {aiResult.flashcards.map((fc, i) => (
                    <div key={i} className="bg-white rounded-lg p-3 border border-violet-100">
                      <p className="text-xs text-violet-500 uppercase tracking-wide mb-1">Q</p>
                      <p className="text-sm text-slate-800 mb-2">{fc.front}</p>
                      <p className="text-xs text-violet-500 uppercase tracking-wide mb-1">A</p>
                      <p className="text-sm text-slate-600">{fc.back}</p>
                    </div>
                  ))}
                </div>
              )}
              {aiResult.questions && (
                <ol className="space-y-2">
                  {aiResult.questions.map((q, i) => (
                    <li key={i} className="flex gap-2 text-sm text-slate-700">
                      <span className="text-violet-600 font-semibold flex-shrink-0">{i + 1}.</span>
                      {q}
                    </li>
                  ))}
                </ol>
              )}
            </div>
          )}

          {/* Note content */}
          <div className="prose prose-slate prose-sm max-w-none">
            <pre className="bg-white border border-slate-200 rounded-xl p-5 text-sm text-slate-700 whitespace-pre-wrap font-sans leading-relaxed overflow-x-auto shadow-sm">
              {note.content}
            </pre>
          </div>

          {/* Divider */}
          <hr className="border-slate-200" />

          {/* AI Summary (if stored) */}
          {note.summary && (
            <div>
              <h3 className="text-sm font-semibold text-slate-700 mb-2 flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-violet-500" />
                AI Summary
              </h3>
              <p className="text-sm text-slate-600 leading-relaxed bg-slate-50 rounded-xl p-4 border border-slate-200">
                {note.summary}
              </p>
            </div>
          )}

          {/* Key concepts */}
          {note.key_concepts.length > 0 && (
            <div>
              <h3 className="text-sm font-semibold text-slate-700 mb-2">Key Concepts</h3>
              <div className="flex flex-wrap gap-2">
                {note.key_concepts.map(concept => (
                  <span
                    key={concept}
                    className="px-2.5 py-1 bg-indigo-50 text-indigo-700 rounded-lg text-xs border border-indigo-200 font-medium"
                  >
                    {concept}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Tags */}
          {note.tags.length > 0 && (
            <div>
              <h3 className="text-sm font-semibold text-slate-700 mb-2 flex items-center gap-2">
                <Tag className="w-4 h-4 text-slate-400" />
                Tags
              </h3>
              <div className="flex flex-wrap gap-2">
                {note.tags.map(tag => (
                  <span
                    key={tag}
                    className="px-2.5 py-1 bg-slate-100 text-slate-600 rounded-full text-xs border border-slate-200"
                  >
                    #{tag}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
