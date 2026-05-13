'use client'

import { useEffect, useState, useRef } from 'react'
import { Search, X, CheckSquare, FileText, BookOpen, Calendar, HardDrive, Clock } from 'lucide-react'
import {
  mockTasks,
  mockNotes,
  mockCourses,
  mockCalendarEvents,
  mockDriveFiles,
} from '@/lib/mock-data'

interface Props {
  onClose: () => void
}

const recentSearches = [
  'Hobbes essay',
  'French vocabulary quiz',
  'DS101 problem set',
  'research paper abstract',
]

export default function SearchModal({ onClose }: Props) {
  const [query, setQuery] = useState('')
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    inputRef.current?.focus()
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', handleKey)
    return () => window.removeEventListener('keydown', handleKey)
  }, [onClose])

  const q = query.toLowerCase().trim()

  const results =
    q.length > 1
      ? {
          tasks: mockTasks
            .filter(t => t.title.toLowerCase().includes(q))
            .slice(0, 3),
          notes: mockNotes
            .filter(n => n.title.toLowerCase().includes(q))
            .slice(0, 3),
          courses: mockCourses
            .filter(c => c.name.toLowerCase().includes(q) || c.code.toLowerCase().includes(q))
            .slice(0, 2),
          events: mockCalendarEvents
            .filter(e => e.title.toLowerCase().includes(q))
            .slice(0, 2),
          files: mockDriveFiles
            .filter(f => f.name.toLowerCase().includes(q))
            .slice(0, 2),
        }
      : null

  const hasResults =
    results !== null &&
    Object.values(results).some(arr => arr.length > 0)

  return (
    <div
      className="fixed inset-0 bg-black/30 backdrop-blur-sm z-50 flex items-start justify-center pt-20 px-4"
      onClick={e => {
        if (e.target === e.currentTarget) onClose()
      }}
    >
      <div className="w-full max-w-2xl bg-white border border-black/[0.08] rounded-2xl shadow-2xl overflow-hidden animate-scale-in">
        {/* Search input */}
        <div className="flex items-center gap-3 px-4 py-3.5 border-b border-slate-100">
          <Search size={18} className="text-slate-400 flex-shrink-0" />
          <input
            ref={inputRef}
            value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder="Search tasks, notes, courses, files..."
            className="flex-1 bg-transparent text-slate-800 placeholder-slate-400 outline-none text-base"
          />
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 transition-colors flex-shrink-0 p-1 rounded-lg hover:bg-slate-100"
            aria-label="Close search"
          >
            <X size={18} />
          </button>
        </div>

        {/* Results */}
        <div className="max-h-[60vh] overflow-y-auto">
          {/* Empty state — recent searches */}
          {!query && (
            <div className="p-4">
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3 px-2">
                Recent Searches
              </p>
              <div className="space-y-0.5">
                {recentSearches.map(s => (
                  <button
                    key={s}
                    onClick={() => setQuery(s)}
                    className="w-full flex items-center gap-3 px-3 py-2.5 hover:bg-slate-50 rounded-lg text-left group transition-colors"
                  >
                    <Clock size={14} className="text-slate-300 group-hover:text-slate-400 flex-shrink-0" />
                    <span className="text-sm text-slate-500 group-hover:text-slate-700">{s}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* No results */}
          {query && !hasResults && (
            <div className="py-12 text-center">
              <Search size={32} className="text-slate-200 mx-auto mb-3" />
              <p className="text-slate-500 text-sm">No results for &ldquo;{query}&rdquo;</p>
              <p className="text-slate-400 text-xs mt-1">Try a different search term</p>
            </div>
          )}

          {/* Grouped results */}
          {results && hasResults && (
            <div className="p-3 space-y-4">
              {/* Tasks */}
              {results.tasks.length > 0 && (
                <section>
                  <h3 className="section-label px-2 mb-1.5">Tasks</h3>
                  <div className="space-y-0.5">
                    {results.tasks.map(task => (
                      <div
                        key={task.id}
                        className="flex items-center gap-3 px-3 py-2.5 hover:bg-slate-50 rounded-lg cursor-pointer group transition-colors"
                      >
                        <CheckSquare size={15} className="text-indigo-500 flex-shrink-0" />
                        <div className="flex-1 min-w-0">
                          <p className="text-sm text-slate-700 truncate group-hover:text-slate-900">
                            {task.title}
                          </p>
                          <p className="text-xs text-slate-400 mt-0.5">
                            Task{task.due_date ? ` · Due ${task.due_date}` : ''}
                          </p>
                        </div>
                        <span
                          className={`text-xs px-2 py-0.5 rounded-full font-medium flex-shrink-0 border ${
                            task.priority === 'urgent'
                              ? 'bg-red-50 text-red-700 border-red-200'
                              : task.priority === 'high'
                              ? 'bg-amber-50 text-amber-700 border-amber-200'
                              : task.priority === 'medium'
                              ? 'bg-blue-50 text-blue-700 border-blue-200'
                              : 'bg-slate-100 text-slate-600 border-slate-200'
                          }`}
                        >
                          {task.priority}
                        </span>
                      </div>
                    ))}
                  </div>
                </section>
              )}

              {/* Notes */}
              {results.notes.length > 0 && (
                <section>
                  <h3 className="section-label px-2 mb-1.5">Notes</h3>
                  <div className="space-y-0.5">
                    {results.notes.map(note => (
                      <div
                        key={note.id}
                        className="flex items-center gap-3 px-3 py-2.5 hover:bg-slate-50 rounded-lg cursor-pointer group transition-colors"
                      >
                        <FileText size={15} className="text-violet-500 flex-shrink-0" />
                        <div className="flex-1 min-w-0">
                          <p className="text-sm text-slate-700 truncate group-hover:text-slate-900">
                            {note.title}
                          </p>
                          <p className="text-xs text-slate-400 mt-0.5">
                            Note
                            {note.tags && note.tags.length > 0
                              ? ` · ${note.tags.slice(0, 2).join(', ')}`
                              : ''}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </section>
              )}

              {/* Courses */}
              {results.courses.length > 0 && (
                <section>
                  <h3 className="section-label px-2 mb-1.5">Courses</h3>
                  <div className="space-y-0.5">
                    {results.courses.map(course => (
                      <div
                        key={course.id}
                        className="flex items-center gap-3 px-3 py-2.5 hover:bg-slate-50 rounded-lg cursor-pointer group transition-colors"
                      >
                        <BookOpen size={15} className="text-emerald-500 flex-shrink-0" />
                        <div className="flex-1 min-w-0">
                          <p className="text-sm text-slate-700 truncate group-hover:text-slate-900">
                            {course.name}
                          </p>
                          <p className="text-xs text-slate-400 mt-0.5">
                            {course.code} · {course.professor}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </section>
              )}

              {/* Events */}
              {results.events.length > 0 && (
                <section>
                  <h3 className="section-label px-2 mb-1.5">Events</h3>
                  <div className="space-y-0.5">
                    {results.events.map(event => (
                      <div
                        key={event.id}
                        className="flex items-center gap-3 px-3 py-2.5 hover:bg-slate-50 rounded-lg cursor-pointer group transition-colors"
                      >
                        <Calendar size={15} className="text-sky-500 flex-shrink-0" />
                        <div className="flex-1 min-w-0">
                          <p className="text-sm text-slate-700 truncate group-hover:text-slate-900">
                            {event.title}
                          </p>
                          <p className="text-xs text-slate-400 mt-0.5">
                            {event.type} · {new Date(event.start_time).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </section>
              )}

              {/* Drive Files */}
              {results.files.length > 0 && (
                <section>
                  <h3 className="section-label px-2 mb-1.5">Drive Files</h3>
                  <div className="space-y-0.5">
                    {results.files.map(file => (
                      <div
                        key={file.id}
                        className="flex items-center gap-3 px-3 py-2.5 hover:bg-slate-50 rounded-lg cursor-pointer group transition-colors"
                      >
                        <HardDrive size={15} className="text-amber-500 flex-shrink-0" />
                        <div className="flex-1 min-w-0">
                          <p className="text-sm text-slate-700 truncate group-hover:text-slate-900">
                            {file.name}
                          </p>
                          <p className="text-xs text-slate-400 mt-0.5 truncate">
                            {file.folder_path}
                          </p>
                        </div>
                        <span className="text-xs bg-slate-100 text-slate-500 border border-slate-200 px-2 py-0.5 rounded flex-shrink-0">
                          {file.detected_type}
                        </span>
                      </div>
                    ))}
                  </div>
                </section>
              )}
            </div>
          )}
        </div>

        {/* Footer hints */}
        <div className="px-4 py-2.5 border-t border-slate-100 flex items-center gap-5 text-xs text-slate-400">
          <span className="flex items-center gap-1">
            <kbd className="bg-slate-100 border border-slate-200 text-slate-500 px-1 rounded text-[10px]">↵</kbd>
            to select
          </span>
          <span className="flex items-center gap-1">
            <kbd className="bg-slate-100 border border-slate-200 text-slate-500 px-1 rounded text-[10px]">↑↓</kbd>
            to navigate
          </span>
          <span className="flex items-center gap-1">
            <kbd className="bg-slate-100 border border-slate-200 text-slate-500 px-1 rounded text-[10px]">Esc</kbd>
            to close
          </span>
        </div>
      </div>
    </div>
  )
}
