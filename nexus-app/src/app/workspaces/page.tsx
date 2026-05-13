'use client'

import { Layers, Plus, CheckSquare, FileText, HardDrive, ChevronRight, Clock } from 'lucide-react'
import { mockWorkspaces, mockTasks, mockNotes, mockDriveFiles } from '@/lib/mock-data'
import { cn } from '@/lib/utils'
import Link from 'next/link'

const WORKSPACE_ICONS: Record<string, string> = {
  College: '🎓',
  French: '🇫🇷',
  Chinese: '🇨🇳',
  'Social Media': '📱',
  Personal: '🌱',
  'Mandato Aberto': '⚡',
  Research: '🔬',
  'Applications/Fellowships': '🏆',
}

export default function WorkspacesPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-3">
            <Layers className="text-indigo-600" size={24} />
            Workspaces
          </h1>
          <p className="text-slate-500 text-sm mt-1">Your life, organized into focused areas</p>
        </div>
        <button className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-sm font-medium transition-all shadow-sm">
          <Plus size={14} /> New Workspace
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {mockWorkspaces.map(ws => {
          const tasks = mockTasks.filter(t => t.workspace_id === ws.id && t.status !== 'done')
          const notes = mockNotes.filter(n => n.workspace_id === ws.id)
          const files = mockDriveFiles.filter(f => f.detected_workspace_id === ws.id)
          const emoji = WORKSPACE_ICONS[ws.name] ?? '📁'

          return (
            <div key={ws.id}
              className="bg-white border border-black/[0.07] rounded-2xl overflow-hidden hover:shadow-md hover:border-indigo-200/50 transition-all shadow-sm">
              {/* Color accent top bar */}
              <div className="h-1 w-full" style={{ backgroundColor: ws.color }} />

              <div className="p-5 space-y-4">
                {/* Header */}
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center text-xl"
                      style={{ backgroundColor: ws.color + '22' }}>
                      {emoji}
                    </div>
                    <div>
                      <h3 className="font-semibold text-slate-900">{ws.name}</h3>
                      <p className="text-xs text-slate-500 mt-0.5 line-clamp-1">{ws.description}</p>
                    </div>
                  </div>
                </div>

                {/* Stats */}
                <div className="bg-slate-50 rounded-xl grid grid-cols-3 gap-2 p-2">
                  <div className="flex flex-col items-center p-2 gap-1">
                    <CheckSquare size={14} className="text-indigo-500" />
                    <span className="text-lg font-bold text-slate-800">{tasks.length}</span>
                    <span className="text-xs text-slate-400">Tasks</span>
                  </div>
                  <div className="flex flex-col items-center p-2 gap-1">
                    <FileText size={14} className="text-violet-500" />
                    <span className="text-lg font-bold text-slate-800">{notes.length}</span>
                    <span className="text-xs text-slate-400">Notes</span>
                  </div>
                  <div className="flex flex-col items-center p-2 gap-1">
                    <HardDrive size={14} className="text-amber-500" />
                    <span className="text-lg font-bold text-slate-800">{files.length}</span>
                    <span className="text-xs text-slate-400">Files</span>
                  </div>
                </div>

                {/* Recent activity */}
                <div className="flex items-center gap-1.5 text-xs text-slate-400">
                  <Clock size={11} />
                  <span>Last active recently</span>
                </div>

                {/* Open button */}
                <Link href={`/workspaces/${ws.id}`}
                  className="flex items-center justify-center gap-2 w-full py-2 text-sm font-medium rounded-xl border border-slate-200 hover:border-indigo-300 hover:bg-indigo-50 hover:text-indigo-700 text-slate-600 transition-all">
                  Open Workspace
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
