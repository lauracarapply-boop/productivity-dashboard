'use client'

import Sidebar from './Sidebar'
import TopBar from './TopBar'
import { useApp } from '@/lib/store'
import QuickCaptureModal from '../modals/QuickCaptureModal'
import AIAssistantPanel from '../panels/AIAssistantPanel'

export default function AppShell({ children }: { children: React.ReactNode }) {
  const { sidebarCollapsed, aiPanelOpen, quickCaptureOpen, setQuickCaptureOpen } = useApp()

  return (
    <div className="flex h-screen overflow-hidden" style={{ background: '#F5F4F1' }}>
      <Sidebar />

      <div
        className={`flex flex-col flex-1 overflow-hidden min-w-0 transition-all duration-300 ${
          aiPanelOpen ? 'mr-80' : ''
        }`}
      >
        <TopBar />
        <main className="flex-1 overflow-y-auto">
          <div className="p-6 max-w-[1400px] mx-auto">
            {children}
          </div>
        </main>
      </div>

      {aiPanelOpen && <AIAssistantPanel />}
      {quickCaptureOpen && (
        <QuickCaptureModal onClose={() => setQuickCaptureOpen(false)} />
      )}
    </div>
  )
}
