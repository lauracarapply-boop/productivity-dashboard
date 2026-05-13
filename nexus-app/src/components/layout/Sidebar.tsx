'use client'

import { usePathname } from 'next/navigation'
import Link from 'next/link'
import {
  LayoutDashboard, Calendar, CheckSquare, Inbox, Zap,
  BookOpen, FileText, Brain, HardDrive, GraduationCap,
  Layers, FolderKanban, Globe, Sparkles, TrendingUp,
  Target, CalendarDays, BarChart2, Settings, Mail,
  Heart, DollarSign,
  ChevronLeft, ChevronRight, type LucideIcon,
} from 'lucide-react'
import { useApp } from '@/lib/store'
import { mockUser } from '@/lib/mock-data'
import { cn } from '@/lib/utils'

interface NavItem {
  label: string
  href: string
  icon: LucideIcon
  badge?: number
}

interface NavGroup {
  label: string
  items: NavItem[]
}

function buildNavGroups(pendingCount: number): NavGroup[] {
  return [
    {
      label: 'Main',
      items: [
        { label: 'Dashboard',   href: '/dashboard', icon: LayoutDashboard },
        { label: 'Calendar',    href: '/calendar',  icon: Calendar },
        { label: 'Tasks',       href: '/tasks',     icon: CheckSquare },
        { label: 'AI Inbox',    href: '/ai-inbox',  icon: Inbox, badge: pendingCount },
        { label: 'Email Hub',   href: '/email',     icon: Mail },
        { label: 'Capture',     href: '/capture',   icon: Zap },
      ],
    },
    {
      label: 'Academic',
      items: [
        { label: 'Academic Hub',  href: '/academic',  icon: GraduationCap },
        { label: 'Courses',       href: '/courses',   icon: BookOpen },
        { label: 'Notes',         href: '/notes',     icon: FileText },
        { label: 'Knowledge Hub', href: '/knowledge', icon: Brain },
        { label: 'Google Drive',  href: '/drive',     icon: HardDrive },
      ],
    },
    {
      label: 'Life & Work',
      items: [
        { label: 'Workspaces',   href: '/workspaces',    icon: Layers },
        { label: 'Projects',     href: '/projects',      icon: FolderKanban },
        { label: 'Social Media', href: '/social',        icon: TrendingUp },
        { label: 'Languages',    href: '/languages',     icon: Globe },
        { label: 'Opportunities',href: '/opportunities', icon: Sparkles },
      ],
    },
    {
      label: 'Personal',
      items: [
        { label: 'Health',    href: '/health',    icon: Heart },
        { label: 'Finances',  href: '/finances',  icon: DollarSign },
      ],
    },
    {
      label: 'Planning',
      items: [
        { label: 'Focus Mode',     href: '/focus',     icon: Target },
        { label: 'Weekly Planner', href: '/planner',   icon: CalendarDays },
        { label: 'Analytics',      href: '/analytics', icon: BarChart2 },
      ],
    },
  ]
}

export default function Sidebar() {
  const pathname = usePathname()
  const { sidebarCollapsed, toggleSidebar, aiInboxItems, setQuickCaptureOpen } = useApp()
  const pendingCount = aiInboxItems.filter(i => i.status === 'pending').length
  const navGroups = buildNavGroups(pendingCount)

  return (
    <aside
      className={cn(
        'flex flex-col h-screen bg-white border-r flex-shrink-0',
        'transition-all duration-300 ease-in-out overflow-hidden',
        'shadow-[1px_0_0_0_rgba(0,0,0,0.06)]',
        sidebarCollapsed ? 'w-[64px]' : 'w-[240px]',
      )}
    >
      {/* Logo */}
      <div className={cn(
        'flex items-center h-14 px-3 flex-shrink-0 border-b border-black/[0.06]',
        sidebarCollapsed ? 'justify-center' : 'justify-between',
      )}>
        {!sidebarCollapsed && (
          <div className="flex items-center gap-2.5 overflow-hidden">
            <div className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0"
              style={{ background: 'linear-gradient(135deg, #3F5F5A, #274743)' }}>
              <span className="text-white text-xs font-bold tracking-tight">N</span>
            </div>
            <span className="text-[17px] font-bold tracking-tight leading-none gradient-text">
              Nexus
            </span>
          </div>
        )}
        {sidebarCollapsed && (
          <div className="w-7 h-7 rounded-lg flex items-center justify-center"
            style={{ background: 'linear-gradient(135deg, #3F5F5A, #274743)' }}>
            <span className="text-white text-xs font-bold">N</span>
          </div>
        )}
        {!sidebarCollapsed && (
          <button onClick={toggleSidebar} aria-label="Collapse sidebar"
            className="p-1 rounded-md text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-all">
            <ChevronLeft size={14} />
          </button>
        )}
      </div>

      {/* Expand toggle when collapsed */}
      {sidebarCollapsed && (
        <div className="flex justify-center pt-2">
          <button onClick={toggleSidebar} aria-label="Expand sidebar"
            className="p-1.5 rounded-md text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-all">
            <ChevronRight size={14} />
          </button>
        </div>
      )}

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto overflow-x-hidden py-3 space-y-0">
        {navGroups.map((group, gi) => (
          <div key={group.label} className={cn('px-2', gi > 0 && 'mt-1')}>
            {/* Section label */}
            {!sidebarCollapsed && (
              <div className="section-label px-2.5 pt-3 pb-1.5">
                {group.label}
              </div>
            )}
            {sidebarCollapsed && gi > 0 && (
              <div className="my-2 mx-2 h-px bg-black/[0.06]" />
            )}

            {/* Items */}
            <div className="space-y-0.5">
              {group.items.map(item => {
                const Icon = item.icon
                const isActive = pathname === item.href || pathname.startsWith(item.href + '/')
                const showBadge = (item.badge ?? 0) > 0

                return (
                  <div key={item.href} className="relative group/nav">
                    <Link
                      href={item.href}
                      aria-current={isActive ? 'page' : undefined}
                      className={cn(
                        'nav-item flex items-center gap-2.5 rounded-lg px-2.5 py-2 text-[13px] font-medium transition-all duration-150',
                        isActive
                          ? 'nav-item-active font-semibold'
                          : 'text-slate-500 hover:bg-slate-100 hover:text-slate-800',
                        sidebarCollapsed && 'justify-center px-2',
                      )}
                    >
                      <Icon
                        size={15}
                        className={cn(
                          'flex-shrink-0',
                          isActive ? 'text-indigo-600' : 'text-slate-400 group-hover/nav:text-slate-600',
                        )}
                      />
                      {!sidebarCollapsed && (
                        <>
                          <span className="truncate flex-1 leading-none">{item.label}</span>
                          {showBadge && (
                            <span className="ml-auto text-[10px] font-bold px-1.5 py-0.5 rounded-full leading-none min-w-[18px] text-center bg-indigo-600 text-white">
                              {item.badge}
                            </span>
                          )}
                        </>
                      )}
                      {sidebarCollapsed && showBadge && (
                        <span className="absolute top-1 right-1 w-2 h-2 bg-indigo-600 rounded-full ring-2 ring-white" />
                      )}
                    </Link>

                    {/* Tooltip (collapsed only) */}
                    {sidebarCollapsed && (
                      <div className="tooltip absolute left-full top-1/2 -translate-y-1/2 ml-2.5 opacity-0 group-hover/nav:opacity-100 transition-opacity duration-150 z-50 pointer-events-none">
                        {item.label}
                        {showBadge && (
                          <span className="ml-1.5 bg-indigo-600 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full">{item.badge}</span>
                        )}
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          </div>
        ))}

        {/* Settings at bottom of nav */}
        <div className="px-2 mt-1">
          {!sidebarCollapsed && <div className="divider mx-1" />}
          <div className="relative group/nav">
            <Link href="/settings"
              aria-current={pathname === '/settings' ? 'page' : undefined}
              className={cn(
                'nav-item flex items-center gap-2.5 rounded-lg px-2.5 py-2 text-[13px] font-medium transition-all duration-150',
                pathname === '/settings'
                  ? 'nav-item-active font-semibold'
                  : 'text-slate-500 hover:bg-slate-100 hover:text-slate-800',
                sidebarCollapsed && 'justify-center px-2',
              )}>
              <Settings size={15} className={cn('flex-shrink-0', pathname === '/settings' ? 'text-indigo-600' : 'text-slate-400')} />
              {!sidebarCollapsed && <span>Settings</span>}
            </Link>
            {sidebarCollapsed && (
              <div className="tooltip absolute left-full top-1/2 -translate-y-1/2 ml-2.5 opacity-0 group-hover/nav:opacity-100 transition-opacity z-50 pointer-events-none">
                Settings
              </div>
            )}
          </div>
        </div>
      </nav>

      {/* Bottom: Quick Capture + User */}
      <div className="flex-shrink-0 p-2.5 border-t border-black/[0.06] space-y-2">
        {/* Quick Capture */}
        <button
          onClick={() => setQuickCaptureOpen(true)}
          aria-label="Quick Capture"
          className={cn(
            'w-full flex items-center gap-2 px-3 py-2 text-white text-[13px] font-semibold rounded-xl transition-all duration-150',
            'shadow-sm hover:shadow-md active:scale-[0.98]',
            sidebarCollapsed && 'justify-center px-2',
          )}
          style={{ background: 'linear-gradient(135deg, #3F5F5A, #274743)' }}
        >
          <Zap size={14} className="flex-shrink-0" />
          {!sidebarCollapsed && <span>Quick Capture</span>}
        </button>

        {/* User */}
        <div className={cn(
          'flex items-center gap-2.5 px-2 py-2 rounded-xl hover:bg-slate-100 transition-all cursor-pointer',
          sidebarCollapsed && 'justify-center',
        )}>
          <div className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold text-white flex-shrink-0 ring-2 ring-indigo-100"
            style={{ background: 'linear-gradient(135deg, #3F5F5A, #274743)' }}>
            {mockUser.name[0]}
          </div>
          {!sidebarCollapsed && (
            <div className="min-w-0 flex-1">
              <p className="text-xs font-semibold text-slate-800 truncate leading-tight">{mockUser.name}</p>
              <p className="text-[10px] text-slate-400 truncate leading-tight mt-0.5">{mockUser.email}</p>
            </div>
          )}
        </div>
      </div>
    </aside>
  )
}
