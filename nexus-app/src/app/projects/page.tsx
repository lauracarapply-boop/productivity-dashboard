'use client'

import { useState } from 'react'
import { FolderKanban, Plus, Target, CheckCircle, Circle, ChevronRight } from 'lucide-react'
import { mockProjects, mockWorkspaces, mockTasks } from '@/lib/mock-data'
import { cn, formatDate, daysUntil } from '@/lib/utils'
import StatusBadge from '@/components/ui/StatusBadge'
import PriorityBadge from '@/components/ui/PriorityBadge'
import Link from 'next/link'

export default function ProjectsPage() {
  const [view, setView] = useState<'cards' | 'kanban'>('cards')

  const kanbanCols = [
    { id: 'planning', label: 'Planning', color: 'text-violet-600' },
    { id: 'active', label: 'Active', color: 'text-indigo-600' },
    { id: 'completed', label: 'Completed', color: 'text-emerald-600' },
  ]

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-3">
            <FolderKanban className="text-violet-600" size={24} />
            Projects
          </h1>
          <p className="text-slate-500 text-sm mt-1">{mockProjects.length} projects · {mockProjects.filter(p => p.status === 'active').length} active</p>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex bg-slate-100 border border-slate-200 rounded-xl p-1">
            {(['cards', 'kanban'] as const).map(v => (
              <button key={v} onClick={() => setView(v)}
                className={cn('px-3 py-1.5 rounded-lg text-sm font-medium transition-all capitalize',
                  view === v
                    ? 'bg-white shadow-sm text-indigo-700'
                    : 'text-slate-500 hover:text-slate-700')}>
                {v}
              </button>
            ))}
          </div>
          <button className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-sm font-medium transition-all shadow-sm">
            <Plus size={14} /> New Project
          </button>
        </div>
      </div>

      {view === 'cards' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {mockProjects.map(project => {
            const ws = mockWorkspaces.find(w => w.id === project.workspace_id)
            const tasks = mockTasks.filter(t => t.project_id === project.id)
            const deadline = project.deadline ? daysUntil(project.deadline) : null

            return (
              <div key={project.id} className="bg-white border border-black/[0.07] rounded-2xl p-5 space-y-4 hover:shadow-md transition-all shadow-sm">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <StatusBadge status={project.status} />
                      <PriorityBadge priority={project.priority} />
                    </div>
                    <h3 className="text-base font-semibold text-slate-900">{project.title}</h3>
                    <p className="text-sm text-slate-500 mt-1 line-clamp-2">{project.description}</p>
                  </div>
                </div>

                {/* Progress */}
                <div className="space-y-1">
                  <div className="flex justify-between text-xs text-slate-500">
                    <span>Progress</span>
                    <span className="font-medium text-slate-700">{project.progress}%</span>
                  </div>
                  <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                    <div className="h-full rounded-full bg-gradient-to-r from-indigo-500 to-violet-500 transition-all"
                      style={{ width: `${project.progress}%` }} />
                  </div>
                </div>

                <div className="flex items-center gap-4 text-xs text-slate-500">
                  {ws && (
                    <span className="flex items-center gap-1">
                      <div className="w-2 h-2 rounded-full" style={{ backgroundColor: ws.color }} />
                      {ws.name}
                    </span>
                  )}
                  {project.deadline && (
                    <span className={cn(
                      deadline !== null && deadline < 14 ? 'text-amber-600' : '',
                      deadline !== null && deadline < 7 ? 'text-red-600' : ''
                    )}>
                      {deadline !== null ? `${deadline} days left` : formatDate(project.deadline)}
                    </span>
                  )}
                  <span>{tasks.length} tasks</span>
                </div>

                {/* Milestones */}
                {project.milestones && project.milestones.length > 0 && (
                  <div className="space-y-1">
                    {project.milestones.slice(0, 3).map(m => (
                      <div key={m.id} className="flex items-center gap-2 text-xs">
                        {m.completed
                          ? <CheckCircle size={12} className="text-emerald-500 flex-shrink-0" />
                          : <Circle size={12} className="text-slate-300 flex-shrink-0" />}
                        <span className={cn('truncate', m.completed ? 'text-slate-400 line-through' : 'text-slate-600')}>
                          {m.title}
                        </span>
                      </div>
                    ))}
                  </div>
                )}

                <Link href={`/projects/${project.id}`}
                  className="flex items-center justify-center gap-2 w-full py-2 text-sm rounded-xl border border-slate-200 hover:border-indigo-300 hover:bg-indigo-50 hover:text-indigo-700 text-slate-600 transition-all">
                  Open Project <ChevronRight size={14} />
                </Link>
              </div>
            )
          })}
        </div>
      ) : (
        <div className="grid grid-cols-3 gap-5">
          {kanbanCols.map(col => {
            const projects = mockProjects.filter(p => p.status === col.id)
            return (
              <div key={col.id} className="space-y-3">
                <div className="bg-slate-50 rounded-xl px-3 py-2.5 border border-slate-200">
                  <div className={cn('text-sm font-semibold uppercase tracking-wider flex items-center gap-2', col.color)}>
                    {col.label}
                    <span className="text-xs text-slate-400 normal-case font-normal">({projects.length})</span>
                  </div>
                </div>
                {projects.map(p => (
                  <div key={p.id} className="bg-white border border-slate-200 rounded-xl p-4 hover:shadow-md hover:border-indigo-200/60 transition-all shadow-sm">
                    <h4 className="text-sm font-medium text-slate-800">{p.title}</h4>
                    <div className="mt-2 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                      <div className="h-full rounded-full bg-gradient-to-r from-indigo-500 to-violet-500" style={{ width: `${p.progress}%` }} />
                    </div>
                    <div className="text-xs text-slate-400 mt-2">{p.progress}% complete</div>
                  </div>
                ))}
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
