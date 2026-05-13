'use client'

import { useState } from 'react'
import { Settings, User, Link2, Bot, Calendar, Bell, Shield, Trash2, Check, ChevronRight, Download } from 'lucide-react'
import { mockUser } from '@/lib/mock-data'
import { cn } from '@/lib/utils'

const NAV_ITEMS = [
  { id: 'account', label: 'Account', icon: User },
  { id: 'integrations', label: 'Integrations', icon: Link2 },
  { id: 'ai', label: 'AI Preferences', icon: Bot },
  { id: 'calendar', label: 'Calendar Rules', icon: Calendar },
  { id: 'notifications', label: 'Notifications', icon: Bell },
  { id: 'privacy', label: 'Privacy & Permissions', icon: Shield },
] as const

type SectionId = typeof NAV_ITEMS[number]['id']

function Toggle({ checked, onChange }: { checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <button onClick={() => onChange(!checked)}
      className={cn('relative w-11 h-6 rounded-full transition-all duration-200',
        checked ? 'bg-indigo-600' : 'bg-slate-200')}>
      <div className={cn('absolute top-1 w-4 h-4 rounded-full bg-white shadow-sm transition-all duration-200',
        checked ? 'left-6' : 'left-1')} />
    </button>
  )
}

function SettingRow({ label, desc, children }: { label: string; desc?: string; children: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between py-4 border-b border-slate-100 last:border-0 gap-4">
      <div className="flex-1">
        <div className="text-sm text-slate-700">{label}</div>
        {desc && <div className="text-xs text-slate-400 mt-0.5">{desc}</div>}
      </div>
      {children}
    </div>
  )
}

export default function SettingsPage() {
  const [activeSection, setActiveSection] = useState<SectionId>('account')
  const [name, setName] = useState(mockUser.name)
  const [email, setEmail] = useState(mockUser.email)
  const [university, setUniversity] = useState('State University')
  const [saved, setSaved] = useState(false)

  const [aiPrefs, setAiPrefs] = useState({
    askBeforeCalendar: true,
    askBeforeTask: true,
    autoSummarize: false,
    autoClassify: false,
    showConfidence: true,
  })

  const [calRules, setCalRules] = useState({
    syncDeadlines: true,
    addBuffer: false,
    noDeepWorkLate: true,
    protectedSunday: true,
  })

  const [notifPrefs, setNotifPrefs] = useState({
    deadlineReminders: true,
    dailyPlanning: true,
    weeklyReview: true,
    overdueTasks: true,
    driveUpdates: false,
  })

  const [drivePermission, setDrivePermission] = useState('basic')
  const [confidenceThreshold, setConfidenceThreshold] = useState(70)
  const [schedulingMode, setSchedulingMode] = useState('semi-auto')
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)

  const handleSave = () => {
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  const integrations = [
    { id: 'calendar', label: 'Google Calendar', icon: '📅', desc: 'Sync your calendar events bidirectionally', status: 'disconnected' },
    { id: 'drive', label: 'Google Drive', icon: '📁', desc: 'Index and classify your files with AI', status: 'disconnected' },
    { id: 'gmail', label: 'Gmail', icon: '📧', desc: 'Extract tasks and deadlines from emails', status: 'planned' },
    { id: 'canvas', label: 'Canvas / LMS', icon: '🎓', desc: 'Import assignments and deadlines automatically', status: 'planned' },
  ]

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-3">
          <Settings className="text-slate-500" size={24} />
          Settings
        </h1>
        <p className="text-slate-500 text-sm mt-1">Manage your account, integrations, and preferences</p>
      </div>

      <div className="flex gap-6">
        {/* Left nav */}
        <div className="w-52 flex-shrink-0 bg-white rounded-2xl border border-black/[0.07] p-2 h-fit">
          {NAV_ITEMS.map(item => {
            const Icon = item.icon
            return (
              <button key={item.id} onClick={() => setActiveSection(item.id)}
                className={cn('w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all text-left',
                  activeSection === item.id
                    ? 'bg-indigo-50 text-indigo-700 font-semibold'
                    : 'text-slate-500 hover:bg-slate-50 hover:text-slate-800')}>
                <Icon size={15} />
                {item.label}
              </button>
            )
          })}
        </div>

        {/* Content */}
        <div className="flex-1 bg-white border border-black/[0.07] rounded-2xl p-6 shadow-sm">
          {activeSection === 'account' && (
            <div className="space-y-6">
              <h2 className="text-base font-semibold text-slate-800">Account</h2>
              {/* Avatar */}
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center text-2xl font-bold text-white">
                  {name[0]}
                </div>
                <div>
                  <div className="text-sm font-medium text-slate-800">{name}</div>
                  <div className="text-xs text-slate-400">{email}</div>
                </div>
              </div>
              <div className="space-y-4">
                {[
                  { label: 'Full name', value: name, setter: setName },
                  { label: 'Email address', value: email, setter: setEmail },
                  { label: 'University', value: university, setter: setUniversity },
                ].map(field => (
                  <div key={field.label} className="space-y-1">
                    <label className="text-xs text-slate-500">{field.label}</label>
                    <input value={field.value} onChange={e => field.setter(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm text-slate-700 outline-none focus:border-indigo-400 focus:ring-1 focus:ring-indigo-200 transition-colors" />
                  </div>
                ))}
                <button onClick={handleSave}
                  className={cn('flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-medium transition-all',
                    saved ? 'bg-emerald-600 text-white' : 'bg-indigo-600 hover:bg-indigo-700 text-white')}>
                  {saved ? <><Check size={14} /> Saved!</> : 'Save changes'}
                </button>
              </div>
            </div>
          )}

          {activeSection === 'integrations' && (
            <div className="space-y-4">
              <h2 className="text-base font-semibold text-slate-800">Integrations</h2>
              {integrations.map(int => (
                <div key={int.id} className="flex items-center gap-4 p-4 bg-white border border-black/[0.07] rounded-xl shadow-sm">
                  <span className="text-2xl">{int.icon}</span>
                  <div className="flex-1">
                    <div className="text-sm font-medium text-slate-700">{int.label}</div>
                    <div className="text-xs text-slate-400">{int.desc}</div>
                  </div>
                  {int.status === 'planned' ? (
                    <span className="text-xs px-2.5 py-1 bg-slate-100 text-slate-400 rounded-full border border-slate-200">Coming soon</span>
                  ) : (
                    <button className="text-xs px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg transition-all">
                      Connect
                    </button>
                  )}
                </div>
              ))}
            </div>
          )}

          {activeSection === 'ai' && (
            <div className="space-y-2">
              <h2 className="text-base font-semibold text-slate-800 mb-4">AI Preferences</h2>
              <SettingRow label="Ask before creating calendar events" desc="AI will always ask for approval before adding events">
                <Toggle checked={aiPrefs.askBeforeCalendar} onChange={v => setAiPrefs(p => ({ ...p, askBeforeCalendar: v }))} />
              </SettingRow>
              <SettingRow label="Ask before creating tasks" desc="AI will send items to the inbox for your review">
                <Toggle checked={aiPrefs.askBeforeTask} onChange={v => setAiPrefs(p => ({ ...p, askBeforeTask: v }))} />
              </SettingRow>
              <SettingRow label="Auto-summarize notes" desc="Generate summaries when notes are saved">
                <Toggle checked={aiPrefs.autoSummarize} onChange={v => setAiPrefs(p => ({ ...p, autoSummarize: v }))} />
              </SettingRow>
              <SettingRow label="Auto-classify Drive files" desc="Detect course and type when files are synced">
                <Toggle checked={aiPrefs.autoClassify} onChange={v => setAiPrefs(p => ({ ...p, autoClassify: v }))} />
              </SettingRow>
              <SettingRow label="Show confidence scores" desc="Display AI confidence percentage on inbox items">
                <Toggle checked={aiPrefs.showConfidence} onChange={v => setAiPrefs(p => ({ ...p, showConfidence: v }))} />
              </SettingRow>
              <div className="py-4">
                <div className="text-sm text-slate-700 mb-1">Confidence threshold: {confidenceThreshold}%</div>
                <div className="text-xs text-slate-400 mb-3">Items below this score will be flagged for review</div>
                <input type="range" min={50} max={95} value={confidenceThreshold} onChange={e => setConfidenceThreshold(Number(e.target.value))}
                  className="w-full accent-indigo-600" />
              </div>
              <div className="py-4 border-t border-slate-100">
                <div className="text-sm text-slate-700 mb-3">Scheduling mode</div>
                <div className="flex gap-2">
                  {[{ id: 'auto', label: 'Auto' }, { id: 'semi-auto', label: 'Semi-auto' }, { id: 'manual', label: 'Manual' }].map(mode => (
                    <button key={mode.id} onClick={() => setSchedulingMode(mode.id)}
                      className={cn('flex-1 py-2 rounded-xl text-sm transition-all font-medium',
                        schedulingMode === mode.id
                          ? 'bg-indigo-600 text-white'
                          : 'bg-slate-100 text-slate-600 hover:bg-slate-200')}>
                      {mode.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {activeSection === 'calendar' && (
            <div className="space-y-2">
              <h2 className="text-base font-semibold text-slate-800 mb-4">Calendar Rules</h2>
              <SettingRow label="Sync deadlines to calendar">
                <Toggle checked={calRules.syncDeadlines} onChange={v => setCalRules(p => ({ ...p, syncDeadlines: v }))} />
              </SettingRow>
              <SettingRow label="Add buffer before classes" desc="15-min prep block added automatically">
                <Toggle checked={calRules.addBuffer} onChange={v => setCalRules(p => ({ ...p, addBuffer: v }))} />
              </SettingRow>
              <SettingRow label="No deep work after 9 PM" desc="AI won't schedule focus tasks late at night">
                <Toggle checked={calRules.noDeepWorkLate} onChange={v => setCalRules(p => ({ ...p, noDeepWorkLate: v }))} />
              </SettingRow>
              <SettingRow label="Protected time: Sundays" desc="No tasks or events scheduled on Sundays">
                <Toggle checked={calRules.protectedSunday} onChange={v => setCalRules(p => ({ ...p, protectedSunday: v }))} />
              </SettingRow>
            </div>
          )}

          {activeSection === 'notifications' && (
            <div className="space-y-2">
              <h2 className="text-base font-semibold text-slate-800 mb-4">Notifications</h2>
              <SettingRow label="Deadline reminders" desc="Notify 24 hours before deadline">
                <Toggle checked={notifPrefs.deadlineReminders} onChange={v => setNotifPrefs(p => ({ ...p, deadlineReminders: v }))} />
              </SettingRow>
              <SettingRow label="Daily planning reminder" desc="8:00 AM every morning">
                <Toggle checked={notifPrefs.dailyPlanning} onChange={v => setNotifPrefs(p => ({ ...p, dailyPlanning: v }))} />
              </SettingRow>
              <SettingRow label="Weekly review reminder" desc="Sundays at 6:00 PM">
                <Toggle checked={notifPrefs.weeklyReview} onChange={v => setNotifPrefs(p => ({ ...p, weeklyReview: v }))} />
              </SettingRow>
              <SettingRow label="Overdue task alerts">
                <Toggle checked={notifPrefs.overdueTasks} onChange={v => setNotifPrefs(p => ({ ...p, overdueTasks: v }))} />
              </SettingRow>
              <SettingRow label="Drive file updates" desc="When new files are detected or classified">
                <Toggle checked={notifPrefs.driveUpdates} onChange={v => setNotifPrefs(p => ({ ...p, driveUpdates: v }))} />
              </SettingRow>
            </div>
          )}

          {activeSection === 'privacy' && (
            <div className="space-y-6">
              <h2 className="text-base font-semibold text-slate-800">Privacy & Permissions</h2>

              {/* Drive permission */}
              <div className="space-y-2">
                <div className="text-sm font-medium text-slate-700">Drive permission level</div>
                {[
                  { id: 'basic', label: 'Basic', desc: 'File names and folders only' },
                  { id: 'smart', label: 'Smart', desc: 'Read content for summaries and search' },
                  { id: 'full', label: 'Full Organization', desc: 'Create folders with your permission' },
                ].map(p => (
                  <button key={p.id} onClick={() => setDrivePermission(p.id)}
                    className={cn('w-full flex items-center gap-3 p-3 rounded-xl border text-left transition-all',
                      drivePermission === p.id
                        ? 'border-indigo-400 bg-indigo-50'
                        : 'border-slate-200 bg-white hover:border-indigo-300 hover:bg-indigo-50/50')}>
                    <div className={cn('w-3 h-3 rounded-full border-2 flex-shrink-0',
                      drivePermission === p.id ? 'bg-indigo-600 border-indigo-600' : 'border-slate-300')} />
                    <div>
                      <div className="text-sm text-slate-700 font-medium">{p.label}</div>
                      <div className="text-xs text-slate-400">{p.desc}</div>
                    </div>
                  </button>
                ))}
              </div>

              {/* AI data explanation */}
              <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-500 leading-relaxed space-y-2">
                <div className="font-medium text-slate-700">AI Data Usage</div>
                <p>Your data is processed securely and is never stored by third-party AI systems permanently. When connected to an AI API, content is transmitted over encrypted connections and is not used for model training.</p>
                <p>All extracted data stays in your Nexus database and is only accessible by you.</p>
              </div>

              {/* Danger zone */}
              <div className="space-y-3 border-t border-slate-200 pt-5">
                <div className="text-sm font-medium text-slate-700">Data Management</div>
                <div className="flex gap-3">
                  <button className="flex items-center gap-2 px-4 py-2.5 border border-slate-200 bg-slate-50 text-slate-600 hover:text-slate-800 hover:bg-slate-100 rounded-xl text-sm transition-all">
                    <Download size={14} /> Export my data
                  </button>
                  {!showDeleteConfirm ? (
                    <button onClick={() => setShowDeleteConfirm(true)}
                      className="flex items-center gap-2 px-4 py-2.5 border border-red-200 text-red-600 hover:bg-red-50 rounded-xl text-sm transition-all">
                      <Trash2 size={14} /> Delete account
                    </button>
                  ) : (
                    <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-xl">
                      <span className="text-xs text-red-600">Are you sure? This cannot be undone.</span>
                      <button onClick={() => setShowDeleteConfirm(false)} className="text-xs text-slate-500 hover:text-slate-700 px-2 py-1 rounded transition-colors">Cancel</button>
                      <button className="text-xs px-3 py-1 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-all">Delete</button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
