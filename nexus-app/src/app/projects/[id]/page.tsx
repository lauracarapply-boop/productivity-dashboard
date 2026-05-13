'use client'

import { useState } from 'react'
import { mockProjects, mockTasks, mockNotes, mockDriveFiles, mockWorkspaces } from '@/lib/mock-data'
import { notFound } from 'next/navigation'
import { ArrowLeft, CheckCircle, Circle, Sparkles, CheckSquare, FileText, HardDrive, Target } from 'lucide-react'
import Link from 'next/link'
import { cn, formatDate, daysUntil } from '@/lib/utils'
import StatusBadge from '@/components/ui/StatusBadge'
import PriorityBadge from '@/components/ui/PriorityBadge'

const TABS = ['Roadmap', 'Tasks', 'Notes', 'Files', 'AI Summary'] as const

export default function ProjectDetailPage({ params }: { params: { id: string } }) {
  const project = mockProjects.find(p => p.id === params.id)
  if (!project) notFound()

  const [activeTab, setActiveTab] = useState<typeof TABS[number]>('Roadmap')
  const ws = mockWorkspaces.find(w => w.id === project.workspace_id)
  const tasks = mockTasks.filter(t => t.project_id === project.id)
  const notes = mockNotes.filter(n => n.project_id === project.id)
  const files = mockDriveFiles.slice(0, 2)
  const deadline = project.deadline ? daysUntil(project.deadline) : null

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Link href="/projects" className="flex items-center gap-2 text-slate-400 hover:text-slate-200 text-sm transition-colors">
          <ArrowLeft size={14} /> Projects
        </Link>
      </div>

      {/* Header */}
      <div className="space-y-3">
        <div className="flex items-center gap-3 flex-wrap">
          <StatusBadge status={project.status} />
          <PriorityBadge priority={project.priority} />
          {ws && (
            <span className="flex items-center gap-1.5 text-xs text-slate-400">
              <div className="w-2 h-2 rounded-full" style={{ backgroundColor: ws.color }} />
              {ws.name}
            </span>
          )}
        </div>
        <h1 className="text-2xl font-bold text-slate-100">{project.title}</h1>
        <p className="text-slate-400">{project.description}</p>
        <div className="flex items-center gap-6 text-sm text-slate-500">
          {project.deadline && (
            <span className={cn(deadline !== null && deadline < 14 ? 'text-amber-400' : '')}>
              Deadline: {formatDate(project.deadline)} {deadline !== null ? `(${deadline} days)` : ''}
            </span>
          )}
          <span>{tasks.length} tasks</span>
          <span>{project.milestones?.length ?? 0} milestones</span>
        </div>
        {/* Progress */}
        <div className="flex items-center gap-3">
          <div className="flex-1 h-2 bg-slate-700 rounded-full overflow-hidden">
            <div className="h-full rounded-full bg-gradient-to-r from-indigo-500 to-violet-500"
              style={{ width: `${project.progress}%` }} />
          </div>
          <span className="text-sm text-slate-400 w-12 text-right">{project.progress}%</span>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-slate-900 rounded-xl p-1 border border-slate-800">
        {TABS.map(tab => (
          <button key={tab} onClick={() => setActiveTab(tab)}
            className={cn('px-4 py-2 rounded-lg text-sm font-medium transition-all',
              activeTab === tab ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800')}>
            {tab}
          </button>
        ))}
      </div>

      {/* Tab content */}
      {activeTab === 'Roadmap' && (
        <div className="space-y-4">
          <h3 className="text-sm font-semibold text-slate-300">Milestones</h3>
          <div className="relative pl-6">
            <div className="absolute left-2.5 top-0 bottom-0 w-px bg-slate-700" />
            {(project.milestones ?? []).map((m, i) => (
              <div key={m.id} className="relative mb-6 last:mb-0">
                <div className={cn('absolute -left-4 w-4 h-4 rounded-full border-2 flex items-center justify-center',
                  m.completed ? 'bg-emerald-500 border-emerald-400' : 'bg-slate-800 border-slate-600')}>
                  {m.completed && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
                </div>
                <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-4">
                  <div className="flex items-center justify-between">
                    <span className={cn('text-sm font-medium', m.completed ? 'text-slate-400 line-through' : 'text-slate-200')}>
                      {m.title}
                    </span>
                    <span className="text-xs text-slate-500">{formatDate(m.due_date)}</span>
                  </div>
                  {m.completed && <div className="text-xs text-emerald-400 mt-1">✓ Completed</div>}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {activeTab === 'Tasks' && (
        <div className="space-y-2">
          {tasks.length === 0 ? (
            <p className="text-slate-500 text-center py-8">No tasks for this project</p>
          ) : (
            tasks.map(task => (
              <div key={task.id} className="flex items-center gap-3 p-4 bg-slate-800/50 border border-slate-700/50 rounded-xl">
                <div className={cn('w-2 h-2 rounded-full',
                  task.priority === 'urgent' ? 'bg-red-400' : task.priority === 'high' ? 'bg-amber-400' : 'bg-blue-400')} />
                <span className="text-sm text-slate-300 flex-1">{task.title}</span>
                {task.due_date && <span className="text-xs text-slate-500">{formatDate(task.due_date)}</span>}
                <StatusBadge status={task.status} />
              </div>
            ))
          )}
        </div>
      )}

      {activeTab === 'Notes' && (
        <div className="grid grid-cols-2 gap-4">
          {notes.length === 0 ? (
            <p className="text-slate-500 col-span-2 text-center py-8">No notes linked to this project</p>
          ) : (
            notes.map(note => (
              <Link key={note.id} href={`/notes/${note.id}`}
                className="p-4 bg-slate-800/50 border border-slate-700/50 rounded-xl hover:border-slate-600 transition-all">
                <h4 className="text-sm font-medium text-slate-200">{note.title}</h4>
                <p className="text-xs text-slate-500 mt-2 line-clamp-2">{note.content}</p>
              </Link>
            ))
          )}
        </div>
      )}

      {activeTab === 'Files' && (
        <div className="space-y-3">
          {files.map(file => (
            <div key={file.id} className="flex items-center gap-3 p-4 bg-slate-800/50 border border-slate-700/50 rounded-xl">
              <span className="text-xl">📄</span>
              <div className="flex-1">
                <div className="text-sm text-slate-300">{file.name}</div>
                <div className="text-xs text-slate-500">{file.folder_path}</div>
              </div>
              <button className="text-xs px-3 py-1 bg-slate-700 hover:bg-slate-600 text-slate-400 rounded-lg transition-all">Open</button>
            </div>
          ))}
        </div>
      )}

      {activeTab === 'AI Summary' && (
        <div className="bg-gradient-to-br from-indigo-950/50 to-violet-950/50 border border-indigo-500/20 rounded-2xl p-6 space-y-4">
          <div className="flex items-center gap-2">
            <Sparkles size={18} className="text-violet-400" />
            <h3 className="text-base font-semibold text-slate-200">AI Project Summary</h3>
          </div>
          <div className="space-y-3 text-sm text-slate-300 leading-relaxed">
            <p><strong className="text-slate-200">Current state:</strong> {project.title} is {project.progress}% complete with {project.status} status. {project.milestones?.filter(m => m.completed).length ?? 0} of {project.milestones?.length ?? 0} milestones finished.</p>
            <p><strong className="text-slate-200">Next steps:</strong> Focus on the upcoming milestone. {tasks.filter(t => t.status !== 'done').length} tasks remain open.</p>
            <p><strong className="text-slate-200">Risk:</strong> {deadline !== null && deadline < 30 ? `Deadline approaching in ${deadline} days — consider prioritizing this project.` : 'No immediate deadline risk.'}</p>
          </div>
          <div className="flex gap-3">
            <button className="text-sm px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg transition-all">Regenerate</button>
            <button className="text-sm px-4 py-2 border border-slate-700 text-slate-400 hover:text-slate-200 rounded-lg transition-all">Create Weekly Report</button>
          </div>
        </div>
      )}
    </div>
  )
}
