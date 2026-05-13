'use client'

// ============================================================
// Nexus App — Global Application Store
// React Context + useState — no external state library required.
// ============================================================

import React, { createContext, useContext, useState, type ReactNode } from 'react'
import type { Task, Note, AIInboxItem, CalendarEvent, DriveFile } from './types'
import {
  mockTasks,
  mockNotes,
  mockAIInboxItems,
  mockCalendarEvents,
  mockDriveFiles,
} from './mock-data'

// ── State shape ───────────────────────────────────────────────

interface AppState {
  tasks: Task[]
  notes: Note[]
  aiInboxItems: AIInboxItem[]
  calendarEvents: CalendarEvent[]
  driveFiles: DriveFile[]
  sidebarCollapsed: boolean
  aiPanelOpen: boolean
  quickCaptureOpen: boolean
}

// ── Actions shape ─────────────────────────────────────────────

interface AppActions {
  // Tasks
  addTask: (task: Task) => void
  updateTask: (id: string, updates: Partial<Task>) => void
  deleteTask: (id: string) => void

  // Notes
  addNote: (note: Note) => void
  updateNote: (id: string, updates: Partial<Note>) => void
  deleteNote: (id: string) => void

  // AI Inbox
  approveAIItem: (id: string) => void
  rejectAIItem: (id: string) => void
  addAIInboxItem: (item: AIInboxItem) => void

  // Calendar Events
  addCalendarEvent: (event: CalendarEvent) => void
  updateCalendarEvent: (id: string, updates: Partial<CalendarEvent>) => void
  deleteCalendarEvent: (id: string) => void

  // UI state
  toggleSidebar: () => void
  toggleAIPanel: () => void
  setQuickCaptureOpen: (open: boolean) => void
}

// ── Context ───────────────────────────────────────────────────

const AppContext = createContext<(AppState & AppActions) | null>(null)

// ── Provider ──────────────────────────────────────────────────

export function AppProvider({ children }: { children: ReactNode }) {
  // ── Data state
  const [tasks, setTasks] = useState<Task[]>(mockTasks)
  const [notes, setNotes] = useState<Note[]>(mockNotes)
  const [aiInboxItems, setAIInboxItems] = useState<AIInboxItem[]>(mockAIInboxItems)
  const [calendarEvents, setCalendarEvents] = useState<CalendarEvent[]>(mockCalendarEvents)
  const [driveFiles] = useState<DriveFile[]>(mockDriveFiles)

  // ── UI state
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const [aiPanelOpen, setAIPanelOpen] = useState(false)
  const [quickCaptureOpen, setQuickCaptureOpen] = useState(false)

  // ── Task actions
  const addTask = (task: Task) => setTasks(prev => [task, ...prev])

  const updateTask = (id: string, updates: Partial<Task>) =>
    setTasks(prev => prev.map(t => (t.id === id ? { ...t, ...updates } : t)))

  const deleteTask = (id: string) => setTasks(prev => prev.filter(t => t.id !== id))

  // ── Note actions
  const addNote = (note: Note) => setNotes(prev => [note, ...prev])

  const updateNote = (id: string, updates: Partial<Note>) =>
    setNotes(prev => prev.map(n => (n.id === id ? { ...n, ...updates } : n)))

  const deleteNote = (id: string) => setNotes(prev => prev.filter(n => n.id !== id))

  // ── AI Inbox actions
  const approveAIItem = (id: string) =>
    setAIInboxItems(prev => prev.map(i => (i.id === id ? { ...i, status: 'approved' } : i)))

  const rejectAIItem = (id: string) =>
    setAIInboxItems(prev => prev.map(i => (i.id === id ? { ...i, status: 'rejected' } : i)))

  const addAIInboxItem = (item: AIInboxItem) => setAIInboxItems(prev => [item, ...prev])

  // ── Calendar Event actions
  const addCalendarEvent = (event: CalendarEvent) =>
    setCalendarEvents(prev => [...prev, event])

  const updateCalendarEvent = (id: string, updates: Partial<CalendarEvent>) =>
    setCalendarEvents(prev => prev.map(e => (e.id === id ? { ...e, ...updates } : e)))

  const deleteCalendarEvent = (id: string) =>
    setCalendarEvents(prev => prev.filter(e => e.id !== id))

  // ── UI actions
  const toggleSidebar = () => setSidebarCollapsed(prev => !prev)
  const toggleAIPanel = () => setAIPanelOpen(prev => !prev)

  // ── Context value
  const value: AppState & AppActions = {
    // State
    tasks,
    notes,
    aiInboxItems,
    calendarEvents,
    driveFiles,
    sidebarCollapsed,
    aiPanelOpen,
    quickCaptureOpen,

    // Task actions
    addTask,
    updateTask,
    deleteTask,

    // Note actions
    addNote,
    updateNote,
    deleteNote,

    // AI Inbox actions
    approveAIItem,
    rejectAIItem,
    addAIInboxItem,

    // Calendar actions
    addCalendarEvent,
    updateCalendarEvent,
    deleteCalendarEvent,

    // UI actions
    toggleSidebar,
    toggleAIPanel,
    setQuickCaptureOpen,
  }

  return React.createElement(AppContext.Provider, { value }, children)
}

// ── Hook ──────────────────────────────────────────────────────

export function useApp() {
  const ctx = useContext(AppContext)
  if (!ctx) throw new Error('useApp must be used within an AppProvider')
  return ctx
}

// ── Selector hooks (convenience) ─────────────────────────────

/** Returns only tasks that match a given status */
export function useTasksByStatus(status: Task['status']) {
  const { tasks } = useApp()
  return tasks.filter(t => t.status === status)
}

/** Returns only tasks for a given workspace */
export function useTasksByWorkspace(workspaceId: string) {
  const { tasks } = useApp()
  return tasks.filter(t => t.workspace_id === workspaceId)
}

/** Returns only notes for a given workspace */
export function useNotesByWorkspace(workspaceId: string) {
  const { notes } = useApp()
  return notes.filter(n => n.workspace_id === workspaceId)
}

/** Returns pending AI inbox items only */
export function usePendingAIItems() {
  const { aiInboxItems } = useApp()
  return aiInboxItems.filter(i => i.status === 'pending')
}

/** Returns calendar events within a date range (ISO strings) */
export function useCalendarEventsInRange(start: string, end: string) {
  const { calendarEvents } = useApp()
  const startMs = new Date(start).getTime()
  const endMs = new Date(end).getTime()
  return calendarEvents.filter(e => {
    const eventStart = new Date(e.start_time).getTime()
    return eventStart >= startMs && eventStart <= endMs
  })
}
