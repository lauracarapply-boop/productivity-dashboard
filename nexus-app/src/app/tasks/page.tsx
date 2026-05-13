'use client'

import { useState } from 'react'
import { CheckSquare, Plus, Sparkles, Filter, Clock, Zap, AlertTriangle, Brain } from 'lucide-react'
import { useApp } from '@/lib/store'
import { mockCourses, mockWorkspaces } from '@/lib/mock-data'
import { daysUntil, formatDate, cn } from '@/lib/utils'
import TaskCard from '@/components/ui/TaskCard'
import EmptyState from '@/components/ui/EmptyState'
import AIRecommendationCard from '@/components/ui/AIRecommendationCard'
import PriorityBadge from '@/components/ui/PriorityBadge'
import type { Task } from '@/lib/types'

const TABS = [
  { id: 'today',    label: 'Today' },
  { id: 'upcoming', label: 'Upcoming' },
  { id: 'overdue',  label: 'Overdue' },
  { id: 'all',      label: 'All' },
  { id: 'quick',    label: 'Quick Wins' },
  { id: 'deep',     label: 'Deep Work' },
  { id: 'done',     label: 'Completed' },
] as const

type TabId = typeof TABS[number]['id']

export default function TasksPage() {
  const { tasks, addTask, updateTask, deleteTask } = useApp()
  const [activeTab, setActiveTab] = useState<TabId>('today')
  const [showAddForm, setShowAddForm] = useState(false)
  const [aiSuggestion, setAiSuggestion] = useState<string | null>(null)
  const [newTask, setNewTask] = useState({
    title: '',
    priority: 'medium' as Task['priority'],
    due_date: '',
    estimated_minutes: 30,
    course_id: '',
  })

  const filterTasks = (tab: TabId): Task[] => {
    switch (tab) {
      case 'today':
        return tasks.filter(t => t.status !== 'done' && t.due_date && daysUntil(t.due_date) <= 1 && daysUntil(t.due_date) >= 0)
      case 'upcoming':
        return tasks.filter(t => t.status !== 'done' && t.due_date && daysUntil(t.due_date) > 1 && daysUntil(t.due_date) <= 7)
      case 'overdue':
        return tasks.filter(t => t.status === 'overdue' || (t.status !== 'done' && t.due_date && daysUntil(t.due_date) < 0))
      case 'quick':
        return tasks.filter(t => t.status !== 'done' && (t.estimated_minutes ?? 999) <= 30)
      case 'deep':
        return tasks.filter(t => t.status !== 'done' && t.energy_level === 'high')
      case 'done':
        return tasks.filter(t => t.status === 'done')
      default:
        return tasks.filter(t => t.status !== 'done')
    }
  }

  const getTabCount = (tab: TabId) => filterTasks(tab).length

  const visibleTasks = filterTasks(activeTab)

  const handleAddTask = () => {
    if (!newTask.title.trim()) return
    const task: Task = {
      id: Date.now().toString(),
      user_id: '1',
      title: newTask.title,
      status: 'todo',
      priority: newTask.priority,
      due_date: newTask.due_date,
      estimated_minutes: newTask.estimated_minutes,
      energy_level: 'medium',
      workspace_id: 'ws-college',
      course_id: newTask.course_id || undefined,
      subtasks: [],
      created_at: new Date().toISOString(),
    }
    addTask(task)
    setNewTask({ title: '', priority: 'medium', due_date: '', estimated_minutes: 30, course_id: '' })
    setShowAddForm(false)
  }

  const handleAIPrioritize = () => {
    setAiSuggestion(
      'Based on your deadlines and energy patterns, I recommend: (1) French grammar exercises — due tomorrow, 30 min. (2) Political Theory reading — overdue, block 90 min today. (3) Mandato Aberto roadmap — high impact, schedule for afternoon.',
    )
  }

  return (
    <div className="space-y-6">

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-3">
            <CheckSquare className="text-indigo-600" size={24} />
            Tasks
          </h1>
          <p className="text-slate-500 text-sm mt-1">
            {tasks.filter(t => t.status !== 'done').length} active tasks
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={handleAIPrioritize}
            className="flex items-center gap-2 px-3 py-2 bg-violet-50 hover:bg-violet-100 text-violet-700 border border-violet-200 rounded-xl text-sm font-medium transition-all"
          >
            <Sparkles size={14} />
            Prioritize
          </button>
          <button
            onClick={() => setShowAddForm(true)}
            className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-sm font-semibold transition-all shadow-sm"
          >
            <Plus size={14} />
            Add Task
          </button>
        </div>
      </div>

      {/* AI suggestion */}
      {aiSuggestion && (
        <AIRecommendationCard
          type="recommendation"
          title="AI Priority Suggestion"
          recommendation={aiSuggestion}
          actionLabel="Dismiss"
          onAction={() => setAiSuggestion(null)}
        />
      )}

      {/* Tabs */}
      <div className="flex gap-1 bg-slate-100 border border-slate-200 rounded-xl p-1 overflow-x-auto">
        {TABS.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={cn(
              'flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-all',
              activeTab === tab.id
                ? 'bg-white shadow-sm text-indigo-700 font-semibold'
                : 'text-slate-500 hover:text-slate-700',
            )}
          >
            {tab.label}
            {getTabCount(tab.id) > 0 && (
              <span
                className={cn(
                  'text-xs px-1.5 py-0.5 rounded-full font-semibold',
                  activeTab === tab.id
                    ? 'bg-indigo-100 text-indigo-700'
                    : 'bg-slate-200 text-slate-600',
                )}
              >
                {getTabCount(tab.id)}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Add task form */}
      {showAddForm && (
        <div className="bg-white border border-slate-200 rounded-2xl p-5 space-y-4 shadow-sm">
          <h3 className="text-sm font-semibold text-slate-900">New Task</h3>
          <input
            value={newTask.title}
            onChange={e => setNewTask(p => ({ ...p, title: e.target.value }))}
            placeholder="Task title..."
            autoFocus
            className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-slate-900 placeholder-slate-400 text-sm outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/20 transition-all"
          />
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <select
              value={newTask.priority}
              onChange={e => setNewTask(p => ({ ...p, priority: e.target.value as Task['priority'] }))}
              className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-700 text-sm outline-none focus:border-indigo-500 transition-colors"
            >
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
              <option value="urgent">Urgent</option>
            </select>
            <input
              type="date"
              value={newTask.due_date}
              onChange={e => setNewTask(p => ({ ...p, due_date: e.target.value }))}
              className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-700 text-sm outline-none focus:border-indigo-500 transition-colors"
            />
            <input
              type="number"
              value={newTask.estimated_minutes}
              onChange={e => setNewTask(p => ({ ...p, estimated_minutes: Number(e.target.value) }))}
              placeholder="Minutes"
              className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-700 text-sm outline-none focus:border-indigo-500 transition-colors"
            />
            <select
              value={newTask.course_id}
              onChange={e => setNewTask(p => ({ ...p, course_id: e.target.value }))}
              className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-700 text-sm outline-none focus:border-indigo-500 transition-colors"
            >
              <option value="">No course</option>
              {mockCourses.map(c => (
                <option key={c.id} value={c.id}>{c.code}</option>
              ))}
            </select>
          </div>
          <div className="flex gap-2 justify-end pt-1">
            <button
              onClick={() => setShowAddForm(false)}
              className="px-4 py-2 text-slate-500 hover:text-slate-700 text-sm font-medium transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleAddTask}
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-sm font-semibold transition-all shadow-sm"
            >
              Add Task
            </button>
          </div>
        </div>
      )}

      {/* Task list */}
      {visibleTasks.length === 0 ? (
        <EmptyState
          icon={<CheckSquare size={32} className="text-slate-300" />}
          title={activeTab === 'done' ? 'No completed tasks yet' : 'No tasks here'}
          description={
            activeTab === 'today'
              ? 'Nothing due today — great work!'
              : 'Add a task or check another tab.'
          }
          action={
            activeTab !== 'done'
              ? { label: 'Add Task', onClick: () => setShowAddForm(true) }
              : undefined
          }
        />
      ) : (
        <div className="space-y-2">
          {visibleTasks.map(task => (
            <TaskCard
              key={task.id}
              task={task}
              onComplete={id => updateTask(id, { status: 'done' })}
              onDelete={deleteTask}
            />
          ))}
        </div>
      )}
    </div>
  )
}
