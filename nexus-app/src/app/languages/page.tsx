'use client'

import { useState } from 'react'
import { Globe, Flame, BookOpen, PenTool, Mic, Headphones, Sparkles, Target, CheckCircle, Circle, Loader2, X } from 'lucide-react'
import { mockLanguageItems } from '@/lib/mock-data'
import { cn } from '@/lib/utils'

const FRENCH_SECTIONS = [
  { id: 'grammar', label: 'Grammar', icon: PenTool, color: 'indigo', items: ['Passé Composé', 'Imparfait', 'Future Simple', 'Subjonctif (next)'] },
  { id: 'vocabulary', label: 'Vocabulary', icon: BookOpen, color: 'violet', progress: 47, goal: 300 },
  { id: 'writing', label: 'Writing', icon: PenTool, color: 'emerald', last: 'May 7 · Describe your university' },
  { id: 'speaking', label: 'Speaking', icon: Mic, color: 'amber', last: 'May 6' },
  { id: 'listening', label: 'Listening', icon: Headphones, color: 'red', resources: ['Podcast français facile', 'France 24', 'Coffee Break French'] },
]

const CHINESE_CHARACTERS: { char: string; pinyin: string; meaning: string; tone: number }[] = [
  { char: '你', pinyin: 'nǐ', meaning: 'you', tone: 3 },
  { char: '好', pinyin: 'hǎo', meaning: 'good / hello', tone: 3 },
  { char: '再', pinyin: 'zài', meaning: 'again', tone: 4 },
  { char: '见', pinyin: 'jiàn', meaning: 'see / meet', tone: 4 },
  { char: '中', pinyin: 'zhōng', meaning: 'middle / China', tone: 1 },
  { char: '文', pinyin: 'wén', meaning: 'language / culture', tone: 2 },
  { char: '学', pinyin: 'xué', meaning: 'study / learn', tone: 2 },
  { char: '生', pinyin: 'shēng', meaning: 'life / student', tone: 1 },
  { char: '大', pinyin: 'dà', meaning: 'big / great', tone: 4 },
  { char: '老', pinyin: 'lǎo', meaning: 'old / teacher', tone: 3 },
  { char: '师', pinyin: 'shī', meaning: 'teacher / master', tone: 1 },
  { char: '朋', pinyin: 'péng', meaning: 'friend', tone: 2 },
]

const TONE_COLORS = ['text-red-500', 'text-amber-500', 'text-emerald-500', 'text-indigo-500']

const WEEK_PLAN = {
  french: [
    { day: 'Mon', duration: 20, topic: 'Grammar review' },
    { day: 'Tue', duration: 0, topic: '' },
    { day: 'Wed', duration: 20, topic: 'Vocabulary' },
    { day: 'Thu', duration: 0, topic: '' },
    { day: 'Fri', duration: 30, topic: 'Writing + Speaking' },
    { day: 'Sat', duration: 0, topic: '' },
    { day: 'Sun', duration: 15, topic: 'Review' },
  ],
  chinese: [
    { day: 'Mon', duration: 0, topic: '' },
    { day: 'Tue', duration: 20, topic: 'Characters' },
    { day: 'Wed', duration: 0, topic: '' },
    { day: 'Thu', duration: 20, topic: 'Vocabulary' },
    { day: 'Fri', duration: 0, topic: '' },
    { day: 'Sat', duration: 30, topic: 'Full review' },
    { day: 'Sun', duration: 10, topic: 'Tones' },
  ],
}

function StatChip({ icon: Icon, value, label, bgColor, iconColor }: { icon: any; value: string | number; label: string; bgColor: string; iconColor: string }) {
  return (
    <div className="flex items-center gap-3 px-4 py-3 bg-white border border-black/[0.07] rounded-xl shadow-sm">
      <div className={cn('w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0', bgColor)}>
        <Icon size={16} className={iconColor} />
      </div>
      <div>
        <div className="text-base font-bold text-slate-900">{value}</div>
        <div className="text-xs text-slate-400">{label}</div>
      </div>
    </div>
  )
}

export default function LanguagesPage() {
  const [lang, setLang] = useState<'french' | 'chinese'>('french')
  const [aiLoading, setAiLoading] = useState<string | null>(null)
  const [aiResult, setAiResult] = useState<string | null>(null)
  const [selectedChar, setSelectedChar] = useState<typeof CHINESE_CHARACTERS[0] | null>(null)

  const handleAI = async (action: string) => {
    setAiLoading(action)
    await new Promise(r => setTimeout(r, 1000))
    const responses: Record<string, string> = {
      session: lang === 'french'
        ? '20-min French session: (1) 5 min grammar flashcards — Passé Composé. (2) 8 min vocabulary — 10 new words from your list. (3) 5 min writing — 3 sentences in past tense. (4) 2 min pronunciation review.'
        : '20-min Chinese session: (1) 5 min character writing — practice 你好再见中文. (2) 8 min tone drills — all 4 tones + neutral. (3) 5 min vocabulary — 8 new HSK1 words. (4) 2 min listening — short dialogue.',
      quiz: lang === 'french'
        ? 'Quiz: 1. Conjugate "aller" in passé composé for "je". 2. What does "pourtant" mean? 3. Translate: "I went to school yesterday."'
        : 'Quiz: 1. Write the pinyin for 你好. 2. What tone is 马 (horse)? 3. Translate: 我是学生.',
      schedule: 'I\'ve added language practice blocks to your calendar: Tomorrow at 7 PM (20 min), Thursday at 8 AM (20 min), Saturday at 10 AM (30 min). These fit between your existing classes.',
      mistakes: lang === 'french'
        ? 'Common mistakes: 1. "Je suis allé" vs "J\'ai allé" (être verbs). 2. Agreement in past participle. 3. "depuis" vs "pendant" for duration.'
        : 'Common mistakes: 1. Confusing tones: mā/má/mǎ/mà. 2. Missing measure words (一个, 一本). 3. SVO word order with time expressions.',
    }
    setAiResult(responses[action] ?? 'Processing...')
    setAiLoading(null)
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-3">
            <Globe className="text-indigo-600" size={24} />
            Languages
          </h1>
          <p className="text-slate-500 text-sm mt-1">Your language learning progress and practice</p>
        </div>
      </div>

      {/* Language tabs */}
      <div className="flex gap-3">
        <button onClick={() => setLang('french')}
          className={cn('flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-semibold transition-all',
            lang === 'french'
              ? 'bg-violet-600 text-white shadow-sm'
              : 'bg-white text-slate-600 border border-black/[0.07] hover:border-violet-300 hover:text-violet-700')}>
          🇫🇷 French
        </button>
        <button onClick={() => setLang('chinese')}
          className={cn('flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-semibold transition-all',
            lang === 'chinese'
              ? 'bg-red-500 text-white shadow-sm'
              : 'bg-white text-slate-600 border border-black/[0.07] hover:border-red-300 hover:text-red-700')}>
          🇨🇳 Chinese
        </button>
      </div>

      {lang === 'french' ? (
        <div className="space-y-6">
          {/* Stats */}
          <div className="flex flex-wrap gap-3">
            <StatChip icon={Flame} value="7" label="Day streak" bgColor="bg-amber-50" iconColor="text-amber-500" />
            <StatChip icon={BookOpen} value="142" label="Words learned" bgColor="bg-violet-50" iconColor="text-violet-600" />
            <StatChip icon={Target} value="23" label="Sessions" bgColor="bg-indigo-50" iconColor="text-indigo-600" />
            <StatChip icon={Globe} value="3.5h" label="This week" bgColor="bg-emerald-50" iconColor="text-emerald-600" />
          </div>

          {/* Weekly plan */}
          <div className="bg-white border border-black/[0.07] rounded-xl p-5">
            <h2 className="text-sm font-semibold text-slate-800 mb-4">Weekly Study Plan</h2>
            <div className="grid grid-cols-7 gap-2">
              {WEEK_PLAN.french.map(day => (
                <div key={day.day} className={cn('text-center p-3 rounded-xl',
                  day.duration > 0
                    ? 'bg-violet-100 border border-violet-300 text-violet-800'
                    : 'bg-slate-100 text-slate-400')}>
                  <div className="text-xs font-semibold">{day.day}</div>
                  {day.duration > 0 ? (
                    <>
                      <div className="text-sm font-bold mt-1">{day.duration}m</div>
                      <div className="text-xs mt-0.5 leading-tight opacity-80">{day.topic}</div>
                    </>
                  ) : (
                    <div className="text-xs mt-1">Rest</div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Sections grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {/* Grammar */}
            <div className="bg-white border border-black/[0.07] rounded-xl p-5">
              <div className="flex items-center gap-2 mb-3">
                <PenTool size={15} className="text-indigo-600" />
                <h3 className="text-sm font-semibold text-slate-800">Grammar</h3>
              </div>
              <div className="space-y-2">
                {['Passé Composé ✓', 'Imparfait ✓', 'Future Simple ✓', 'Subjonctif (next)'].map(item => (
                  <div key={item} className="flex items-center gap-2 text-sm">
                    {item.includes('✓')
                      ? <CheckCircle size={13} className="text-emerald-500 flex-shrink-0" />
                      : <Circle size={13} className="text-slate-300 flex-shrink-0" />}
                    <span className={cn('text-sm', item.includes('next') ? 'text-amber-600 font-medium' : item.includes('✓') ? 'text-slate-400' : 'text-slate-700')}>
                      {item.replace(' ✓', '').replace(' (next)', '')}
                      {item.includes('next') && <span className="text-xs ml-1">(up next)</span>}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Vocabulary */}
            <div className="bg-white border border-black/[0.07] rounded-xl p-5">
              <div className="flex items-center gap-2 mb-3">
                <BookOpen size={15} className="text-violet-600" />
                <h3 className="text-sm font-semibold text-slate-800">Vocabulary</h3>
              </div>
              <div className="space-y-3">
                <div>
                  <div className="flex justify-between text-xs text-slate-500 mb-1">
                    <span>Words learned</span>
                    <span>142 / 300</span>
                  </div>
                  <div className="h-2 bg-slate-100 rounded-full">
                    <div className="h-full rounded-full bg-gradient-to-r from-indigo-500 to-violet-500" style={{ width: '47%' }} />
                  </div>
                </div>
                <p className="text-xs text-slate-400">Recent: arriver, partir, venir, prendre, mettre...</p>
              </div>
            </div>

            {/* Listening */}
            <div className="bg-white border border-black/[0.07] rounded-xl p-5">
              <div className="flex items-center gap-2 mb-3">
                <Headphones size={15} className="text-red-500" />
                <h3 className="text-sm font-semibold text-slate-800">Listening</h3>
              </div>
              <div className="space-y-2">
                {['Podcast français facile', 'France 24', 'Coffee Break French'].map(r => (
                  <button key={r} className="w-full text-left text-xs px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-500 hover:bg-indigo-50 hover:border-indigo-200 hover:text-indigo-700 transition-all">
                    🎧 {r}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Stats */}
          <div className="flex flex-wrap gap-3">
            <StatChip icon={Flame} value="4" label="Day streak" bgColor="bg-red-50" iconColor="text-red-500" />
            <StatChip icon={BookOpen} value="89" label="Characters" bgColor="bg-amber-50" iconColor="text-amber-600" />
            <StatChip icon={Target} value="1" label="HSK Level" bgColor="bg-red-50" iconColor="text-red-500" />
            <StatChip icon={Globe} value="2.5h" label="This week" bgColor="bg-emerald-50" iconColor="text-emerald-600" />
          </div>

          {/* Characters grid */}
          <div className="bg-white border border-black/[0.07] rounded-xl p-5">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-sm font-semibold text-slate-800">Characters Practice</h2>
              <span className="text-xs text-slate-400">Click a character to study</span>
            </div>
            <div className="grid grid-cols-6 md:grid-cols-12 gap-2">
              {CHINESE_CHARACTERS.map(item => (
                <button key={item.char} onClick={() => setSelectedChar(item)}
                  className="aspect-square flex flex-col items-center justify-center bg-slate-50 border border-slate-200 rounded-lg hover:bg-red-50 hover:border-red-300 transition-all group">
                  <span className="text-2xl">{item.char}</span>
                  <span className="text-[8px] text-slate-400 group-hover:text-red-500 mt-0.5 transition-colors">{item.pinyin}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Character flash card modal */}
          {selectedChar && (
            <div className="fixed inset-0 bg-black/30 backdrop-blur-sm z-50 flex items-center justify-center p-4"
              onClick={e => { if (e.target === e.currentTarget) setSelectedChar(null) }}>
              <div className="bg-white rounded-2xl shadow-2xl border border-black/[0.08] p-8 w-full max-w-sm text-center animate-scale-in">
                <div className="flex justify-end mb-2">
                  <button onClick={() => setSelectedChar(null)} className="p-1 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 transition-all">
                    <X size={16} />
                  </button>
                </div>
                <div className="text-8xl mb-4">{selectedChar.char}</div>
                <div className={cn('text-2xl font-bold mb-1', TONE_COLORS[selectedChar.tone - 1])}>
                  {selectedChar.pinyin}
                  <span className="ml-2 text-sm font-normal text-slate-400">Tone {selectedChar.tone}</span>
                </div>
                <p className="text-slate-600 text-lg mt-2">{selectedChar.meaning}</p>
                <div className="mt-4 flex items-center justify-center gap-2">
                  {[1, 2, 3, 4].map(t => (
                    <span key={t} className={cn('text-xs px-2 py-0.5 rounded-full font-medium',
                      t === selectedChar.tone ? `${TONE_COLORS[t - 1]} bg-slate-100` : 'text-slate-300')}>
                      T{t}
                    </span>
                  ))}
                </div>
                <div className="flex gap-3 mt-6">
                  <button onClick={() => { const idx = CHINESE_CHARACTERS.findIndex(c => c.char === selectedChar.char); setSelectedChar(CHINESE_CHARACTERS[(idx - 1 + CHINESE_CHARACTERS.length) % CHINESE_CHARACTERS.length]) }}
                    className="flex-1 py-2.5 border border-slate-200 rounded-xl text-sm text-slate-600 hover:bg-slate-50 transition-all">
                    ← Previous
                  </button>
                  <button onClick={() => { const idx = CHINESE_CHARACTERS.findIndex(c => c.char === selectedChar.char); setSelectedChar(CHINESE_CHARACTERS[(idx + 1) % CHINESE_CHARACTERS.length]) }}
                    className="flex-1 py-2.5 bg-red-500 hover:bg-red-600 text-white rounded-xl text-sm font-semibold transition-all">
                    Next →
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* HSK Progress */}
          <div className="bg-white border border-black/[0.07] rounded-xl p-5">
            <h2 className="text-sm font-semibold text-slate-800 mb-4">HSK Progress</h2>
            <div className="space-y-3">
              {[
                { level: 'HSK 1', words: 150, learned: 89, barColor: 'bg-emerald-500' },
                { level: 'HSK 2', words: 150, learned: 12, barColor: 'bg-blue-500' },
              ].map(hsk => (
                <div key={hsk.level}>
                  <div className="flex justify-between text-xs text-slate-500 mb-1">
                    <span>{hsk.level}</span>
                    <span>{hsk.learned} / {hsk.words} words</span>
                  </div>
                  <div className="h-2 bg-slate-100 rounded-full">
                    <div className={cn('h-full rounded-full', hsk.barColor)}
                      style={{ width: `${(hsk.learned / hsk.words) * 100}%` }} />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Weekly plan */}
          <div className="bg-white border border-black/[0.07] rounded-xl p-5">
            <h2 className="text-sm font-semibold text-slate-800 mb-4">Weekly Study Plan</h2>
            <div className="grid grid-cols-7 gap-2">
              {WEEK_PLAN.chinese.map(day => (
                <div key={day.day} className={cn('text-center p-3 rounded-xl',
                  day.duration > 0
                    ? 'bg-red-100 border border-red-300 text-red-800'
                    : 'bg-slate-100 text-slate-400')}>
                  <div className="text-xs font-semibold">{day.day}</div>
                  {day.duration > 0 ? (
                    <>
                      <div className="text-sm font-bold mt-1">{day.duration}m</div>
                      <div className="text-xs mt-0.5 leading-tight opacity-80">{day.topic}</div>
                    </>
                  ) : (
                    <div className="text-xs mt-1">Rest</div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* AI Tools */}
      <div className="bg-gradient-to-br from-indigo-50 to-violet-50 border border-indigo-200/50 rounded-2xl p-6">
        <h2 className="text-sm font-semibold text-slate-800 mb-4 flex items-center gap-2">
          <Sparkles size={15} className="text-indigo-600" /> AI Language Tools
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
          {[
            { id: 'session', label: 'Generate 20-min session' },
            { id: 'quiz', label: 'Quiz me' },
            { id: 'schedule', label: 'Schedule practice' },
            { id: 'mistakes', label: 'Review mistakes' },
          ].map(action => (
            <button key={action.id} onClick={() => handleAI(action.id)}
              disabled={!!aiLoading}
              className="flex items-center justify-center gap-2 px-4 py-2.5 bg-white border border-slate-200 hover:border-indigo-300 hover:bg-indigo-50 text-slate-700 hover:text-indigo-700 rounded-xl text-sm transition-all disabled:opacity-50">
              {aiLoading === action.id ? <Loader2 size={13} className="animate-spin" /> : <Sparkles size={13} />}
              {action.label}
            </button>
          ))}
        </div>
        {aiResult && (
          <div className="bg-white rounded-xl p-4 text-sm text-slate-700 leading-relaxed border border-indigo-100 shadow-sm">
            {aiResult}
            <button onClick={() => setAiResult(null)} className="block mt-2 text-xs text-slate-400 hover:text-slate-600 transition-colors">Dismiss</button>
          </div>
        )}
      </div>
    </div>
  )
}
