'use client'

import { useState } from 'react'
import { Sparkles, Plus, AlertTriangle, CheckCircle, Circle, ExternalLink, Bell, Star, Loader2 } from 'lucide-react'
import { mockOpportunities } from '@/lib/mock-data'
import { cn, formatDate, daysUntil } from '@/lib/utils'
import StatusBadge from '@/components/ui/StatusBadge'
import PriorityBadge from '@/components/ui/PriorityBadge'
import EmptyState from '@/components/ui/EmptyState'
import type { Opportunity } from '@/lib/types'

const TABS = ['All', 'Researching', 'Applying', 'Submitted', 'Saved', 'Archived'] as const
const TYPE_COLORS: Record<string, string> = {
  internship: 'bg-blue-100 text-blue-700',
  fellowship: 'bg-violet-100 text-violet-700',
  scholarship: 'bg-amber-100 text-amber-700',
  research: 'bg-emerald-100 text-emerald-700',
  competition: 'bg-red-100 text-red-700',
  program: 'bg-teal-100 text-teal-700',
}

function DeadlinePill({ deadline }: { deadline: string }) {
  const days = daysUntil(deadline)
  const color = days < 7 ? 'text-red-700 bg-red-100 border-red-200'
    : days < 14 ? 'text-amber-700 bg-amber-100 border-amber-200'
    : 'text-slate-500 bg-slate-100 border-slate-200'
  return (
    <span className={cn('text-xs px-2.5 py-1 rounded-full border font-medium', color)}>
      {days < 0 ? 'Passed' : days === 0 ? 'Today!' : `${days}d left`} · {formatDate(deadline)}
    </span>
  )
}

export default function OpportunitiesPage() {
  const [activeTab, setActiveTab] = useState<typeof TABS[number]>('All')
  const [captureText, setCaptureText] = useState('')
  const [capturing, setCapturing] = useState(false)
  const [captureResult, setCaptureResult] = useState<string | null>(null)

  const filtered = activeTab === 'All'
    ? mockOpportunities
    : mockOpportunities.filter(o => {
        const statusMap: Record<string, Opportunity['status'][]> = {
          Researching: ['researching'],
          Applying: ['applying', 'waiting_recommendation'],
          Submitted: ['submitted', 'interview'],
          Saved: ['saved'],
          Archived: ['archived', 'rejected', 'accepted'],
        }
        return statusMap[activeTab]?.includes(o.status) ?? true
      })

  const urgentDeadlines = mockOpportunities.filter(o =>
    o.deadline && daysUntil(o.deadline) <= 14 && daysUntil(o.deadline) >= 0 && o.status !== 'archived'
  )

  const handleCapture = async () => {
    if (!captureText.trim()) return
    setCapturing(true)
    await new Promise(r => setTimeout(r, 1200))
    setCaptureResult('Detected:\n• Deadline: June 15, 2026\n• Type: Fellowship\n• Required materials: Cover letter, CV, 2 recommendation letters, personal statement\n• Application link: Extracted successfully\n• Eligibility: Undergraduate, GPA 3.5+')
    setCapturing(false)
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-3">
            <Sparkles className="text-indigo-600" size={24} />
            Opportunities
          </h1>
          <p className="text-slate-500 text-sm mt-1">Track internships, fellowships, scholarships, and more</p>
        </div>
        <button className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-sm font-medium transition-all">
          <Plus size={14} /> Add Opportunity
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-3">
        {[
          { label: 'Total tracked', value: mockOpportunities.length, color: 'text-slate-900' },
          { label: 'Deadlines ≤14 days', value: urgentDeadlines.length, color: urgentDeadlines.length > 0 ? 'text-amber-600' : 'text-slate-900' },
          { label: 'In progress', value: mockOpportunities.filter(o => ['applying', 'researching', 'waiting_recommendation'].includes(o.status)).length, color: 'text-blue-600' },
          { label: 'Submitted', value: mockOpportunities.filter(o => ['submitted', 'interview', 'accepted'].includes(o.status)).length, color: 'text-emerald-600' },
        ].map(stat => (
          <div key={stat.label} className="bg-white border border-black/[0.07] rounded-xl p-4 text-center shadow-sm">
            <div className={cn('text-2xl font-bold', stat.color)}>{stat.value}</div>
            <div className="text-xs text-slate-400 mt-1">{stat.label}</div>
          </div>
        ))}
      </div>

      {/* Urgent warning */}
      {urgentDeadlines.length > 0 && (
        <div className="flex items-start gap-3 p-4 bg-amber-50 border border-amber-300 rounded-xl">
          <AlertTriangle size={16} className="text-amber-600 flex-shrink-0 mt-0.5" />
          <div className="text-sm text-amber-800">
            <strong>{urgentDeadlines[0].name}</strong> deadline is in {daysUntil(urgentDeadlines[0].deadline!)} days.
            {urgentDeadlines.length > 1 && ` And ${urgentDeadlines.length - 1} more deadline${urgentDeadlines.length > 2 ? 's' : ''} coming up.`}
          </div>
          <button className="ml-auto flex-shrink-0 text-xs px-3 py-1.5 border border-amber-300 text-amber-700 bg-white rounded-lg hover:bg-amber-100 transition-all">
            Add to calendar
          </button>
        </div>
      )}

      {/* Tabs */}
      <div className="flex gap-1 bg-slate-100 border border-slate-200 rounded-xl p-1 overflow-x-auto">
        {TABS.map(tab => (
          <button key={tab} onClick={() => setActiveTab(tab)}
            className={cn('px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-all',
              activeTab === tab
                ? 'bg-white text-slate-900 shadow-sm'
                : 'text-slate-500 hover:text-slate-700 hover:bg-white/60')}>
            {tab}
          </button>
        ))}
      </div>

      {/* Opportunities list */}
      <div className="space-y-4">
        {filtered.length === 0 ? (
          <EmptyState icon={<Sparkles size={28} className="text-slate-300" />} title="No opportunities here" description="Add opportunities or check another tab." />
        ) : (
          filtered.map(opp => (
            <div key={opp.id} className="bg-white border border-black/[0.07] rounded-2xl p-5 hover:shadow-md transition-all">
              <div className="flex items-start gap-4">
                {/* Fit score */}
                <div className="flex flex-col items-center justify-center w-14 h-14 rounded-xl bg-white border border-black/[0.07] shadow-sm flex-shrink-0">
                  <span className={cn('text-lg font-bold',
                    (opp.fit_score ?? 0) >= 85 ? 'text-emerald-600' :
                    (opp.fit_score ?? 0) >= 70 ? 'text-amber-600' : 'text-slate-400')}>
                    {opp.fit_score ?? '—'}
                  </span>
                  <span className="text-xs text-slate-400">fit</span>
                </div>

                <div className="flex-1 space-y-3">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <div className="flex items-center gap-2 flex-wrap mb-1">
                        <span className={cn('text-xs px-2 py-0.5 rounded-full font-medium', TYPE_COLORS[opp.type] ?? 'bg-slate-100 text-slate-500')}>
                          {opp.type}
                        </span>
                        <StatusBadge status={opp.status} />
                        {opp.priority === 'high' || opp.priority === 'urgent' ? <PriorityBadge priority={opp.priority} /> : null}
                      </div>
                      <h3 className="text-lg font-bold text-slate-900">{opp.name}</h3>
                      <p className="text-sm text-slate-500">{opp.institution}{opp.location ? ` · ${opp.location}` : ''}</p>
                    </div>
                    {opp.deadline && <DeadlinePill deadline={opp.deadline} />}
                  </div>

                  {/* Required materials */}
                  {opp.required_materials && opp.required_materials.length > 0 && (
                    <div>
                      <div className="text-xs text-slate-400 mb-1.5">Required materials:</div>
                      <div className="flex flex-wrap gap-2">
                        {opp.required_materials.map((mat, i) => (
                          <span key={mat} className={cn('flex items-center gap-1 text-xs px-2 py-0.5 rounded-full',
                            i < 2 ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-500')}>
                            {i < 2 ? <CheckCircle size={10} /> : <Circle size={10} />}
                            {mat}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {opp.notes && (
                    <p className="text-xs text-slate-500 italic">"{opp.notes}"</p>
                  )}

                  {/* Actions */}
                  <div className="flex gap-2 pt-1">
                    <button className="text-xs px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-lg transition-all border border-slate-200">View Details</button>
                    <button className="text-xs px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-lg transition-all border border-slate-200 flex items-center gap-1">
                      <Bell size={10} /> Add to Calendar
                    </button>
                    {opp.application_link && (
                      <button className="text-xs px-3 py-1.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-600 rounded-lg transition-all border border-indigo-200 flex items-center gap-1">
                        <ExternalLink size={10} /> Apply
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* AI Capture */}
      <div className="bg-gradient-to-br from-indigo-50 to-violet-50 border border-indigo-200/50 rounded-2xl p-6 space-y-4">
        <div className="flex items-center gap-2">
          <Sparkles size={16} className="text-indigo-600" />
          <h2 className="text-sm font-semibold text-slate-800">Paste an Opportunity Description</h2>
        </div>
        <p className="text-xs text-slate-500">AI will automatically extract the deadline, requirements, and type.</p>
        <textarea value={captureText} onChange={e => setCaptureText(e.target.value)}
          placeholder="Paste fellowship description, job posting, or scholarship details here..."
          className="w-full h-28 bg-white border border-slate-200 rounded-xl px-4 py-3 text-sm text-slate-700 placeholder-slate-400 outline-none focus:border-indigo-400 resize-none transition-colors shadow-sm" />
        <button onClick={handleCapture} disabled={capturing || !captureText.trim()}
          className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white text-sm rounded-xl font-medium transition-all">
          {capturing ? <Loader2 size={14} className="animate-spin" /> : <Sparkles size={14} />}
          Extract with AI
        </button>
        {captureResult && (
          <div className="bg-white rounded-xl p-4 text-sm text-slate-700 whitespace-pre-line border border-indigo-100 shadow-sm">
            {captureResult}
            <button onClick={() => setCaptureResult(null)} className="block mt-2 text-xs text-slate-400 hover:text-slate-600 transition-colors">Dismiss</button>
          </div>
        )}
      </div>
    </div>
  )
}
