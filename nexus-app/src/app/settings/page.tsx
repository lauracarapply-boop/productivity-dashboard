'use client'

import { useState, useEffect, useCallback } from 'react'
import {
  Settings, User, Link2, Bot, Calendar, Bell, Shield, Trash2,
  Check, Download, RefreshCw, AlertCircle, ExternalLink, X,
  Loader2, CheckCircle, GraduationCap, Mail, CalendarDays,
} from 'lucide-react'
import { mockUser } from '@/lib/mock-data'
import { cn } from '@/lib/utils'

const NAV_ITEMS = [
  { id: 'account',       label: 'Account',            icon: User },
  { id: 'integrations',  label: 'Integrations',        icon: Link2 },
  { id: 'ai',            label: 'AI Preferences',      icon: Bot },
  { id: 'calendar',      label: 'Calendar Rules',      icon: Calendar },
  { id: 'notifications', label: 'Notifications',       icon: Bell },
  { id: 'privacy',       label: 'Privacy & Data',      icon: Shield },
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

// ── Google Integration ──────────────────────────────────────────

interface GoogleStatus {
  connected: boolean
  email: string | null
  name: string | null
}

function GoogleIntegration() {
  const [status, setStatus] = useState<GoogleStatus | null>(null)
  const [loading, setLoading] = useState(true)
  const [disconnecting, setDisconnecting] = useState(false)
  const [urlParams, setUrlParams] = useState<{ integration: string | null; status: string | null }>({ integration: null, status: null })

  const fetchStatus = useCallback(async () => {
    try {
      const res = await fetch('/api/auth/google/status')
      const data = await res.json()
      setStatus(data)
    } catch {
      setStatus({ connected: false, email: null, name: null })
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchStatus()
    const sp = new URLSearchParams(window.location.search)
    setUrlParams({ integration: sp.get('integration'), status: sp.get('status') })
  }, [fetchStatus])

  const justConnected = urlParams.integration === 'google' && urlParams.status === 'connected'
  const connectError = urlParams.integration === 'google' && urlParams.status !== 'connected' && urlParams.status !== null

  async function disconnect() {
    setDisconnecting(true)
    await fetch('/api/auth/google/disconnect', { method: 'POST' })
    setStatus({ connected: false, email: null, name: null })
    setDisconnecting(false)
  }

  const isConfigured = true // show connect button regardless; API route handles missing env vars

  return (
    <div className="bg-white border border-black/[0.08] rounded-2xl overflow-hidden">
      {/* Header */}
      <div className="flex items-center gap-4 p-5 border-b border-slate-100">
        <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-100 flex items-center justify-center text-2xl flex-shrink-0">
          🔵
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <h3 className="text-sm font-semibold text-slate-800">Google Account</h3>
            {(loading ? false : status?.connected) && (
              <span className="flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 bg-emerald-100 text-emerald-700 rounded-full">
                <CheckCircle size={9} /> Connected
              </span>
            )}
          </div>
          <p className="text-xs text-slate-500 mt-0.5">Google Calendar + Gmail — one sign-in connects both</p>
        </div>
        <div className="flex-shrink-0">
          {loading ? (
            <Loader2 size={16} className="animate-spin text-slate-400" />
          ) : status?.connected ? (
            <button onClick={disconnect} disabled={disconnecting}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-red-600 border border-red-200 hover:bg-red-50 rounded-lg transition-all">
              {disconnecting ? <Loader2 size={11} className="animate-spin" /> : <X size={11} />}
              Disconnect
            </button>
          ) : (
            <a href="/api/auth/google"
              className="flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white rounded-lg bg-[#4285F4] hover:bg-[#3367D6] transition-all shadow-sm">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#fff" opacity=".8"/>
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#fff" opacity=".8"/>
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#fff" opacity=".8"/>
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#fff" opacity=".8"/>
              </svg>
              Sign in with Google
            </a>
          )}
        </div>
      </div>

      {/* Connected info */}
      {status?.connected && (
        <div className="px-5 py-4 bg-emerald-50/50 border-b border-emerald-100">
          <div className="flex items-center gap-2 text-sm text-slate-700">
            <CheckCircle size={14} className="text-emerald-600 flex-shrink-0" />
            <span>Signed in as <strong>{status.email}</strong></span>
          </div>
          <div className="flex items-center gap-4 mt-3">
            <div className="flex items-center gap-2 text-xs text-slate-600 bg-white border border-slate-200 px-2.5 py-1.5 rounded-lg">
              <CalendarDays size={12} className="text-blue-500" />
              Google Calendar synced
            </div>
            <div className="flex items-center gap-2 text-xs text-slate-600 bg-white border border-slate-200 px-2.5 py-1.5 rounded-lg">
              <Mail size={12} className="text-red-500" />
              Gmail synced
            </div>
          </div>
        </div>
      )}

      {/* Error/success banners */}
      {justConnected && !status?.connected && (
        <div className="px-5 py-3 bg-emerald-50 flex items-center gap-2 text-xs text-emerald-700">
          <CheckCircle size={13} /> Successfully connected to Google!
        </div>
      )}
      {connectError && (
        <div className="px-5 py-3 bg-red-50 flex items-center gap-2 text-xs text-red-600">
          <AlertCircle size={13} />
          Connection failed ({urlParams.status}). Check that GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET, and GOOGLE_REDIRECT_URI are set in Vercel.
        </div>
      )}

      {/* Setup instructions when not connected */}
      {!loading && !status?.connected && (
        <div className="p-5">
          <p className="text-xs font-semibold text-slate-600 mb-3">Setup required — one-time steps:</p>
          <ol className="space-y-2 text-xs text-slate-500">
            <li className="flex gap-2"><span className="font-bold text-slate-600 flex-shrink-0">1.</span>Go to <a href="https://console.cloud.google.com/" target="_blank" rel="noopener" className="text-indigo-600 hover:underline inline-flex items-center gap-0.5">Google Cloud Console <ExternalLink size={9} /></a>, create a project, enable Calendar API and Gmail API.</li>
            <li className="flex gap-2"><span className="font-bold text-slate-600 flex-shrink-0">2.</span>Create OAuth 2.0 credentials (Web application). Add your Vercel URL + <code className="bg-slate-100 px-1 rounded">/api/auth/google/callback</code> as Authorized redirect URI.</li>
            <li className="flex gap-2"><span className="font-bold text-slate-600 flex-shrink-0">3.</span>In Vercel → Settings → Environment Variables, add <code className="bg-slate-100 px-1 rounded">GOOGLE_CLIENT_ID</code>, <code className="bg-slate-100 px-1 rounded">GOOGLE_CLIENT_SECRET</code>, and <code className="bg-slate-100 px-1 rounded">GOOGLE_REDIRECT_URI</code>.</li>
            <li className="flex gap-2"><span className="font-bold text-slate-600 flex-shrink-0">4.</span>Redeploy and click "Sign in with Google" above.</li>
          </ol>
        </div>
      )}
    </div>
  )
}

// ── Canvas Integration ──────────────────────────────────────────

function CanvasIntegration() {
  const [canvasUrl, setCanvasUrl] = useState(() => typeof window !== 'undefined' ? localStorage.getItem('canvas_url') ?? '' : '')
  const [canvasToken, setCanvasToken] = useState(() => typeof window !== 'undefined' ? localStorage.getItem('canvas_token') ?? '' : '')
  const [testing, setTesting] = useState(false)
  const [testResult, setTestResult] = useState<'success' | 'error' | null>(null)
  const [testMessage, setTestMessage] = useState('')
  const [saved, setSaved] = useState(false)

  const isConnected = !!(canvasUrl && canvasToken && testResult === 'success')

  async function testConnection() {
    if (!canvasUrl || !canvasToken) return
    setTesting(true)
    setTestResult(null)
    try {
      const url = new URL('/api/canvas', window.location.origin)
      url.searchParams.set('url', canvasUrl)
      url.searchParams.set('token', canvasToken)
      url.searchParams.set('endpoint', '/api/v1/courses?enrollment_state=active&per_page=5')
      const res = await fetch(url.toString())
      if (res.ok) {
        const data = await res.json()
        const count = Array.isArray(data) ? data.length : 0
        setTestResult('success')
        setTestMessage(`Connected! Found ${count} active course${count !== 1 ? 's' : ''}.`)
      } else {
        setTestResult('error')
        setTestMessage(`Canvas returned ${res.status}. Check your URL and API token.`)
      }
    } catch {
      setTestResult('error')
      setTestMessage('Could not reach Canvas. Check the URL.')
    } finally {
      setTesting(false)
    }
  }

  function save() {
    localStorage.setItem('canvas_url', canvasUrl)
    localStorage.setItem('canvas_token', canvasToken)
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  function disconnect() {
    localStorage.removeItem('canvas_url')
    localStorage.removeItem('canvas_token')
    setCanvasUrl('')
    setCanvasToken('')
    setTestResult(null)
  }

  return (
    <div className="bg-white border border-black/[0.08] rounded-2xl overflow-hidden">
      <div className="flex items-center gap-4 p-5 border-b border-slate-100">
        <div className="w-12 h-12 rounded-2xl bg-red-50 border border-red-100 flex items-center justify-center text-2xl flex-shrink-0">
          🎓
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <h3 className="text-sm font-semibold text-slate-800">Canvas LMS</h3>
            {isConnected && (
              <span className="flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 bg-emerald-100 text-emerald-700 rounded-full">
                <CheckCircle size={9} /> Connected
              </span>
            )}
          </div>
          <p className="text-xs text-slate-500 mt-0.5">Courses, assignments, grades, and deadlines</p>
        </div>
        {isConnected && (
          <button onClick={disconnect} className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-red-600 border border-red-200 hover:bg-red-50 rounded-lg transition-all flex-shrink-0">
            <X size={11} /> Disconnect
          </button>
        )}
      </div>

      <div className="p-5 space-y-4">
        <div>
          <label className="block text-xs font-medium text-slate-600 mb-1.5">Canvas Institution URL</label>
          <input
            type="url"
            value={canvasUrl}
            onChange={e => setCanvasUrl(e.target.value)}
            placeholder="https://youruniversity.instructure.com"
            className="w-full px-3 py-2.5 border border-black/[0.12] rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300 font-mono text-slate-700"
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-slate-600 mb-1.5">
            Canvas API Token
            <a href="#canvas-token-help" className="ml-1.5 text-indigo-500 hover:underline font-normal">How to get this?</a>
          </label>
          <input
            type="password"
            value={canvasToken}
            onChange={e => setCanvasToken(e.target.value)}
            placeholder="Canvas API access token"
            className="w-full px-3 py-2.5 border border-black/[0.12] rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300 font-mono text-slate-700"
          />
        </div>

        {testResult === 'success' && (
          <div className="flex items-center gap-2 p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-700">
            <CheckCircle size={13} /> {testMessage}
          </div>
        )}
        {testResult === 'error' && (
          <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-xl text-xs text-red-600">
            <AlertCircle size={13} /> {testMessage}
          </div>
        )}

        <div className="flex items-center gap-2">
          <button
            onClick={testConnection}
            disabled={testing || !canvasUrl || !canvasToken}
            className="flex items-center gap-2 px-4 py-2 border border-black/[0.12] rounded-xl text-sm font-medium text-slate-600 hover:bg-slate-50 disabled:opacity-50 transition-all"
          >
            {testing ? <Loader2 size={13} className="animate-spin" /> : <RefreshCw size={13} />}
            Test Connection
          </button>
          <button
            onClick={save}
            disabled={!canvasUrl || !canvasToken}
            className={cn(
              'flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all disabled:opacity-50',
              saved ? 'bg-emerald-500 text-white' : 'bg-indigo-600 hover:bg-indigo-700 text-white'
            )}
          >
            {saved ? <><Check size={13} /> Saved!</> : 'Save'}
          </button>
        </div>

        <details id="canvas-token-help" className="text-xs text-slate-500">
          <summary className="cursor-pointer font-medium text-slate-600 hover:text-slate-800 transition-colors">
            How to get a Canvas API token
          </summary>
          <ol className="mt-2 space-y-1.5 pl-4">
            <li>1. Log in to your Canvas account</li>
            <li>2. Go to <strong>Account → Settings</strong> (top-left menu)</li>
            <li>3. Scroll to <strong>Approved Integrations</strong></li>
            <li>4. Click <strong>+ New Access Token</strong></li>
            <li>5. Enter a purpose (e.g. "Nexus Dashboard") and click Generate</li>
            <li>6. Copy the token and paste it above</li>
          </ol>
        </details>
      </div>
    </div>
  )
}

// ── Calendar iCal Integration ───────────────────────────────────

function OutlookCalendarIntegration() {
  const [icalUrl, setIcalUrl] = useState(() => typeof window !== 'undefined' ? localStorage.getItem('outlook_ical_url') ?? '' : '')
  const [saved, setSaved] = useState(false)
  const isConnected = !!icalUrl

  function save() {
    localStorage.setItem('outlook_ical_url', icalUrl)
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  function disconnect() {
    localStorage.removeItem('outlook_ical_url')
    setIcalUrl('')
  }

  return (
    <div className="bg-white border border-black/[0.08] rounded-2xl overflow-hidden">
      <div className="flex items-center gap-4 p-5 border-b border-slate-100">
        <div className="w-12 h-12 rounded-2xl bg-blue-50 border border-blue-100 flex items-center justify-center text-2xl flex-shrink-0">
          📅
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <h3 className="text-sm font-semibold text-slate-800">Outlook / iCal Calendar</h3>
            {isConnected && (
              <span className="flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 bg-emerald-100 text-emerald-700 rounded-full">
                <CheckCircle size={9} /> Connected
              </span>
            )}
          </div>
          <p className="text-xs text-slate-500 mt-0.5">Import any calendar via iCal subscription URL (Outlook, Apple, etc.)</p>
        </div>
        {isConnected && (
          <button onClick={disconnect} className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-red-600 border border-red-200 hover:bg-red-50 rounded-lg transition-all flex-shrink-0">
            <X size={11} /> Remove
          </button>
        )}
      </div>

      <div className="p-5 space-y-4">
        <div>
          <label className="block text-xs font-medium text-slate-600 mb-1.5">iCal Subscription URL</label>
          <input
            type="url"
            value={icalUrl}
            onChange={e => setIcalUrl(e.target.value)}
            placeholder="https://outlook.live.com/owa/calendar/.../reachcalendar.ics"
            className="w-full px-3 py-2.5 border border-black/[0.12] rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300 font-mono text-slate-700"
          />
        </div>
        <button
          onClick={save}
          disabled={!icalUrl}
          className={cn(
            'flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all disabled:opacity-50',
            saved ? 'bg-emerald-500 text-white' : 'bg-indigo-600 hover:bg-indigo-700 text-white'
          )}
        >
          {saved ? <><Check size={13} /> Saved!</> : 'Save URL'}
        </button>
        <p className="text-xs text-slate-400">
          In Outlook: Calendar → Share → Publish → Copy ICS link. In Apple Calendar: right-click calendar → Get Info → copy URL.
        </p>
      </div>
    </div>
  )
}

// ── Main Settings Page ──────────────────────────────────────────

export default function SettingsPage() {
  const [activeSection, setActiveSection] = useState<SectionId>('account')
  const [name, setName] = useState(mockUser.name)
  const [email, setEmail] = useState(mockUser.email)
  const [university, setUniversity] = useState('')
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
        <div className="flex-1 min-w-0">

          {/* ── ACCOUNT ── */}
          {activeSection === 'account' && (
            <div className="bg-white border border-black/[0.07] rounded-2xl p-6 shadow-sm space-y-6">
              <h2 className="text-base font-semibold text-slate-800">Account</h2>
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-2xl flex items-center justify-center text-2xl font-bold text-white flex-shrink-0"
                  style={{ background: 'linear-gradient(135deg, #3F5F5A, #274743)' }}>
                  {name[0]}
                </div>
                <div>
                  <div className="text-sm font-medium text-slate-800">{name}</div>
                  <div className="text-xs text-slate-400">{email}</div>
                </div>
              </div>
              <div className="space-y-4">
                {[
                  { label: 'Full name', value: name, setter: setName, placeholder: 'Your Name' },
                  { label: 'Email address', value: email, setter: setEmail, placeholder: 'your@email.com' },
                  { label: 'University / Institution', value: university, setter: setUniversity, placeholder: 'e.g. State University' },
                ].map(field => (
                  <div key={field.label} className="space-y-1">
                    <label className="text-xs text-slate-500">{field.label}</label>
                    <input value={field.value} onChange={e => field.setter(e.target.value)}
                      placeholder={field.placeholder}
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

          {/* ── INTEGRATIONS ── */}
          {activeSection === 'integrations' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-base font-semibold text-slate-800">Integrations</h2>
                  <p className="text-xs text-slate-500 mt-0.5">Connect your services to sync data automatically</p>
                </div>
              </div>

              <GoogleIntegration />
              <CanvasIntegration />
              <OutlookCalendarIntegration />

              {/* Coming soon */}
              <div className="bg-white border border-black/[0.08] rounded-2xl p-5">
                <h3 className="text-sm font-semibold text-slate-700 mb-3">More integrations coming soon</h3>
                <div className="grid grid-cols-3 gap-3">
                  {[
                    { icon: '📁', name: 'Google Drive' },
                    { icon: '💼', name: 'Microsoft Teams' },
                    { icon: '🤝', name: 'Handshake' },
                    { icon: '📱', name: 'Notion' },
                    { icon: '🔔', name: 'Slack' },
                    { icon: '📊', name: 'Gradescope' },
                  ].map(s => (
                    <div key={s.name} className="flex items-center gap-2 p-3 bg-slate-50 border border-slate-200 rounded-xl opacity-60">
                      <span className="text-base">{s.icon}</span>
                      <span className="text-xs font-medium text-slate-600">{s.name}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* ── AI PREFERENCES ── */}
          {activeSection === 'ai' && (
            <div className="bg-white border border-black/[0.07] rounded-2xl p-6 shadow-sm space-y-2">
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
                        schedulingMode === mode.id ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200')}>
                      {mode.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* ── CALENDAR RULES ── */}
          {activeSection === 'calendar' && (
            <div className="bg-white border border-black/[0.07] rounded-2xl p-6 shadow-sm space-y-2">
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

          {/* ── NOTIFICATIONS ── */}
          {activeSection === 'notifications' && (
            <div className="bg-white border border-black/[0.07] rounded-2xl p-6 shadow-sm space-y-2">
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

          {/* ── PRIVACY ── */}
          {activeSection === 'privacy' && (
            <div className="bg-white border border-black/[0.07] rounded-2xl p-6 shadow-sm space-y-6">
              <h2 className="text-base font-semibold text-slate-800">Privacy & Data</h2>

              <div className="space-y-2">
                <div className="text-sm font-medium text-slate-700">Drive permission level</div>
                {[
                  { id: 'basic', label: 'Basic', desc: 'File names and folders only' },
                  { id: 'smart', label: 'Smart', desc: 'Read content for summaries and search' },
                  { id: 'full', label: 'Full Organization', desc: 'Create folders with your permission' },
                ].map(p => (
                  <button key={p.id} onClick={() => setDrivePermission(p.id)}
                    className={cn('w-full flex items-center gap-3 p-3 rounded-xl border text-left transition-all',
                      drivePermission === p.id ? 'border-indigo-400 bg-indigo-50' : 'border-slate-200 bg-white hover:border-indigo-300 hover:bg-indigo-50/50')}>
                    <div className={cn('w-3 h-3 rounded-full border-2 flex-shrink-0',
                      drivePermission === p.id ? 'bg-indigo-600 border-indigo-600' : 'border-slate-300')} />
                    <div>
                      <div className="text-sm text-slate-700 font-medium">{p.label}</div>
                      <div className="text-xs text-slate-400">{p.desc}</div>
                    </div>
                  </button>
                ))}
              </div>

              <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-500 leading-relaxed space-y-2">
                <div className="font-medium text-slate-700">AI Data Usage</div>
                <p>Your data is processed securely and is never stored by third-party AI systems permanently. Content is transmitted over encrypted connections and is not used for model training.</p>
                <p>All extracted data stays in your Nexus database and is only accessible by you.</p>
              </div>

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
