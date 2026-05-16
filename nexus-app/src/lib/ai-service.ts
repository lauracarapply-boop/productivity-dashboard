import type { Task, Note, DriveFile, AIInboxItem, CalendarEvent } from './types'

// ── Shared Types ─────────────────────────────────────────────

export interface ExtractedItems {
  tasks: Partial<Task>[]
  events: Partial<CalendarEvent>[]
  deadlines: { title: string; date: string }[]
  notes: Partial<Note>[]
  suggested_workspace?: string
  suggested_course?: string
  confidence: number
}

async function callAI(action: string, payload: Record<string, unknown>) {
  const res = await fetch('/api/ai', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ action, payload }),
  })
  if (!res.ok) throw new Error(`AI call failed: ${res.status}`)
  return res.json()
}

// ── Text Extraction ───────────────────────────────────────────

export async function extractStructuredItemsFromText(inputText: string): Promise<ExtractedItems> {
  try {
    const data = await callAI('extract', { text: inputText })
    return {
      tasks: data.tasks ?? [],
      events: data.events ?? [],
      deadlines: data.deadlines ?? [],
      notes: data.notes ?? [],
      suggested_course: data.suggested_course ?? undefined,
      confidence: data.confidence ?? 0.85,
    }
  } catch {
    return { tasks: [], events: [], deadlines: [], notes: [], confidence: 0 }
  }
}

// ── Drive File Classification ─────────────────────────────────

export async function classifyDriveFile(
  fileMetadata: Partial<DriveFile>,
  fileContent?: string
): Promise<{
  detected_type: DriveFile['detected_type']
  suggested_course_id?: string
  summary?: string
  detected_tasks: string[]
  detected_deadlines: string[]
  confidence: number
}> {
  try {
    return await callAI('classify_file', {
      name: fileMetadata.name ?? '',
      mimeType: fileMetadata.mime_type,
      content: fileContent,
    })
  } catch {
    return {
      detected_type: 'general',
      summary: 'Could not classify file.',
      detected_tasks: [],
      detected_deadlines: [],
      confidence: 0,
    }
  }
}

// ── Task Breakdown ────────────────────────────────────────────

export async function generateTaskBreakdown(task: Partial<Task>): Promise<{
  subtasks: { title: string; estimated_minutes: number }[]
}> {
  try {
    return await callAI('task_breakdown', { title: task.title, description: task.description })
  } catch {
    return { subtasks: [] }
  }
}

// ── Daily Priority Suggestions ────────────────────────────────

export async function suggestDailyPriorities(tasks: Task[]): Promise<{
  top_tasks: Task[]
  explanation: string
}> {
  const urgentTasks = tasks
    .filter(t => t.status !== 'done' && (t.priority === 'urgent' || t.priority === 'high'))
    .slice(0, 3)

  return {
    top_tasks: urgentTasks,
    explanation:
      'These tasks are prioritized based on urgency and priority level. Focus on urgent items first, then tackle high-priority work during your peak energy hours.',
  }
}

// ── Note Summarization ────────────────────────────────────────

export async function summarizeNote(noteContent: string): Promise<{
  summary: string
  key_concepts: string[]
  possible_tasks: string[]
  possible_flashcards: { front: string; back: string }[]
}> {
  try {
    return await callAI('summarize_note', { content: noteContent })
  } catch {
    return {
      summary: 'Could not summarize note.',
      key_concepts: [],
      possible_tasks: [],
      possible_flashcards: [],
    }
  }
}

// ── Knowledge Base Q&A ────────────────────────────────────────

export async function askKnowledgeBase(query: string): Promise<{
  relevant_notes: string[]
  relevant_files: string[]
  relevant_tasks: string[]
  synthesized_answer: string
}> {
  return {
    relevant_notes: [],
    relevant_files: [],
    relevant_tasks: [],
    synthesized_answer: `Searching your knowledge base for: "${query}". Connect more notes and files to get personalized answers.`,
  }
}

// ── Quick Capture Processing ──────────────────────────────────

export async function processQuickCapture(
  text: string,
  userId: string
): Promise<Omit<import('./types').AIInboxItem, 'id' | 'created_at'>[]> {
  const extracted = await extractStructuredItemsFromText(text)

  const items: Omit<import('./types').AIInboxItem, 'id' | 'created_at'>[] = []

  for (const task of extracted.tasks) {
    items.push({
      user_id: userId,
      type: 'task',
      title: task.title ?? 'Captured task',
      extracted_data: task,
      source_type: 'capture',
      source_text: text,
      suggested_workspace_id: extracted.suggested_workspace,
      suggested_course_id: extracted.suggested_course,
      confidence: extracted.confidence,
      status: 'pending',
    })
  }

  for (const event of extracted.events) {
    items.push({
      user_id: userId,
      type: 'event',
      title: event.title ?? 'Captured event',
      extracted_data: event,
      source_type: 'capture',
      source_text: text,
      suggested_workspace_id: extracted.suggested_workspace,
      suggested_course_id: extracted.suggested_course,
      confidence: extracted.confidence,
      status: 'pending',
    })
  }

  for (const deadline of extracted.deadlines) {
    items.push({
      user_id: userId,
      type: 'deadline',
      title: deadline.title,
      extracted_data: deadline,
      source_type: 'capture',
      source_text: text,
      suggested_workspace_id: extracted.suggested_workspace,
      suggested_course_id: extracted.suggested_course,
      confidence: extracted.confidence,
      status: 'pending',
    })
  }

  for (const note of extracted.notes) {
    items.push({
      user_id: userId,
      type: 'note',
      title: note.title ?? 'Captured note',
      extracted_data: note,
      source_type: 'capture',
      source_text: text,
      suggested_workspace_id: extracted.suggested_workspace,
      suggested_course_id: extracted.suggested_course,
      confidence: extracted.confidence,
      status: 'pending',
    })
  }

  return items
}

// ── Email → Calendar Parsing ──────────────────────────────────

export interface ParsedEmailEvent {
  title: string
  date: string
  startTime: string
  endTime: string
  location: string
  description: string
  type: string
  confidence: number
}

export async function parseEmailForCalendar(emailText: string): Promise<ParsedEmailEvent> {
  try {
    return await callAI('parse_email', { email: emailText })
  } catch {
    const today = new Date().toISOString().split('T')[0]
    return {
      title: 'Event from Email',
      date: today,
      startTime: '10:00',
      endTime: '11:00',
      location: '',
      description: emailText.slice(0, 400).trim(),
      type: 'meeting',
      confidence: 0.3,
    }
  }
}

// ── Unused import suppression ─────────────────────────────────
export type { AIInboxItem }
