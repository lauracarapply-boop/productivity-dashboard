'use client'

import { useState } from 'react'
import {
  Inbox,
  CheckCircle,
  XCircle,
  Edit3,
  Sparkles,
  AlertTriangle,
  Calendar,
  FileText,
  HardDrive,
  BookOpen,
  ChevronDown,
  CheckSquare,
  Shield,
  Check,
} from 'lucide-react'
import { useApp } from '@/lib/store'
import { mockCourses, mockWorkspaces } from '@/lib/mock-data'
import EmptyState from '@/components/ui/EmptyState'
import type { AIInboxItem, AIInboxItemType } from '@/lib/types'

// ── Helpers ────────────────────────────────────────────────────

function relativeTime(iso: string): string {
  const diffMs = Date.now() - new Date(iso).getTime()
  const diffMin = Math.round(diffMs / 60000)
  if (diffMin < 1) return 'just now'
  if (diffMin < 60) return `${diffMin} min ago`
  const diffHr = Math.round(diffMin / 60)
  if (diffHr < 24) return `${diffHr}h ago`
  return `${Math.round(diffHr / 24)}d ago`
}

function ConfidenceBar({ value }: { value: number }) {
  const pct = Math.round(value * 100)
  const color =
    pct >= 80 ? 'bg-emerald-500' : pct >= 60 ? 'bg-amber-500' : 'bg-red-500'
  const textColor =
    pct >= 80 ? 'text-emerald-600' : pct >= 60 ? 'text-amber-600' : 'text-red-600'

  return (
    <div className="flex items-center gap-2">
      <div className="flex-1 h-1.5 bg-slate-100 rounded-full overflow-hidden">
        <div
          className={`h-full rounded-full ${color} transition-all duration-500`}
          style={{ width: `${pct}%` }}
        />
      </div>
      <span className={`text-xs font-semibold tabular-nums w-8 text-right ${textColor}`}>{pct}%</span>
    </div>
  )
}

function TypeBadge({ type }: { type: AIInboxItemType }) {
  const map: Record<AIInboxItemType, { label: string; cls: string; icon: React.ReactNode }> = {
    task: {
      label: 'Task',
      cls: 'bg-indigo-50 text-indigo-700 border-indigo-200',
      icon: <CheckSquare size={11} />,
    },
    event: {
      label: 'Event',
      cls: 'bg-violet-50 text-violet-700 border-violet-200',
      icon: <Calendar size={11} />,
    },
    deadline: {
      label: 'Deadline',
      cls: 'bg-amber-50 text-amber-700 border-amber-200',
      icon: <AlertTriangle size={11} />,
    },
    note: {
      label: 'Note',
      cls: 'bg-emerald-50 text-emerald-700 border-emerald-200',
      icon: <FileText size={11} />,
    },
    drive_file: {
      label: 'Drive File',
      cls: 'bg-sky-50 text-sky-700 border-sky-200',
      icon: <HardDrive size={11} />,
    },
    course_info: {
      label: 'Course Info',
      cls: 'bg-teal-50 text-teal-700 border-teal-200',
      icon: <BookOpen size={11} />,
    },
  }
  const { label, cls, icon } = map[type]
  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold border ${cls}`}>
      {icon}
      {label}
    </span>
  )
}

// Left-border accent color by type
const TYPE_BORDER_COLOR: Record<AIInboxItemType, string> = {
  task:        'border-l-indigo-500',
  event:       'border-l-violet-500',
  deadline:    'border-l-amber-500',
  note:        'border-l-emerald-500',
  drive_file:  'border-l-sky-500',
  course_info: 'border-l-teal-500',
}

function ApproveLabel({ type }: { type: AIInboxItemType }) {
  if (type === 'task' || type === 'deadline') return <>Add to Tasks</>
  if (type === 'event') return <>Add to Calendar</>
  if (type === 'note') return <>Save Note</>
  return <>Approve</>
}

function AddedToBadge({ type }: { type: AIInboxItemType }) {
  if (type === 'task' || type === 'deadline') {
    return <span className="text-xs text-emerald-600 font-semibold">Added to Tasks</span>
  }
  if (type === 'event') {
    return <span className="text-xs text-emerald-600 font-semibold">Added to Calendar</span>
  }
  if (type === 'note') {
    return <span className="text-xs text-emerald-600 font-semibold">Note Saved</span>
  }
  return <span className="text-xs text-emerald-600 font-semibold">Added</span>
}

// ── Item Card ──────────────────────────────────────────────────

interface ItemCardProps {
  item: AIInboxItem
  onApprove: (id: string) => void
  onReject: (id: string) => void
}

function ItemCard({ item, onApprove, onReject }: ItemCardProps) {
  const [isEditing, setIsEditing] = useState(false)
  const [editTitle, setEditTitle] = useState(item.title)
  const [sourceExpanded, setSourceExpanded] = useState(false)
  const [selectedWorkspace, setSelectedWorkspace] = useState(item.suggested_workspace_id ?? '')
  const [selectedCourse, setSelectedCourse] = useState(item.suggested_course_id ?? '')
  const [justApproved, setJustApproved] = useState(false)

  const workspace = mockWorkspaces.find(ws => ws.id === (selectedWorkspace || item.suggested_workspace_id))
  const course = mockCourses.find(c => c.id === (selectedCourse || item.suggested_course_id))

  const extractedData = item.extracted_data as Record<string, string | undefined> | null

  function handleApprove() {
    setJustApproved(true)
    setTimeout(() => onApprove(item.id), 600)
  }

  // ── Approved state ──
  if (item.status === 'approved') {
    return (
      <div className="flex items-center gap-3 p-4 bg-emerald-50 border border-emerald-200 border-l-4 border-l-emerald-500 rounded-2xl transition-all duration-300">
        <div className="w-8 h-8 rounded-full bg-emerald-100 border border-emerald-200 flex items-center justify-center flex-shrink-0">
          <CheckCircle size={16} className="text-emerald-600" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-slate-700 truncate">{item.title}</p>
          <div className="flex items-center gap-2 mt-0.5">
            <TypeBadge type={item.type} />
            <AddedToBadge type={item.type} />
          </div>
        </div>
        <span className="text-xs font-semibold text-emerald-600 flex-shrink-0">Added ✓</span>
      </div>
    )
  }

  // ── Rejected state ──
  if (item.status === 'rejected') {
    return (
      <div className="flex items-center gap-3 p-4 bg-slate-50 border border-slate-200 rounded-2xl opacity-50 transition-all duration-300">
        <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center flex-shrink-0">
          <XCircle size={16} className="text-slate-400" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm text-slate-400 line-through truncate">{item.title}</p>
          <p className="text-xs text-slate-400 mt-0.5">Dismissed</p>
        </div>
      </div>
    )
  }

  return (
    <div
      className={`bg-white border border-l-4 rounded-2xl overflow-hidden transition-all duration-300 shadow-sm ${
        justApproved
          ? 'border-emerald-200 border-l-emerald-500 bg-emerald-50/50'
          : `border-black/[0.07] ${TYPE_BORDER_COLOR[item.type]} hover:shadow-md`
      }`}
    >
      <div className="p-5 space-y-4">

        {/* Top row: type badge + source */}
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-2 flex-wrap">
            <TypeBadge type={item.type} />
          </div>
          <p className="text-xs text-slate-400 flex-shrink-0 whitespace-nowrap">
            {item.source_type} · {relativeTime(item.created_at)}
          </p>
        </div>

        {/* Title */}
        {isEditing ? (
          <input
            autoFocus
            type="text"
            value={editTitle}
            onChange={e => setEditTitle(e.target.value)}
            onBlur={() => setIsEditing(false)}
            onKeyDown={e => e.key === 'Enter' && setIsEditing(false)}
            className="w-full bg-slate-50 border border-indigo-300 rounded-xl px-3 py-2 text-base font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 transition-all"
          />
        ) : (
          <h3 className="text-base font-bold text-slate-900 leading-snug">{editTitle}</h3>
        )}

        {/* Confidence */}
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-xs text-slate-500 font-medium">AI Confidence</span>
          </div>
          <ConfidenceBar value={item.confidence} />
        </div>

        {/* Source text (collapsible) */}
        {item.source_text && (
          <div>
            <button
              onClick={() => setSourceExpanded(prev => !prev)}
              className="flex items-center gap-1 text-xs text-slate-500 hover:text-slate-700 transition-colors"
            >
              <ChevronDown
                size={12}
                className={`transition-transform duration-200 ${sourceExpanded ? 'rotate-180' : ''}`}
              />
              {sourceExpanded ? 'Hide' : 'Show'} source text
            </button>
            {sourceExpanded && (
              <div className="mt-2 p-3 bg-slate-50 border border-slate-200 rounded-lg">
                <p className="text-xs text-slate-500 leading-relaxed line-clamp-4 italic">
                  {item.source_text}
                </p>
              </div>
            )}
          </div>
        )}

        {/* Extracted details */}
        {extractedData && Object.keys(extractedData).length > 0 && (
          <div className="grid grid-cols-2 gap-x-4 gap-y-1.5">
            {extractedData.due_date && (
              <div className="flex items-center gap-1.5">
                <Calendar size={12} className="text-slate-400 flex-shrink-0" />
                <span className="text-xs text-slate-500">
                  Due: <span className="text-slate-700 font-semibold">{extractedData.due_date}</span>
                </span>
              </div>
            )}
            {extractedData.priority && (
              <div className="flex items-center gap-1.5">
                <AlertTriangle size={12} className="text-slate-400 flex-shrink-0" />
                <span className="text-xs text-slate-500">
                  Priority:{' '}
                  <span
                    className={`font-semibold ${
                      extractedData.priority === 'urgent'
                        ? 'text-red-600'
                        : extractedData.priority === 'high'
                        ? 'text-amber-600'
                        : 'text-slate-700'
                    }`}
                  >
                    {extractedData.priority}
                  </span>
                </span>
              </div>
            )}
            {(extractedData.suggested_course ?? extractedData.course) && (
              <div className="flex items-center gap-1.5">
                <BookOpen size={12} className="text-slate-400 flex-shrink-0" />
                <span className="text-xs text-slate-500">
                  Course:{' '}
                  <span className="text-slate-700 font-semibold">
                    {extractedData.suggested_course ?? extractedData.course}
                  </span>
                </span>
              </div>
            )}
            {extractedData.description && (
              <div className="col-span-2 flex items-start gap-1.5">
                <FileText size={12} className="text-slate-400 flex-shrink-0 mt-0.5" />
                <span className="text-xs text-slate-500 leading-relaxed">{extractedData.description}</span>
              </div>
            )}
            {extractedData.office_hours && (
              <div className="col-span-2 flex items-center gap-1.5">
                <Calendar size={12} className="text-slate-400 flex-shrink-0" />
                <span className="text-xs text-slate-500">
                  Office hours: <span className="text-slate-700 font-semibold">{extractedData.office_hours}</span>
                  {extractedData.location && (
                    <span className="ml-1 text-slate-400">· {extractedData.location}</span>
                  )}
                </span>
              </div>
            )}
            {extractedData.note && (
              <div className="col-span-2 flex items-start gap-1.5">
                <Sparkles size={12} className="text-indigo-500 flex-shrink-0 mt-0.5" />
                <span className="text-xs text-indigo-600 leading-relaxed italic">{extractedData.note}</span>
              </div>
            )}
          </div>
        )}

        {/* Suggested workspace / course display */}
        {(workspace || course) && (
          <div className="flex items-center gap-2 flex-wrap">
            {workspace && (
              <div
                className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg border text-xs font-medium"
                style={{
                  borderColor: workspace.color + '40',
                  backgroundColor: workspace.color + '12',
                  color: workspace.color,
                }}
              >
                <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: workspace.color }} />
                {workspace.name}
              </div>
            )}
            {course && (
              <div
                className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg border text-xs font-medium"
                style={{
                  borderColor: course.color + '40',
                  backgroundColor: course.color + '12',
                  color: course.color,
                }}
              >
                <BookOpen size={10} />
                {course.code}
              </div>
            )}
          </div>
        )}

        {/* Assignment dropdowns */}
        <div className="flex gap-2">
          <select
            value={selectedWorkspace}
            onChange={e => setSelectedWorkspace(e.target.value)}
            className="flex-1 text-xs bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-1.5 text-slate-600 focus:outline-none focus:border-indigo-400 transition-colors"
          >
            <option value="">Assign workspace...</option>
            {mockWorkspaces.map(ws => (
              <option key={ws.id} value={ws.id}>{ws.name}</option>
            ))}
          </select>
          <select
            value={selectedCourse}
            onChange={e => setSelectedCourse(e.target.value)}
            className="flex-1 text-xs bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-1.5 text-slate-600 focus:outline-none focus:border-indigo-400 transition-colors"
          >
            <option value="">Assign course...</option>
            {mockCourses.map(c => (
              <option key={c.id} value={c.id}>{c.code}</option>
            ))}
          </select>
        </div>

        {/* Action buttons */}
        <div className="flex items-center gap-2 pt-1">
          <button
            onClick={handleApprove}
            className="flex items-center gap-1.5 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold rounded-xl transition-all duration-200 shadow-sm"
          >
            <Check size={13} />
            <ApproveLabel type={item.type} />
          </button>
          <button
            onClick={() => setIsEditing(prev => !prev)}
            className="flex items-center gap-1.5 px-3 py-2 text-slate-600 hover:text-slate-800 text-xs font-medium rounded-xl border border-slate-200 hover:border-slate-300 hover:bg-slate-50 transition-all duration-200"
          >
            <Edit3 size={13} />
            Edit
          </button>
          <button
            onClick={() => onReject(item.id)}
            className="flex items-center gap-1.5 px-3 py-2 text-slate-400 hover:text-red-500 text-xs font-medium rounded-xl transition-all duration-200"
          >
            <XCircle size={13} />
            Dismiss
          </button>
        </div>
      </div>
    </div>
  )
}

// ── Page ───────────────────────────────────────────────────────

type CategoryTab = 'all' | AIInboxItemType

export default function AIInboxPage() {
  const { aiInboxItems, approveAIItem, rejectAIItem } = useApp()

  const [categoryTab, setCategoryTab] = useState<CategoryTab>('all')
  const [filterSource, setFilterSource] = useState<string>('all')
  const [filterConfidence, setFilterConfidence] = useState<string>('all')
  const [approvedExpanded, setApprovedExpanded] = useState(false)

  const pending = aiInboxItems.filter(i => i.status === 'pending')
  const approved = aiInboxItems.filter(i => i.status === 'approved')
  const rejected = aiInboxItems.filter(i => i.status === 'rejected')

  // Category counts
  const countByType = (type: AIInboxItemType) =>
    pending.filter(i => i.type === type).length

  // Filter pending items
  const filteredPending = pending.filter(item => {
    if (categoryTab !== 'all' && item.type !== categoryTab) return false
    if (filterSource !== 'all' && item.source_type !== filterSource) return false
    if (filterConfidence === 'high' && item.confidence < 0.8) return false
    if (filterConfidence === 'medium' && (item.confidence < 0.6 || item.confidence >= 0.8)) return false
    if (filterConfidence === 'low' && item.confidence >= 0.6) return false
    return true
  })

  const categoryTabs: { id: CategoryTab; label: string; icon: React.ReactNode; count?: number }[] = [
    { id: 'all',       label: 'All',        icon: <Inbox size={13} />,        count: pending.length },
    { id: 'task',      label: 'Tasks',      icon: <CheckSquare size={13} />,  count: countByType('task') },
    { id: 'event',     label: 'Events',     icon: <Calendar size={13} />,     count: countByType('event') },
    { id: 'deadline',  label: 'Deadlines',  icon: <AlertTriangle size={13} />, count: countByType('deadline') },
    { id: 'note',      label: 'Notes',      icon: <FileText size={13} />,     count: countByType('note') },
    { id: 'drive_file',label: 'Drive Files',icon: <HardDrive size={13} />,    count: countByType('drive_file') },
  ]

  return (
    <div className="space-y-8 max-w-3xl">

      {/* ── Header ── */}
      <div>
        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
              <Inbox size={22} className="text-indigo-600" />
              AI Inbox
              {pending.length > 0 && (
                <span className="ml-1 px-2.5 py-0.5 rounded-full bg-indigo-100 border border-indigo-200 text-indigo-700 text-sm font-semibold">
                  {pending.length}
                </span>
              )}
            </h1>
            <p className="text-slate-500 text-sm mt-1">
              Review and approve AI-detected items before they enter your system
            </p>
          </div>
        </div>

        {/* Safety notice — dark pill for contrast on important message */}
        <div className="mt-4 flex items-start gap-3 p-4 bg-slate-900 text-white rounded-xl">
          <Shield size={16} className="text-indigo-400 flex-shrink-0 mt-0.5" />
          <p className="text-xs text-slate-300 leading-relaxed">
            <span className="font-semibold text-white">AI Safety:</span>{' '}
            The AI will never automatically add items to your calendar or task list without your approval. Everything stays here until you decide.
          </p>
        </div>

        {/* Filter bar */}
        <div className="mt-4 flex flex-wrap items-center gap-2">
          <select
            value={filterSource}
            onChange={e => setFilterSource(e.target.value)}
            className="text-xs bg-white border border-slate-200 rounded-xl px-3 py-1.5 text-slate-600 focus:outline-none focus:border-indigo-400 transition-colors"
          >
            <option value="all">All Sources</option>
            <option value="capture">Brain Dump</option>
            <option value="drive">Drive</option>
            <option value="email">Email</option>
            <option value="calendar">Calendar</option>
          </select>

          <select
            value={filterConfidence}
            onChange={e => setFilterConfidence(e.target.value)}
            className="text-xs bg-white border border-slate-200 rounded-xl px-3 py-1.5 text-slate-600 focus:outline-none focus:border-indigo-400 transition-colors"
          >
            <option value="all">All Confidence</option>
            <option value="high">High (&ge;80%)</option>
            <option value="medium">Medium (60–79%)</option>
            <option value="low">Low (&lt;60%)</option>
          </select>

          {(filterSource !== 'all' || filterConfidence !== 'all') && (
            <button
              onClick={() => { setFilterSource('all'); setFilterConfidence('all') }}
              className="text-xs text-slate-500 hover:text-slate-700 px-2 py-1.5 rounded-xl border border-slate-200 hover:border-slate-300 transition-colors"
            >
              Clear filters
            </button>
          )}
        </div>
      </div>

      {/* ── Category tabs ── */}
      <div className="flex flex-wrap gap-1 p-1 bg-white border border-slate-200 rounded-xl w-fit shadow-sm">
        {categoryTabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => setCategoryTab(tab.id)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all duration-150 ${
              categoryTab === tab.id
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'text-slate-500 hover:text-slate-700 hover:bg-slate-50'
            }`}
          >
            {tab.icon}
            {tab.label}
            {tab.count !== undefined && tab.count > 0 && (
              <span
                className={`px-1.5 py-0.5 rounded-full text-xs font-semibold ${
                  categoryTab === tab.id
                    ? 'bg-white/25 text-white'
                    : 'bg-slate-100 text-slate-500'
                }`}
              >
                {tab.count}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* ── Pending items ── */}
      {filteredPending.length === 0 && pending.length === 0 ? (
        <EmptyState
          icon={
            <div className="text-emerald-500">
              <CheckCircle size={32} />
            </div>
          }
          title="Your inbox is clear"
          description="Everything AI detected has been reviewed. Capture more to get started."
          action={{
            label: 'Go to Capture',
            onClick: () => { window.location.href = '/capture' },
          }}
        />
      ) : filteredPending.length === 0 ? (
        <div className="text-center py-12 bg-white border border-black/[0.07] rounded-2xl shadow-sm">
          <p className="text-sm text-slate-500 font-medium">No items match the current filters.</p>
          <button
            onClick={() => { setFilterSource('all'); setFilterConfidence('all'); setCategoryTab('all') }}
            className="mt-2 text-xs text-indigo-600 hover:text-indigo-700 font-medium transition-colors"
          >
            Clear all filters
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <p className="text-xs text-slate-500">
              {filteredPending.length} item{filteredPending.length !== 1 ? 's' : ''} pending review
            </p>
            <div className="flex items-center gap-2">
              <button
                onClick={() => filteredPending.forEach(i => approveAIItem(i.id))}
                className="text-xs text-emerald-700 hover:text-emerald-800 font-medium px-2.5 py-1 rounded-xl border border-emerald-200 hover:border-emerald-300 bg-emerald-50 hover:bg-emerald-100 transition-colors"
              >
                Approve all
              </button>
            </div>
          </div>

          {filteredPending.map(item => (
            <ItemCard
              key={item.id}
              item={item}
              onApprove={approveAIItem}
              onReject={rejectAIItem}
            />
          ))}
        </div>
      )}

      {/* ── Approved section ── */}
      {approved.length > 0 && (
        <div>
          <button
            onClick={() => setApprovedExpanded(prev => !prev)}
            className="flex items-center gap-2 w-full text-left mb-3"
          >
            <ChevronDown
              size={14}
              className={`text-slate-400 transition-transform duration-200 ${approvedExpanded ? 'rotate-180' : ''}`}
            />
            <span className="text-sm font-semibold text-slate-600">
              Approved
              <span className="ml-2 px-2 py-0.5 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-semibold">
                {approved.length}
              </span>
            </span>
            <div className="flex-1 h-px bg-slate-200" />
          </button>

          {approvedExpanded && (
            <div className="space-y-2">
              {approved.map(item => (
                <ItemCard
                  key={item.id}
                  item={item}
                  onApprove={approveAIItem}
                  onReject={rejectAIItem}
                />
              ))}
            </div>
          )}
        </div>
      )}

      {/* ── Rejected section ── */}
      {rejected.length > 0 && (
        <div>
          <div className="flex items-center gap-2 mb-3">
            <div className="flex-1 h-px bg-slate-200" />
            <span className="text-xs text-slate-400 font-medium px-2">
              {rejected.length} dismissed
            </span>
            <div className="flex-1 h-px bg-slate-200" />
          </div>
          <div className="space-y-2">
            {rejected.map(item => (
              <ItemCard
                key={item.id}
                item={item}
                onApprove={approveAIItem}
                onReject={rejectAIItem}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
