'use client'

import { useState } from 'react'
import { HardDrive, Link2, RefreshCw, FolderOpen, FileText, AlertCircle, CheckCircle, Sparkles, Shield, Eye, Settings2, Loader2 } from 'lucide-react'
import { mockDriveFiles, mockCourses } from '@/lib/mock-data'
import { cn, formatDate } from '@/lib/utils'
import type { DriveFile } from '@/lib/types'

const FOLDERS = [
  { name: 'College / Fall 2026', count: 14 },
  { name: 'Projects / Mandato Aberto', count: 8 },
  { name: 'Languages / French', count: 12 },
  { name: 'Languages / Chinese', count: 9 },
  { name: 'Personal Knowledge', count: 5 },
  { name: 'Opportunities', count: 7 },
]

const PERMISSION_LEVELS = [
  { id: 'basic', label: 'Basic', icon: Shield, desc: 'File names and folder structure only. No content is read.' },
  { id: 'smart', label: 'Smart', icon: Eye, desc: 'Read document content to enable AI summaries and task extraction.' },
  { id: 'full', label: 'Full Organization', icon: Settings2, desc: 'Create folders and templates to keep Drive organized automatically.' },
]

const CLASSIFICATION_QUEUE = [
  { name: 'Week 4 Reading - Media and Democracy.pdf', suggestion: 'Comparative Politics · Reading', confidence: 87 },
  { name: 'French-Grammar-Unit-2.docx', suggestion: 'French I · Notes', confidence: 91 },
  { name: 'DS101-Lab3-Results.csv', suggestion: 'Data Science Foundations · Assignment', confidence: 78 },
]

function getMimeIcon(mimeType: string) {
  if (mimeType.includes('pdf')) return '📄'
  if (mimeType.includes('document') || mimeType.includes('word')) return '📝'
  if (mimeType.includes('presentation') || mimeType.includes('powerpoint')) return '📊'
  if (mimeType.includes('spreadsheet') || mimeType.includes('excel')) return '📈'
  return '📁'
}

function getMimeColor(mimeType: string) {
  if (mimeType.includes('pdf')) return 'text-red-500'
  if (mimeType.includes('document')) return 'text-blue-500'
  if (mimeType.includes('presentation')) return 'text-amber-500'
  if (mimeType.includes('spreadsheet')) return 'text-emerald-500'
  return 'text-slate-400'
}

export default function DrivePage() {
  const [showDemo, setShowDemo] = useState(false)
  const [connecting, setConnecting] = useState(false)
  const [permission, setPermission] = useState('basic')
  const [classifiedItems, setClassifiedItems] = useState<Set<number>>(new Set())

  async function handleConnect() {
    setConnecting(true)
    await new Promise(r => setTimeout(r, 1800))
    setConnecting(false)
    setShowDemo(true)
  }

  const handleConfirmClassification = (idx: number) => {
    setClassifiedItems(prev => new Set([...prev, idx]))
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-3">
            <HardDrive className="text-amber-500" size={24} />
            Google Drive
          </h1>
          <p className="text-slate-500 text-sm mt-1">Connect and organize your Drive as a knowledge source</p>
        </div>
      </div>

      {/* Connection Status */}
      {!showDemo ? (
        <div className="bg-white border border-dashed border-slate-300 rounded-2xl p-6 shadow-sm">
          <div className="flex flex-col items-center text-center py-4 gap-4">
            <div className="w-14 h-14 rounded-2xl bg-amber-50 border border-amber-100 flex items-center justify-center">
              <HardDrive size={28} className="text-amber-500" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-slate-800">Connect Google Drive</h2>
              <p className="text-slate-500 text-sm mt-1 max-w-md">
                Automatically index, classify, and link your files to courses and projects. AI will detect assignments, readings, deadlines, and more.
              </p>
            </div>
            <div className="flex gap-3">
              <button onClick={handleConnect} disabled={connecting}
                className="flex items-center gap-2 px-5 py-2.5 bg-amber-500 hover:bg-amber-600 disabled:opacity-70 text-white rounded-xl text-sm font-medium transition-all shadow-sm">
                {connecting ? <Loader2 size={14} className="animate-spin" /> : <Link2 size={14} />}
                {connecting ? 'Connecting…' : 'Connect Google Drive'}
              </button>
              <button onClick={() => setShowDemo(true)}
                className="px-4 py-2.5 border border-slate-200 bg-white text-slate-600 hover:text-slate-900 hover:border-slate-300 rounded-xl text-sm transition-all">
                Preview Demo
              </button>
            </div>
            <p className="text-xs text-slate-400">Uses read-only access by default. No files will be modified.</p>
          </div>
        </div>
      ) : (
        <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-5 shadow-sm">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
            <div className="flex items-center gap-3 flex-1">
              <div className="w-3 h-3 rounded-full bg-emerald-500 animate-pulse" />
              <div>
                <span className="text-slate-800 font-medium">Connected</span>
                <span className="text-slate-400 text-sm ml-2">·</span>
                <span className="text-slate-600 text-sm ml-2">laura@university.edu</span>
              </div>
            </div>
            <div className="flex items-center gap-4 text-sm text-slate-500">
              <span>43 files indexed</span>
              <span>·</span>
              <span>Last synced 2 min ago</span>
            </div>
            <div className="flex gap-2">
              <button className="flex items-center gap-1.5 px-3 py-1.5 bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 rounded-lg text-sm transition-all shadow-sm">
                <RefreshCw size={13} /> Sync Now
              </button>
              <button onClick={() => setShowDemo(false)} className="text-xs text-slate-400 hover:text-slate-600 px-2 transition-colors">Disconnect</button>
            </div>
          </div>
        </div>
      )}

      {/* Permission Levels */}
      <div>
        <h2 className="text-base font-semibold text-slate-800 mb-4">Permission Level</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {PERMISSION_LEVELS.map(p => {
            const Icon = p.icon
            const active = permission === p.id
            return (
              <button key={p.id} onClick={() => setPermission(p.id)}
                className={cn('text-left p-4 rounded-xl border transition-all',
                  active
                    ? 'border-indigo-300 bg-indigo-50'
                    : 'border-slate-200 bg-white hover:border-slate-300 shadow-sm')}>
                <div className="flex items-center gap-2 mb-2">
                  <Icon size={16} className={active ? 'text-indigo-600' : 'text-slate-400'} />
                  <span className={cn('text-sm font-semibold', active ? 'text-indigo-700' : 'text-slate-700')}>{p.label}</span>
                  {active && <CheckCircle size={13} className="text-indigo-600 ml-auto" />}
                </div>
                <p className="text-xs text-slate-500 leading-relaxed">{p.desc}</p>
              </button>
            )
          })}
        </div>
      </div>

      {/* Synced Folders */}
      <div>
        <h2 className="text-base font-semibold text-slate-800 mb-4">Synced Folders</h2>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          {FOLDERS.map(folder => (
            <div key={folder.name} className="flex items-center gap-3 p-4 bg-white border border-slate-200 rounded-xl hover:border-indigo-200 hover:bg-indigo-50/30 transition-all cursor-pointer shadow-sm">
              <FolderOpen size={18} className="text-amber-500 flex-shrink-0" />
              <div className="flex-1 min-w-0">
                <div className="text-sm font-medium text-slate-700 truncate">{folder.name}</div>
                <div className="text-xs text-slate-400">{folder.count} files</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Recent Files */}
      <div>
        <h2 className="text-base font-semibold text-slate-800 mb-4">Recent Drive Files</h2>
        <div className="space-y-3">
          {mockDriveFiles.map(file => {
            const course = mockCourses.find(c => c.id === file.detected_course_id)
            return (
              <div key={file.id} className="bg-white border border-black/[0.07] rounded-xl p-4 hover:shadow-md transition-all shadow-sm">
                <div className="flex items-start gap-4">
                  <span className="text-2xl flex-shrink-0">{getMimeIcon(file.mime_type)}</span>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <div className="text-sm font-medium text-slate-800">{file.name}</div>
                        <div className="text-xs text-slate-400 mt-0.5">{file.folder_path} · {formatDate(file.last_modified)}</div>
                      </div>
                      <div className="flex items-center gap-2 flex-shrink-0">
                        {file.detected_type && (
                          <span className="text-xs px-2 py-0.5 rounded-full bg-amber-50 text-amber-700 border border-amber-200">{file.detected_type}</span>
                        )}
                        {file.indexed_status === 'indexed' && <CheckCircle size={14} className="text-emerald-500" />}
                        {file.indexed_status === 'needs_review' && <AlertCircle size={14} className="text-amber-500" />}
                      </div>
                    </div>
                    {course && (
                      <div className="mt-2 flex items-center gap-1.5">
                        <div className="w-1.5 h-1.5 rounded-full bg-indigo-500" />
                        <span className="text-xs text-slate-600">{course.name}</span>
                        {file.confidence && (
                          <span className="text-xs text-slate-400 ml-1">· {file.confidence}% confidence</span>
                        )}
                      </div>
                    )}
                    {file.summary && (
                      <p className="text-xs text-slate-500 mt-2 line-clamp-2">{file.summary}</p>
                    )}
                    <div className="flex gap-2 mt-3">
                      {['Open', 'Summarize', 'Extract Tasks', 'Link to Course', 'Send to AI Inbox'].map(action => (
                        <button key={action} className="text-xs px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-lg transition-all">
                          {action}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* Classification Queue */}
      <div>
        <h2 className="text-base font-semibold text-slate-800 mb-4 flex items-center gap-2">
          <AlertCircle size={16} className="text-amber-500" />
          Classification Queue
          <span className="text-xs px-2 py-0.5 bg-amber-50 text-amber-700 border border-amber-200 rounded-full">
            {CLASSIFICATION_QUEUE.filter((_, i) => !classifiedItems.has(i)).length} pending
          </span>
        </h2>
        <div className="space-y-3">
          {CLASSIFICATION_QUEUE.map((item, idx) => (
            classifiedItems.has(idx) ? (
              <div key={idx} className="flex items-center gap-3 p-4 border-l-4 border-emerald-400 bg-white border border-slate-200 rounded-xl opacity-60">
                <CheckCircle size={16} className="text-emerald-500 flex-shrink-0" />
                <span className="text-sm text-slate-500 line-through">{item.name}</span>
                <span className="text-xs text-emerald-600 ml-auto font-medium">Confirmed</span>
              </div>
            ) : (
              <div key={idx} className="bg-amber-50/50 border-l-4 border-amber-400 border border-amber-100 rounded-xl p-4">
                <div className="flex items-start gap-3">
                  <span className="text-xl">📄</span>
                  <div className="flex-1">
                    <div className="text-sm font-medium text-slate-800">{item.name}</div>
                    <div className="text-xs text-slate-500 mt-1">
                      Suggested: <span className="text-amber-600 font-medium">{item.suggestion}</span>
                    </div>
                    <div className="flex items-center gap-2 mt-2">
                      <div className="flex-1 h-1.5 bg-slate-200 rounded-full overflow-hidden">
                        <div className="h-full rounded-full bg-gradient-to-r from-indigo-500 to-emerald-500" style={{ width: `${item.confidence}%` }} />
                      </div>
                      <span className="text-xs text-slate-500">{item.confidence}%</span>
                    </div>
                    <div className="flex gap-2 mt-3">
                      <button onClick={() => handleConfirmClassification(idx)}
                        className="text-xs px-3 py-1.5 bg-amber-500 hover:bg-amber-600 text-white rounded-lg transition-all shadow-sm">
                        Confirm
                      </button>
                      <button className="text-xs px-3 py-1.5 border border-slate-200 bg-white text-slate-600 hover:text-slate-800 rounded-lg transition-all">Edit</button>
                      <button className="text-xs px-3 py-1.5 text-slate-400 hover:text-slate-600 rounded-lg transition-all">Skip</button>
                    </div>
                  </div>
                </div>
              </div>
            )
          ))}
        </div>
      </div>
    </div>
  )
}
