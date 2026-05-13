'use client'

import { useState } from 'react'
import {
  TrendingUp, Link2, Loader2, RefreshCw, Check, Sparkles, X,
  Plus, Eye, Heart, MessageCircle, Share2, Bookmark, Users,
  BarChart2, Lightbulb, Target, Clock, Hash, Zap, Star,
  ChevronDown, ChevronRight, AlertTriangle, Play,
} from 'lucide-react'
import { cn } from '@/lib/utils'

// ── Types ──────────────────────────────────────────────────────

type Platform = 'instagram' | 'tiktok' | 'both'
type Tab = 'overview' | 'content' | 'competitors' | 'ideas'

interface MyPost {
  id: string
  platform: 'instagram' | 'tiktok'
  type: 'reel' | 'post' | 'video' | 'carousel'
  title: string
  emoji: string
  date: string
  views: number
  likes: number
  comments: number
  shares: number
  saves: number
  engagementRate: number
  aiScore: number
  tags: string[]
}

interface Competitor {
  id: string
  handle: string
  platform: Platform
  name: string
  emoji: string
  followers: number
  engagementRate: number
  avgViews: number
  postFrequency: string
  niche: string[]
  topFormats: string[]
  analyzed: boolean
  insights?: string[]
}

interface ContentIdea {
  id: string
  title: string
  hook: string
  format: string
  platform: Platform
  estimatedReach: string
  trendScore: number
  basedOn: string
  tags: string[]
}

interface AIAnalysis {
  hookScore: number
  ctaScore: number
  hashtagScore: number
  retentionScore: number
  suggestions: string[]
  bestTime: string
  trendAlignment: string[]
  improvedHook: string
  recommendedTags: string[]
}

// ── Mock Data ──────────────────────────────────────────────────

const MY_POSTS: MyPost[] = [
  { id: 'p1', platform: 'tiktok', type: 'video', title: '5 productivity hacks that changed my uni life', emoji: '⚡', date: 'May 10', views: 67400, likes: 4120, comments: 189, shares: 892, saves: 1340, engagementRate: 9.7, aiScore: 82, tags: ['productivity', 'student', 'studytok'] },
  { id: 'p2', platform: 'tiktok', type: 'video', title: 'How I organize my notes with Notion', emoji: '📓', date: 'May 7', views: 22100, likes: 1840, comments: 234, shares: 445, saves: 2100, engagementRate: 20.8, aiScore: 91, tags: ['notion', 'notes', 'studytips'] },
  { id: 'p3', platform: 'instagram', type: 'reel', title: 'Morning routine as a CS student', emoji: '🌅', date: 'May 5', views: 12300, likes: 890, comments: 67, shares: 134, saves: 312, engagementRate: 11.4, aiScore: 74, tags: ['morningroutine', 'csstudent', 'dayinmylife'] },
  { id: 'p4', platform: 'tiktok', type: 'video', title: 'Study with me – 3 hour session', emoji: '📚', date: 'May 3', views: 45200, likes: 3210, comments: 89, shares: 234, saves: 890, engagementRate: 9.8, aiScore: 78, tags: ['studywithme', 'pomodoro', 'focus'] },
  { id: 'p5', platform: 'instagram', type: 'carousel', title: 'My complete study setup tour', emoji: '🖥️', date: 'Apr 30', views: 8900, likes: 1240, comments: 98, shares: 67, saves: 567, engagementRate: 22.2, aiScore: 88, tags: ['studysetup', 'desksetup', 'aesthetic'] },
  { id: 'p6', platform: 'tiktok', type: 'video', title: 'French learning journey – month 3 update', emoji: '🇫🇷', date: 'Apr 28', views: 18600, likes: 1120, comments: 312, shares: 145, saves: 234, engagementRate: 9.7, aiScore: 69, tags: ['languagelearning', 'french', 'polyglot'] },
  { id: 'p7', platform: 'instagram', type: 'reel', title: 'What I eat in a day as a CS student', emoji: '🥗', date: 'Apr 25', views: 7800, likes: 654, comments: 43, shares: 89, saves: 123, engagementRate: 11.7, aiScore: 65, tags: ['whatieatinaday', 'studentlife', 'healthyeating'] },
  { id: 'p8', platform: 'tiktok', type: 'video', title: 'Coding night vlog – debugging until 2am', emoji: '💻', date: 'Apr 22', views: 8900, likes: 432, comments: 78, shares: 56, saves: 145, engagementRate: 8.0, aiScore: 60, tags: ['coding', 'programminglife', 'vlog'] },
]

const MOCK_ANALYSES: Record<string, AIAnalysis> = {
  p1: { hookScore: 9, ctaScore: 7, hashtagScore: 6, retentionScore: 8, suggestions: ['Add a stronger visual hook in the first 2 seconds', 'Include a clear CTA asking users to save the video', 'Replace #student with #studytok for 3x more reach', 'Add text overlay during transitions to improve retention'], bestTime: 'Tue–Thu 8–9 PM', trendAlignment: ['#StudyTok', '#ProductivityTips', '#UniLife'], improvedHook: '"Stop scrolling — these 5 hacks saved my GPA (and my sleep)"', recommendedTags: ['#StudyTok', '#ProductivityHacks', '#UniTips', '#StudentLife', '#FocusTips'] },
  p2: { hookScore: 10, ctaScore: 9, hashtagScore: 8, retentionScore: 9, suggestions: ['This is your top performer! Pin it to your profile', 'Create a Part 2 with advanced Notion templates', 'Reply to top comments with a video to boost the algorithm', 'Repurpose this as an Instagram carousel'], bestTime: 'Already performing — boost with a Duet', trendAlignment: ['#Notion', '#NotionTips', '#DigitalPlanning'], improvedHook: 'Hook is already strong — keep this format!', recommendedTags: ['#Notion', '#NotionSetup', '#ProductivityTips', '#StudyTips', '#Organization'] },
  p3: { hookScore: 7, ctaScore: 5, hashtagScore: 7, retentionScore: 6, suggestions: ['Start with a surprising statement instead of "hi guys"', 'Show the most visually appealing moment in the first 3 seconds', 'Add "save this for your morning routine" as CTA', 'Use trending morning audio to boost discoverability'], bestTime: 'Mon–Wed 7–8 AM', trendAlignment: ['#MorningRoutine', '#DayInMyLife'], improvedHook: '"My 6am CS student routine (you won\'t believe how early I wake up)"', recommendedTags: ['#MorningRoutine', '#CsStudent', '#DayInMyLife', '#StudyMotivation', '#Aesthetic'] },
  p6: { hookScore: 6, ctaScore: 5, hashtagScore: 7, retentionScore: 7, suggestions: ['Language learning content is trending — post more consistently in this niche', 'Show before/after: demonstrate your improvement with a conversation', 'Partner with a French language account for a duet', 'Add subtitles in both English and French for dual audience'], bestTime: 'Sun 6–8 PM', trendAlignment: ['#LanguageLearning', '#Polyglot', '#LearnFrench'], improvedHook: '"I tried speaking French after 3 months — here\'s what happened (cringe warning)"', recommendedTags: ['#LearnFrench', '#LanguageTok', '#Polyglot', '#FrenchLearning', '#LanguageChallenge'] },
}

const INITIAL_COMPETITORS: Competitor[] = [
  { id: 'c1', handle: '@studywithjess', platform: 'both', name: 'Jess · Study & Productivity', emoji: '📖', followers: 125000, engagementRate: 3.8, avgViews: 45000, postFrequency: '1 per day', niche: ['study', 'productivity', 'aesthetic', 'student'], topFormats: ['Study with me', 'Day in my life', 'Tips & hacks', 'Q&A'], analyzed: true, insights: ['Posts daily at 7pm EST — very consistent', 'Study with me videos average 2x her normal reach', 'Uses trending audio on 80% of posts', 'Aesthetic B-roll + voiceover drives 60% of saves', 'Strong community: responds to every comment in the first hour'] },
  { id: 'c2', handle: '@techstudentlife', platform: 'tiktok', name: 'Alex · CS & Coding Content', emoji: '💻', followers: 89000, engagementRate: 5.1, avgViews: 62000, postFrequency: '4–5 per week', niche: ['coding', 'cs', 'tech', 'career', 'internship'], topFormats: ['Code reviews', 'Day in my life (tech intern)', 'Interview prep', 'Project showcases'], analyzed: true, insights: ['Coding tutorials with visible screen recording are his #1 format', 'Career/internship content gets 3x engagement vs regular vlogs', 'Posts Monday & Wednesday morning for peak reach', 'Uses hooks that challenge common beliefs ("X is NOT what they teach you")'] },
  { id: 'c3', handle: '@dailyplanning', platform: 'instagram', name: 'Mia · Planning & Organization', emoji: '🗓️', followers: 45000, engagementRate: 4.7, avgViews: 12000, postFrequency: '3–4 per week', niche: ['planning', 'productivity', 'journaling', 'wellness', 'balance'], topFormats: ['Planner flips', 'Weekly plan with me', 'Notion templates', 'Habit tracking'], analyzed: true, insights: ['Sunday planning posts are her highest reach format', 'Free template offers convert followers to email list', 'Carousel posts get 4x more saves than Reels', 'Very personal captions — shares real struggles, builds trust'] },
]

const CONTENT_IDEAS: ContentIdea[] = [
  { id: 'i1', title: '"I tried the productivity system of a 4.0 student for a week"', hook: '"What if I stopped using my own system and copied the top student\'s routine exactly?"', format: 'TikTok Video (3–5 min)', platform: 'tiktok', estimatedReach: '40–80K views', trendScore: 94, basedOn: 'Trending challenge format · @studywithjess strategy', tags: ['#StudyChallenge', '#ProductivityTok', '#StudentLife'] },
  { id: 'i2', title: 'My Notion setup walkthrough (free template)', hook: '"The exact Notion system I use to manage 5 courses, 3 languages, and a content calendar"', format: 'Instagram Carousel (8–10 slides)', platform: 'instagram', estimatedReach: '8–15K saves', trendScore: 88, basedOn: 'Your top performing Notion video · @dailyplanning template strategy', tags: ['#Notion', '#FreeTemplate', '#StudentOrganization'] },
  { id: 'i3', title: '"Realistic day in my life — CS student + content creator"', hook: '"6am to midnight. This is what being a CS student AND content creator actually looks like."', format: 'TikTok / Instagram Reel (60s)', platform: 'both', estimatedReach: '25–60K views', trendScore: 86, basedOn: '@techstudentlife day-in-life format · your best engagement format', tags: ['#DayInMyLife', '#ContentCreator', '#CsStudent'] },
  { id: 'i4', title: '"Things CS students wish someone told them before year 1"', hook: '"I wish I had this list my first week of university"', format: 'TikTok Video (2–3 min)', platform: 'tiktok', estimatedReach: '50–120K views', trendScore: 91, basedOn: '@techstudentlife challenge hook format · high-save content pattern', tags: ['#CsStudent', '#UniversityTips', '#ComputerScience'] },
  { id: 'i5', title: 'French learning challenge — speak for 30 days straight', hook: '"I\'m going to speak French for 30 days and document everything — even the embarrassing parts"', format: 'TikTok Series (daily 30s clips)', platform: 'tiktok', estimatedReach: '15–40K views per episode', trendScore: 83, basedOn: 'Language challenge trend · your French content engagement spike', tags: ['#30DayChallenge', '#LearnFrench', '#LanguageTok'] },
  { id: 'i6', title: '"Rate my study setup" – audience participation', hook: '"Send me your study setups and I\'ll rate them honestly (and roast them a little)"', format: 'Instagram Reel + TikTok Stitch', platform: 'both', estimatedReach: '20–45K views', trendScore: 79, basedOn: 'UGC collaboration format · @studywithjess community building', tags: ['#StudySetup', '#StudyAesthetic', '#DeskTour'] },
]

// ── Helpers ────────────────────────────────────────────────────

function fmtNum(n: number): string {
  if (n >= 1000000) return `${(n / 1000000).toFixed(1)}M`
  if (n >= 1000) return `${(n / 1000).toFixed(1)}K`
  return n.toString()
}

function PlatformBadge({ platform }: { platform: 'instagram' | 'tiktok' | 'both' }) {
  if (platform === 'both') return (
    <div className="flex items-center gap-1">
      <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-pink-50 text-pink-600 border border-pink-200 font-medium">IG</span>
      <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-slate-900 text-white border border-slate-800 font-medium">TT</span>
    </div>
  )
  if (platform === 'instagram') return <span className="text-[10px] px-2 py-0.5 rounded-full bg-gradient-to-r from-pink-50 to-violet-50 text-pink-600 border border-pink-200 font-medium">Instagram</span>
  return <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-900 text-white font-medium">TikTok</span>
}

function ScoreBar({ value, max = 10, color }: { value: number; max?: number; color: string }) {
  return (
    <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
      <div className={cn('h-full rounded-full transition-all', color)} style={{ width: `${(value / max) * 100}%` }} />
    </div>
  )
}

function TrendBadge({ score }: { score: number }) {
  const color = score >= 90 ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : score >= 80 ? 'bg-indigo-50 text-indigo-700 border-indigo-200' : 'bg-amber-50 text-amber-700 border-amber-200'
  return <span className={cn('text-[10px] px-2 py-0.5 rounded-full border font-semibold', color)}>{score}% trend</span>
}

// ── Main Component ─────────────────────────────────────────────

export default function SocialPage() {
  const [tab, setTab] = useState<Tab>('overview')
  const [igConnected, setIgConnected] = useState(false)
  const [ttConnected, setTtConnected] = useState(false)
  const [connectingIg, setConnectingIg] = useState(false)
  const [connectingTt, setConnectingTt] = useState(false)
  const [syncing, setSyncing] = useState(false)
  const [syncDone, setSyncDone] = useState(false)

  // Content analysis
  const [analyzingPost, setAnalyzingPost] = useState<string | null>(null)
  const [postAnalyses, setPostAnalyses] = useState<Record<string, AIAnalysis>>({})
  const [expandedPost, setExpandedPost] = useState<string | null>(null)
  const [contentFilter, setContentFilter] = useState<'all' | 'instagram' | 'tiktok'>('all')

  // Competitors
  const [competitors, setCompetitors] = useState<Competitor[]>(INITIAL_COMPETITORS)
  const [addingCompetitor, setAddingCompetitor] = useState(false)
  const [newHandle, setNewHandle] = useState('')
  const [newPlatform, setNewPlatform] = useState<Platform>('both')
  const [analyzingComp, setAnalyzingComp] = useState<string | null>(null)
  const [expandedComp, setExpandedComp] = useState<string | null>(null)

  // Ideas
  const [generatingIdeas, setGeneratingIdeas] = useState(false)
  const [ideas, setIdeas] = useState<ContentIdea[]>(CONTENT_IDEAS)
  const [savedIdeas, setSavedIdeas] = useState<Set<string>>(new Set())

  async function connectIG() {
    setConnectingIg(true)
    await new Promise(r => setTimeout(r, 1800))
    setIgConnected(true)
    setConnectingIg(false)
  }
  async function connectTT() {
    setConnectingTt(true)
    await new Promise(r => setTimeout(r, 1800))
    setTtConnected(true)
    setConnectingTt(false)
  }
  async function handleSync() {
    setSyncing(true)
    await new Promise(r => setTimeout(r, 1500))
    setSyncing(false)
    setSyncDone(true)
    setTimeout(() => setSyncDone(false), 3000)
  }

  async function analyzePost(postId: string) {
    setAnalyzingPost(postId)
    await new Promise(r => setTimeout(r, 2000))
    const analysis = MOCK_ANALYSES[postId] ?? {
      hookScore: Math.floor(Math.random() * 3) + 6,
      ctaScore: Math.floor(Math.random() * 4) + 5,
      hashtagScore: Math.floor(Math.random() * 4) + 5,
      retentionScore: Math.floor(Math.random() * 3) + 6,
      suggestions: ['Improve your opening hook within the first 2 seconds', 'Add a save-worthy CTA at the end', 'Use trending audio to increase discoverability', 'Post at peak time for your audience'],
      bestTime: 'Tue–Thu 7–9 PM',
      trendAlignment: ['#StudentLife', '#Productivity'],
      improvedHook: 'Try a more surprising or relatable opening line',
      recommendedTags: ['#StudyTok', '#StudentLife', '#Productivity', '#Aesthetic'],
    }
    setPostAnalyses(prev => ({ ...prev, [postId]: analysis }))
    setExpandedPost(postId)
    setAnalyzingPost(null)
  }

  async function analyzeCompetitor(compId: string) {
    setAnalyzingComp(compId)
    await new Promise(r => setTimeout(r, 2500))
    setCompetitors(prev => prev.map(c => c.id === compId ? { ...c, analyzed: true, insights: c.insights ?? ['Strong consistent posting schedule', 'High engagement in comments section', 'Trending audio usage drives discovery', 'CTA in every post drives saves'] } : c))
    setExpandedComp(compId)
    setAnalyzingComp(null)
  }

  async function addCompetitor() {
    if (!newHandle.trim()) return
    const handle = newHandle.startsWith('@') ? newHandle : `@${newHandle}`
    const newComp: Competitor = {
      id: `c-${Date.now()}`,
      handle,
      platform: newPlatform,
      name: `${handle} · Creator`,
      emoji: '👤',
      followers: Math.floor(Math.random() * 200000) + 10000,
      engagementRate: +(Math.random() * 5 + 2).toFixed(1),
      avgViews: Math.floor(Math.random() * 80000) + 5000,
      postFrequency: ['Daily', '4–5/week', '3–4/week', '2–3/week'][Math.floor(Math.random() * 4)],
      niche: ['content', 'lifestyle', 'student'],
      topFormats: ['Vlogs', 'Tips', 'Day in my life'],
      analyzed: false,
    }
    setCompetitors(prev => [...prev, newComp])
    setNewHandle('')
    setAddingCompetitor(false)
  }

  async function generateMoreIdeas() {
    setGeneratingIdeas(true)
    await new Promise(r => setTimeout(r, 2200))
    const newIdea: ContentIdea = {
      id: `idea-${Date.now()}`,
      title: '"What I wish I knew before starting university content creation"',
      hook: '"I started posting with 0 followers and here\'s every mistake I made"',
      format: 'TikTok Video (3–4 min)',
      platform: 'tiktok',
      estimatedReach: '30–70K views',
      trendScore: 87,
      basedOn: 'Your audience interest pattern · creator journey content trend',
      tags: ['#ContentCreator', '#CreatorTips', '#StudentCreator'],
    }
    setIdeas(prev => [newIdea, ...prev])
    setGeneratingIdeas(false)
  }

  const anyConnected = igConnected || ttConnected
  const filteredPosts = MY_POSTS.filter(p => contentFilter === 'all' || p.platform === contentFilter)

  const TABS: { id: Tab; label: string; icon: typeof BarChart2 }[] = [
    { id: 'overview', label: 'Overview', icon: BarChart2 },
    { id: 'content', label: 'My Content', icon: Play },
    { id: 'competitors', label: 'Competitor Radar', icon: Target },
    { id: 'ideas', label: 'Content Ideas', icon: Lightbulb },
  ]

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-3">
            <span className="text-2xl">📱</span>
            Social Media
          </h1>
          <p className="text-slate-500 text-sm mt-1">Professional analytics, AI content analysis & competitor radar</p>
        </div>
        <div className="flex items-center gap-2">
          {anyConnected && (
            <button onClick={handleSync} disabled={syncing}
              className="flex items-center gap-2 px-3 py-2 bg-white hover:bg-slate-50 border border-slate-200 text-slate-600 rounded-xl text-sm font-medium transition-all shadow-sm disabled:opacity-70">
              {syncing ? <Loader2 size={14} className="animate-spin" /> : syncDone ? <Check size={14} className="text-emerald-500" /> : <RefreshCw size={14} />}
              {syncDone ? 'Updated!' : 'Sync'}
            </button>
          )}
        </div>
      </div>

      {/* Account Connection Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Instagram */}
        <div className={cn('rounded-2xl border p-5 shadow-sm transition-all', igConnected ? 'bg-gradient-to-br from-pink-50 to-violet-50 border-pink-200' : 'bg-white border-black/[0.07]')}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-xl flex items-center justify-center text-2xl"
                style={{ background: 'linear-gradient(135deg, #f09433 0%, #e6683c 25%, #dc2743 50%, #cc2366 75%, #bc1888 100%)' }}>
                📸
              </div>
              <div>
                <p className="font-bold text-slate-900">Instagram</p>
                {igConnected
                  ? <p className="text-xs text-pink-600 font-medium">@laura.creates · Connected</p>
                  : <p className="text-xs text-slate-400">Not connected</p>}
              </div>
            </div>
            {igConnected ? (
              <button onClick={() => setIgConnected(false)} className="text-xs text-slate-400 hover:text-slate-600 transition-colors">Disconnect</button>
            ) : (
              <button onClick={connectIG} disabled={connectingIg}
                className="flex items-center gap-1.5 px-4 py-2 text-white rounded-xl text-xs font-semibold transition-all shadow-sm disabled:opacity-70"
                style={{ background: 'linear-gradient(135deg, #f09433, #dc2743, #bc1888)' }}>
                {connectingIg ? <Loader2 size={12} className="animate-spin" /> : <Link2 size={12} />}
                {connectingIg ? 'Connecting…' : 'Connect Instagram'}
              </button>
            )}
          </div>
          {igConnected && (
            <div className="mt-4 grid grid-cols-4 gap-2 pt-4 border-t border-pink-200">
              {[{ label: 'Followers', value: '8.4K' }, { label: 'Posts', value: '76' }, { label: 'Avg Likes', value: '890' }, { label: 'Eng. Rate', value: '4.1%' }].map(s => (
                <div key={s.label} className="text-center">
                  <p className="text-base font-bold text-slate-900">{s.value}</p>
                  <p className="text-[10px] text-slate-500">{s.label}</p>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* TikTok */}
        <div className={cn('rounded-2xl border p-5 shadow-sm transition-all', ttConnected ? 'bg-slate-900 border-slate-700' : 'bg-white border-black/[0.07]')}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-xl bg-black flex items-center justify-center text-2xl">🎵</div>
              <div>
                <p className={cn('font-bold', ttConnected ? 'text-white' : 'text-slate-900')}>TikTok</p>
                {ttConnected
                  ? <p className="text-xs text-emerald-400 font-medium">@lauracreates · Connected</p>
                  : <p className="text-xs text-slate-400">Not connected</p>}
              </div>
            </div>
            {ttConnected ? (
              <button onClick={() => setTtConnected(false)} className="text-xs text-slate-400 hover:text-slate-300 transition-colors">Disconnect</button>
            ) : (
              <button onClick={connectTT} disabled={connectingTt}
                className="flex items-center gap-1.5 px-4 py-2 bg-black hover:bg-slate-800 text-white rounded-xl text-xs font-semibold transition-all shadow-sm disabled:opacity-70">
                {connectingTt ? <Loader2 size={12} className="animate-spin" /> : <Link2 size={12} />}
                {connectingTt ? 'Connecting…' : 'Connect TikTok'}
              </button>
            )}
          </div>
          {ttConnected && (
            <div className="mt-4 grid grid-cols-4 gap-2 pt-4 border-t border-slate-700">
              {[{ label: 'Followers', value: '23.6K' }, { label: 'Videos', value: '134' }, { label: 'Avg Views', value: '15.2K' }, { label: 'Eng. Rate', value: '9.4%' }].map(s => (
                <div key={s.label} className="text-center">
                  <p className="text-base font-bold text-white">{s.value}</p>
                  <p className="text-[10px] text-slate-400">{s.label}</p>
                </div>
              ))}
            </div>
          )}
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

      {/* ── OVERVIEW TAB ── */}
      {tab === 'overview' && (
        <div className="space-y-6">
          {!anyConnected ? (
            <div className="bg-white border border-dashed border-slate-300 rounded-2xl p-12 text-center shadow-sm">
              <div className="text-4xl mb-4">📱</div>
              <h2 className="text-lg font-semibold text-slate-800 mb-2">Connect your accounts to get started</h2>
              <p className="text-slate-500 text-sm max-w-md mx-auto">
                Link Instagram and TikTok above to see your analytics, get AI content analysis, and compare with competitors.
              </p>
            </div>
          ) : (
            <>
              {/* Performance summary */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {[
                  { icon: Eye, value: '32M', label: 'Total Views', sub: '↑ 18% vs last month', color: 'bg-indigo-50 text-indigo-600' },
                  { icon: Heart, value: '214K', label: 'Total Likes', sub: '↑ 22% vs last month', color: 'bg-pink-50 text-pink-600' },
                  { icon: Users, value: '32K', label: 'Total Followers', sub: '+1.2K this month', color: 'bg-violet-50 text-violet-600' },
                  { icon: TrendingUp, value: '11.2%', label: 'Avg Engagement', sub: '↑ from 9.8%', color: 'bg-emerald-50 text-emerald-600' },
                ].map(({ icon: Icon, value, label, sub, color }) => (
                  <div key={label} className="bg-white border border-black/[0.07] rounded-2xl p-5 shadow-sm">
                    <div className={cn('w-9 h-9 rounded-xl flex items-center justify-center mb-3', color)}>
                      <Icon size={16} />
                    </div>
                    <p className="text-2xl font-bold text-slate-900">{value}</p>
                    <p className="text-xs text-slate-500 mt-0.5">{label}</p>
                    <p className="text-xs text-emerald-600 mt-1 font-medium">{sub}</p>
                  </div>
                ))}
              </div>

              {/* Top performing content */}
              <div className="bg-white border border-black/[0.07] rounded-2xl p-5 shadow-sm">
                <h2 className="text-sm font-semibold text-slate-800 mb-4 flex items-center gap-2"><Star size={14} className="text-amber-500" /> Top Performing Content This Month</h2>
                <div className="space-y-3">
                  {MY_POSTS.slice(0, 4).sort((a, b) => b.views - a.views).map((post, i) => (
                    <div key={post.id} className="flex items-center gap-3">
                      <span className="text-xs font-bold text-slate-300 w-5 text-right">#{i + 1}</span>
                      <span className="text-xl">{post.emoji}</span>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-slate-800 truncate">{post.title}</p>
                        <div className="flex items-center gap-3 mt-0.5">
                          <PlatformBadge platform={post.platform} />
                          <span className="text-xs text-slate-400 flex items-center gap-1"><Eye size={10} />{fmtNum(post.views)}</span>
                          <span className="text-xs text-slate-400 flex items-center gap-1"><Heart size={10} />{fmtNum(post.likes)}</span>
                        </div>
                      </div>
                      <div className={cn('text-xs font-semibold px-2 py-1 rounded-lg', post.engagementRate > 15 ? 'bg-emerald-50 text-emerald-700' : post.engagementRate > 8 ? 'bg-indigo-50 text-indigo-700' : 'bg-slate-50 text-slate-600')}>
                        {post.engagementRate}% eng.
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Quick insights */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {[
                  { icon: Clock, title: 'Best Posting Time', body: 'TikTok: Tue–Thu 7–9 PM\nInstagram: Mon–Wed 8–10 AM', color: 'bg-indigo-50 border-indigo-100' },
                  { icon: Hash, title: 'Top Performing Tags', body: '#StudyTok · #Notion\n#ProductivityTips · #StudentLife', color: 'bg-violet-50 border-violet-100' },
                  { icon: AlertTriangle, title: 'Action Needed', body: '3 videos with low hook scores\n2 posts without a clear CTA', color: 'bg-amber-50 border-amber-100' },
                ].map(({ icon: Icon, title, body, color }) => (
                  <div key={title} className={cn('rounded-2xl border p-4 shadow-sm', color)}>
                    <div className="flex items-center gap-2 mb-2">
                      <Icon size={14} className="text-slate-600" />
                      <span className="text-xs font-semibold text-slate-700">{title}</span>
                    </div>
                    <p className="text-xs text-slate-600 whitespace-pre-line leading-relaxed">{body}</p>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      )}

      {/* ── CONTENT TAB ── */}
      {tab === 'content' && (
        <div className="space-y-5">
          <div className="flex items-center gap-2 flex-wrap">
            {(['all', 'tiktok', 'instagram'] as const).map(f => (
              <button key={f} onClick={() => setContentFilter(f)}
                className={cn('px-3 py-1.5 rounded-xl text-xs font-medium capitalize transition-all border',
                  contentFilter === f ? 'bg-slate-900 text-white border-slate-900' : 'bg-white text-slate-500 border-slate-200 hover:border-slate-300')}>
                {f === 'all' ? 'All Platforms' : f === 'tiktok' ? '🎵 TikTok' : '📸 Instagram'}
              </button>
            ))}
            <span className="ml-auto text-xs text-slate-400">{filteredPosts.length} posts</span>
          </div>

          <div className="space-y-3">
            {filteredPosts.map(post => {
              const analysis = postAnalyses[post.id]
              const isAnalyzing = analyzingPost === post.id
              const isExpanded = expandedPost === post.id

              return (
                <div key={post.id} className="bg-white border border-black/[0.07] rounded-2xl shadow-sm overflow-hidden">
                  {/* Post row */}
                  <div className="p-5">
                    <div className="flex items-start gap-4">
                      {/* Thumbnail placeholder */}
                      <div className="w-14 h-14 rounded-xl bg-slate-100 flex items-center justify-center text-2xl flex-shrink-0">{post.emoji}</div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <PlatformBadge platform={post.platform} />
                          <span className="text-[10px] text-slate-400 capitalize">{post.type}</span>
                          <span className="text-[10px] text-slate-400 ml-auto">{post.date}</span>
                        </div>
                        <p className="text-sm font-semibold text-slate-800 leading-snug">{post.title}</p>

                        {/* Metrics */}
                        <div className="flex items-center gap-3 mt-2 flex-wrap">
                          <span className="flex items-center gap-1 text-xs text-slate-500"><Eye size={11} />{fmtNum(post.views)}</span>
                          <span className="flex items-center gap-1 text-xs text-slate-500"><Heart size={11} />{fmtNum(post.likes)}</span>
                          <span className="flex items-center gap-1 text-xs text-slate-500"><MessageCircle size={11} />{fmtNum(post.comments)}</span>
                          <span className="flex items-center gap-1 text-xs text-slate-500"><Share2 size={11} />{fmtNum(post.shares)}</span>
                          <span className="flex items-center gap-1 text-xs text-slate-500"><Bookmark size={11} />{fmtNum(post.saves)}</span>
                          <span className={cn('ml-1 text-xs font-semibold px-2 py-0.5 rounded-lg', post.engagementRate > 15 ? 'bg-emerald-50 text-emerald-700' : post.engagementRate > 8 ? 'bg-indigo-50 text-indigo-700' : 'bg-slate-50 text-slate-600')}>
                            {post.engagementRate}% eng.
                          </span>
                        </div>
                      </div>

                      {/* AI Score + Analyze button */}
                      <div className="flex flex-col items-end gap-2 flex-shrink-0">
                        <div className={cn('text-sm font-bold px-2 py-1 rounded-lg', post.aiScore >= 85 ? 'bg-emerald-50 text-emerald-700' : post.aiScore >= 70 ? 'bg-indigo-50 text-indigo-700' : 'bg-amber-50 text-amber-700')}>
                          {analysis ? `${Math.round((analysis.hookScore + analysis.ctaScore + analysis.hashtagScore + analysis.retentionScore) / 4 * 10)}%` : `${post.aiScore}%`}
                        </div>
                        <button
                          onClick={() => analysis ? setExpandedPost(isExpanded ? null : post.id) : analyzePost(post.id)}
                          disabled={isAnalyzing}
                          className={cn('flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all shadow-sm disabled:opacity-60',
                            analysis ? 'bg-slate-100 hover:bg-slate-200 text-slate-700' : 'bg-indigo-600 hover:bg-indigo-700 text-white')}>
                          {isAnalyzing ? <Loader2 size={11} className="animate-spin" /> : <Sparkles size={11} />}
                          {isAnalyzing ? 'Analyzing…' : analysis ? (isExpanded ? 'Hide' : 'View Analysis') : 'AI Analyze'}
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* AI Analysis Panel */}
                  {isExpanded && analysis && (
                    <div className="border-t border-slate-100 bg-gradient-to-br from-indigo-50/50 to-violet-50/50 p-5 space-y-5">
                      <div className="flex items-center gap-2">
                        <Sparkles size={13} className="text-indigo-600" />
                        <span className="text-xs font-semibold text-slate-700 uppercase tracking-wide">AI Content Analysis</span>
                      </div>

                      {/* Score breakdown */}
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        {[
                          { label: 'Hook Strength', score: analysis.hookScore, color: 'bg-indigo-500' },
                          { label: 'CTA Quality', score: analysis.ctaScore, color: 'bg-violet-500' },
                          { label: 'Hashtags', score: analysis.hashtagScore, color: 'bg-pink-500' },
                          { label: 'Retention', score: analysis.retentionScore, color: 'bg-emerald-500' },
                        ].map(({ label, score, color }) => (
                          <div key={label} className="bg-white rounded-xl p-3 shadow-sm border border-white">
                            <div className="flex items-center justify-between mb-2">
                              <span className="text-[10px] text-slate-500 font-medium">{label}</span>
                              <span className="text-xs font-bold text-slate-900">{score}/10</span>
                            </div>
                            <ScoreBar value={score} color={color} />
                          </div>
                        ))}
                      </div>

                      {/* Improved hook */}
                      <div className="bg-white rounded-xl p-4 border border-indigo-100 shadow-sm">
                        <p className="text-[10px] font-semibold text-indigo-600 uppercase tracking-wide mb-2">💡 Suggested Hook Rewrite</p>
                        <p className="text-sm text-slate-700 italic leading-relaxed">"{analysis.improvedHook}"</p>
                      </div>

                      {/* Suggestions */}
                      <div>
                        <p className="text-[10px] font-semibold text-slate-600 uppercase tracking-wide mb-2">Improvement Suggestions</p>
                        <div className="space-y-2">
                          {analysis.suggestions.map((s, i) => (
                            <div key={i} className="flex items-start gap-2 bg-white rounded-lg p-3 border border-slate-100 shadow-sm">
                              <span className="text-xs font-bold text-indigo-500 flex-shrink-0 mt-0.5">0{i + 1}</span>
                              <p className="text-xs text-slate-700 leading-relaxed">{s}</p>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Best time + recommended tags */}
                      <div className="grid grid-cols-2 gap-4">
                        <div className="bg-white rounded-xl p-3 border border-slate-100 shadow-sm">
                          <p className="text-[10px] font-semibold text-slate-500 mb-1 flex items-center gap-1"><Clock size={10} /> Best Posting Time</p>
                          <p className="text-xs font-semibold text-slate-800">{analysis.bestTime}</p>
                        </div>
                        <div className="bg-white rounded-xl p-3 border border-slate-100 shadow-sm">
                          <p className="text-[10px] font-semibold text-slate-500 mb-1 flex items-center gap-1"><Hash size={10} /> Trending Tags to Use</p>
                          <div className="flex flex-wrap gap-1">
                            {analysis.recommendedTags.slice(0, 3).map(tag => (
                              <span key={tag} className="text-[10px] px-1.5 py-0.5 bg-indigo-50 text-indigo-600 rounded border border-indigo-100 font-medium">{tag}</span>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* ── COMPETITORS TAB ── */}
      {tab === 'competitors' && (
        <div className="space-y-5">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-sm font-semibold text-slate-800">Competitor Radar</h2>
              <p className="text-xs text-slate-500 mt-0.5">Add creators in your niche — AI analyzes their strategy and helps you generate content ideas</p>
            </div>
            <button onClick={() => setAddingCompetitor(true)}
              className="flex items-center gap-1.5 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-semibold transition-all shadow-sm">
              <Plus size={13} /> Add Creator
            </button>
          </div>

          {/* Add competitor form */}
          {addingCompetitor && (
            <div className="bg-white border border-indigo-200 rounded-2xl p-5 shadow-sm space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-semibold text-slate-800">Add a Creator to Monitor</h3>
                <button onClick={() => setAddingCompetitor(false)} className="text-slate-400 hover:text-slate-600"><X size={15} /></button>
              </div>
              <div className="grid grid-cols-3 gap-3">
                <div className="col-span-2">
                  <label className="text-xs text-slate-500 mb-1 block">Instagram or TikTok handle</label>
                  <input type="text" value={newHandle} onChange={e => setNewHandle(e.target.value)}
                    placeholder="@handle or username"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:border-indigo-400 transition-all" />
                </div>
                <div>
                  <label className="text-xs text-slate-500 mb-1 block">Platform</label>
                  <select value={newPlatform} onChange={e => setNewPlatform(e.target.value as Platform)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-sm text-slate-700 focus:outline-none focus:border-indigo-400">
                    <option value="both">Both</option>
                    <option value="instagram">Instagram</option>
                    <option value="tiktok">TikTok</option>
                  </select>
                </div>
              </div>
              <button onClick={addCompetitor}
                className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-sm font-semibold transition-all shadow-sm">
                <Plus size={13} /> Add & Analyze
              </button>
            </div>
          )}

          {/* Competitor cards */}
          <div className="space-y-4">
            {competitors.map(comp => {
              const isAnalyzing = analyzingComp === comp.id
              const isExpanded = expandedComp === comp.id

              return (
                <div key={comp.id} className="bg-white border border-black/[0.07] rounded-2xl shadow-sm overflow-hidden">
                  <div className="p-5">
                    <div className="flex items-start gap-4">
                      <div className="w-12 h-12 rounded-xl bg-slate-100 flex items-center justify-center text-2xl flex-shrink-0">{comp.emoji}</div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-0.5">
                          <span className="text-sm font-bold text-slate-900">{comp.handle}</span>
                          <PlatformBadge platform={comp.platform} />
                          {comp.analyzed && <span className="text-[10px] px-1.5 py-0.5 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-full font-medium">Analyzed</span>}
                        </div>
                        <p className="text-xs text-slate-500">{comp.name}</p>
                        <div className="flex items-center gap-4 mt-2 flex-wrap">
                          <span className="flex items-center gap-1 text-xs text-slate-500"><Users size={11} />{fmtNum(comp.followers)} followers</span>
                          <span className="text-xs text-slate-500">{comp.engagementRate}% engagement</span>
                          <span className="flex items-center gap-1 text-xs text-slate-500"><Eye size={11} />{fmtNum(comp.avgViews)} avg views</span>
                          <span className="text-xs text-slate-500">{comp.postFrequency}</span>
                        </div>
                        <div className="flex flex-wrap gap-1 mt-2">
                          {comp.niche.map(n => (
                            <span key={n} className="text-[10px] px-1.5 py-0.5 bg-slate-100 text-slate-600 rounded-full">#{n}</span>
                          ))}
                        </div>
                      </div>
                      <div className="flex flex-col gap-2 flex-shrink-0">
                        <button onClick={() => comp.analyzed ? setExpandedComp(isExpanded ? null : comp.id) : analyzeCompetitor(comp.id)}
                          disabled={isAnalyzing}
                          className={cn('flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all shadow-sm disabled:opacity-60',
                            comp.analyzed ? 'bg-slate-100 hover:bg-slate-200 text-slate-700' : 'bg-indigo-600 hover:bg-indigo-700 text-white')}>
                          {isAnalyzing ? <Loader2 size={11} className="animate-spin" /> : <Target size={11} />}
                          {isAnalyzing ? 'Analyzing…' : comp.analyzed ? (isExpanded ? 'Collapse' : 'View Insights') : 'Analyze'}
                        </button>
                        <button onClick={() => setTab('ideas')}
                          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium bg-violet-50 hover:bg-violet-100 text-violet-700 border border-violet-200 transition-all">
                          <Lightbulb size={11} /> Get Ideas
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Competitor analysis panel */}
                  {isExpanded && comp.insights && (
                    <div className="border-t border-slate-100 bg-gradient-to-br from-slate-50 to-indigo-50/30 p-5 space-y-4">
                      <div className="flex items-center gap-2">
                        <Target size={13} className="text-indigo-600" />
                        <span className="text-xs font-semibold text-slate-700 uppercase tracking-wide">Strategy Analysis</span>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {/* Top formats */}
                        <div className="bg-white rounded-xl p-4 border border-slate-100 shadow-sm">
                          <p className="text-[10px] font-semibold text-slate-500 uppercase tracking-wide mb-2">Top Content Formats</p>
                          <div className="space-y-1.5">
                            {comp.topFormats.map((f, i) => (
                              <div key={f} className="flex items-center gap-2">
                                <span className="text-[10px] font-bold text-indigo-400 w-4">#{i + 1}</span>
                                <span className="text-xs text-slate-700">{f}</span>
                              </div>
                            ))}
                          </div>
                        </div>

                        {/* Key insights */}
                        <div className="bg-white rounded-xl p-4 border border-slate-100 shadow-sm">
                          <p className="text-[10px] font-semibold text-slate-500 uppercase tracking-wide mb-2">Strategy Insights</p>
                          <div className="space-y-1.5">
                            {comp.insights.slice(0, 4).map((insight, i) => (
                              <div key={i} className="flex items-start gap-2">
                                <span className="text-emerald-500 text-xs flex-shrink-0 mt-0.5">→</span>
                                <span className="text-xs text-slate-600 leading-relaxed">{insight}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>

                      {/* AI opportunity summary */}
                      <div className="bg-indigo-600 rounded-xl p-4 text-white">
                        <p className="text-[10px] font-semibold uppercase tracking-wide opacity-70 mb-1">AI Opportunity for You</p>
                        <p className="text-xs leading-relaxed">
                          {comp.handle} thrives on <strong>{comp.topFormats[0]}</strong> format which you haven't fully explored.
                          Your audience overlaps significantly — you could capture their audience by combining your <strong>productivity + student life</strong> angle with their <strong>{comp.topFormats[1]?.toLowerCase() ?? 'top'}</strong> approach. Try posting a <strong>{comp.topFormats[0]}</strong> at {comp.handle}'s peak time to tap into their audience.
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* ── IDEAS TAB ── */}
      {tab === 'ideas' && (
        <div className="space-y-5">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-sm font-semibold text-slate-800">AI Content Ideas</h2>
              <p className="text-xs text-slate-500 mt-0.5">Generated from your top content + competitor analysis</p>
            </div>
            <button onClick={generateMoreIdeas} disabled={generatingIdeas}
              className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-70 text-white rounded-xl text-xs font-semibold transition-all shadow-sm">
              {generatingIdeas ? <Loader2 size={13} className="animate-spin" /> : <Sparkles size={13} />}
              {generatingIdeas ? 'Generating…' : 'Generate More Ideas'}
            </button>
          </div>

          <div className="space-y-4">
            {ideas.map(idea => (
              <div key={idea.id} className="bg-white border border-black/[0.07] rounded-2xl p-5 shadow-sm hover:shadow-md hover:border-indigo-200/60 transition-all">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-2 flex-wrap">
                      <PlatformBadge platform={idea.platform} />
                      <span className="text-[10px] text-slate-400">{idea.format}</span>
                      <TrendBadge score={idea.trendScore} />
                      <span className="ml-auto text-[10px] text-slate-400">{idea.estimatedReach}</span>
                    </div>
                    <h3 className="text-sm font-bold text-slate-900 leading-snug mb-2">{idea.title}</h3>
                    <div className="bg-indigo-50 border border-indigo-100 rounded-lg p-2.5 mb-3">
                      <p className="text-[10px] font-semibold text-indigo-600 uppercase tracking-wide mb-1">Suggested Hook</p>
                      <p className="text-xs text-slate-700 italic leading-relaxed">"{idea.hook}"</p>
                    </div>
                    <div className="flex items-center gap-3 flex-wrap">
                      <div className="flex items-center gap-1 text-[10px] text-slate-400">
                        <Zap size={10} className="text-amber-500" />
                        Based on: {idea.basedOn}
                      </div>
                    </div>
                    <div className="flex flex-wrap gap-1 mt-2">
                      {idea.tags.map(tag => (
                        <span key={tag} className="text-[10px] px-2 py-0.5 bg-slate-100 text-slate-600 rounded-full">{tag}</span>
                      ))}
                    </div>
                  </div>
                  <button onClick={() => setSavedIdeas(prev => { const s = new Set(prev); s.has(idea.id) ? s.delete(idea.id) : s.add(idea.id); return s })}
                    className={cn('p-2 rounded-xl transition-all flex-shrink-0', savedIdeas.has(idea.id) ? 'bg-amber-100 text-amber-500' : 'bg-slate-100 text-slate-400 hover:text-amber-500')}>
                    <Bookmark size={15} fill={savedIdeas.has(idea.id) ? 'currentColor' : 'none'} />
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Trending topics in niche */}
          <div className="bg-gradient-to-br from-indigo-50 to-violet-50 border border-indigo-200/50 rounded-2xl p-5">
            <h2 className="text-sm font-semibold text-slate-800 mb-4 flex items-center gap-2">
              <TrendingUp size={14} className="text-indigo-600" /> Trending Topics in Your Niche This Week
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {[
                { tag: '#StudyWithMe', growth: '+234%', platform: 'tiktok' },
                { tag: '#NotionTips', growth: '+87%', platform: 'both' },
                { tag: '#ProductivityTok', growth: '+156%', platform: 'tiktok' },
                { tag: '#DeskSetup', growth: '+62%', platform: 'instagram' },
                { tag: '#LanguageTok', growth: '+198%', platform: 'tiktok' },
                { tag: '#StudentAesthetic', growth: '+45%', platform: 'instagram' },
                { tag: '#CodingLife', growth: '+73%', platform: 'both' },
                { tag: '#UniLife', growth: '+39%', platform: 'both' },
              ].map(({ tag, growth, platform }) => (
                <div key={tag} className="bg-white rounded-xl p-3 border border-white shadow-sm">
                  <p className="text-xs font-semibold text-slate-800">{tag}</p>
                  <p className="text-[10px] text-emerald-600 font-medium mt-0.5">{growth} this week</p>
                  <div className="mt-1"><PlatformBadge platform={platform as Platform} /></div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
