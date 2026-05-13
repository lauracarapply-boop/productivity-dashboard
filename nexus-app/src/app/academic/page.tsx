'use client'

import { useState } from 'react'
import {
  GraduationCap, Link2, Loader2, Check, RefreshCw, ExternalLink,
  Calendar, CheckSquare, Briefcase, BookOpen, Bell, Star, Clock,
  MapPin, Users, ChevronRight, AlertTriangle, Sparkles, Rss,
  Globe, Mail, FileText, Target, Plus, X, Zap, TrendingUp,
} from 'lucide-react'
import { useApp } from '@/lib/store'
import { mockTasks, mockCalendarEvents, mockCourses } from '@/lib/mock-data'
import { cn } from '@/lib/utils'

// ── Types ──────────────────────────────────────────────────────

type Tab = 'dashboard' | 'events' | 'jobs' | 'integrations'

type EventSource = 'teams' | 'campusgroups' | 'tickets' | 'canvas'

interface AcademicEvent {
  id: string
  title: string
  date: string
  time: string
  location: string
  type: string
  source: EventSource
  url: string
  rsvp?: 'going' | 'interested' | null
  isOnline?: boolean
  organizer?: string
}

interface JobListing {
  id: string
  title: string
  org: string
  type: 'on-campus' | 'internship' | 'full-time' | 'research'
  location: string
  deadline: string
  pay?: string
  source: 'handshake' | 'workday'
  url: string
  tags: string[]
  isNew?: boolean
}

interface Integration {
  id: string
  name: string
  description: string
  url: string
  icon: string
  color: string
  connected: boolean
  lastSync?: string
  dataTypes: string[]
}

interface AtlanticArticle {
  id: string
  title: string
  author: string
  section: string
  readTime: string
  url: string
  preview: string
  isNew: boolean
}

// ── Mock Data ──────────────────────────────────────────────────

const ACADEMIC_EVENTS: AcademicEvent[] = [
  { id: 'ae1', title: 'CS Research Symposium – Spring Presentations', date: 'May 13', time: '2:00 PM', location: 'Druckenmiller Hall 020', type: 'Academic', source: 'campusgroups', url: 'https://bowdoin.campusgroups.com/events', organizer: 'CS Department' },
  { id: 'ae2', title: 'Office Hours – Prof. Thompson (ML)', date: 'May 13', time: '3:00 PM', location: 'Zoom (Teams)', type: 'Office Hours', source: 'teams', url: 'https://teams.cloud.microsoft/', isOnline: true, organizer: 'Prof. Thompson' },
  { id: 'ae3', title: 'Bowdoin Sustainability Forum', date: 'May 14', time: '5:30 PM', location: 'Smith Union 220', type: 'Event', source: 'campusgroups', url: 'https://bowdoin.campusgroups.com/events', organizer: 'Sustainability Club' },
  { id: 'ae4', title: 'Spring Concert – Bowdoin Orchestra', date: 'May 14', time: '7:00 PM', location: 'Pickard Theater', type: 'Performance', source: 'tickets', url: 'https://bowdointickets.universitytickets.com/', organizer: 'Music Department' },
  { id: 'ae5', title: 'Study Group – ML Midterm Prep', date: 'May 16', time: '4:00 PM', location: 'Library Room B', type: 'Study', source: 'teams', url: 'https://teams.cloud.microsoft/', isOnline: false, organizer: 'Study Group' },
  { id: 'ae6', title: 'Career Fair – Tech & Finance', date: 'May 16', time: '10:00 AM', location: 'Watson Arena', type: 'Career', source: 'campusgroups', url: 'https://bowdoin.campusgroups.com/events', organizer: 'Career Planning' },
  { id: 'ae7', title: 'Bates-Bowdoin Lacrosse Match', date: 'May 17', time: '1:00 PM', location: 'Pickard Field', type: 'Athletics', source: 'tickets', url: 'https://bowdointickets.universitytickets.com/', organizer: 'Athletics' },
  { id: 'ae8', title: 'French Language Exchange Meetup', date: 'May 18', time: '6:00 PM', location: 'Moulton Union Café', type: 'Language', source: 'campusgroups', url: 'https://bowdoin.campusgroups.com/events', organizer: 'French Club' },
  { id: 'ae9', title: 'Data Science Workshop – Intro to R', date: 'May 19', time: '2:00 PM', location: 'Zoom (Teams)', type: 'Workshop', source: 'teams', url: 'https://teams.cloud.microsoft/', isOnline: true, organizer: 'Data Science Club' },
  { id: 'ae10', title: 'Canvas – Assignment: Comparative Politics Essay Due', date: 'May 15', time: '11:59 PM', location: 'Online', type: 'Deadline', source: 'canvas', url: 'https://bowdoin.instructure.com/', isOnline: true, organizer: 'Prof. Silva' },
]

const JOB_LISTINGS: JobListing[] = [
  { id: 'j1', title: 'Research Assistant – Cognitive Science Lab', org: 'Bowdoin College', type: 'research', location: 'On campus', deadline: 'May 20', pay: '$14/hr', source: 'workday', url: 'https://www.myworkday.com/bowdoin/d/task/1422$2251.htmld', tags: ['research', 'part-time', 'cognitive science'], isNew: true },
  { id: 'j2', title: 'Software Engineering Intern – Summer 2026', org: 'HubSpot', type: 'internship', location: 'Boston, MA (Hybrid)', deadline: 'May 25', pay: '$35/hr', source: 'handshake', url: 'https://bowdoin.joinhandshake.com/explore', tags: ['engineering', 'SWE', 'internship'], isNew: true },
  { id: 'j3', title: 'IT Help Desk Assistant', org: 'Bowdoin IT Services', type: 'on-campus', location: 'On campus', deadline: 'May 30', pay: '$13/hr', source: 'workday', url: 'https://www.myworkday.com/bowdoin/d/task/1422$2251.htmld', tags: ['IT', 'on-campus', 'part-time'] },
  { id: 'j4', title: 'Data Science Intern – Analytics Team', org: 'Wayfair', type: 'internship', location: 'Boston, MA', deadline: 'May 22', pay: '$32/hr', source: 'handshake', url: 'https://bowdoin.joinhandshake.com/explore', tags: ['data science', 'Python', 'analytics'], isNew: true },
  { id: 'j5', title: 'Library Student Worker', org: 'Hawthorne-Longfellow Library', type: 'on-campus', location: 'On campus', deadline: 'Jun 1', pay: '$12/hr', source: 'workday', url: 'https://www.myworkday.com/bowdoin/d/task/1422$2251.htmld', tags: ['library', 'flexible hours'] },
  { id: 'j6', title: 'Product Management Intern', org: 'Fidelity Investments', type: 'internship', location: 'Boston, MA', deadline: 'May 28', pay: '$30/hr', source: 'handshake', url: 'https://bowdoin.joinhandshake.com/explore', tags: ['PM', 'finance', 'tech'] },
  { id: 'j7', title: 'Social Media & Marketing Assistant', org: 'Bowdoin Communications', type: 'on-campus', location: 'On campus', deadline: 'May 31', pay: '$13.50/hr', source: 'workday', url: 'https://www.myworkday.com/bowdoin/d/task/1422$2251.htmld', tags: ['marketing', 'social media', 'content'], isNew: true },
  { id: 'j8', title: 'Machine Learning Research Intern', org: 'MIT CSAIL (via Handshake)', type: 'research', location: 'Cambridge, MA', deadline: 'May 21', pay: '$28/hr', source: 'handshake', url: 'https://bowdoin.joinhandshake.com/explore', tags: ['ML', 'research', 'Python', 'AI'], isNew: true },
]

const ATLANTIC_ARTICLES: AtlanticArticle[] = [
  { id: 'a1', title: 'The Quiet Collapse of the American Middle Class', author: 'Annie Lowrey', section: 'Economy', readTime: '8 min', url: 'https://www.theatlantic.com/economy/', preview: 'For decades, economists promised that growth would lift all boats. Then it didn\'t. What went wrong, and what comes next.', isNew: true },
  { id: 'a2', title: 'AI Is Coming for White-Collar Work. This Is What Happens Next.', author: 'Derek Thompson', section: 'Technology', readTime: '12 min', url: 'https://www.theatlantic.com/technology/', preview: 'The disruption of professional work is already underway. But the story is more complicated than either the optimists or pessimists suggest.', isNew: true },
  { id: 'a3', title: 'Why Young People Are Abandoning Traditional Religion — and What They\'re Finding Instead', author: 'Tara Isabella Burton', section: 'Ideas', readTime: '10 min', url: 'https://www.theatlantic.com/ideas/', preview: 'A new study reveals how Gen Z is reshaping spiritual life in America, blending ancient practices with modern identity.', isNew: true },
  { id: 'a4', title: 'The Climate Technology That Actually Works', author: 'Robinson Meyer', section: 'Science', readTime: '7 min', url: 'https://www.theatlantic.com/science/', preview: 'Amid the noise of climate debate, some solutions are quietly working. Here\'s what the data actually shows.', isNew: false },
  { id: 'a5', title: 'The Strange Afterlife of the Liberal Arts Degree', author: 'Graeme Wood', section: 'Education', readTime: '9 min', url: 'https://www.theatlantic.com/education/', preview: 'Once dismissed as impractical, the humanities degree is having an unexpected moment — in Silicon Valley of all places.', isNew: false },
]

const CANVAS_NOTIFICATIONS = [
  { id: 'cn1', course: 'Machine Learning (CS 301)', message: 'New assignment posted: Problem Set 3 — Due May 13', type: 'assignment', urgent: true },
  { id: 'cn2', course: 'Comparative Politics (GOVT 240)', message: 'Grade posted: Essay 2 — 91/100', type: 'grade', urgent: false },
  { id: 'cn3', course: 'Data Science Foundations', message: 'New announcement: Lab 3 rubric uploaded', type: 'announcement', urgent: false },
  { id: 'cn4', course: 'Linear Algebra (MATH 225)', message: 'New discussion: Midterm review questions', type: 'discussion', urgent: false },
]

const INTEGRATIONS_DATA: Integration[] = [
  { id: 'canvas', name: 'Canvas (Instructure)', description: 'Courses, assignments, grades, announcements', url: 'https://bowdoin.instructure.com/', icon: '🎓', color: 'bg-red-50 border-red-200 text-red-700', connected: false, dataTypes: ['Assignments', 'Grades', 'Announcements', 'Calendar'] },
  { id: 'teams', name: 'Microsoft Teams', description: 'Online events, office hours, team channels', url: 'https://teams.cloud.microsoft/', icon: '💼', color: 'bg-indigo-50 border-indigo-200 text-indigo-700', connected: false, dataTypes: ['Meetings', 'Events', 'Tasks', 'Files'] },
  { id: 'handshake', name: 'Handshake', description: 'Jobs, internships, employer events', url: 'https://bowdoin.joinhandshake.com/explore', icon: '🤝', color: 'bg-violet-50 border-violet-200 text-violet-700', connected: false, dataTypes: ['Job listings', 'Internships', 'Events', 'Applications'] },
  { id: 'workday', name: 'Workday (Bowdoin)', description: 'On-campus jobs, HR, financial aid', url: 'https://www.myworkday.com/bowdoin/d/task/1422$2251.htmld', icon: '🏢', color: 'bg-blue-50 border-blue-200 text-blue-700', connected: false, dataTypes: ['On-campus jobs', 'Payroll', 'Financial aid'] },
  { id: 'campusgroups', name: 'Campus Groups', description: 'Campus events, clubs, RSVPs', url: 'https://bowdoin.campusgroups.com/events', icon: '🎪', color: 'bg-emerald-50 border-emerald-200 text-emerald-700', connected: false, dataTypes: ['Events', 'Clubs', 'RSVPs', 'Organizations'] },
  { id: 'tickets', name: 'Bowdoin Tickets', description: 'Athletics, performances, campus events', url: 'https://bowdointickets.universitytickets.com/', icon: '🎫', color: 'bg-amber-50 border-amber-200 text-amber-700', connected: false, dataTypes: ['Athletics', 'Performances', 'Tickets', 'Schedule'] },
  { id: 'atlantic', name: 'The Atlantic', description: 'Daily articles and long-form reads', url: 'https://www.theatlantic.com/', icon: '📰', color: 'bg-slate-50 border-slate-200 text-slate-700', connected: false, dataTypes: ['Articles', 'Daily digest', 'Sections'] },
]

// ── Helpers ────────────────────────────────────────────────────

const SOURCE_CONFIG: Record<EventSource, { label: string; color: string; url: string; icon: string }> = {
  teams: { label: 'Teams', color: 'bg-indigo-50 text-indigo-700 border-indigo-200', url: 'https://teams.cloud.microsoft/', icon: '💼' },
  campusgroups: { label: 'Campus Groups', color: 'bg-emerald-50 text-emerald-700 border-emerald-200', url: 'https://bowdoin.campusgroups.com/events', icon: '🎪' },
  tickets: { label: 'Bowdoin Tickets', color: 'bg-amber-50 text-amber-700 border-amber-200', url: 'https://bowdointickets.universitytickets.com/', icon: '🎫' },
  canvas: { label: 'Canvas', color: 'bg-red-50 text-red-700 border-red-200', url: 'https://bowdoin.instructure.com/', icon: '🎓' },
}

const JOB_TYPE_COLORS: Record<JobListing['type'], string> = {
  'on-campus': 'bg-emerald-50 text-emerald-700 border-emerald-200',
  internship: 'bg-indigo-50 text-indigo-700 border-indigo-200',
  'full-time': 'bg-violet-50 text-violet-700 border-violet-200',
  research: 'bg-amber-50 text-amber-700 border-amber-200',
}

const JOB_TYPE_LABELS: Record<JobListing['type'], string> = {
  'on-campus': 'On Campus', internship: 'Internship', 'full-time': 'Full-Time', research: 'Research',
}

function SourceBadge({ source }: { source: EventSource }) {
  const cfg = SOURCE_CONFIG[source]
  return (
    <span className={cn('text-[10px] px-2 py-0.5 rounded-full border font-medium flex items-center gap-1', cfg.color)}>
      <span>{cfg.icon}</span>{cfg.label}
    </span>
  )
}

// ── Main Component ─────────────────────────────────────────────

export default function AcademicPage() {
  const { tasks } = useApp()
  const [tab, setTab] = useState<Tab>('dashboard')
  const [integrations, setIntegrations] = useState<Integration[]>(INTEGRATIONS_DATA)
  const [connecting, setConnecting] = useState<string | null>(null)
  const [eventFilter, setEventFilter] = useState<EventSource | 'all'>('all')
  const [jobFilter, setJobFilter] = useState<'all' | 'on-campus' | 'internship' | 'research'>('all')
  const [jobSource, setJobSource] = useState<'all' | 'handshake' | 'workday'>('all')
  const [rsvps, setRsvps] = useState<Record<string, 'going' | 'interested'>>({})
  const [savedJobs, setSavedJobs] = useState<Set<string>>(new Set())
  const [syncing, setSyncing] = useState(false)
  const [syncDone, setSyncDone] = useState(false)

  const connectedCount = integrations.filter(i => i.connected).length
  const thisWeekTasks = tasks.filter(t => t.status !== 'done').slice(0, 5)
  const urgentTasks = tasks.filter(t => t.priority === 'urgent' || t.priority === 'high').slice(0, 3)
  const upcomingEvents = ACADEMIC_EVENTS.slice(0, 5)

  async function connectIntegration(id: string) {
    setConnecting(id)
    await new Promise(r => setTimeout(r, 1800))
    setIntegrations(prev => prev.map(i => i.id === id
      ? { ...i, connected: true, lastSync: 'Just now' }
      : i))
    setConnecting(null)
  }

  async function handleSync() {
    setSyncing(true)
    await new Promise(r => setTimeout(r, 1500))
    setSyncing(false)
    setSyncDone(true)
    setTimeout(() => setSyncDone(false), 3000)
  }

  function toggleRsvp(eventId: string, type: 'going' | 'interested') {
    setRsvps(prev => {
      const n = { ...prev }
      if (n[eventId] === type) delete n[eventId]
      else n[eventId] = type
      return n
    })
  }

  const filteredEvents = ACADEMIC_EVENTS.filter(e => eventFilter === 'all' || e.source === eventFilter)
  const filteredJobs = JOB_LISTINGS.filter(j =>
    (jobFilter === 'all' || j.type === jobFilter) &&
    (jobSource === 'all' || j.source === jobSource)
  )

  const TABS: { id: Tab; label: string; icon: typeof GraduationCap }[] = [
    { id: 'dashboard', label: 'Dashboard', icon: GraduationCap },
    { id: 'events', label: 'Events', icon: Calendar },
    { id: 'jobs', label: 'Jobs & Careers', icon: Briefcase },
    { id: 'integrations', label: 'Integrations', icon: Link2 },
  ]

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-3">
            <GraduationCap className="text-indigo-600" size={26} />
            Academic Hub
          </h1>
          <p className="text-slate-500 text-sm mt-1">
            Bowdoin College · Spring 2026 ·{' '}
            <span className={cn('font-medium', connectedCount > 0 ? 'text-emerald-600' : 'text-amber-600')}>
              {connectedCount}/{integrations.length} integrations connected
            </span>
          </p>
        </div>
        <div className="flex items-center gap-2">
          {connectedCount > 0 && (
            <button onClick={handleSync} disabled={syncing}
              className="flex items-center gap-2 px-3 py-2 bg-white hover:bg-slate-50 border border-slate-200 text-slate-600 rounded-xl text-sm font-medium transition-all shadow-sm disabled:opacity-70">
              {syncing ? <Loader2 size={14} className="animate-spin" /> : syncDone ? <Check size={14} className="text-emerald-500" /> : <RefreshCw size={14} />}
              {syncDone ? 'Updated!' : 'Sync All'}
            </button>
          )}
          <a href="https://bowdoin.instructure.com/" target="_blank" rel="noopener noreferrer"
            className="flex items-center gap-2 px-3 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-sm font-semibold transition-all shadow-sm">
            <ExternalLink size={14} /> Open Canvas
          </a>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="flex gap-1 p-1 bg-slate-100 border border-slate-200 rounded-xl w-fit">
        {TABS.map(t => {
          const Icon = t.icon
          return (
            <button key={t.id} onClick={() => setTab(t.id)}
              className={cn('flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium transition-all',
                tab === t.id ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700')}>
              <Icon size={14} />
              {t.label}
            </button>
          )
        })}
      </div>

      {/* ── DASHBOARD TAB ── */}
      {tab === 'dashboard' && (
        <div className="space-y-6">

          {/* Canvas notification strip */}
          {CANVAS_NOTIFICATIONS.some(n => n.urgent) && (
            <div className="flex items-center gap-3 px-4 py-3 bg-red-50 border border-red-200 rounded-xl">
              <AlertTriangle size={14} className="text-red-500 flex-shrink-0" />
              <span className="text-sm text-red-700 font-medium">
                {CANVAS_NOTIFICATIONS.find(n => n.urgent)?.message} — {CANVAS_NOTIFICATIONS.find(n => n.urgent)?.course}
              </span>
              <a href="https://bowdoin.instructure.com/" target="_blank" rel="noopener noreferrer"
                className="ml-auto flex items-center gap-1 text-xs text-red-700 hover:text-red-800 font-semibold border border-red-300 bg-white px-2.5 py-1 rounded-lg transition-colors">
                Open Canvas <ExternalLink size={10} />
              </a>
            </div>
          )}

          <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">

            {/* LEFT COLUMN — Tasks + Events */}
            <div className="xl:col-span-2 space-y-5">

              {/* Tasks this week */}
              <div className="bg-white border border-black/[0.07] rounded-2xl p-5 shadow-sm">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-sm font-semibold text-slate-800 flex items-center gap-2">
                    <CheckSquare size={14} className="text-indigo-600" /> Tasks This Week
                  </h2>
                  <a href="/tasks" className="text-xs text-indigo-600 hover:text-indigo-700 flex items-center gap-1">
                    View all <ChevronRight size={11} />
                  </a>
                </div>
                <div className="space-y-2.5">
                  {thisWeekTasks.map(task => (
                    <div key={task.id} className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl hover:bg-slate-100 transition-colors">
                      <div className={cn('w-2 h-2 rounded-full flex-shrink-0',
                        task.priority === 'urgent' ? 'bg-red-500' : task.priority === 'high' ? 'bg-amber-500' : task.priority === 'medium' ? 'bg-indigo-400' : 'bg-slate-300')} />
                      <span className="text-sm text-slate-700 flex-1 truncate">{task.title}</span>
                      {task.due_date && (
                        <span className="text-xs text-slate-400 flex-shrink-0 flex items-center gap-1">
                          <Clock size={10} />{new Date(task.due_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                        </span>
                      )}
                      {task.course_id && (
                        <span className="text-[10px] px-2 py-0.5 bg-indigo-50 text-indigo-600 border border-indigo-100 rounded-full flex-shrink-0">
                          {mockCourses.find(c => c.id === task.course_id)?.code ?? 'Course'}
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Upcoming events */}
              <div className="bg-white border border-black/[0.07] rounded-2xl p-5 shadow-sm">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-sm font-semibold text-slate-800 flex items-center gap-2">
                    <Calendar size={14} className="text-violet-600" /> Upcoming Events
                  </h2>
                  <button onClick={() => setTab('events')} className="text-xs text-indigo-600 hover:text-indigo-700 flex items-center gap-1">
                    See all <ChevronRight size={11} />
                  </button>
                </div>
                <div className="space-y-3">
                  {upcomingEvents.map(ev => (
                    <div key={ev.id} className="flex items-start gap-3">
                      <div className="flex flex-col items-center w-10 flex-shrink-0 pt-0.5">
                        <span className="text-xs font-bold text-slate-600">{ev.date.split(' ')[1]}</span>
                        <span className="text-[10px] text-slate-400">{ev.date.split(' ')[0]}</span>
                      </div>
                      <div className="flex-1 min-w-0 p-3 bg-slate-50 rounded-xl">
                        <div className="flex items-center gap-2 mb-1">
                          <SourceBadge source={ev.source} />
                          {ev.isOnline && <span className="text-[10px] px-1.5 py-0.5 bg-slate-200 text-slate-600 rounded-full">Online</span>}
                        </div>
                        <p className="text-sm font-medium text-slate-800 truncate">{ev.title}</p>
                        <p className="text-xs text-slate-400 mt-0.5 flex items-center gap-1">
                          <Clock size={10} />{ev.time}
                          {ev.location !== 'Online' && <><MapPin size={10} className="ml-1" />{ev.location}</>}
                        </p>
                      </div>
                      <a href={ev.url} target="_blank" rel="noopener noreferrer"
                        className="p-1.5 text-slate-300 hover:text-indigo-500 transition-colors flex-shrink-0 mt-2">
                        <ExternalLink size={13} />
                      </a>
                    </div>
                  ))}
                </div>
              </div>

              {/* Canvas notifications */}
              <div className="bg-white border border-black/[0.07] rounded-2xl p-5 shadow-sm">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-sm font-semibold text-slate-800 flex items-center gap-2">
                    <Bell size={14} className="text-red-500" /> Canvas Notifications
                    <span className="text-[10px] px-1.5 py-0.5 bg-red-500 text-white rounded-full font-bold">
                      {CANVAS_NOTIFICATIONS.filter(n => n.urgent).length}
                    </span>
                  </h2>
                  <a href="https://bowdoin.instructure.com/" target="_blank" rel="noopener noreferrer"
                    className="text-xs text-indigo-600 hover:text-indigo-700 flex items-center gap-1">
                    Open Canvas <ExternalLink size={11} />
                  </a>
                </div>
                <div className="space-y-2">
                  {CANVAS_NOTIFICATIONS.map(n => (
                    <div key={n.id} className={cn('p-3 rounded-xl border flex items-start gap-3',
                      n.urgent ? 'bg-red-50 border-red-200' : 'bg-slate-50 border-slate-100')}>
                      <div className={cn('w-1.5 h-1.5 rounded-full mt-1.5 flex-shrink-0', n.urgent ? 'bg-red-500' : 'bg-slate-300')} />
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-semibold text-slate-600">{n.course}</p>
                        <p className={cn('text-xs mt-0.5', n.urgent ? 'text-red-700 font-medium' : 'text-slate-600')}>{n.message}</p>
                      </div>
                      {n.type === 'assignment' && <CheckSquare size={13} className="text-red-400 flex-shrink-0 mt-0.5" />}
                      {n.type === 'grade' && <Star size={13} className="text-amber-400 flex-shrink-0 mt-0.5" />}
                      {n.type === 'announcement' && <Bell size={13} className="text-indigo-400 flex-shrink-0 mt-0.5" />}
                      {n.type === 'discussion' && <Users size={13} className="text-violet-400 flex-shrink-0 mt-0.5" />}
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* RIGHT COLUMN — Jobs + Readings */}
            <div className="space-y-5">

              {/* New job openings */}
              <div className="bg-white border border-black/[0.07] rounded-2xl p-5 shadow-sm">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-sm font-semibold text-slate-800 flex items-center gap-2">
                    <Briefcase size={14} className="text-violet-600" /> New Job Openings
                  </h2>
                  <button onClick={() => setTab('jobs')} className="text-xs text-indigo-600 hover:text-indigo-700 flex items-center gap-1">
                    View all <ChevronRight size={11} />
                  </button>
                </div>
                <div className="space-y-3">
                  {JOB_LISTINGS.filter(j => j.isNew).slice(0, 4).map(job => (
                    <a key={job.id} href={job.url} target="_blank" rel="noopener noreferrer"
                      className="block p-3 bg-slate-50 rounded-xl hover:bg-indigo-50 hover:border-indigo-200 border border-transparent transition-all group">
                      <div className="flex items-center gap-2 mb-1">
                        <span className={cn('text-[10px] px-2 py-0.5 rounded-full border font-medium', JOB_TYPE_COLORS[job.type])}>
                          {JOB_TYPE_LABELS[job.type]}
                        </span>
                        <span className="text-[10px] px-1.5 py-0.5 bg-emerald-100 text-emerald-700 rounded-full font-semibold ml-auto">New</span>
                      </div>
                      <p className="text-sm font-semibold text-slate-800 group-hover:text-indigo-700 transition-colors leading-snug">{job.title}</p>
                      <p className="text-xs text-slate-500 mt-0.5">{job.org}</p>
                      <div className="flex items-center gap-2 mt-1.5 text-[10px] text-slate-400">
                        <span>{job.pay}</span>
                        <span>·</span>
                        <span className="flex items-center gap-0.5"><Clock size={9} />Due {job.deadline}</span>
                      </div>
                    </a>
                  ))}
                </div>
                <div className="flex gap-2 mt-3">
                  <a href="https://bowdoin.joinhandshake.com/explore" target="_blank" rel="noopener noreferrer"
                    className="flex-1 flex items-center justify-center gap-1.5 py-2 text-xs font-medium text-violet-700 bg-violet-50 hover:bg-violet-100 border border-violet-200 rounded-xl transition-all">
                    <ExternalLink size={11} /> Handshake
                  </a>
                  <a href="https://www.myworkday.com/bowdoin/d/task/1422$2251.htmld" target="_blank" rel="noopener noreferrer"
                    className="flex-1 flex items-center justify-center gap-1.5 py-2 text-xs font-medium text-blue-700 bg-blue-50 hover:bg-blue-100 border border-blue-200 rounded-xl transition-all">
                    <ExternalLink size={11} /> Workday
                  </a>
                </div>
              </div>

              {/* The Atlantic Readings */}
              <div className="bg-white border border-black/[0.07] rounded-2xl p-5 shadow-sm">
                <div className="flex items-center justify-between mb-1">
                  <h2 className="text-sm font-semibold text-slate-800 flex items-center gap-2">
                    <Rss size={14} className="text-slate-600" /> The Atlantic
                  </h2>
                  <a href="https://www.theatlantic.com/" target="_blank" rel="noopener noreferrer"
                    className="text-xs text-indigo-600 hover:text-indigo-700 flex items-center gap-1">
                    Open <ExternalLink size={10} />
                  </a>
                </div>
                <p className="text-[10px] text-slate-400 mb-4">Today's articles · {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}</p>
                <div className="space-y-3">
                  {ATLANTIC_ARTICLES.map(article => (
                    <a key={article.id} href={article.url} target="_blank" rel="noopener noreferrer"
                      className="block p-3 bg-slate-50 rounded-xl hover:bg-slate-100 border border-slate-100 hover:border-slate-200 transition-all group">
                      <div className="flex items-center gap-2 mb-1.5">
                        <span className="text-[10px] px-2 py-0.5 bg-slate-200 text-slate-600 rounded-full font-medium">{article.section}</span>
                        {article.isNew && <span className="text-[10px] px-1.5 py-0.5 bg-indigo-100 text-indigo-700 rounded-full font-semibold">New today</span>}
                        <span className="text-[10px] text-slate-400 ml-auto flex items-center gap-0.5"><Clock size={9} />{article.readTime}</span>
                      </div>
                      <p className="text-xs font-semibold text-slate-800 group-hover:text-indigo-700 transition-colors leading-snug">{article.title}</p>
                      <p className="text-[10px] text-slate-400 mt-1">by {article.author}</p>
                      <p className="text-[10px] text-slate-500 mt-1.5 leading-relaxed line-clamp-2">{article.preview}</p>
                    </a>
                  ))}
                </div>
                <a href="https://www.theatlantic.com/" target="_blank" rel="noopener noreferrer"
                  className="flex items-center justify-center gap-1.5 w-full py-2 mt-3 text-xs text-slate-600 hover:text-indigo-700 bg-slate-50 hover:bg-indigo-50 border border-slate-200 hover:border-indigo-200 rounded-xl transition-all font-medium">
                  Browse all articles <ExternalLink size={11} />
                </a>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── EVENTS TAB ── */}
      {tab === 'events' && (
        <div className="space-y-5">
          <div className="flex items-center gap-2 flex-wrap">
            {([
              { id: 'all', label: '🗓 All Events' },
              { id: 'canvas', label: '🎓 Canvas' },
              { id: 'teams', label: '💼 Teams' },
              { id: 'campusgroups', label: '🎪 Campus Groups' },
              { id: 'tickets', label: '🎫 Tickets' },
            ] as const).map(f => (
              <button key={f.id} onClick={() => setEventFilter(f.id as typeof eventFilter)}
                className={cn('px-3 py-1.5 rounded-xl text-xs font-medium transition-all border',
                  eventFilter === f.id ? 'bg-slate-900 text-white border-slate-900' : 'bg-white text-slate-500 border-slate-200 hover:border-slate-300')}>
                {f.label}
              </button>
            ))}
            <span className="ml-auto text-xs text-slate-400">{filteredEvents.length} events</span>
          </div>

          <div className="space-y-3">
            {filteredEvents.map(ev => (
              <div key={ev.id} className="bg-white border border-black/[0.07] rounded-2xl p-5 shadow-sm hover:shadow-md transition-all">
                <div className="flex items-start gap-4">
                  {/* Date block */}
                  <div className="flex flex-col items-center bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 flex-shrink-0 min-w-[52px] text-center">
                    <span className="text-[10px] font-semibold text-slate-400 uppercase">{ev.date.split(' ')[0]}</span>
                    <span className="text-lg font-bold text-slate-900 leading-none">{ev.date.split(' ')[1]}</span>
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                      <SourceBadge source={ev.source} />
                      <span className="text-[10px] px-2 py-0.5 bg-slate-100 text-slate-600 rounded-full">{ev.type}</span>
                      {ev.isOnline && <span className="text-[10px] px-2 py-0.5 bg-indigo-50 text-indigo-600 border border-indigo-100 rounded-full">📹 Online</span>}
                    </div>
                    <h3 className="text-sm font-semibold text-slate-900 leading-snug">{ev.title}</h3>
                    <div className="flex items-center gap-3 mt-2 text-xs text-slate-500 flex-wrap">
                      <span className="flex items-center gap-1"><Clock size={11} />{ev.time}</span>
                      <span className="flex items-center gap-1"><MapPin size={11} />{ev.location}</span>
                      {ev.organizer && <span className="flex items-center gap-1"><Users size={11} />{ev.organizer}</span>}
                    </div>
                  </div>

                  <div className="flex flex-col gap-2 flex-shrink-0">
                    <a href={ev.url} target="_blank" rel="noopener noreferrer"
                      className="flex items-center gap-1.5 px-3 py-1.5 bg-white hover:bg-indigo-50 text-slate-600 hover:text-indigo-700 border border-slate-200 hover:border-indigo-300 rounded-xl text-xs font-medium transition-all">
                      <ExternalLink size={11} /> Open
                    </a>
                    {ev.source !== 'canvas' && (
                      <div className="flex gap-1">
                        <button
                          onClick={() => toggleRsvp(ev.id, 'going')}
                          className={cn('flex-1 px-2 py-1 rounded-lg text-[10px] font-semibold transition-all',
                            rsvps[ev.id] === 'going' ? 'bg-emerald-500 text-white' : 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200')}>
                          {rsvps[ev.id] === 'going' ? '✓ Going' : 'Going'}
                        </button>
                        <button
                          onClick={() => toggleRsvp(ev.id, 'interested')}
                          className={cn('flex-1 px-2 py-1 rounded-lg text-[10px] font-semibold transition-all',
                            rsvps[ev.id] === 'interested' ? 'bg-amber-500 text-white' : 'bg-amber-50 text-amber-700 hover:bg-amber-100 border border-amber-200')}>
                          {rsvps[ev.id] === 'interested' ? '★' : 'Interested'}
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Quick links */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {[
              { label: 'Campus Groups', url: 'https://bowdoin.campusgroups.com/events', icon: '🎪', color: 'bg-emerald-50 border-emerald-200 text-emerald-700 hover:bg-emerald-100' },
              { label: 'Bowdoin Tickets', url: 'https://bowdointickets.universitytickets.com/', icon: '🎫', color: 'bg-amber-50 border-amber-200 text-amber-700 hover:bg-amber-100' },
              { label: 'Microsoft Teams', url: 'https://teams.cloud.microsoft/', icon: '💼', color: 'bg-indigo-50 border-indigo-200 text-indigo-700 hover:bg-indigo-100' },
              { label: 'Canvas Calendar', url: 'https://bowdoin.instructure.com/', icon: '🎓', color: 'bg-red-50 border-red-200 text-red-700 hover:bg-red-100' },
            ].map(link => (
              <a key={link.label} href={link.url} target="_blank" rel="noopener noreferrer"
                className={cn('flex items-center gap-2 px-4 py-3 rounded-xl border text-xs font-semibold transition-all', link.color)}>
                <span>{link.icon}</span>{link.label} <ExternalLink size={10} className="ml-auto" />
              </a>
            ))}
          </div>
        </div>
      )}

      {/* ── JOBS & CAREERS TAB ── */}
      {tab === 'jobs' && (
        <div className="space-y-5">
          <div className="flex items-center gap-2 flex-wrap">
            {/* Type filter */}
            {([
              { id: 'all', label: 'All Types' },
              { id: 'internship', label: 'Internships' },
              { id: 'on-campus', label: 'On Campus' },
              { id: 'research', label: 'Research' },
            ] as const).map(f => (
              <button key={f.id} onClick={() => setJobFilter(f.id)}
                className={cn('px-3 py-1.5 rounded-xl text-xs font-medium transition-all border',
                  jobFilter === f.id ? 'bg-slate-900 text-white border-slate-900' : 'bg-white text-slate-500 border-slate-200 hover:border-slate-300')}>
                {f.label}
              </button>
            ))}
            <div className="w-px h-5 bg-slate-200 mx-1" />
            {([{ id: 'all', label: 'Both Sources' }, { id: 'handshake', label: '🤝 Handshake' }, { id: 'workday', label: '🏢 Workday' }] as const).map(f => (
              <button key={f.id} onClick={() => setJobSource(f.id)}
                className={cn('px-3 py-1.5 rounded-xl text-xs font-medium transition-all border',
                  jobSource === f.id ? 'bg-violet-600 text-white border-violet-600' : 'bg-white text-slate-500 border-slate-200 hover:border-slate-300')}>
                {f.label}
              </button>
            ))}
            <span className="ml-auto text-xs text-slate-400">{filteredJobs.length} listings</span>
          </div>

          <div className="space-y-3">
            {filteredJobs.map(job => (
              <div key={job.id} className="bg-white border border-black/[0.07] rounded-2xl p-5 shadow-sm hover:shadow-md hover:border-indigo-200/60 transition-all">
                <div className="flex items-start gap-4">
                  <div className="w-11 h-11 rounded-xl bg-slate-100 flex items-center justify-center text-xl flex-shrink-0">
                    {job.source === 'handshake' ? '🤝' : '🏢'}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                      <span className={cn('text-[10px] px-2 py-0.5 rounded-full border font-medium', JOB_TYPE_COLORS[job.type])}>
                        {JOB_TYPE_LABELS[job.type]}
                      </span>
                      <span className={cn('text-[10px] px-2 py-0.5 rounded-full border font-medium',
                        job.source === 'handshake' ? 'bg-violet-50 text-violet-700 border-violet-200' : 'bg-blue-50 text-blue-700 border-blue-200')}>
                        {job.source === 'handshake' ? '🤝 Handshake' : '🏢 Workday'}
                      </span>
                      {job.isNew && <span className="text-[10px] px-2 py-0.5 bg-emerald-100 text-emerald-700 rounded-full font-bold">🆕 New</span>}
                    </div>
                    <h3 className="text-sm font-bold text-slate-900 leading-snug">{job.title}</h3>
                    <p className="text-xs text-slate-600 mt-0.5">{job.org}</p>
                    <div className="flex items-center gap-3 mt-2 text-xs text-slate-500 flex-wrap">
                      <span className="flex items-center gap-1"><MapPin size={11} />{job.location}</span>
                      {job.pay && <span className="font-medium text-emerald-700">{job.pay}</span>}
                      <span className="flex items-center gap-1 text-amber-700"><AlertTriangle size={10} />Apply by {job.deadline}</span>
                    </div>
                    <div className="flex flex-wrap gap-1 mt-2">
                      {job.tags.map(tag => (
                        <span key={tag} className="text-[10px] px-1.5 py-0.5 bg-slate-100 text-slate-500 rounded-full">#{tag}</span>
                      ))}
                    </div>
                  </div>
                  <div className="flex flex-col gap-2 flex-shrink-0">
                    <a href={job.url} target="_blank" rel="noopener noreferrer"
                      className="flex items-center gap-1.5 px-3 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-semibold transition-all shadow-sm">
                      Apply <ExternalLink size={11} />
                    </a>
                    <button onClick={() => setSavedJobs(prev => { const s = new Set(prev); s.has(job.id) ? s.delete(job.id) : s.add(job.id); return s })}
                      className={cn('flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium border transition-all',
                        savedJobs.has(job.id) ? 'bg-amber-50 text-amber-700 border-amber-200' : 'bg-white text-slate-500 border-slate-200 hover:border-slate-300')}>
                      <Star size={11} fill={savedJobs.has(job.id) ? 'currentColor' : 'none'} />
                      {savedJobs.has(job.id) ? 'Saved' : 'Save'}
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* External links */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <a href="https://bowdoin.joinhandshake.com/explore" target="_blank" rel="noopener noreferrer"
              className="flex items-center gap-4 p-5 bg-gradient-to-br from-violet-50 to-indigo-50 border border-violet-200 rounded-2xl hover:shadow-md transition-all group">
              <div className="w-12 h-12 rounded-xl bg-violet-100 flex items-center justify-center text-2xl flex-shrink-0">🤝</div>
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-slate-900">Browse All on Handshake</p>
                <p className="text-xs text-slate-500 mt-0.5">Internships, full-time roles, employer events, career fairs</p>
              </div>
              <ExternalLink size={16} className="text-violet-500 group-hover:text-violet-700 flex-shrink-0" />
            </a>
            <a href="https://www.myworkday.com/bowdoin/d/task/1422$2251.htmld" target="_blank" rel="noopener noreferrer"
              className="flex items-center gap-4 p-5 bg-gradient-to-br from-blue-50 to-sky-50 border border-blue-200 rounded-2xl hover:shadow-md transition-all group">
              <div className="w-12 h-12 rounded-xl bg-blue-100 flex items-center justify-center text-2xl flex-shrink-0">🏢</div>
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-slate-900">Browse On-Campus Jobs</p>
                <p className="text-xs text-slate-500 mt-0.5">Work-study, campus jobs, research positions at Bowdoin</p>
              </div>
              <ExternalLink size={16} className="text-blue-500 group-hover:text-blue-700 flex-shrink-0" />
            </a>
          </div>
        </div>
      )}

      {/* ── INTEGRATIONS TAB ── */}
      {tab === 'integrations' && (
        <div className="space-y-5">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-sm font-semibold text-slate-800">University Integrations</h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Connect your Bowdoin accounts to sync data automatically
                · <span className="text-emerald-600 font-medium">{connectedCount}/{integrations.length} connected</span>
              </p>
            </div>
            <button
              onClick={() => { integrations.forEach((i, idx) => { if (!i.connected) setTimeout(() => connectIntegration(i.id), idx * 400) }) }}
              className="flex items-center gap-2 px-3 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-semibold transition-all shadow-sm">
              <Zap size={13} /> Connect All
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {integrations.map(integration => (
              <div key={integration.id} className={cn('bg-white border rounded-2xl p-5 shadow-sm transition-all',
                integration.connected ? 'border-emerald-200 bg-emerald-50/30' : 'border-black/[0.07]')}>
                <div className="flex items-start gap-4">
                  <div className={cn('w-12 h-12 rounded-xl flex items-center justify-center text-2xl flex-shrink-0 border', integration.color)}>
                    {integration.icon}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-0.5">
                      <h3 className="text-sm font-bold text-slate-900">{integration.name}</h3>
                      {integration.connected && (
                        <span className="text-[10px] px-1.5 py-0.5 bg-emerald-100 text-emerald-700 rounded-full font-semibold flex items-center gap-1">
                          <div className="w-1 h-1 bg-emerald-500 rounded-full animate-pulse" /> Live
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-slate-500">{integration.description}</p>
                    {integration.connected && integration.lastSync && (
                      <p className="text-[10px] text-slate-400 mt-1">Last sync: {integration.lastSync}</p>
                    )}
                    <div className="flex flex-wrap gap-1 mt-2">
                      {integration.dataTypes.map(dt => (
                        <span key={dt} className="text-[10px] px-1.5 py-0.5 bg-slate-100 text-slate-500 rounded-full">{dt}</span>
                      ))}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2 mt-4 pt-3 border-t border-slate-100">
                  <a href={integration.url} target="_blank" rel="noopener noreferrer"
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-white hover:bg-slate-50 text-slate-600 border border-slate-200 rounded-xl text-xs font-medium transition-all">
                    <ExternalLink size={11} /> Open Site
                  </a>
                  {integration.connected ? (
                    <button onClick={() => setIntegrations(prev => prev.map(i => i.id === integration.id ? { ...i, connected: false } : i))}
                      className="flex items-center gap-1.5 px-3 py-1.5 bg-white hover:bg-red-50 text-slate-400 hover:text-red-500 border border-slate-200 hover:border-red-200 rounded-xl text-xs font-medium transition-all ml-auto">
                      Disconnect
                    </button>
                  ) : (
                    <button onClick={() => connectIntegration(integration.id)} disabled={connecting === integration.id}
                      className="flex items-center gap-1.5 px-4 py-1.5 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-70 text-white rounded-xl text-xs font-semibold transition-all shadow-sm ml-auto">
                      {connecting === integration.id ? <Loader2 size={11} className="animate-spin" /> : <Link2 size={11} />}
                      {connecting === integration.id ? 'Connecting…' : 'Connect'}
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* What happens when connected */}
          <div className="bg-gradient-to-br from-indigo-50 to-violet-50 border border-indigo-200/50 rounded-2xl p-5">
            <h3 className="text-sm font-semibold text-slate-800 mb-3 flex items-center gap-2">
              <Sparkles size={14} className="text-indigo-600" /> What gets synced when you connect
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {[
                { icon: '🎓', title: 'Canvas', detail: 'Assignments auto-create tasks in Nexus. Grades and announcements appear in your dashboard.' },
                { icon: '💼', title: 'Teams', detail: 'Online meetings and office hours populate your Nexus calendar automatically.' },
                { icon: '🤝', title: 'Handshake', detail: 'New jobs matching your profile appear in your Jobs tab. Application deadlines create reminders.' },
                { icon: '🏢', title: 'Workday', detail: 'On-campus job openings are fetched weekly. Your work schedule syncs to your calendar.' },
                { icon: '🎪', title: 'Campus Groups', detail: 'Events you RSVP to are added to your calendar. Club announcements appear in your feed.' },
                { icon: '🎫', title: 'Bowdoin Tickets', detail: 'Athletic schedules and performance dates sync automatically. Ticket purchase links included.' },
              ].map(item => (
                <div key={item.title} className="flex items-start gap-3 bg-white rounded-xl p-3 border border-white shadow-sm">
                  <span className="text-xl flex-shrink-0">{item.icon}</span>
                  <div>
                    <p className="text-xs font-semibold text-slate-700">{item.title}</p>
                    <p className="text-[10px] text-slate-500 mt-0.5 leading-relaxed">{item.detail}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
