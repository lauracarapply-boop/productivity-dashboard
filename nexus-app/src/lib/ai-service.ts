// ============================================================
// Nexus App — AI Service
// Placeholder functions ready for real API connection.
// Replace mock implementations with actual AI API calls.
// ============================================================

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

// ── Text Extraction ───────────────────────────────────────────

/**
 * Extract structured items (tasks, events, deadlines, notes) from free-form text.
 *
 * TODO: Connect to OpenAI/Claude API
 * Prompt: Parse the following text and extract any tasks, calendar events,
 * deadlines, or notes. Return structured JSON.
 */
export async function extractStructuredItemsFromText(inputText: string): Promise<ExtractedItems> {
  // Simulate API latency
  await new Promise(r => setTimeout(r, 800))

  const items: ExtractedItems = {
    tasks: [],
    events: [],
    deadlines: [],
    notes: [],
    confidence: 0.85,
  }

  const lower = inputText.toLowerCase()

  // Simple mock parsing — keyword-based heuristics
  if (lower.includes('read') || lower.includes('finish')) {
    items.tasks.push({
      title: 'Complete assigned reading',
      priority: 'medium',
      status: 'todo',
    })
  }
  if (lower.includes('email') || lower.includes('send') || lower.includes('reply')) {
    items.tasks.push({
      title: 'Send email',
      priority: 'high',
      status: 'todo',
    })
  }
  if (lower.includes('essay') || lower.includes('paper') || lower.includes('write')) {
    items.tasks.push({
      title: 'Work on written assignment',
      priority: 'high',
      status: 'todo',
    })
  }
  if (lower.includes('meeting') || lower.includes('session') || lower.includes('call')) {
    items.events.push({
      title: 'Meeting / Session',
      type: 'meeting',
    })
  }
  if (lower.includes('class') || lower.includes('lecture')) {
    items.events.push({
      title: 'Class / Lecture',
      type: 'class',
    })
  }
  if (
    lower.includes('friday') ||
    lower.includes('deadline') ||
    lower.includes('due') ||
    lower.includes('submit')
  ) {
    items.deadlines.push({
      title: 'Upcoming deadline',
      date: '2026-05-16',
    })
  }
  if (lower.includes('note') || lower.includes('summary') || lower.includes('remember')) {
    items.notes.push({
      title: 'Captured note',
      content: inputText,
    })
  }

  return items
}

// ── Drive File Classification ─────────────────────────────────

/**
 * Classify a Google Drive file by metadata and optional content.
 *
 * TODO: Connect to AI API
 * Prompt: Given the file name, MIME type, folder path, and content excerpt,
 * classify the file type, suggest a course, write a summary, and extract
 * any tasks or deadlines mentioned.
 */
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
  await new Promise(r => setTimeout(r, 600))

  const name = (fileMetadata.name ?? '').toLowerCase()

  let detected_type: DriveFile['detected_type'] = 'general'
  if (name.includes('syllabus')) detected_type = 'syllabus'
  else if (name.includes('reading') || name.includes('chapter') || name.includes('excerpt')) detected_type = 'reading'
  else if (name.includes('note') || name.includes('lecture')) detected_type = 'notes'
  else if (name.includes('assignment') || name.includes('problem set') || name.includes('ps')) detected_type = 'assignment'
  else if (name.includes('slide') || name.includes('presentation')) detected_type = 'slides'

  return {
    detected_type,
    summary: `This document appears to be ${detected_type} material. ${fileContent ? 'Content has been analyzed.' : 'Full analysis requires file content access.'}`,
    detected_tasks: ['Review this document', 'Take notes on key concepts'],
    detected_deadlines: [],
    confidence: 0.82,
  }
}

// ── Task Breakdown ────────────────────────────────────────────

/**
 * Break a task down into actionable subtasks with time estimates.
 *
 * TODO: Connect to AI API
 * Prompt: Given this task title and description, break it down into
 * 3–6 concrete subtasks with estimated time in minutes for each.
 */
export async function generateTaskBreakdown(task: Partial<Task>): Promise<{
  subtasks: { title: string; estimated_minutes: number }[]
}> {
  await new Promise(r => setTimeout(r, 500))

  return {
    subtasks: [
      {
        title: `Research and gather materials for: ${task.title ?? 'task'}`,
        estimated_minutes: 20,
      },
      {
        title: 'Draft initial outline',
        estimated_minutes: 15,
      },
      {
        title: 'Complete main work',
        estimated_minutes: 45,
      },
      {
        title: 'Review and finalize',
        estimated_minutes: 20,
      },
    ],
  }
}

// ── Daily Priority Suggestions ────────────────────────────────

/**
 * Suggest the top tasks to work on today based on priority, deadlines, and energy.
 *
 * TODO: Connect to AI API
 * Prompt: Given the user's full task list, today's date, and schedule,
 * return the 3–5 tasks that should be prioritized today with a brief explanation.
 */
export async function suggestDailyPriorities(tasks: Task[]): Promise<{
  top_tasks: Task[]
  explanation: string
}> {
  await new Promise(r => setTimeout(r, 400))

  const urgentTasks = tasks
    .filter(t => t.status !== 'done' && (t.priority === 'urgent' || t.priority === 'high'))
    .slice(0, 3)

  return {
    top_tasks: urgentTasks,
    explanation:
      'These tasks are prioritized based on urgency, upcoming deadlines, and estimated completion time. Focus on urgent items first, then tackle high-priority work during your peak energy hours.',
  }
}

// ── Note Summarization ────────────────────────────────────────

/**
 * Summarize a note, extract key concepts, and suggest follow-up tasks and flashcards.
 *
 * TODO: Connect to AI API
 * Prompt: Summarize the following note in 2–3 sentences. Then list 3–5 key
 * concepts, 2–3 possible tasks that arise from this note, and 2–3 flashcard
 * front/back pairs for studying.
 */
export async function summarizeNote(noteContent: string): Promise<{
  summary: string
  key_concepts: string[]
  possible_tasks: string[]
  possible_flashcards: { front: string; back: string }[]
}> {
  await new Promise(r => setTimeout(r, 700))

  return {
    summary:
      'This note covers key concepts from the course material. The main themes include foundational theory, practical applications, and critical analysis of the subject matter.',
    key_concepts: ['Core concept 1', 'Core concept 2', 'Core concept 3'],
    possible_tasks: [
      'Review these notes before next class',
      'Create flashcards from key concepts',
      'Connect these ideas to the upcoming assignment',
    ],
    possible_flashcards: [
      {
        front: 'Key term from your notes',
        back: 'Definition and context from your notes',
      },
      {
        front: 'Main argument',
        back: 'Supporting evidence and examples',
      },
    ],
  }
}

// ── Knowledge Base Q&A ────────────────────────────────────────

/**
 * Answer a question by searching across the user's notes, files, and tasks.
 *
 * TODO: Connect to AI API + vector DB (e.g. Pinecone, Supabase pgvector)
 * Implementation:
 * 1. Embed the query
 * 2. Retrieve top-K relevant notes/files via vector similarity
 * 3. Pass retrieved context + query to LLM for synthesis
 */
export async function askKnowledgeBase(query: string): Promise<{
  relevant_notes: string[]
  relevant_files: string[]
  relevant_tasks: string[]
  synthesized_answer: string
}> {
  await new Promise(r => setTimeout(r, 900))

  return {
    relevant_notes: [],
    relevant_files: [],
    relevant_tasks: [],
    synthesized_answer: `Based on your knowledge base, here's what I found related to "${query}": Your notes and files contain information relevant to this topic. Once the AI knowledge base is fully connected, I'll be able to surface specific passages from your notes and Drive files and synthesize them into a direct answer.`,
  }
}

// ── Quick Capture Processing ──────────────────────────────────

/**
 * Process a quick capture entry and produce AI inbox items for review.
 *
 * TODO: Connect to AI API
 * This is the main entry point from the Quick Capture UI. It calls
 * extractStructuredItemsFromText and wraps the results as AIInboxItem candidates.
 */
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
  date: string        // ISO date string YYYY-MM-DD
  startTime: string   // HH:MM
  endTime: string     // HH:MM
  location: string
  description: string
  type: string
  confidence: number
}

/**
 * Parse email text and extract calendar event details.
 *
 * TODO: Connect to AI API for accurate NLP extraction.
 */
export async function parseEmailForCalendar(emailText: string): Promise<ParsedEmailEvent> {
  await new Promise(r => setTimeout(r, 1200))

  const lower = emailText.toLowerCase()

  // Extract subject/title — first non-empty line or "Subject:" field
  let title = 'Event from Email'
  const subjectMatch = emailText.match(/subject:\s*([^\n]+)/i)
  if (subjectMatch) {
    title = subjectMatch[1].trim().replace(/^re:\s*/i, '').trim()
  } else {
    const firstLine = emailText.split('\n').find(l => l.trim().length > 5)
    if (firstLine) title = firstLine.trim().slice(0, 80)
  }

  // Extract date
  let isoDate = ''
  const today = new Date()

  const dayNames = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday']
  const matchedDay = dayNames.find(d => lower.includes(d))
  if (matchedDay) {
    const targetDow = dayNames.indexOf(matchedDay)
    const d = new Date(today)
    let diff = targetDow - d.getDay()
    if (diff <= 0) diff += 7
    d.setDate(d.getDate() + diff)
    isoDate = d.toISOString().split('T')[0]
  }

  const mdy = emailText.match(/(\d{1,2})\/(\d{1,2})(?:\/(\d{2,4}))?/)
  if (!isoDate && mdy) {
    const year = mdy[3] ? (mdy[3].length === 2 ? `20${mdy[3]}` : mdy[3]) : today.getFullYear()
    isoDate = `${year}-${mdy[1].padStart(2, '0')}-${mdy[2].padStart(2, '0')}`
  }

  const monthNames = ['jan', 'feb', 'mar', 'apr', 'may', 'jun', 'jul', 'aug', 'sep', 'oct', 'nov', 'dec']
  if (!isoDate) {
    const mname = monthNames.find(m => lower.includes(m))
    if (mname) {
      const midx = monthNames.indexOf(mname)
      const dayMatch = emailText.match(new RegExp(`${mname}\\w*\\.?\\s+(\\d{1,2})`, 'i'))
      if (dayMatch) {
        isoDate = `${today.getFullYear()}-${(midx + 1).toString().padStart(2, '0')}-${dayMatch[1].padStart(2, '0')}`
      }
    }
  }

  if (!isoDate) isoDate = today.toISOString().split('T')[0]

  // Extract time
  let startH = 10, startM = 0
  const timeMatch = emailText.match(/(\d{1,2})(?::(\d{2}))?\s*(am|pm)/i)
  if (timeMatch) {
    startH = parseInt(timeMatch[1])
    startM = timeMatch[2] ? parseInt(timeMatch[2]) : 0
    const ampm = timeMatch[3].toLowerCase()
    if (ampm === 'pm' && startH !== 12) startH += 12
    if (ampm === 'am' && startH === 12) startH = 0
  }
  const endH = startH + 1

  const startTime = `${startH.toString().padStart(2, '0')}:${startM.toString().padStart(2, '0')}`
  const endTime = `${endH.toString().padStart(2, '0')}:${startM.toString().padStart(2, '0')}`

  // Extract location
  let location = ''
  const locMatch = emailText.match(/(?:location|place|venue|room|where|at):\s*([^\n,]+)/i)
  if (locMatch) {
    location = locMatch[1].trim()
  } else {
    const roomMatch = emailText.match(/(?:room|hall|building|lab)\s*[\w-]+/i)
    if (roomMatch) location = roomMatch[0]
  }

  // Classify event type
  let type = 'meeting'
  if (lower.includes('lecture') || lower.includes('class')) type = 'class'
  else if (lower.includes('exam') || lower.includes('test') || lower.includes(' due ')) type = 'deadline'
  else if (lower.includes('study') || lower.includes('review session')) type = 'study'
  else if (lower.includes('appointment') || lower.includes('doctor') || lower.includes('office hours')) type = 'appointment'

  const confidence = (timeMatch ? 0.3 : 0) + (matchedDay || mdy ? 0.3 : 0) + (location ? 0.1 : 0) + 0.35

  return {
    title,
    date: isoDate,
    startTime,
    endTime,
    location,
    description: emailText.slice(0, 400).trim(),
    type,
    confidence: Math.min(confidence, 0.97),
  }
}

// ── Unused import suppression ─────────────────────────────────
// AIInboxItem is referenced in processQuickCapture return type above
export type { AIInboxItem }
