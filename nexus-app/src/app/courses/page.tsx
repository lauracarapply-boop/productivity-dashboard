'use client'

import { useState } from 'react'
import { mockCourses, mockTasks, mockNotes, mockDriveFiles } from '@/lib/mock-data'
import { BookOpen, Clock, FileText, CheckSquare, HardDrive, ChevronRight, Plus, GraduationCap, X } from 'lucide-react'
import Link from 'next/link'

// Format a schedule slot into a human-readable string: "MWF 10:00–11:00 AM · Room 204"
function formatSchedule(schedule: { day: string; start: string; end: string; location: string }[]) {
  if (!schedule.length) return ''

  const dayAbbr: Record<string, string> = {
    Monday: 'M',
    Tuesday: 'T',
    Wednesday: 'W',
    Thursday: 'Th',
    Friday: 'F',
    Saturday: 'Sa',
    Sunday: 'Su',
  }

  const days = schedule.map(s => dayAbbr[s.day] ?? s.day).join('')
  const first = schedule[0]

  // Format time like "10:00" → "10:00 AM"
  function fmtTime(t: string) {
    const [hStr, mStr] = t.split(':')
    let h = parseInt(hStr, 10)
    const m = parseInt(mStr, 10)
    const ampm = h >= 12 ? 'PM' : 'AM'
    if (h > 12) h -= 12
    if (h === 0) h = 12
    return `${h}:${m.toString().padStart(2, '0')} ${ampm}`
  }

  return `${days} ${fmtTime(first.start)}–${fmtTime(first.end)} · ${first.location}`
}

// Return the next upcoming class day label
function getNextClass(schedule: { day: string; start: string; end: string; location: string }[]): string {
  if (!schedule.length) return 'No schedule'

  const dayOrder: Record<string, number> = {
    Sunday: 0, Monday: 1, Tuesday: 2, Wednesday: 3,
    Thursday: 4, Friday: 5, Saturday: 6,
  }

  const today = new Date()
  const todayDow = today.getDay() // 0=Sun

  // Find the soonest upcoming slot
  let minDaysAhead = 8
  let nextDay = ''
  let nextDate: Date | null = null

  for (const slot of schedule) {
    const slotDow = dayOrder[slot.day]
    if (slotDow === undefined) continue
    let daysAhead = slotDow - todayDow
    if (daysAhead < 0) daysAhead += 7
    if (daysAhead === 0) daysAhead = 7 // treat "today" as next week if already happened
    if (daysAhead < minDaysAhead) {
      minDaysAhead = daysAhead
      nextDay = slot.day
      const d = new Date(today)
      d.setDate(today.getDate() + daysAhead)
      nextDate = d
    }
  }

  if (!nextDate) return 'No upcoming class'

  return `Next class: ${nextDay}, ${nextDate.toLocaleDateString('en-US', { month: 'long', day: 'numeric' })}`
}

const COURSE_COLORS = ['#4F46E5', '#7C3AED', '#059669', '#D97706', '#DC2626', '#0284C7', '#DB2777', '#16A34A']

export default function CoursesPage() {
  const [showModal, setShowModal] = useState(false)
  const [form, setForm] = useState({ name: '', code: '', professor: '', color: '#4F46E5', semester: 'Spring 2026' })
  const [added, setAdded] = useState(false)

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setShowModal(false)
    setAdded(true)
    setForm({ name: '', code: '', professor: '', color: '#4F46E5', semester: 'Spring 2026' })
    setTimeout(() => setAdded(false), 3000)
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <GraduationCap size={26} className="text-indigo-600" />
            Courses
          </h1>
          <p className="text-slate-500 text-sm mt-1">Spring 2026 semester</p>
        </div>
        <button onClick={() => setShowModal(true)}
          className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium rounded-xl transition-colors shadow-sm">
          <Plus size={15} />
          Add Course
        </button>
      </div>

      {added && (
        <div className="flex items-center gap-3 px-4 py-3 bg-emerald-50 border border-emerald-200 rounded-xl text-sm text-emerald-700 font-medium">
          ✓ Course added to your semester!
        </div>
      )}

      {/* Add Course Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/30 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          onClick={e => { if (e.target === e.currentTarget) setShowModal(false) }}>
          <div className="bg-white rounded-2xl shadow-2xl border border-black/[0.08] p-6 w-full max-w-md animate-scale-in">
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-lg font-bold text-slate-900">Add Course</h2>
              <button onClick={() => setShowModal(false)} className="p-1 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 transition-all">
                <X size={16} />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="text-xs text-slate-500 mb-1 block">Course Name *</label>
                <input type="text" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                  placeholder="e.g. Introduction to Machine Learning" required
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:border-indigo-400 transition-all" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-slate-500 mb-1 block">Course Code *</label>
                  <input type="text" value={form.code} onChange={e => setForm(f => ({ ...f, code: e.target.value }))}
                    placeholder="e.g. CS301" required
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-sm text-slate-700 focus:outline-none focus:border-indigo-400" />
                </div>
                <div>
                  <label className="text-xs text-slate-500 mb-1 block">Semester</label>
                  <select value={form.semester} onChange={e => setForm(f => ({ ...f, semester: e.target.value }))}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-sm text-slate-700 focus:outline-none focus:border-indigo-400">
                    <option>Spring 2026</option>
                    <option>Fall 2026</option>
                    <option>Spring 2027</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="text-xs text-slate-500 mb-1 block">Professor</label>
                <input type="text" value={form.professor} onChange={e => setForm(f => ({ ...f, professor: e.target.value }))}
                  placeholder="Professor name"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:border-indigo-400 transition-all" />
              </div>
              <div>
                <label className="text-xs text-slate-500 mb-2 block">Course Color</label>
                <div className="flex gap-2 flex-wrap">
                  {COURSE_COLORS.map(color => (
                    <button key={color} type="button" onClick={() => setForm(f => ({ ...f, color }))}
                      className="w-7 h-7 rounded-lg transition-all hover:scale-110"
                      style={{ backgroundColor: color, outline: form.color === color ? `3px solid ${color}` : 'none', outlineOffset: '2px' }} />
                  ))}
                </div>
              </div>
              <div className="flex gap-3 pt-1">
                <button type="button" onClick={() => setShowModal(false)}
                  className="flex-1 py-2.5 border border-slate-200 rounded-xl text-sm text-slate-600 hover:bg-slate-50 transition-all">Cancel</button>
                <button type="submit"
                  className="flex-1 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-sm font-semibold transition-all shadow-sm">Add Course</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Course grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
        {mockCourses.map(course => {
          const courseTasks = mockTasks.filter(t => t.course_id === course.id && t.status !== 'done')
          const courseNotes = mockNotes.filter(n => n.course_id === course.id)
          const courseFiles = mockDriveFiles.filter(f => f.detected_course_id === course.id)
          const scheduleLabel = formatSchedule(course.schedule)
          const nextClass = getNextClass(course.schedule)

          return (
            <div
              key={course.id}
              className="bg-white border border-black/[0.07] rounded-2xl overflow-hidden hover:shadow-md hover:border-indigo-200/60 transition-all duration-200 shadow-sm flex flex-col"
            >
              {/* Colored top accent bar */}
              <div
                className="h-1 w-full"
                style={{ backgroundColor: course.color }}
              />

              <div className="p-5 flex-1 flex flex-col gap-3">
                {/* Top row: code badge + title */}
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <h2 className="text-base font-bold text-slate-900 leading-snug">
                      {course.name}
                    </h2>
                    <p className="text-sm text-slate-500 mt-0.5">{course.professor}</p>
                  </div>
                  <span
                    className="flex-shrink-0 text-xs font-bold px-2.5 py-1 rounded-lg"
                    style={{
                      backgroundColor: `${course.color}20`,
                      color: course.color,
                      border: `1px solid ${course.color}44`,
                    }}
                  >
                    {course.code}
                  </span>
                </div>

                {/* Schedule */}
                <div className="flex items-center gap-1.5 text-xs text-slate-400">
                  <Clock size={12} className="flex-shrink-0" />
                  <span className="truncate">{scheduleLabel}</span>
                </div>

                {/* Stats row */}
                <div className="bg-slate-50 rounded-xl p-2 grid grid-cols-3 gap-2">
                  <div className="flex flex-col items-center gap-1 py-1">
                    <CheckSquare size={13} className="text-indigo-500" />
                    <span className="text-xs font-semibold text-slate-700">{courseTasks.length}</span>
                    <span className="text-xs text-slate-400">tasks</span>
                  </div>
                  <div className="flex flex-col items-center gap-1 py-1">
                    <FileText size={13} className="text-violet-500" />
                    <span className="text-xs font-semibold text-slate-700">{courseNotes.length}</span>
                    <span className="text-xs text-slate-400">notes</span>
                  </div>
                  <div className="flex flex-col items-center gap-1 py-1">
                    <HardDrive size={13} className="text-emerald-500" />
                    <span className="text-xs font-semibold text-slate-700">{courseFiles.length}</span>
                    <span className="text-xs text-slate-400">files</span>
                  </div>
                </div>

                {/* Next class */}
                <p className="text-xs text-indigo-600 font-medium">{nextClass}</p>

                {/* Divider */}
                <div className="border-t border-slate-100" />

                {/* Open course link */}
                <Link
                  href={`/courses/${course.id}`}
                  className="flex items-center justify-center gap-1.5 w-full py-2 text-sm font-medium rounded-xl border border-slate-200 hover:border-indigo-300 hover:bg-indigo-50 hover:text-indigo-700 text-slate-600 transition-all"
                >
                  <BookOpen size={14} />
                  Open Course
                  <ChevronRight size={14} />
                </Link>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
