// ============================================================
// Nexus App — Core TypeScript Type Definitions
// ============================================================

// ── User ────────────────────────────────────────────────────
export interface User {
  id: string
  name: string
  email: string
  avatar?: string
  created_at: string
}

// ── Workspace ────────────────────────────────────────────────
export interface Workspace {
  id: string
  user_id: string
  name: string
  description?: string
  color: string       // hex color string, e.g. "#4F46E5"
  icon: string        // Lucide icon name as string, e.g. "BookOpen"
  type: string        // "academic" | "personal" | "project" | "language" | etc.
  created_at: string
}

// ── Course ───────────────────────────────────────────────────
export interface CourseScheduleSlot {
  day: string         // e.g. "Monday", "Tuesday"
  start: string       // e.g. "10:00"
  end: string         // e.g. "11:00"
  location: string
}

export interface Course {
  id: string
  user_id: string
  workspace_id: string
  name: string
  code: string
  professor: string
  professor_email?: string
  schedule: CourseScheduleSlot[]
  office_hours?: string
  semester: string
  color: string
  syllabus_file_id?: string
  drive_folder_id?: string
  created_at: string
}

// ── Task ─────────────────────────────────────────────────────
export type TaskStatus = 'todo' | 'in_progress' | 'done' | 'overdue'
export type TaskPriority = 'low' | 'medium' | 'high' | 'urgent'
export type EnergyLevel = 'low' | 'medium' | 'high'

export interface Subtask {
  id: string
  task_id: string
  title: string
  completed: boolean
}

export interface Task {
  id: string
  user_id: string
  title: string
  description?: string
  status: TaskStatus
  priority: TaskPriority
  due_date?: string
  estimated_minutes?: number
  energy_level?: EnergyLevel
  workspace_id?: string
  course_id?: string
  project_id?: string
  note_id?: string
  drive_file_id?: string
  calendar_event_id?: string
  subtasks: Subtask[]
  created_at: string
}

// ── Calendar Event ───────────────────────────────────────────
export type CalendarEventType = 'class' | 'study' | 'meeting' | 'deadline' | 'personal' | 'appointment'
export type CalendarEventSource = 'google' | 'platform' | 'ai' | 'email'

export interface CalendarEvent {
  id: string
  user_id: string
  title: string
  description?: string
  start_time: string
  end_time: string
  type: CalendarEventType
  source: CalendarEventSource
  google_event_id?: string
  workspace_id?: string
  course_id?: string
  task_id?: string
  location?: string
  color?: string
  created_at: string
}

// ── Note ─────────────────────────────────────────────────────
export interface Note {
  id: string
  user_id: string
  title: string
  content: string
  summary?: string
  workspace_id?: string
  course_id?: string
  project_id?: string
  tags: string[]
  linked_drive_file_ids: string[]
  key_concepts: string[]
  created_at: string
  updated_at: string
}

// ── Drive File ───────────────────────────────────────────────
export type DriveFileDetectedType = 'syllabus' | 'reading' | 'notes' | 'assignment' | 'slides' | 'general'
export type DriveFileIndexedStatus = 'indexed' | 'pending' | 'needs_review'

export interface DriveFile {
  id: string
  user_id: string
  google_file_id: string
  name: string
  mime_type: string
  folder_path: string
  web_url: string
  last_modified: string
  detected_type: DriveFileDetectedType
  detected_workspace_id?: string
  detected_course_id?: string
  summary?: string
  indexed_status: DriveFileIndexedStatus
  confidence: number
  created_at: string
}

// ── AI Inbox Item ────────────────────────────────────────────
export type AIInboxItemType = 'task' | 'event' | 'deadline' | 'note' | 'drive_file' | 'course_info'
export type AIInboxSourceType = 'capture' | 'drive' | 'email' | 'calendar'
export type AIInboxStatus = 'pending' | 'approved' | 'rejected' | 'edited'

export interface AIInboxItem {
  id: string
  user_id: string
  type: AIInboxItemType
  title: string
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  extracted_data: any
  source_type: AIInboxSourceType
  source_text?: string
  source_file_id?: string
  suggested_workspace_id?: string
  suggested_course_id?: string
  confidence: number
  status: AIInboxStatus
  created_at: string
}

// ── Project ──────────────────────────────────────────────────
export type ProjectStatus = 'planning' | 'active' | 'paused' | 'completed'

export interface Milestone {
  id: string
  project_id: string
  title: string
  due_date: string
  completed: boolean
}

export interface Project {
  id: string
  user_id: string
  workspace_id: string
  title: string
  description?: string
  status: ProjectStatus
  priority: TaskPriority
  deadline?: string
  progress: number  // 0–100
  milestones: Milestone[]
  created_at: string
}

// ── Opportunity ──────────────────────────────────────────────
export type OpportunityType = 'internship' | 'fellowship' | 'scholarship' | 'research' | 'competition' | 'program'
export type OpportunityStatus =
  | 'saved'
  | 'researching'
  | 'applying'
  | 'waiting_recommendation'
  | 'submitted'
  | 'interview'
  | 'accepted'
  | 'rejected'
  | 'archived'

export interface Opportunity {
  id: string
  user_id: string
  name: string
  type: OpportunityType
  institution: string
  location: string
  deadline: string
  eligibility?: string
  required_materials: string[]
  status: OpportunityStatus
  priority: TaskPriority
  fit_score: number  // 0–100
  application_link?: string
  notes?: string
  related_documents: string[]
  created_at: string
}

// ── Focus Session ────────────────────────────────────────────
export interface FocusSession {
  id: string
  user_id: string
  task_id?: string
  start_time: string
  end_time?: string
  duration_minutes?: number
  notes?: string
  progress_summary?: string
  created_at: string
}

// ── Language Learning ────────────────────────────────────────
export type LanguageCode = 'french' | 'chinese'
export type LanguageItemType = 'vocabulary' | 'grammar' | 'character' | 'phrase' | 'exercise'
export type LanguageItemStatus = 'new' | 'learning' | 'mastered'

export interface LanguageItem {
  id: string
  user_id: string
  language: LanguageCode
  type: LanguageItemType
  title: string
  content: string
  status: LanguageItemStatus
  next_review_date?: string
  created_at: string
}

// ── Lecture ──────────────────────────────────────────────────
export type NotesStatus = 'complete' | 'incomplete' | 'missing' | 'needs_review'
export type ReviewStatus = 'reviewed' | 'needs_review' | 'not_started'

export interface Lecture {
  id: string
  course_id: string
  number: number
  date: string
  topic: string
  notes_status: NotesStatus
  related_slides?: string
  related_readings: string[]
  has_ai_summary: boolean
  review_status: ReviewStatus
}

// ── Reading ──────────────────────────────────────────────────
export interface Reading {
  id: string
  course_id: string
  title: string
  due_date?: string
  completed: boolean
  pages?: string
  notes_linked: string[]
  has_ai_summary: boolean
}
