'use client'

import { use, useState } from 'react'
import { mockCourses, mockTasks, mockNotes, mockDriveFiles, mockLectures, mockReadings } from '@/lib/mock-data'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import {
  ArrowLeft,
  BookOpen,
  CheckSquare,
  FileText,
  HardDrive,
  Calendar,
  Mail,
  Clock,
  GraduationCap,
  Sparkles,
  Layers,
  Brain,
  Target,
  ExternalLink,
  Check,
  AlertTriangle,
  ChevronRight,
  Tag,
  Folder,
} from 'lucide-react'
import { cn, formatDate, getDueDateColor, getDueDateLabel, daysUntil } from '@/lib/utils'
import type { Task, Reading, Lecture } from '@/lib/types'

// ── helpers ──────────────────────────────────────────────────────────────────

function fmtTime(t: string) {
  const [hStr, mStr] = t.split(':')
  let h = parseInt(hStr, 10)
  const m = parseInt(mStr, 10)
  const ampm = h >= 12 ? 'PM' : 'AM'
  if (h > 12) h -= 12
  if (h === 0) h = 12
  return `${h}:${m.toString().padStart(2, '0')} ${ampm}`
}

function getNextClassDate(schedule: { day: string; start: string; end: string; location: string }[]): string {
  if (!schedule.length) return 'No schedule'
  const dayOrder: Record<string, number> = {
    Sunday: 0, Monday: 1, Tuesday: 2, Wednesday: 3,
    Thursday: 4, Friday: 5, Saturday: 6,
  }
  const today = new Date()
  const todayDow = today.getDay()
  let minDaysAhead = 8
  let nextDay = ''
  let nextDate: Date | null = null
  for (const slot of schedule) {
    const slotDow = dayOrder[slot.day]
    if (slotDow === undefined) continue
    let daysAhead = slotDow - todayDow
    if (daysAhead <= 0) daysAhead += 7
    if (daysAhead < minDaysAhead) {
      minDaysAhead = daysAhead
      nextDay = slot.day
      const d = new Date(today)
      d.setDate(today.getDate() + daysAhead)
      nextDate = d
    }
  }
  if (!nextDate) return 'No upcoming class'
  return `${nextDay}, ${nextDate.toLocaleDateString('en-US', { month: 'long', day: 'numeric' })}`
}

// ── Notes status badge ────────────────────────────────────────────────────────

function NotesStatusBadge({ status }: { status: string }) {
  const cfg: Record<string, { label: string; cls: string }> = {
    complete:     { label: 'Notes Complete', cls: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
    needs_review: { label: 'Needs Review',   cls: 'bg-violet-50 text-violet-700 border-violet-200' },
    incomplete:   { label: 'Incomplete',     cls: 'bg-amber-50 text-amber-700 border-amber-200' },
    missing:      { label: 'Missing',        cls: 'bg-red-50 text-red-700 border-red-200' },
  }
  const { label, cls } = cfg[status] ?? cfg.incomplete
  return (
    <span className={cn('text-xs px-2 py-0.5 rounded-full border font-medium', cls)}>
      {label}
    </span>
  )
}

// ── Priority badge ────────────────────────────────────────────────────────────

function PriorityDot({ priority }: { priority: string }) {
  const colors: Record<string, string> = {
    urgent: 'bg-red-500',
    high:   'bg-orange-500',
    medium: 'bg-amber-400',
    low:    'bg-slate-400',
  }
  return <span className={cn('w-2 h-2 rounded-full flex-shrink-0', colors[priority] ?? 'bg-slate-400')} />
}

// ── Inline task row ───────────────────────────────────────────────────────────

function TaskRow({ task }: { task: Task }) {
  const isDone = task.status === 'done'
  const isOverdue = task.status === 'overdue' || (task.due_date && daysUntil(task.due_date) < 0 && !isDone)
  const dueDateLabel = task.due_date ? getDueDateLabel(task.due_date) : null
  const dueDateColor = task.due_date ? getDueDateColor(task.due_date) : 'text-slate-400'

  return (
    <div className={cn(
      'flex items-start gap-3 p-3 rounded-xl border transition-colors',
      isDone
        ? 'bg-slate-50 border-slate-200 opacity-60'
        : isOverdue
          ? 'bg-red-50/60 border-red-200/60'
          : 'bg-white border-slate-200 hover:bg-slate-50',
    )}>
      <div className={cn(
        'flex-shrink-0 w-5 h-5 rounded-md border-2 flex items-center justify-center mt-0.5',
        isDone ? 'bg-emerald-500 border-emerald-500 text-white' : 'border-slate-300',
      )}>
        {isDone && <Check size={11} strokeWidth={3} />}
      </div>
      <div className="flex-1 min-w-0">
        <p className={cn('text-sm font-medium leading-snug', isDone ? 'line-through text-slate-400' : 'text-slate-800')}>
          {task.title}
        </p>
        <div className="flex flex-wrap items-center gap-2 mt-1.5">
          <PriorityDot priority={task.priority} />
          <span className="text-xs text-slate-500 capitalize">{task.priority}</span>
          {dueDateLabel && (
            <span className={cn('text-xs font-medium', dueDateColor)}>{dueDateLabel}</span>
          )}
          {task.estimated_minutes && (
            <span className="flex items-center gap-1 text-xs text-slate-400">
              <Clock size={11} />
              {task.estimated_minutes}m
            </span>
          )}
        </div>
      </div>
    </div>
  )
}

// ── File type badge ───────────────────────────────────────────────────────────

function FileTypeBadge({ type }: { type: string }) {
  const cfg: Record<string, string> = {
    syllabus:   'bg-indigo-50 text-indigo-700 border-indigo-200',
    reading:    'bg-emerald-50 text-emerald-700 border-emerald-200',
    notes:      'bg-violet-50 text-violet-700 border-violet-200',
    assignment: 'bg-orange-50 text-orange-700 border-orange-200',
    slides:     'bg-sky-50 text-sky-700 border-sky-200',
    general:    'bg-slate-100 text-slate-600 border-slate-200',
  }
  return (
    <span className={cn('text-xs px-2 py-0.5 rounded-full border capitalize font-medium', cfg[type] ?? cfg.general)}>
      {type}
    </span>
  )
}

// ── Mock toast ────────────────────────────────────────────────────────────────

function useToast() {
  const [toast, setToast] = useState<string | null>(null)
  const show = (msg: string) => {
    setToast(msg)
    setTimeout(() => setToast(null), 2500)
  }
  return { toast, show }
}

// ── Tab types ─────────────────────────────────────────────────────────────────

type Tab =
  | 'overview'
  | 'assignments'
  | 'readings'
  | 'lectures'
  | 'notes'
  | 'drive'
  | 'study'
  | 'grades'

const TABS: { id: Tab; label: string }[] = [
  { id: 'overview',     label: 'Overview' },
  { id: 'assignments',  label: 'Assignments' },
  { id: 'readings',     label: 'Readings' },
  { id: 'lectures',     label: 'Lectures' },
  { id: 'notes',        label: 'Notes' },
  { id: 'drive',        label: 'Drive Files' },
  { id: 'study',        label: 'Study Tools' },
  { id: 'grades',       label: 'Grade Tracker' },
]

// ─────────────────────────────────────────────────────────────────────────────

export default function CourseDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)

  const course = mockCourses.find(c => c.id === id)
  if (!course) notFound()

  const [activeTab, setActiveTab] = useState<Tab>('overview')
  const { toast, show: showToast } = useToast()

  // Filtered data
  const allCourseTasks = mockTasks.filter(t => t.course_id === course.id)
  const courseNotes     = mockNotes.filter(n => n.course_id === course.id)
  const courseFiles     = mockDriveFiles.filter(f => f.detected_course_id === course.id)
  const courseLectures  = mockLectures.filter(l => l.course_id === course.id)
  const courseReadings  = mockReadings.filter(r => r.course_id === course.id)

  // Task groups
  const today = new Date()
  today.setHours(0, 0, 0, 0)

  const upcomingTasks = allCourseTasks.filter(t =>
    t.status !== 'done' &&
    t.due_date &&
    daysUntil(t.due_date) >= 0,
  ).sort((a, b) => new Date(a.due_date!).getTime() - new Date(b.due_date!).getTime())

  const overdueTasks = allCourseTasks.filter(t =>
    t.status !== 'done' &&
    (t.status === 'overdue' || (t.due_date && daysUntil(t.due_date) < 0)),
  )

  const completedTasks = allCourseTasks.filter(t => t.status === 'done')

  // Readings progress
  const completedReadings = courseReadings.filter(r => r.completed).length
  const readingsProgress = courseReadings.length > 0
    ? Math.round((completedReadings / courseReadings.length) * 100)
    : 0

  // Reading toggles (local state)
  const [readingDone, setReadingDone] = useState<Record<string, boolean>>(
    Object.fromEntries(courseReadings.map(r => [r.id, r.completed]))
  )

  const nextClass = getNextClassDate(course.schedule)

  // ── Render ──────────────────────────────────────────────────────────────────

  return (
    <div className="space-y-6">
      {/* Toast */}
      {toast && (
        <div className="fixed bottom-6 right-6 z-50 bg-emerald-600 text-white text-sm font-medium px-4 py-2.5 rounded-xl shadow-lg flex items-center gap-2 animate-in slide-in-from-bottom-2">
          <Check size={15} />
          {toast}
        </div>
      )}

      {/* Back link */}
      <div>
        <Link
          href="/courses"
          className="inline-flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-900 transition-colors"
        >
          <ArrowLeft size={15} />
          Courses
        </Link>
      </div>

      {/* Course banner */}
      <div
        className="rounded-2xl p-6 border"
        style={{
          background: `linear-gradient(135deg, ${course.color}18 0%, ${course.color}08 100%)`,
          borderColor: `${course.color}30`,
        }}
      >
        <div className="flex flex-col md:flex-row md:items-start gap-4">
          <div className="flex-1 min-w-0">
            {/* Code + name */}
            <div className="flex items-center gap-3 flex-wrap mb-1">
              <span
                className="text-xs font-bold px-2.5 py-1 rounded-lg border"
                style={{
                  color: course.color,
                  backgroundColor: `${course.color}20`,
                  borderColor: `${course.color}40`,
                }}
              >
                {course.code}
              </span>
              <span className="text-xs text-slate-500 border border-slate-200 rounded-lg px-2.5 py-1 bg-white/60">
                {course.semester}
              </span>
            </div>
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight mt-2">{course.name}</h1>

            {/* Professor */}
            <div className="flex flex-wrap items-center gap-4 mt-3 text-sm text-slate-600">
              <span className="flex items-center gap-1.5">
                <GraduationCap size={14} />
                {course.professor}
              </span>
              {course.professor_email && (
                <a
                  href={`mailto:${course.professor_email}`}
                  className="flex items-center gap-1.5 hover:text-indigo-600 transition-colors"
                >
                  <Mail size={14} />
                  {course.professor_email}
                </a>
              )}
            </div>

            {/* Schedule badges */}
            <div className="flex flex-wrap gap-2 mt-3">
              {course.schedule.map((slot, i) => (
                <span
                  key={i}
                  className="text-xs px-2.5 py-1 rounded-lg bg-white border border-slate-200 text-slate-600"
                >
                  {slot.day} {fmtTime(slot.start)}–{fmtTime(slot.end)} · {slot.location}
                </span>
              ))}
            </div>
          </div>

          {/* Quick stats */}
          <div className="grid grid-cols-2 gap-3 flex-shrink-0">
            {[
              { label: 'Tasks',    value: allCourseTasks.filter(t => t.status !== 'done').length, icon: CheckSquare, color: 'text-indigo-600' },
              { label: 'Notes',    value: courseNotes.length,    icon: FileText,    color: 'text-violet-600' },
              { label: 'Lectures', value: courseLectures.length, icon: BookOpen,    color: 'text-sky-600' },
              { label: 'Files',    value: courseFiles.length,    icon: HardDrive,   color: 'text-emerald-600' },
            ].map(stat => (
              <div
                key={stat.label}
                className="bg-white/70 border border-slate-200 rounded-xl p-3 text-center min-w-[80px] shadow-sm"
              >
                <stat.icon size={16} className={cn('mx-auto mb-1', stat.color)} />
                <p className="text-xl font-bold text-slate-900">{stat.value}</p>
                <p className="text-xs text-slate-500">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Tab navigation */}
      <div className="bg-slate-100 rounded-xl p-1 border border-slate-200 overflow-x-auto">
        <nav className="flex gap-1 min-w-max">
          {TABS.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={cn(
                'px-4 py-2 text-sm font-medium rounded-lg transition-colors whitespace-nowrap',
                activeTab === tab.id
                  ? 'bg-white shadow-sm text-indigo-700 font-semibold'
                  : 'text-slate-500 hover:text-slate-700',
              )}
            >
              {tab.label}
            </button>
          ))}
        </nav>
      </div>

      {/* ── TAB: OVERVIEW ──────────────────────────────────────────────────── */}
      {activeTab === 'overview' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left: course info + upcoming */}
          <div className="lg:col-span-2 space-y-5">
            {/* Course info card */}
            <div className="bg-white border border-slate-200 rounded-2xl p-5 space-y-3 shadow-sm">
              <h2 className="text-sm font-semibold text-slate-700 uppercase tracking-wider">Course Info</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
                <div>
                  <p className="text-xs text-slate-400 mb-0.5">Professor</p>
                  <p className="text-slate-800 font-medium">{course.professor}</p>
                </div>
                {course.professor_email && (
                  <div>
                    <p className="text-xs text-slate-400 mb-0.5">Email</p>
                    <a href={`mailto:${course.professor_email}`} className="text-indigo-600 hover:underline">
                      {course.professor_email}
                    </a>
                  </div>
                )}
                {course.office_hours && (
                  <div>
                    <p className="text-xs text-slate-400 mb-0.5">Office Hours</p>
                    <p className="text-slate-700">{course.office_hours}</p>
                  </div>
                )}
                <div>
                  <p className="text-xs text-slate-400 mb-0.5">Schedule</p>
                  {course.schedule.map((s, i) => (
                    <p key={i} className="text-slate-700">{s.day} {fmtTime(s.start)}–{fmtTime(s.end)}, {s.location}</p>
                  ))}
                </div>
              </div>
            </div>

            {/* Upcoming assignments */}
            <div>
              <h2 className="text-sm font-semibold text-slate-700 mb-3 flex items-center gap-2">
                <CheckSquare size={15} className="text-indigo-600" />
                Upcoming Assignments
              </h2>
              {upcomingTasks.length === 0 ? (
                <p className="text-sm text-slate-400 py-4 text-center bg-slate-50 rounded-xl border border-slate-200">
                  No upcoming assignments
                </p>
              ) : (
                <div className="space-y-2">
                  {upcomingTasks.slice(0, 3).map(task => (
                    <TaskRow key={task.id} task={task} />
                  ))}
                </div>
              )}
            </div>

            {/* Recent notes */}
            <div>
              <h2 className="text-sm font-semibold text-slate-700 mb-3 flex items-center gap-2">
                <FileText size={15} className="text-violet-600" />
                Recent Notes
              </h2>
              {courseNotes.length === 0 ? (
                <p className="text-sm text-slate-400 py-4 text-center bg-slate-50 rounded-xl border border-slate-200">
                  No notes yet
                </p>
              ) : (
                <div className="space-y-2">
                  {courseNotes.slice(0, 2).map(note => (
                    <div
                      key={note.id}
                      className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm"
                    >
                      <p className="text-sm font-medium text-slate-800">{note.title}</p>
                      {note.summary && (
                        <p className="text-xs text-slate-500 mt-1 line-clamp-2">{note.summary}</p>
                      )}
                      <p className="text-xs text-slate-400 mt-2">Updated {formatDate(note.updated_at)}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Right sidebar */}
          <div className="space-y-5">
            {/* Next class countdown */}
            <div
              className="rounded-2xl p-4 border text-center"
              style={{
                background: `linear-gradient(135deg, ${course.color}15 0%, ${course.color}05 100%)`,
                borderColor: `${course.color}25`,
              }}
            >
              <Calendar size={20} className="mx-auto mb-2" style={{ color: course.color }} />
              <p className="text-xs text-slate-500 mb-1">Next Class</p>
              <p className="text-sm font-semibold text-slate-800">{nextClass}</p>
            </div>

            {/* Drive folder badge */}
            {course.drive_folder_id && (
              <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm">
                <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">Drive Folder</h3>
                <div className="flex items-center gap-2 text-sm text-emerald-600">
                  <HardDrive size={14} />
                  <span className="truncate font-medium">Linked Drive Folder</span>
                  <ExternalLink size={12} className="flex-shrink-0 ml-auto" />
                </div>
                <p className="text-xs text-slate-400 mt-1">{course.drive_folder_id}</p>
              </div>
            )}

            {/* Overdue alert */}
            {overdueTasks.length > 0 && (
              <div className="bg-red-50 border border-red-200 rounded-2xl p-4">
                <div className="flex items-center gap-2 text-red-600 mb-2">
                  <AlertTriangle size={14} />
                  <p className="text-sm font-medium">{overdueTasks.length} Overdue</p>
                </div>
                <div className="space-y-1.5">
                  {overdueTasks.slice(0, 2).map(t => (
                    <p key={t.id} className="text-xs text-slate-600 truncate">• {t.title}</p>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ── TAB: ASSIGNMENTS ───────────────────────────────────────────────── */}
      {activeTab === 'assignments' && (
        <div className="space-y-6">
          {/* Upcoming */}
          <section>
            <h2 className="text-sm font-semibold text-slate-700 mb-3 flex items-center gap-2">
              <CheckSquare size={15} className="text-indigo-600" />
              Upcoming
              <span className="ml-1 text-xs bg-indigo-50 text-indigo-600 border border-indigo-200 rounded-full px-2 py-0.5">
                {upcomingTasks.length}
              </span>
            </h2>
            {upcomingTasks.length === 0 ? (
              <p className="text-sm text-slate-400 py-6 text-center bg-slate-50 rounded-xl border border-slate-200">
                No upcoming assignments
              </p>
            ) : (
              <div className="space-y-2">
                {upcomingTasks.map(task => <TaskRow key={task.id} task={task} />)}
              </div>
            )}
          </section>

          {/* Overdue */}
          {overdueTasks.length > 0 && (
            <section>
              <h2 className="text-sm font-semibold text-red-600 mb-3 flex items-center gap-2">
                <AlertTriangle size={15} />
                Overdue
                <span className="ml-1 text-xs bg-red-50 text-red-600 border border-red-200 rounded-full px-2 py-0.5">
                  {overdueTasks.length}
                </span>
              </h2>
              <div className="space-y-2">
                {overdueTasks.map(task => <TaskRow key={task.id} task={task} />)}
              </div>
            </section>
          )}

          {/* Completed */}
          <section>
            <h2 className="text-sm font-semibold text-slate-500 mb-3 flex items-center gap-2">
              <Check size={15} />
              Completed
              <span className="ml-1 text-xs bg-slate-100 text-slate-500 border border-slate-200 rounded-full px-2 py-0.5">
                {completedTasks.length}
              </span>
            </h2>
            {completedTasks.length === 0 ? (
              <p className="text-sm text-slate-400 py-6 text-center bg-slate-50 rounded-xl border border-slate-200">
                No completed assignments yet
              </p>
            ) : (
              <div className="space-y-2">
                {completedTasks.map(task => <TaskRow key={task.id} task={task} />)}
              </div>
            )}
          </section>
        </div>
      )}

      {/* ── TAB: READINGS ──────────────────────────────────────────────────── */}
      {activeTab === 'readings' && (
        <div className="space-y-5">
          {/* Progress bar */}
          <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-slate-700">Reading Progress</span>
              <span className="text-sm font-bold text-slate-900">{readingsProgress}%</span>
            </div>
            <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
              <div
                className="h-full rounded-full transition-all duration-500 bg-gradient-to-r from-indigo-500 to-violet-500"
                style={{ width: `${readingsProgress}%` }}
              />
            </div>
            <p className="text-xs text-slate-400 mt-2">
              {Object.values(readingDone).filter(Boolean).length} of {courseReadings.length} completed
            </p>
          </div>

          {courseReadings.length === 0 ? (
            <p className="text-sm text-slate-400 py-8 text-center bg-slate-50 rounded-xl border border-slate-200">
              No readings for this course
            </p>
          ) : (
            <div className="space-y-3">
              {courseReadings.map(reading => {
                const done = readingDone[reading.id] ?? reading.completed
                return (
                  <div
                    key={reading.id}
                    className={cn(
                      'bg-white border border-slate-200 rounded-xl p-4 transition-all shadow-sm',
                      done && 'opacity-60',
                    )}
                  >
                    <div className="flex items-start gap-3">
                      {/* Checkbox */}
                      <button
                        onClick={() => setReadingDone(prev => ({ ...prev, [reading.id]: !prev[reading.id] }))}
                        className={cn(
                          'flex-shrink-0 w-5 h-5 rounded-md border-2 flex items-center justify-center mt-0.5 transition-all',
                          done
                            ? 'bg-emerald-500 border-emerald-500 text-white'
                            : 'border-slate-300 hover:border-emerald-500',
                        )}
                      >
                        {done && <Check size={11} strokeWidth={3} />}
                      </button>

                      <div className="flex-1 min-w-0">
                        <p className={cn('text-sm font-medium', done ? 'line-through text-slate-400' : 'text-slate-800')}>
                          {reading.title}
                        </p>
                        <div className="flex flex-wrap items-center gap-3 mt-1.5">
                          {reading.pages && (
                            <span className="text-xs text-slate-500">{reading.pages}</span>
                          )}
                          {reading.due_date && (
                            <span className={cn('text-xs font-medium', getDueDateColor(reading.due_date))}>
                              Due {formatDate(reading.due_date)}
                            </span>
                          )}
                          {reading.notes_linked.length > 0 && (
                            <span className="text-xs text-violet-600 flex items-center gap-1">
                              <FileText size={11} />
                              Notes linked
                            </span>
                          )}
                        </div>
                      </div>

                      {/* AI Summary button */}
                      <button
                        onClick={() => showToast('AI summary generated!')}
                        className="flex-shrink-0 text-xs px-2.5 py-1.5 rounded-lg bg-indigo-50 text-indigo-600 border border-indigo-200 hover:bg-indigo-100 transition-colors flex items-center gap-1"
                      >
                        <Sparkles size={11} />
                        AI Summary
                      </button>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      )}

      {/* ── TAB: LECTURES ──────────────────────────────────────────────────── */}
      {activeTab === 'lectures' && (
        <div className="space-y-3">
          {courseLectures.length === 0 ? (
            <p className="text-sm text-slate-400 py-8 text-center bg-slate-50 rounded-xl border border-slate-200">
              No lectures recorded for this course
            </p>
          ) : (
            courseLectures.map(lecture => (
              <div
                key={lecture.id}
                className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm"
              >
                <div className="flex items-start gap-4">
                  {/* Lecture number */}
                  <div
                    className="flex-shrink-0 w-9 h-9 rounded-xl flex items-center justify-center text-sm font-bold"
                    style={{
                      backgroundColor: `${course.color}20`,
                      color: course.color,
                    }}
                  >
                    {lecture.number}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2 mb-1">
                      <p className="text-sm font-semibold text-slate-800">{lecture.topic}</p>
                      <NotesStatusBadge status={lecture.notes_status} />
                    </div>
                    <p className="text-xs text-slate-500 mb-2">
                      Lecture {lecture.number} · {formatDate(lecture.date)}
                    </p>
                    {lecture.related_readings.length > 0 && (
                      <p className="text-xs text-slate-500 mb-2">
                        Readings: {lecture.related_readings.join(', ')}
                      </p>
                    )}
                    <div className="flex flex-wrap gap-2">
                      {lecture.related_slides && (
                        <button
                          onClick={() => showToast('Opening slides...')}
                          className="text-xs px-2.5 py-1 rounded-lg bg-slate-100 text-slate-600 hover:bg-slate-200 border border-slate-200 transition-colors flex items-center gap-1"
                        >
                          <BookOpen size={11} />
                          Slides
                        </button>
                      )}
                      <button
                        onClick={() => showToast('Opening notes...')}
                        className="text-xs px-2.5 py-1 rounded-lg bg-slate-100 text-slate-600 hover:bg-slate-200 border border-slate-200 transition-colors flex items-center gap-1"
                      >
                        <FileText size={11} />
                        Notes
                      </button>
                      {lecture.has_ai_summary && (
                        <button
                          onClick={() => showToast('AI summary loaded!')}
                          className="text-xs px-2.5 py-1 rounded-lg bg-indigo-50 text-indigo-600 border border-indigo-200 hover:bg-indigo-100 transition-colors flex items-center gap-1"
                        >
                          <Sparkles size={11} />
                          AI Summary
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* ── TAB: NOTES ─────────────────────────────────────────────────────── */}
      {activeTab === 'notes' && (
        <div>
          {courseNotes.length === 0 ? (
            <p className="text-sm text-slate-400 py-8 text-center bg-slate-50 rounded-xl border border-slate-200">
              No notes for this course yet
            </p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {courseNotes.map(note => (
                <div
                  key={note.id}
                  className="bg-white border border-slate-200 rounded-xl p-4 hover:border-indigo-200 hover:shadow-sm transition-all cursor-pointer shadow-sm"
                >
                  <h3 className="text-sm font-semibold text-slate-800 mb-2 leading-snug">{note.title}</h3>
                  {note.summary && (
                    <p className="text-xs text-slate-500 line-clamp-3 mb-3">{note.summary}</p>
                  )}
                  {note.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 mb-2">
                      {note.tags.slice(0, 4).map(tag => (
                        <span key={tag} className="text-xs bg-slate-100 text-slate-500 rounded-md px-2 py-0.5 flex items-center gap-1 border border-slate-200">
                          <Tag size={9} />
                          {tag}
                        </span>
                      ))}
                    </div>
                  )}
                  <p className="text-xs text-slate-400">Last edited {formatDate(note.updated_at)}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ── TAB: DRIVE FILES ───────────────────────────────────────────────── */}
      {activeTab === 'drive' && (
        <div className="space-y-3">
          {courseFiles.length === 0 ? (
            <p className="text-sm text-slate-400 py-8 text-center bg-slate-50 rounded-xl border border-slate-200">
              No Drive files linked to this course
            </p>
          ) : (
            courseFiles.map(file => (
              <div
                key={file.id}
                className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm"
              >
                <div className="flex items-start gap-3">
                  <HardDrive size={16} className="text-emerald-600 flex-shrink-0 mt-0.5" />
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-start gap-2 mb-1">
                      <p className="text-sm font-medium text-slate-800 truncate">{file.name}</p>
                      <FileTypeBadge type={file.detected_type} />
                    </div>
                    <div className="flex items-center gap-1.5 text-xs text-slate-400 mb-2">
                      <Folder size={11} />
                      <span className="truncate">{file.folder_path}</span>
                    </div>
                    {file.summary && (
                      <p className="text-xs text-slate-500 line-clamp-2 mb-3">{file.summary}</p>
                    )}
                    <div className="flex flex-wrap gap-2">
                      <a
                        href={file.web_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs px-2.5 py-1 rounded-lg bg-slate-100 text-slate-600 hover:bg-slate-200 border border-slate-200 transition-colors flex items-center gap-1"
                      >
                        <ExternalLink size={11} />
                        Open
                      </a>
                      <button
                        onClick={() => showToast('Generating AI summary...')}
                        className="text-xs px-2.5 py-1 rounded-lg bg-indigo-50 text-indigo-600 border border-indigo-200 hover:bg-indigo-100 transition-colors flex items-center gap-1"
                      >
                        <Sparkles size={11} />
                        Summarize
                      </button>
                      <button
                        onClick={() => showToast('Tasks extracted!')}
                        className="text-xs px-2.5 py-1 rounded-lg bg-violet-50 text-violet-600 border border-violet-200 hover:bg-violet-100 transition-colors flex items-center gap-1"
                      >
                        <CheckSquare size={11} />
                        Extract tasks
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* ── TAB: STUDY TOOLS ───────────────────────────────────────────────── */}
      {activeTab === 'study' && (
        <div className="space-y-4">
          <p className="text-sm text-slate-600">
            AI-powered study tools for <span className="text-slate-900 font-medium">{course.name}</span>.
            Generated content is based on your notes, readings, and lectures.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {[
              {
                icon: Sparkles,
                title: 'Generate Study Guide',
                description: 'Create a comprehensive study guide from all course materials — lectures, notes, and readings organized by topic.',
                iconCls: 'text-indigo-600',
                iconBg: 'bg-indigo-50',
                cardCls: 'border-indigo-100',
                btnCls: 'bg-indigo-600 hover:bg-indigo-700',
                toast: 'Study guide generated!',
              },
              {
                icon: Layers,
                title: 'Generate Flashcards',
                description: 'Auto-generate Anki-style flashcards from key concepts, definitions, and important facts in your notes.',
                iconCls: 'text-violet-600',
                iconBg: 'bg-violet-50',
                cardCls: 'border-violet-100',
                btnCls: 'bg-violet-600 hover:bg-violet-700',
                toast: 'Flashcard deck created!',
              },
              {
                icon: Brain,
                title: 'Generate Practice Quiz',
                description: 'Test your understanding with AI-generated multiple choice and short-answer questions from course content.',
                iconCls: 'text-sky-600',
                iconBg: 'bg-sky-50',
                cardCls: 'border-sky-100',
                btnCls: 'bg-sky-600 hover:bg-sky-700',
                toast: 'Practice quiz ready!',
              },
              {
                icon: Target,
                title: 'Find Weak Areas',
                description: 'Analyze your notes and quiz performance to identify topics that need more study time and attention.',
                iconCls: 'text-amber-600',
                iconBg: 'bg-amber-50',
                cardCls: 'border-amber-100',
                btnCls: 'bg-amber-600 hover:bg-amber-700',
                toast: 'Weak areas identified!',
              },
            ].map(tool => {
              const Icon = tool.icon
              return (
                <div
                  key={tool.title}
                  className={cn('bg-white rounded-2xl border p-5 flex flex-col gap-3 shadow-sm', tool.cardCls)}
                >
                  <div className="flex items-center gap-3">
                    <div className={cn('w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0', tool.iconBg)}>
                      <Icon size={18} className={tool.iconCls} />
                    </div>
                    <h3 className="text-sm font-semibold text-slate-800">{tool.title}</h3>
                  </div>
                  <p className="text-xs text-slate-500 leading-relaxed flex-1">{tool.description}</p>
                  <button
                    onClick={() => showToast(tool.toast)}
                    className={cn(
                      'self-start text-sm font-medium text-white px-4 py-2 rounded-lg transition-colors',
                      tool.btnCls,
                    )}
                  >
                    Generate
                  </button>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* ── TAB: GRADE TRACKER ─────────────────────────────────────────────── */}
      {activeTab === 'grades' && (
        <div className="space-y-5">
          <p className="text-sm text-slate-600">
            Track your grades by assignment category. Enter scores to calculate your current estimate.
          </p>

          <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50">
                  <th className="text-left text-xs font-semibold text-slate-500 uppercase tracking-wider px-5 py-3">Category</th>
                  <th className="text-center text-xs font-semibold text-slate-500 uppercase tracking-wider px-5 py-3">Weight</th>
                  <th className="text-center text-xs font-semibold text-slate-500 uppercase tracking-wider px-5 py-3">Your Score</th>
                  <th className="text-center text-xs font-semibold text-slate-500 uppercase tracking-wider px-5 py-3">Weighted</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {[
                  { category: 'Participation',  weight: 10 },
                  { category: 'Problem Sets',   weight: 30 },
                  { category: 'Midterm',        weight: 25 },
                  { category: 'Final Paper',    weight: 35 },
                ].map(row => (
                  <tr key={row.category} className="hover:bg-slate-50 transition-colors">
                    <td className="px-5 py-3.5 text-slate-800 font-medium">{row.category}</td>
                    <td className="px-5 py-3.5 text-center text-slate-500">{row.weight}%</td>
                    <td className="px-5 py-3.5 text-center">
                      <input
                        type="number"
                        min={0}
                        max={100}
                        placeholder="—"
                        className="w-20 text-center bg-slate-50 border border-slate-200 rounded-lg px-2 py-1 text-slate-700 text-sm focus:outline-none focus:border-indigo-400 placeholder-slate-300"
                      />
                    </td>
                    <td className="px-5 py-3.5 text-center text-slate-400 text-xs">—</td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr className="border-t border-slate-200 bg-slate-50">
                  <td colSpan={2} className="px-5 py-3.5 text-sm font-semibold text-slate-700">Current Estimate</td>
                  <td colSpan={2} className="px-5 py-3.5 text-center text-sm text-slate-400 italic">Insufficient data</td>
                </tr>
              </tfoot>
            </table>
          </div>

          <p className="text-xs text-slate-400">
            Enter your scores (0–100) to calculate a weighted grade estimate. Weights must sum to 100%.
          </p>
        </div>
      )}
    </div>
  )
}
