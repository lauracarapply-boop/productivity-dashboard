'use client'

import { useState, useRef, useEffect } from 'react'
import { Search, Zap, Bot, Bell, ChevronDown, CheckSquare, Calendar, AlertTriangle, Mail } from 'lucide-react'
import { useApp } from '@/lib/store'
import { mockUser } from '@/lib/mock-data'
import SearchModal from '../modals/SearchModal'
import { cn } from '@/lib/utils'

const MOCK_NOTIFICATIONS = [
  { id: '1', icon: AlertTriangle, color: 'text-red-500 bg-red-50', title: 'Assignment due tomorrow', body: 'Machine Learning Problem Set 3 is due May 13', time: '2h ago', unread: true },
  { id: '2', icon: Calendar, color: 'text-indigo-500 bg-indigo-50', title: 'Class starting in 30 min', body: 'Comparative Politics — Room 204', time: '28m ago', unread: true },
  { id: '3', icon: Mail, color: 'text-violet-500 bg-violet-50', title: 'New email from Prof. Thompson', body: 'Re: Office hours this week', time: '1h ago', unread: true },
  { id: '4', icon: CheckSquare, color: 'text-emerald-500 bg-emerald-50', title: 'Task completed', body: 'French vocabulary quiz marked as done', time: '3h ago', unread: false },
]

export default function TopBar() {
  const { toggleAIPanel, setQuickCaptureOpen, aiPanelOpen } = useApp()
  const [searchOpen, setSearchOpen] = useState(false)
  const [notifOpen, setNotifOpen] = useState(false)
  const [readIds, setReadIds] = useState<Set<string>>(new Set())
  const notifRef = useRef<HTMLDivElement>(null)

  const unreadCount = MOCK_NOTIFICATIONS.filter(n => n.unread && !readIds.has(n.id)).length

  useEffect(() => {
    function onClickOutside(e: MouseEvent) {
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) {
        setNotifOpen(false)
      }
    }
    if (notifOpen) document.addEventListener('mousedown', onClickOutside)
    return () => document.removeEventListener('mousedown', onClickOutside)
  }, [notifOpen])

  function openNotifs() {
    setNotifOpen(v => !v)
    setReadIds(new Set(MOCK_NOTIFICATIONS.map(n => n.id)))
  }

  const today = new Date().toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })

  return (
    <>
      <header className="h-14 bg-white/80 backdrop-blur-md border-b border-black/[0.06] flex items-center px-5 gap-3 flex-shrink-0 sticky top-0 z-10">
        {/* Date */}
        <span className="text-sm font-medium text-slate-400 flex-shrink-0 hidden md:block">{today}</span>
        <div className="w-px h-5 bg-black/[0.08] flex-shrink-0 hidden md:block" />

        {/* Search trigger */}
        <button onClick={() => setSearchOpen(true)}
          className="flex-1 max-w-sm flex items-center gap-2.5 px-3.5 py-2 bg-slate-100 hover:bg-slate-200/70 rounded-xl text-slate-400 text-sm transition-all duration-200 group"
          aria-label="Search everything">
          <Search size={14} className="flex-shrink-0 text-slate-400" />
          <span className="flex-1 text-left truncate text-slate-400 group-hover:text-slate-500 text-sm">Search everything&hellip;</span>
          <kbd className="ml-auto text-[11px] bg-white border border-slate-200 text-slate-400 px-1.5 py-0.5 rounded-md font-mono flex-shrink-0 shadow-sm">⌘K</kbd>
        </button>

        <div className="flex-1" />

        {/* Capture button */}
        <button onClick={() => setQuickCaptureOpen(true)}
          className="flex items-center gap-2 px-3.5 py-2 text-white text-sm font-semibold rounded-xl transition-all duration-200 hover:shadow-md flex-shrink-0"
          style={{ background: 'linear-gradient(135deg, #4F46E5, #7C3AED)' }}>
          <Zap size={14} />
          <span className="hidden sm:inline">Capture</span>
        </button>

        {/* AI toggle */}
        <button onClick={toggleAIPanel}
          className={cn('p-2 rounded-xl transition-all duration-200 flex-shrink-0',
            aiPanelOpen ? 'bg-violet-100 text-violet-600 ring-1 ring-violet-200' : 'text-slate-400 hover:bg-slate-100 hover:text-slate-600')}
          aria-label="Toggle AI assistant" aria-pressed={aiPanelOpen}>
          <Bot size={18} />
        </button>

        {/* Notifications */}
        <div ref={notifRef} className="relative flex-shrink-0">
          <button onClick={openNotifs}
            className="p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-600 rounded-xl transition-all duration-200 relative"
            aria-label="Notifications">
            <Bell size={18} />
            {unreadCount > 0 && (
              <span className="absolute top-1 right-1 w-4 h-4 bg-indigo-500 rounded-full ring-1 ring-white text-white text-[9px] font-bold flex items-center justify-center">
                {unreadCount}
              </span>
            )}
          </button>

          {notifOpen && (
            <div className="absolute right-0 top-12 w-80 bg-white border border-black/[0.08] rounded-2xl shadow-xl z-50 overflow-hidden animate-slide-in-down">
              <div className="px-4 py-3 border-b border-slate-100 flex items-center justify-between">
                <span className="text-sm font-semibold text-slate-900">Notifications</span>
                <span className="text-xs text-slate-400">{MOCK_NOTIFICATIONS.length} total</span>
              </div>
              <div className="divide-y divide-slate-100 max-h-80 overflow-y-auto">
                {MOCK_NOTIFICATIONS.map(n => {
                  const Icon = n.icon
                  const isRead = readIds.has(n.id)
                  return (
                    <div key={n.id} className={cn('flex items-start gap-3 px-4 py-3 hover:bg-slate-50 transition-colors cursor-pointer', !isRead && 'bg-indigo-50/30')}>
                      <div className={cn('w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5', n.color)}>
                        <Icon size={14} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-semibold text-slate-800 leading-snug">{n.title}</p>
                        <p className="text-xs text-slate-500 mt-0.5 truncate">{n.body}</p>
                        <p className="text-[10px] text-slate-400 mt-1">{n.time}</p>
                      </div>
                      {!isRead && <div className="w-1.5 h-1.5 bg-indigo-500 rounded-full flex-shrink-0 mt-2" />}
                    </div>
                  )
                })}
              </div>
              <div className="px-4 py-3 border-t border-slate-100">
                <button className="w-full text-xs text-indigo-600 hover:text-indigo-700 font-medium text-center transition-colors">
                  View all notifications
                </button>
              </div>
            </div>
          )}
        </div>

        <div className="w-px h-5 bg-black/[0.08] flex-shrink-0" />

        {/* User */}
        <div className="flex items-center gap-2 flex-shrink-0 cursor-pointer hover:opacity-80 transition-opacity">
          <div className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-semibold text-white ring-2 ring-white shadow-sm"
            style={{ background: 'linear-gradient(135deg, #4F46E5, #7C3AED)' }}>
            {mockUser.name[0]}
          </div>
          <span className="text-sm font-medium text-slate-700 hidden sm:block">{mockUser.name}</span>
          <ChevronDown size={14} className="text-slate-400" />
        </div>
      </header>

      {searchOpen && <SearchModal onClose={() => setSearchOpen(false)} />}
    </>
  )
}
