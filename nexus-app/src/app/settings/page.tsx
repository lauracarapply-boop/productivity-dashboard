'use client'

import { useState, useEffect, useCallback, createContext, useContext } from 'react'
import {
  Settings, User, Link2, Bot, Calendar, Bell, Shield, Trash2,
  Check, Download, RefreshCw, AlertCircle, ExternalLink, X,
  Loader2, CheckCircle, Mail, CalendarDays, HardDrive,
} from 'lucide-react'
import { mockUser } from '@/lib/mock-data'
import { cn } from '@/lib/utils'

// ── Integration DB sync ────────────────────────────────────────
// Keys stored: canvas_url, canvas_token, notion_token, slack_token, ical_url, handshake_url, gradescope_url

const INTEGRATION_KEYS = ['canvas_url','canvas_token','notion_token','slack_token','ical_url','handshake_url','gradescope_url'] as const
type IntegrationKey = typeof INTEGRATION_KEYS[number]

const IntegrationsCtx = createContext<{
  get: (k: IntegrationKey) => string
  save: (k: IntegrationKey, v: string) => Promise<void>
  remove: (k: IntegrationKey) => Promise<void>
}>({ get: () => '', save: async () => {}, remove: async () => {} })

function IntegrationsProvider({ children }: { children: React.ReactNode }) {
  const [data, setData] = useState<Record<string, string>>({})

  useEffect(() => {
    // Seed from localStorage immediately
    const local: Record<string, string> = {}
    INTEGRATION_KEYS.forEach(k => { local[k] = localStorage.getItem(k) ?? '' })
    setData(local)

    // Then fetch from DB and override
    fetch('/api/integrations').then(r => r.json()).then(db => {
      if (!db || db.error) return
      const merged: Record<string, string> = { ...local }
      INTEGRATION_KEYS.forEach(k => {
        if (db[k]) {
          merged[k] = db[k]
          localStorage.setItem(k, db[k]) // keep localStorage in sync
        }
      })
      setData(merged)
    }).catch(() => {})
  }, [])

  function get(k: IntegrationKey) { return data[k] ?? '' }

  async function save(k: IntegrationKey, v: string) {
    localStorage.setItem(k, v)
    setData(d => ({ ...d, [k]: v }))
    await fetch('/api/integrations', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ [k]: v }),
    }).catch(() => {})
  }

  async function remove(k: IntegrationKey) {
    localStorage.removeItem(k)
    setData(d => ({ ...d, [k]: '' }))
    await fetch('/api/integrations', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ [k]: null }),
    }).catch(() => {})
  }

  return <IntegrationsCtx.Provider value={{ get, save, remove }}>{children}</IntegrationsCtx.Provider>
}

function useIntegrations() { return useContext(IntegrationsCtx) }

const NAV_ITEMS = [
  { id: 'account',       label: 'Account',         icon: User },
  { id: 'integrations',  label: 'Integrations',     icon: Link2 },
  { id: 'ai',            label: 'AI Preferences',   icon: Bot },
  { id: 'calendar',      label: 'Calendar Rules',   icon: Calendar },
  { id: 'notifications', label: 'Notifications',    icon: Bell },
  { id: 'privacy',       label: 'Privacy & Data',   icon: Shield },
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

// ── Shared helpers ──────────────────────────────────────────────

function ConnectedBadge() {
  return (
    <span className="flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 bg-emerald-100 text-emerald-700 rounded-full flex-shrink-0">
      <CheckCircle size={9} /> Connected
    </span>
  )
}

function DisconnectButton({ onClick, loading }: { onClick: () => void; loading?: boolean }) {
  return (
    <button onClick={onClick} disabled={loading}
      className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-red-600 border border-red-200 hover:bg-red-50 rounded-lg transition-all flex-shrink-0">
      {loading ? <Loader2 size={11} className="animate-spin" /> : <X size={11} />}
      Disconnect
    </button>
  )
}

function TokenInput({
  label, value, onChange, placeholder, type = 'password', helpUrl, helpText,
}: {
  label: string; value: string; onChange: (v: string) => void
  placeholder: string; type?: string; helpUrl?: string; helpText?: string
}) {
  return (
    <div>
      <div className="flex items-center gap-2 mb-1.5">
        <label className="text-xs font-medium text-slate-600">{label}</label>
        {helpUrl && (
          <a href={helpUrl} target="_blank" rel="noopener"
            className="text-[11px] text-indigo-500 hover:underline flex items-center gap-0.5">
            How to get this <ExternalLink size={9} />
          </a>
        )}
      </div>
      <input type={type} value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder}
        className="w-full px-3 py-2.5 border border-black/[0.12] rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300 font-mono text-slate-700" />
      {helpText && <p className="text-[11px] text-slate-400 mt-1">{helpText}</p>}
    </div>
  )
}

function TestResult({ result, message }: { result: 'success' | 'error' | null; message: string }) {
  if (!result) return null
  return (
    <div className={cn('flex items-center gap-2 p-3 rounded-xl text-xs',
      result === 'success' ? 'bg-emerald-50 border border-emerald-200 text-emerald-700' : 'bg-red-50 border border-red-200 text-red-600')}>
      {result === 'success' ? <CheckCircle size={13} /> : <AlertCircle size={13} />}
      {message}
    </div>
  )
}

// ── Google (Calendar + Gmail + Drive) ──────────────────────────

function GoogleIntegration() {
  const [status, setStatus] = useState<{ connected: boolean; email: string | null; name: string | null } | null>(null)
  const [loading, setLoading] = useState(true)
  const [disconnecting, setDisconnecting] = useState(false)
  const [urlStatus, setUrlStatus] = useState<{ integration: string | null; status: string | null }>({ integration: null, status: null })

  const fetchStatus = useCallback(async () => {
    try {
      const res = await fetch('/api/auth/google/status')
      setStatus(await res.json())
    } catch { setStatus({ connected: false, email: null, name: null }) }
    finally { setLoading(false) }
  }, [])

  useEffect(() => {
    fetchStatus()
    const sp = new URLSearchParams(window.location.search)
    setUrlStatus({ integration: sp.get('integration'), status: sp.get('status') })
  }, [fetchStatus])

  const isError = urlStatus.integration === 'google' && urlStatus.status && urlStatus.status !== 'connected'

  async function disconnect() {
    setDisconnecting(true)
    await fetch('/api/auth/google/disconnect', { method: 'POST' })
    setStatus({ connected: false, email: null, name: null })
    setDisconnecting(false)
  }

  return (
    <div className="bg-white border border-black/[0.08] rounded-2xl overflow-hidden">
      <div className="flex items-center gap-4 p-5 border-b border-slate-100">
        <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-100 flex items-center justify-center text-xl flex-shrink-0">🔵</div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <h3 className="text-sm font-semibold text-slate-800">Google Account</h3>
            {!loading && status?.connected && <ConnectedBadge />}
          </div>
          <p className="text-xs text-slate-500 mt-0.5">Google Calendar · Gmail · Google Drive — one sign-in</p>
        </div>
        {loading ? <Loader2 size={16} className="animate-spin text-slate-400 flex-shrink-0" />
          : status?.connected ? <DisconnectButton onClick={disconnect} loading={disconnecting} />
          : (
            <a href="/api/auth/google"
              className="flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white rounded-lg bg-[#4285F4] hover:bg-[#3367D6] transition-all shadow-sm flex-shrink-0">
              Sign in with Google
            </a>
          )}
      </div>

      {status?.connected && (
        <div className="px-5 py-4 bg-emerald-50/50">
          <p className="text-xs text-slate-600 mb-2">Signed in as <strong>{status.email}</strong></p>
          <div className="flex flex-wrap gap-2">
            {[
              { icon: CalendarDays, label: 'Google Calendar', color: 'text-blue-500' },
              { icon: Mail, label: 'Gmail', color: 'text-red-500' },
              { icon: HardDrive, label: 'Google Drive', color: 'text-green-600' },
            ].map(({ icon: Icon, label, color }) => (
              <div key={label} className="flex items-center gap-1.5 text-xs text-slate-600 bg-white border border-slate-200 px-2.5 py-1.5 rounded-lg">
                <Icon size={12} className={color} /> {label}
              </div>
            ))}
          </div>
        </div>
      )}

      {isError && (
        <div className="px-5 py-3 bg-red-50 flex items-center gap-2 text-xs text-red-600">
          <AlertCircle size={13} />
          Connection failed ({urlStatus.status}). Verify GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET, GOOGLE_REDIRECT_URI in Vercel.
        </div>
      )}

      {!loading && !status?.connected && (
        <details className="p-5">
          <summary className="text-xs font-semibold text-slate-600 cursor-pointer hover:text-slate-800">Setup instructions (one-time)</summary>
          <ol className="mt-3 space-y-2 text-xs text-slate-500">
            <li className="flex gap-2"><span className="font-bold text-slate-600 flex-shrink-0">1.</span><span>Go to <a href="https://console.cloud.google.com/" target="_blank" rel="noopener" className="text-indigo-600 hover:underline">console.cloud.google.com</a> → create a project → enable <strong>Calendar API</strong>, <strong>Gmail API</strong>, and <strong>Drive API</strong>.</span></li>
            <li className="flex gap-2"><span className="font-bold text-slate-600 flex-shrink-0">2.</span><span>Create OAuth credentials (Web app). Set redirect URI to <code className="bg-slate-100 px-1 rounded">https://your-app.vercel.app/api/auth/google/callback</code></span></li>
            <li className="flex gap-2"><span className="font-bold text-slate-600 flex-shrink-0">3.</span><span>Add <code className="bg-slate-100 px-1 rounded">GOOGLE_CLIENT_ID</code>, <code className="bg-slate-100 px-1 rounded">GOOGLE_CLIENT_SECRET</code>, <code className="bg-slate-100 px-1 rounded">GOOGLE_REDIRECT_URI</code> to Vercel environment variables.</span></li>
            <li className="flex gap-2"><span className="font-bold text-slate-600 flex-shrink-0">4.</span><span>Redeploy on Vercel, then click <strong>Sign in with Google</strong>.</span></li>
          </ol>
        </details>
      )}
    </div>
  )
}

// ── Microsoft 365 (Outlook + Teams + OneDrive) ─────────────────

function MicrosoftIntegration() {
  const [status, setStatus] = useState<{ connected: boolean; email: string | null; name: string | null } | null>(null)
  const [loading, setLoading] = useState(true)
  const [disconnecting, setDisconnecting] = useState(false)
  const [urlStatus, setUrlStatus] = useState<{ integration: string | null; status: string | null }>({ integration: null, status: null })

  const fetchStatus = useCallback(async () => {
    try {
      const res = await fetch('/api/auth/microsoft/status')
      setStatus(await res.json())
    } catch { setStatus({ connected: false, email: null, name: null }) }
    finally { setLoading(false) }
  }, [])

  useEffect(() => {
    fetchStatus()
    const sp = new URLSearchParams(window.location.search)
    setUrlStatus({ integration: sp.get('integration'), status: sp.get('status') })
  }, [fetchStatus])

  const isError = urlStatus.integration === 'microsoft' && urlStatus.status && urlStatus.status !== 'connected'

  async function disconnect() {
    setDisconnecting(true)
    await fetch('/api/auth/microsoft/disconnect', { method: 'POST' })
    setStatus({ connected: false, email: null, name: null })
    setDisconnecting(false)
  }

  return (
    <div className="bg-white border border-black/[0.08] rounded-2xl overflow-hidden">
      <div className="flex items-center gap-4 p-5 border-b border-slate-100">
        <div className="w-12 h-12 rounded-2xl bg-blue-50 border border-blue-100 flex items-center justify-center text-xl flex-shrink-0">🪟</div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <h3 className="text-sm font-semibold text-slate-800">Microsoft 365</h3>
            {!loading && status?.connected && <ConnectedBadge />}
          </div>
          <p className="text-xs text-slate-500 mt-0.5">Outlook Calendar · Microsoft Teams · OneDrive</p>
        </div>
        {loading ? <Loader2 size={16} className="animate-spin text-slate-400 flex-shrink-0" />
          : status?.connected ? <DisconnectButton onClick={disconnect} loading={disconnecting} />
          : (
            <a href="/api/auth/microsoft"
              className="flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white rounded-lg bg-[#0078D4] hover:bg-[#106EBE] transition-all shadow-sm flex-shrink-0">
              Sign in with Microsoft
            </a>
          )}
      </div>

      {status?.connected && (
        <div className="px-5 py-4 bg-blue-50/30">
          <p className="text-xs text-slate-600 mb-2">Signed in as <strong>{status.email}</strong></p>
          <div className="flex flex-wrap gap-2">
            {['Outlook Calendar', 'Microsoft Teams', 'OneDrive'].map(label => (
              <div key={label} className="text-xs text-slate-600 bg-white border border-slate-200 px-2.5 py-1.5 rounded-lg">{label}</div>
            ))}
          </div>
        </div>
      )}

      {isError && (
        <div className="px-5 py-3 bg-red-50 flex items-center gap-2 text-xs text-red-600">
          <AlertCircle size={13} />
          Connection failed ({urlStatus.status}). Verify MICROSOFT_CLIENT_ID, MICROSOFT_CLIENT_SECRET, MICROSOFT_REDIRECT_URI in Vercel.
        </div>
      )}

      {!loading && !status?.connected && (
        <details className="p-5">
          <summary className="text-xs font-semibold text-slate-600 cursor-pointer hover:text-slate-800">Setup instructions (one-time)</summary>
          <ol className="mt-3 space-y-2 text-xs text-slate-500">
            <li className="flex gap-2"><span className="font-bold text-slate-600 flex-shrink-0">1.</span><span>Go to <a href="https://portal.azure.com" target="_blank" rel="noopener" className="text-indigo-600 hover:underline">portal.azure.com</a> → Azure Active Directory → App registrations → New registration.</span></li>
            <li className="flex gap-2"><span className="font-bold text-slate-600 flex-shrink-0">2.</span><span>Set redirect URI to <code className="bg-slate-100 px-1 rounded">https://your-app.vercel.app/api/auth/microsoft/callback</code> (type: Web).</span></li>
            <li className="flex gap-2"><span className="font-bold text-slate-600 flex-shrink-0">3.</span><span>Under <strong>Certificates & secrets</strong> → create a new Client Secret. Copy the value immediately.</span></li>
            <li className="flex gap-2"><span className="font-bold text-slate-600 flex-shrink-0">4.</span><span>Add <code className="bg-slate-100 px-1 rounded">MICROSOFT_CLIENT_ID</code> (Application ID), <code className="bg-slate-100 px-1 rounded">MICROSOFT_CLIENT_SECRET</code>, and <code className="bg-slate-100 px-1 rounded">MICROSOFT_REDIRECT_URI</code> to Vercel env vars.</span></li>
            <li className="flex gap-2"><span className="font-bold text-slate-600 flex-shrink-0">5.</span><span>Redeploy and click <strong>Sign in with Microsoft</strong>.</span></li>
          </ol>
        </details>
      )}
    </div>
  )
}

// ── Canvas LMS ─────────────────────────────────────────────────

function CanvasIntegration() {
  const db = useIntegrations()
  const [canvasUrl, setCanvasUrl] = useState('')
  const [canvasToken, setCanvasToken] = useState('')
  const [testing, setTesting] = useState(false)
  const [testResult, setTestResult] = useState<'success' | 'error' | null>(null)
  const [testMessage, setTestMessage] = useState('')
  const [saved, setSaved] = useState(false)

  useEffect(() => {
    setCanvasUrl(db.get('canvas_url'))
    setCanvasToken(db.get('canvas_token'))
  }, [db])

  const isConnected = !!(db.get('canvas_url') && db.get('canvas_token'))

  async function testConnection() {
    if (!canvasUrl || !canvasToken) return
    setTesting(true); setTestResult(null)
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
      setTestResult('error'); setTestMessage('Could not reach Canvas. Check the URL.')
    } finally { setTesting(false) }
  }

  async function save() {
    await db.save('canvas_url', canvasUrl)
    await db.save('canvas_token', canvasToken)
    setSaved(true); setTimeout(() => setSaved(false), 2000)
  }

  async function disconnect() {
    await db.remove('canvas_url'); await db.remove('canvas_token')
    setCanvasUrl(''); setCanvasToken(''); setTestResult(null)
  }

  return (
    <div className="bg-white border border-black/[0.08] rounded-2xl overflow-hidden">
      <div className="flex items-center gap-4 p-5 border-b border-slate-100">
        <div className="w-12 h-12 rounded-2xl bg-red-50 border border-red-100 flex items-center justify-center text-xl flex-shrink-0">🎓</div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <h3 className="text-sm font-semibold text-slate-800">Canvas LMS</h3>
            {isConnected && testResult === 'success' && <ConnectedBadge />}
          </div>
          <p className="text-xs text-slate-500 mt-0.5">Courses, assignments, grades, and deadlines</p>
        </div>
        {isConnected && <DisconnectButton onClick={disconnect} />}
      </div>
      <div className="p-5 space-y-4">
        <TokenInput label="Canvas Institution URL" value={canvasUrl} onChange={setCanvasUrl}
          placeholder="https://youruniversity.instructure.com" type="url" />
        <TokenInput label="Canvas API Token" value={canvasToken} onChange={setCanvasToken}
          placeholder="Canvas API access token"
          helpText="Account → Settings → Approved Integrations → New Access Token" />
        <TestResult result={testResult} message={testMessage} />
        <div className="flex gap-2">
          <button onClick={testConnection} disabled={testing || !canvasUrl || !canvasToken}
            className="flex items-center gap-2 px-4 py-2 border border-black/[0.12] rounded-xl text-sm font-medium text-slate-600 hover:bg-slate-50 disabled:opacity-50 transition-all">
            {testing ? <Loader2 size={13} className="animate-spin" /> : <RefreshCw size={13} />}
            Test Connection
          </button>
          <button onClick={save} disabled={!canvasUrl || !canvasToken}
            className={cn('flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all disabled:opacity-50',
              saved ? 'bg-emerald-500 text-white' : 'bg-indigo-600 hover:bg-indigo-700 text-white')}>
            {saved ? <><Check size={13} /> Saved!</> : 'Save'}
          </button>
        </div>
      </div>
    </div>
  )
}

// ── Notion ─────────────────────────────────────────────────────

function NotionIntegration() {
  const db = useIntegrations()
  const [token, setToken] = useState('')
  const [testing, setTesting] = useState(false)
  const [testResult, setTestResult] = useState<'success' | 'error' | null>(null)
  const [testMessage, setTestMessage] = useState('')
  const [saved, setSaved] = useState(false)

  useEffect(() => { setToken(db.get('notion_token')) }, [db])

  const isConnected = !!db.get('notion_token')

  async function testConnection() {
    if (!token) return
    setTesting(true); setTestResult(null)
    try {
      const url = new URL('/api/notion', window.location.origin)
      url.searchParams.set('token', token)
      url.searchParams.set('endpoint', '/v1/users/me')
      const res = await fetch(url.toString())
      if (res.ok) {
        const data = await res.json()
        setTestResult('success')
        setTestMessage(`Connected as ${data.name ?? data.id}!`)
      } else {
        setTestResult('error')
        setTestMessage('Invalid token. Check your Notion integration token.')
      }
    } catch {
      setTestResult('error'); setTestMessage('Could not reach Notion API.')
    } finally { setTesting(false) }
  }

  async function save() {
    await db.save('notion_token', token)
    setSaved(true); setTimeout(() => setSaved(false), 2000)
  }

  async function disconnect() {
    await db.remove('notion_token'); setToken(''); setTestResult(null)
  }

  return (
    <div className="bg-white border border-black/[0.08] rounded-2xl overflow-hidden">
      <div className="flex items-center gap-4 p-5 border-b border-slate-100">
        <div className="w-12 h-12 rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-center text-xl flex-shrink-0">◻️</div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <h3 className="text-sm font-semibold text-slate-800">Notion</h3>
            {isConnected && testResult === 'success' && <ConnectedBadge />}
          </div>
          <p className="text-xs text-slate-500 mt-0.5">Pages, databases, notes, and tasks</p>
        </div>
        {isConnected && <DisconnectButton onClick={disconnect} />}
      </div>
      <div className="p-5 space-y-4">
        <TokenInput label="Notion API Token" value={token} onChange={setToken}
          placeholder="secret_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
          helpUrl="https://www.notion.so/my-integrations"
          helpText="Create an integration at notion.so/my-integrations → copy the Internal Integration Token" />
        <TestResult result={testResult} message={testMessage} />
        <div className="flex gap-2">
          <button onClick={testConnection} disabled={testing || !token}
            className="flex items-center gap-2 px-4 py-2 border border-black/[0.12] rounded-xl text-sm font-medium text-slate-600 hover:bg-slate-50 disabled:opacity-50 transition-all">
            {testing ? <Loader2 size={13} className="animate-spin" /> : <RefreshCw size={13} />}
            Test Connection
          </button>
          <button onClick={save} disabled={!token}
            className={cn('flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all disabled:opacity-50',
              saved ? 'bg-emerald-500 text-white' : 'bg-indigo-600 hover:bg-indigo-700 text-white')}>
            {saved ? <><Check size={13} /> Saved!</> : 'Save'}
          </button>
        </div>
        <details className="text-xs text-slate-500">
          <summary className="cursor-pointer font-medium text-slate-600 hover:text-slate-800">How to create a Notion integration</summary>
          <ol className="mt-2 space-y-1.5 pl-4">
            <li>1. Go to <a href="https://www.notion.so/my-integrations" target="_blank" rel="noopener" className="text-indigo-600 hover:underline">notion.so/my-integrations</a></li>
            <li>2. Click <strong>New integration</strong> → give it a name → Submit</li>
            <li>3. Copy the <strong>Internal Integration Token</strong> (starts with <code className="bg-slate-100 px-1 rounded">secret_</code>)</li>
            <li>4. In Notion, open any page → click <strong>⋯ → Add connections</strong> → select your integration</li>
          </ol>
        </details>
      </div>
    </div>
  )
}

// ── Slack ──────────────────────────────────────────────────────

function SlackIntegration() {
  const db = useIntegrations()
  const [token, setToken] = useState('')
  const [testing, setTesting] = useState(false)
  const [testResult, setTestResult] = useState<'success' | 'error' | null>(null)
  const [testMessage, setTestMessage] = useState('')
  const [saved, setSaved] = useState(false)

  useEffect(() => { setToken(db.get('slack_token')) }, [db])

  const isConnected = !!db.get('slack_token')

  async function testConnection() {
    if (!token) return
    setTesting(true); setTestResult(null)
    try {
      const url = new URL('/api/slack', window.location.origin)
      url.searchParams.set('token', token)
      url.searchParams.set('method', 'auth.test')
      const res = await fetch(url.toString())
      if (res.ok) {
        const data = await res.json()
        setTestResult('success')
        setTestMessage(`Connected to ${data.team} as ${data.user}!`)
      } else {
        const data = await res.json().catch(() => ({}))
        setTestResult('error')
        setTestMessage(`Invalid token: ${data.error ?? 'check your Slack bot token'}`)
      }
    } catch {
      setTestResult('error'); setTestMessage('Could not reach Slack API.')
    } finally { setTesting(false) }
  }

  async function save() {
    await db.save('slack_token', token)
    setSaved(true); setTimeout(() => setSaved(false), 2000)
  }

  async function disconnect() {
    await db.remove('slack_token'); setToken(''); setTestResult(null)
  }

  return (
    <div className="bg-white border border-black/[0.08] rounded-2xl overflow-hidden">
      <div className="flex items-center gap-4 p-5 border-b border-slate-100">
        <div className="w-12 h-12 rounded-2xl bg-purple-50 border border-purple-100 flex items-center justify-center text-xl flex-shrink-0">🔔</div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <h3 className="text-sm font-semibold text-slate-800">Slack</h3>
            {isConnected && testResult === 'success' && <ConnectedBadge />}
          </div>
          <p className="text-xs text-slate-500 mt-0.5">Channels, messages, and workspace activity</p>
        </div>
        {isConnected && <DisconnectButton onClick={disconnect} />}
      </div>
      <div className="p-5 space-y-4">
        <TokenInput label="Slack Bot Token" value={token} onChange={setToken}
          placeholder="xoxb-xxxxxxxxxxxx-xxxxxxxxxxxx-xxxxxxxxxxxxxxxxxxxxxxxx"
          helpText="Starts with xoxb- — from api.slack.com/apps → your app → OAuth & Permissions → Bot User OAuth Token" />
        <TestResult result={testResult} message={testMessage} />
        <div className="flex gap-2">
          <button onClick={testConnection} disabled={testing || !token}
            className="flex items-center gap-2 px-4 py-2 border border-black/[0.12] rounded-xl text-sm font-medium text-slate-600 hover:bg-slate-50 disabled:opacity-50 transition-all">
            {testing ? <Loader2 size={13} className="animate-spin" /> : <RefreshCw size={13} />}
            Test Connection
          </button>
          <button onClick={save} disabled={!token}
            className={cn('flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all disabled:opacity-50',
              saved ? 'bg-emerald-500 text-white' : 'bg-indigo-600 hover:bg-indigo-700 text-white')}>
            {saved ? <><Check size={13} /> Saved!</> : 'Save'}
          </button>
        </div>
        <details className="text-xs text-slate-500">
          <summary className="cursor-pointer font-medium text-slate-600 hover:text-slate-800">How to create a Slack bot token</summary>
          <ol className="mt-2 space-y-1.5 pl-4">
            <li>1. Go to <a href="https://api.slack.com/apps" target="_blank" rel="noopener" className="text-indigo-600 hover:underline">api.slack.com/apps</a> → <strong>Create New App → From scratch</strong></li>
            <li>2. Give it a name (e.g. "Nexus") and pick your workspace</li>
            <li>3. Go to <strong>OAuth & Permissions</strong> → under Scopes → Bot Token Scopes, add: <code className="bg-slate-100 px-1 rounded">channels:read</code>, <code className="bg-slate-100 px-1 rounded">channels:history</code>, <code className="bg-slate-100 px-1 rounded">im:read</code></li>
            <li>4. Click <strong>Install to Workspace</strong> → allow → copy the <strong>Bot User OAuth Token</strong></li>
          </ol>
        </details>
      </div>
    </div>
  )
}

// ── Handshake ─────────────────────────────────────────────────

function HandshakeIntegration() {
  const [customUrl, setCustomUrl] = useState('')
  const [saved, setSaved] = useState(false)

  const db = useIntegrations()
  useEffect(() => { setCustomUrl(db.get('handshake_url')) }, [db])

  async function save() {
    await db.save('handshake_url', customUrl || 'https://joinhandshake.com/')
    setSaved(true); setTimeout(() => setSaved(false), 2000)
  }

  const handshakeUrl = customUrl || db.get('handshake_url') || 'https://joinhandshake.com/'

  return (
    <div className="bg-white border border-black/[0.08] rounded-2xl overflow-hidden">
      <div className="flex items-center gap-4 p-5 border-b border-slate-100">
        <div className="w-12 h-12 rounded-2xl bg-violet-50 border border-violet-100 flex items-center justify-center text-xl flex-shrink-0">🤝</div>
        <div className="flex-1 min-w-0">
          <h3 className="text-sm font-semibold text-slate-800">Handshake</h3>
          <p className="text-xs text-slate-500 mt-0.5">Jobs, internships, and career events</p>
        </div>
        <a href={handshakeUrl} target="_blank" rel="noopener"
          className="flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white rounded-lg bg-violet-600 hover:bg-violet-700 transition-all flex-shrink-0">
          Open Handshake <ExternalLink size={11} />
        </a>
      </div>
      <div className="p-5 space-y-4">
        <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-700 flex items-start gap-2">
          <AlertCircle size={13} className="flex-shrink-0 mt-0.5" />
          Handshake doesn't offer a public API for data sync. Use the button above to open Handshake directly, or save your school's custom Handshake URL below.
        </div>
        <TokenInput label="Your School's Handshake URL (optional)" value={customUrl} onChange={setCustomUrl}
          placeholder="https://yourschool.joinhandshake.com/" type="url"
          helpText="Find this by logging into Handshake — use the URL from your browser" />
        <button onClick={save} disabled={!customUrl}
          className={cn('flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all disabled:opacity-50',
            saved ? 'bg-emerald-500 text-white' : 'bg-indigo-600 hover:bg-indigo-700 text-white')}>
          {saved ? <><Check size={13} /> Saved!</> : 'Save URL'}
        </button>
      </div>
    </div>
  )
}

// ── Gradescope ────────────────────────────────────────────────

function GradescopeIntegration() {
  const [customUrl, setCustomUrl] = useState('')
  const [saved, setSaved] = useState(false)

  const db = useIntegrations()
  useEffect(() => { setCustomUrl(db.get('gradescope_url')) }, [db])

  async function save() {
    await db.save('gradescope_url', customUrl || 'https://www.gradescope.com/')
    setSaved(true); setTimeout(() => setSaved(false), 2000)
  }

  const gradescopeUrl = customUrl || db.get('gradescope_url') || 'https://www.gradescope.com/'

  return (
    <div className="bg-white border border-black/[0.08] rounded-2xl overflow-hidden">
      <div className="flex items-center gap-4 p-5 border-b border-slate-100">
        <div className="w-12 h-12 rounded-2xl bg-teal-50 border border-teal-100 flex items-center justify-center text-xl flex-shrink-0">📊</div>
        <div className="flex-1 min-w-0">
          <h3 className="text-sm font-semibold text-slate-800">Gradescope</h3>
          <p className="text-xs text-slate-500 mt-0.5">Assignments, submissions, and grades</p>
        </div>
        <a href={gradescopeUrl} target="_blank" rel="noopener"
          className="flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white rounded-lg bg-teal-600 hover:bg-teal-700 transition-all flex-shrink-0">
          Open Gradescope <ExternalLink size={11} />
        </a>
      </div>
      <div className="p-5 space-y-4">
        <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-700 flex items-start gap-2">
          <AlertCircle size={13} className="flex-shrink-0 mt-0.5" />
          Gradescope doesn't provide a public API. Use the button above to open it directly, or save your institution's Gradescope URL below for quick access.
        </div>
        <TokenInput label="Your Institution's Gradescope URL (optional)" value={customUrl} onChange={setCustomUrl}
          placeholder="https://www.gradescope.com/" type="url" />
        <button onClick={save} disabled={!customUrl}
          className={cn('flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all disabled:opacity-50',
            saved ? 'bg-emerald-500 text-white' : 'bg-indigo-600 hover:bg-indigo-700 text-white')}>
          {saved ? <><Check size={13} /> Saved!</> : 'Save URL'}
        </button>
      </div>
    </div>
  )
}

// ── Outlook iCal ──────────────────────────────────────────────

function ICalIntegration() {
  const [icalUrl, setIcalUrl] = useState('')
  const [saved, setSaved] = useState(false)

  const db = useIntegrations()
  useEffect(() => { setIcalUrl(db.get('ical_url')) }, [db])

  async function save() {
    await db.save('ical_url', icalUrl)
    setSaved(true); setTimeout(() => setSaved(false), 2000)
  }

  async function disconnect() {
    await db.remove('ical_url'); setIcalUrl('')
  }

  const isConnected = !!db.get('ical_url')

  return (
    <div className="bg-white border border-black/[0.08] rounded-2xl overflow-hidden">
      <div className="flex items-center gap-4 p-5 border-b border-slate-100">
        <div className="w-12 h-12 rounded-2xl bg-sky-50 border border-sky-100 flex items-center justify-center text-xl flex-shrink-0">📅</div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <h3 className="text-sm font-semibold text-slate-800">iCal / Outlook Calendar</h3>
            {isConnected && <ConnectedBadge />}
          </div>
          <p className="text-xs text-slate-500 mt-0.5">Import any calendar via iCal URL — works with Outlook, Apple Calendar, and more</p>
        </div>
        {isConnected && <DisconnectButton onClick={disconnect} />}
      </div>
      <div className="p-5 space-y-4">
        <TokenInput label="iCal Subscription URL" value={icalUrl} onChange={setIcalUrl}
          placeholder="https://outlook.live.com/owa/calendar/…/reachcalendar.ics" type="url"
          helpText="Outlook: Calendar → Share → Publish → Copy ICS link   |   Apple Calendar: right-click → Get Info → URL" />
        <div className="flex gap-2">
          <button onClick={save} disabled={!icalUrl}
            className={cn('flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all disabled:opacity-50',
              saved ? 'bg-emerald-500 text-white' : 'bg-indigo-600 hover:bg-indigo-700 text-white')}>
            {saved ? <><Check size={13} /> Saved!</> : 'Save URL'}
          </button>
        </div>
      </div>
    </div>
  )
}

// ── Main Settings Page ─────────────────────────────────────────

function SettingsPageInner() {
  const [activeSection, setActiveSection] = useState<SectionId>('account')
  const [name, setName] = useState(mockUser.name)
  const [email, setEmail] = useState(mockUser.email)
  const [university, setUniversity] = useState('')
  const [saved, setSaved] = useState(false)

  const [aiPrefs, setAiPrefs] = useState({
    askBeforeCalendar: true, askBeforeTask: true,
    autoSummarize: false, autoClassify: false, showConfidence: true,
  })

  const [calRules, setCalRules] = useState({
    syncDeadlines: true, addBuffer: false, noDeepWorkLate: true, protectedSunday: true,
  })

  const [notifPrefs, setNotifPrefs] = useState({
    deadlineReminders: true, dailyPlanning: true, weeklyReview: true,
    overdueTasks: true, driveUpdates: false,
  })

  const [drivePermission, setDrivePermission] = useState('basic')
  const [confidenceThreshold, setConfidenceThreshold] = useState(70)
  const [schedulingMode, setSchedulingMode] = useState('semi-auto')
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-3">
          <Settings className="text-slate-500" size={24} /> Settings
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
                  activeSection === item.id ? 'bg-indigo-50 text-indigo-700 font-semibold' : 'text-slate-500 hover:bg-slate-50 hover:text-slate-800')}>
                <Icon size={15} /> {item.label}
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
                <button onClick={() => { setSaved(true); setTimeout(() => setSaved(false), 2000) }}
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
              <div>
                <h2 className="text-base font-semibold text-slate-800">Integrations</h2>
                <p className="text-xs text-slate-500 mt-0.5">Connect your services to sync data automatically</p>
              </div>

              {/* OAuth integrations */}
              <p className="text-[11px] font-bold uppercase tracking-widest text-slate-400">Single Sign-On</p>
              <GoogleIntegration />
              <MicrosoftIntegration />

              {/* Token-based */}
              <p className="text-[11px] font-bold uppercase tracking-widest text-slate-400 pt-2">API Token</p>
              <CanvasIntegration />
              <NotionIntegration />
              <SlackIntegration />

              {/* Calendar import */}
              <p className="text-[11px] font-bold uppercase tracking-widest text-slate-400 pt-2">Calendar Import</p>
              <ICalIntegration />

              {/* Quick links */}
              <p className="text-[11px] font-bold uppercase tracking-widest text-slate-400 pt-2">Quick Access</p>
              <HandshakeIntegration />
              <GradescopeIntegration />
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
                <input type="range" min={50} max={95} value={confidenceThreshold}
                  onChange={e => setConfidenceThreshold(Number(e.target.value))} className="w-full accent-indigo-600" />
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
                <p>Your data is processed securely and never stored by third-party AI systems permanently. Content is transmitted over encrypted connections and is not used for model training.</p>
              </div>
              <div className="space-y-3 border-t border-slate-200 pt-5">
                <div className="text-sm font-medium text-slate-700">Data Management</div>
                <div className="flex gap-3">
                  <button className="flex items-center gap-2 px-4 py-2.5 border border-slate-200 bg-slate-50 text-slate-600 hover:bg-slate-100 rounded-xl text-sm transition-all">
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
                      <button onClick={() => setShowDeleteConfirm(false)} className="text-xs text-slate-500 px-2 py-1 rounded">Cancel</button>
                      <button className="text-xs px-3 py-1 bg-red-600 text-white rounded-lg">Delete</button>
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

export default function SettingsPage() {
  return (
    <IntegrationsProvider>
      <SettingsPageInner />
    </IntegrationsProvider>
  )
}
