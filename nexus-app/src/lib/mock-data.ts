// ============================================================
// Nexus App — Comprehensive Mock Data
// ============================================================

import type {
  User,
  Workspace,
  Course,
  Task,
  CalendarEvent,
  Note,
  DriveFile,
  AIInboxItem,
  Project,
  Opportunity,
  LanguageItem,
  Lecture,
  Reading,
} from './types'

// ── User ─────────────────────────────────────────────────────
export const mockUser: User = {
  id: '1',
  name: 'Laura',
  email: 'laura@university.edu',
  avatar: undefined,
  created_at: '2026-01-15',
}

// ── Workspaces ───────────────────────────────────────────────
export const mockWorkspaces: Workspace[] = [
  {
    id: 'ws-1',
    user_id: '1',
    name: 'College',
    description: 'Academic coursework, assignments, and class notes',
    color: '#4F46E5',
    icon: 'GraduationCap',
    type: 'academic',
    created_at: '2026-01-15',
  },
  {
    id: 'ws-2',
    user_id: '1',
    name: 'French',
    description: 'French language learning — vocabulary, grammar, practice',
    color: '#7C3AED',
    icon: 'Languages',
    type: 'language',
    created_at: '2026-01-15',
  },
  {
    id: 'ws-3',
    user_id: '1',
    name: 'Chinese',
    description: 'Mandarin Chinese — characters, tones, conversation',
    color: '#DC2626',
    icon: 'BookText',
    type: 'language',
    created_at: '2026-01-15',
  },
  {
    id: 'ws-4',
    user_id: '1',
    name: 'Social Media',
    description: 'Content planning, scheduling, and analytics',
    color: '#0891B2',
    icon: 'Share2',
    type: 'project',
    created_at: '2026-01-15',
  },
  {
    id: 'ws-5',
    user_id: '1',
    name: 'Personal',
    description: 'Personal goals, habits, and life admin',
    color: '#059669',
    icon: 'User',
    type: 'personal',
    created_at: '2026-01-15',
  },
  {
    id: 'ws-6',
    user_id: '1',
    name: 'Mandato Aberto',
    description: 'Open mandate civic tech project — design and outreach',
    color: '#D97706',
    icon: 'Landmark',
    type: 'project',
    created_at: '2026-01-15',
  },
  {
    id: 'ws-7',
    user_id: '1',
    name: 'Research',
    description: 'Academic research projects and paper writing',
    color: '#6366F1',
    icon: 'FlaskConical',
    type: 'project',
    created_at: '2026-01-15',
  },
  {
    id: 'ws-8',
    user_id: '1',
    name: 'Applications',
    description: 'Scholarships, fellowships, internships, and programs',
    color: '#8B5CF6',
    icon: 'Send',
    type: 'project',
    created_at: '2026-01-15',
  },
]

// ── Courses ──────────────────────────────────────────────────
export const mockCourses: Course[] = [
  {
    id: 'c-1',
    user_id: '1',
    workspace_id: 'ws-1',
    name: 'Introduction to Political Theory',
    code: 'POL101',
    professor: 'Dr. James Harrington',
    professor_email: 'j.harrington@university.edu',
    schedule: [
      { day: 'Monday', start: '10:00', end: '11:00', location: 'Room 204' },
      { day: 'Wednesday', start: '10:00', end: '11:00', location: 'Room 204' },
      { day: 'Friday', start: '10:00', end: '11:00', location: 'Room 204' },
    ],
    office_hours: 'Tuesdays 2:00–4:00 PM, Office 312',
    semester: 'Spring 2026',
    color: '#4F46E5',
    syllabus_file_id: 'df-1',
    drive_folder_id: 'gdrive-folder-pol101',
    created_at: '2026-01-15',
  },
  {
    id: 'c-2',
    user_id: '1',
    workspace_id: 'ws-1',
    name: 'Comparative Politics',
    code: 'POL201',
    professor: 'Dr. Sofia Reyes',
    professor_email: 's.reyes@university.edu',
    schedule: [
      { day: 'Tuesday', start: '14:00', end: '15:30', location: 'Room 301' },
      { day: 'Thursday', start: '14:00', end: '15:30', location: 'Room 301' },
    ],
    office_hours: 'Wednesdays 1:00–3:00 PM, Office 218',
    semester: 'Spring 2026',
    color: '#0891B2',
    syllabus_file_id: 'df-2',
    drive_folder_id: 'gdrive-folder-pol201',
    created_at: '2026-01-15',
  },
  {
    id: 'c-3',
    user_id: '1',
    workspace_id: 'ws-2',
    name: 'French I',
    code: 'FRE101',
    professor: 'Marie Dubois',
    professor_email: 'm.dubois@university.edu',
    schedule: [
      { day: 'Monday', start: '09:00', end: '10:00', location: 'Language Lab 1' },
      { day: 'Wednesday', start: '09:00', end: '10:00', location: 'Language Lab 1' },
      { day: 'Friday', start: '09:00', end: '10:00', location: 'Language Lab 1' },
    ],
    office_hours: 'Thursdays 11:00 AM–1:00 PM, Office 105',
    semester: 'Spring 2026',
    color: '#7C3AED',
    syllabus_file_id: 'df-3',
    drive_folder_id: 'gdrive-folder-fre101',
    created_at: '2026-01-15',
  },
  {
    id: 'c-4',
    user_id: '1',
    workspace_id: 'ws-3',
    name: 'Chinese I',
    code: 'CHI101',
    professor: 'Dr. Wei Zhang',
    professor_email: 'w.zhang@university.edu',
    schedule: [
      { day: 'Tuesday', start: '11:00', end: '12:30', location: 'Language Lab 2' },
      { day: 'Thursday', start: '11:00', end: '12:30', location: 'Language Lab 2' },
    ],
    office_hours: 'Mondays 1:00–3:00 PM, Office 108',
    semester: 'Spring 2026',
    color: '#DC2626',
    syllabus_file_id: 'df-4',
    drive_folder_id: 'gdrive-folder-chi101',
    created_at: '2026-01-15',
  },
  {
    id: 'c-5',
    user_id: '1',
    workspace_id: 'ws-1',
    name: 'Data Science Foundations',
    code: 'DS101',
    professor: 'Dr. Aisha Johnson',
    professor_email: 'a.johnson@university.edu',
    schedule: [
      { day: 'Monday', start: '15:00', end: '16:30', location: 'Computer Lab' },
      { day: 'Wednesday', start: '15:00', end: '16:30', location: 'Computer Lab' },
    ],
    office_hours: 'Fridays 10:00 AM–12:00 PM, Office 420',
    semester: 'Spring 2026',
    color: '#059669',
    syllabus_file_id: 'df-5',
    drive_folder_id: 'gdrive-folder-ds101',
    created_at: '2026-01-15',
  },
]

// ── Tasks ────────────────────────────────────────────────────
export const mockTasks: Task[] = [
  {
    id: 't-1',
    user_id: '1',
    title: 'Write essay on Hobbes\' Leviathan and state of nature',
    description: 'Analyze Hobbes\' conception of the state of nature and how it justifies absolute sovereignty. 1500 words, cite at least 5 sources.',
    status: 'in_progress',
    priority: 'urgent',
    due_date: '2026-05-13',
    estimated_minutes: 180,
    energy_level: 'high',
    workspace_id: 'ws-1',
    course_id: 'c-1',
    subtasks: [
      { id: 'st-1a', task_id: 't-1', title: 'Re-read Leviathan chapters 13–14', completed: true },
      { id: 'st-1b', task_id: 't-1', title: 'Draft thesis and outline', completed: true },
      { id: 'st-1c', task_id: 't-1', title: 'Write first draft', completed: false },
      { id: 'st-1d', task_id: 't-1', title: 'Revise and add citations', completed: false },
    ],
    created_at: '2026-05-05',
  },
  {
    id: 't-2',
    user_id: '1',
    title: 'Complete Problem Set 3 — Data cleaning with pandas',
    description: 'Load the provided dataset, handle missing values, normalize columns, and produce summary statistics. Submit via course portal.',
    status: 'todo',
    priority: 'high',
    due_date: '2026-05-14',
    estimated_minutes: 120,
    energy_level: 'high',
    workspace_id: 'ws-1',
    course_id: 'c-5',
    subtasks: [
      { id: 'st-2a', task_id: 't-2', title: 'Download dataset from course portal', completed: false },
      { id: 'st-2b', task_id: 't-2', title: 'Handle missing values and outliers', completed: false },
      { id: 'st-2c', task_id: 't-2', title: 'Write analysis script', completed: false },
      { id: 'st-2d', task_id: 't-2', title: 'Submit on portal', completed: false },
    ],
    created_at: '2026-05-06',
  },
  {
    id: 't-3',
    user_id: '1',
    title: 'Read Dahl — "Polyarchy" chapters 1–3',
    description: 'Reading for Comparative Politics. Take notes on key definitions and Dahl\'s criteria for democratic governance.',
    status: 'todo',
    priority: 'high',
    due_date: '2026-05-12',
    estimated_minutes: 75,
    energy_level: 'medium',
    workspace_id: 'ws-1',
    course_id: 'c-2',
    subtasks: [],
    created_at: '2026-05-07',
  },
  {
    id: 't-4',
    user_id: '1',
    title: 'Study for French I vocabulary quiz — Unit 6',
    description: 'Food and restaurant vocabulary. Use Anki deck and complete the workbook exercises pp. 78–82.',
    status: 'todo',
    priority: 'medium',
    due_date: '2026-05-15',
    estimated_minutes: 60,
    energy_level: 'low',
    workspace_id: 'ws-2',
    course_id: 'c-3',
    subtasks: [
      { id: 'st-4a', task_id: 't-4', title: 'Review Anki deck (50 cards)', completed: false },
      { id: 'st-4b', task_id: 't-4', title: 'Complete workbook pp. 78–82', completed: false },
    ],
    created_at: '2026-05-08',
  },
  {
    id: 't-5',
    user_id: '1',
    title: 'Practice Chinese tones — listen and repeat exercises',
    description: 'Use the audio files from Dr. Zhang\'s Drive folder. Focus on tones 2 and 3 pairs which are causing errors.',
    status: 'in_progress',
    priority: 'medium',
    due_date: '2026-05-11',
    estimated_minutes: 45,
    energy_level: 'medium',
    workspace_id: 'ws-3',
    course_id: 'c-4',
    subtasks: [],
    created_at: '2026-05-07',
  },
  {
    id: 't-6',
    user_id: '1',
    title: 'Update Mandato Aberto landing page wireframes',
    description: 'Redesign the hero section and citizen form based on feedback from last week\'s meeting. Share in Figma.',
    status: 'in_progress',
    priority: 'high',
    due_date: '2026-05-16',
    estimated_minutes: 150,
    energy_level: 'high',
    workspace_id: 'ws-6',
    project_id: 'p-1',
    subtasks: [
      { id: 'st-6a', task_id: 't-6', title: 'Review meeting notes and feedback', completed: true },
      { id: 'st-6b', task_id: 't-6', title: 'Sketch new hero section layout', completed: false },
      { id: 'st-6c', task_id: 't-6', title: 'Build Figma wireframes', completed: false },
      { id: 'st-6d', task_id: 't-6', title: 'Share link with team', completed: false },
    ],
    created_at: '2026-05-06',
  },
  {
    id: 't-7',
    user_id: '1',
    title: 'Draft abstract for political behavior research paper',
    description: 'Submit 250-word abstract to Dr. Reyes by end of week for approval before writing the full paper.',
    status: 'todo',
    priority: 'urgent',
    due_date: '2026-05-12',
    estimated_minutes: 60,
    energy_level: 'high',
    workspace_id: 'ws-7',
    project_id: 'p-2',
    course_id: 'c-2',
    subtasks: [
      { id: 'st-7a', task_id: 't-7', title: 'Review research notes', completed: false },
      { id: 'st-7b', task_id: 't-7', title: 'Write 250-word abstract', completed: false },
      { id: 'st-7c', task_id: 't-7', title: 'Email to Dr. Reyes', completed: false },
    ],
    created_at: '2026-05-08',
  },
  {
    id: 't-8',
    user_id: '1',
    title: 'Submit Rhodes Scholarship personal statement draft',
    description: 'First draft of 1000-word personal statement. Focus on intellectual curiosity and leadership narrative.',
    status: 'todo',
    priority: 'urgent',
    due_date: '2026-05-18',
    estimated_minutes: 240,
    energy_level: 'high',
    workspace_id: 'ws-8',
    project_id: 'p-3',
    subtasks: [
      { id: 'st-8a', task_id: 't-8', title: 'Outline key themes and anecdotes', completed: false },
      { id: 'st-8b', task_id: 't-8', title: 'Write full first draft', completed: false },
      { id: 'st-8c', task_id: 't-8', title: 'Review for clarity and voice', completed: false },
    ],
    created_at: '2026-05-07',
  },
  {
    id: 't-9',
    user_id: '1',
    title: 'Email professor Harrington about office hours appointment',
    description: 'Ask about getting feedback on essay outline before submission deadline.',
    status: 'done',
    priority: 'medium',
    due_date: '2026-05-09',
    estimated_minutes: 10,
    energy_level: 'low',
    workspace_id: 'ws-1',
    course_id: 'c-1',
    subtasks: [],
    created_at: '2026-05-08',
  },
  {
    id: 't-10',
    user_id: '1',
    title: 'Schedule social media content for the week',
    description: 'Plan and schedule 5 posts across Instagram and Twitter/X. Focus on civic engagement theme.',
    status: 'todo',
    priority: 'low',
    due_date: '2026-05-11',
    estimated_minutes: 90,
    energy_level: 'low',
    workspace_id: 'ws-4',
    subtasks: [
      { id: 'st-10a', task_id: 't-10', title: 'Draft captions for 5 posts', completed: false },
      { id: 'st-10b', task_id: 't-10', title: 'Select/create visuals', completed: false },
      { id: 'st-10c', task_id: 't-10', title: 'Schedule in Buffer', completed: false },
    ],
    created_at: '2026-05-08',
  },
  {
    id: 't-11',
    user_id: '1',
    title: 'Read Tocqueville — Democracy in America (excerpt)',
    description: 'Pages 1–40 of the assigned excerpt. Take notes on his observations about American civic culture.',
    status: 'overdue',
    priority: 'high',
    due_date: '2026-05-07',
    estimated_minutes: 90,
    energy_level: 'medium',
    workspace_id: 'ws-1',
    course_id: 'c-1',
    subtasks: [],
    created_at: '2026-05-02',
  },
  {
    id: 't-12',
    user_id: '1',
    title: 'Prepare Comparative Politics discussion questions',
    description: 'Bring 3 discussion questions based on the Dahl reading to Thursday\'s seminar.',
    status: 'todo',
    priority: 'medium',
    due_date: '2026-05-14',
    estimated_minutes: 30,
    energy_level: 'medium',
    workspace_id: 'ws-1',
    course_id: 'c-2',
    subtasks: [],
    created_at: '2026-05-09',
  },
]

// ── Calendar Events ───────────────────────────────────────────
// Week of May 11–17, 2026
export const mockCalendarEvents: CalendarEvent[] = [
  {
    id: 'ev-1',
    user_id: '1',
    title: 'POL101 — Political Theory',
    description: 'Topic: Rousseau and the General Will',
    start_time: '2026-05-11T10:00:00',
    end_time: '2026-05-11T11:00:00',
    type: 'class',
    source: 'platform',
    workspace_id: 'ws-1',
    course_id: 'c-1',
    location: 'Room 204',
    color: '#4F46E5',
    created_at: '2026-01-15',
  },
  {
    id: 'ev-2',
    user_id: '1',
    title: 'FRE101 — French I',
    description: 'Topic: Passé composé with avoir',
    start_time: '2026-05-11T09:00:00',
    end_time: '2026-05-11T10:00:00',
    type: 'class',
    source: 'platform',
    workspace_id: 'ws-2',
    course_id: 'c-3',
    location: 'Language Lab 1',
    color: '#7C3AED',
    created_at: '2026-01-15',
  },
  {
    id: 'ev-3',
    user_id: '1',
    title: 'DS101 — Data Science',
    description: 'Topic: Introduction to pandas DataFrames',
    start_time: '2026-05-11T15:00:00',
    end_time: '2026-05-11T16:30:00',
    type: 'class',
    source: 'platform',
    workspace_id: 'ws-1',
    course_id: 'c-5',
    location: 'Computer Lab',
    color: '#059669',
    created_at: '2026-01-15',
  },
  {
    id: 'ev-4',
    user_id: '1',
    title: 'Study Block — Political Theory Essay',
    description: 'Focus session: complete first draft of Hobbes essay',
    start_time: '2026-05-12T13:00:00',
    end_time: '2026-05-12T16:00:00',
    type: 'study',
    source: 'platform',
    workspace_id: 'ws-1',
    course_id: 'c-1',
    task_id: 't-1',
    color: '#4F46E5',
    created_at: '2026-05-09',
  },
  {
    id: 'ev-5',
    user_id: '1',
    title: 'CHI101 — Chinese I',
    description: 'Topic: Measure words and quantities',
    start_time: '2026-05-13T11:00:00',
    end_time: '2026-05-13T12:30:00',
    type: 'class',
    source: 'platform',
    workspace_id: 'ws-3',
    course_id: 'c-4',
    location: 'Language Lab 2',
    color: '#DC2626',
    created_at: '2026-01-15',
  },
  {
    id: 'ev-6',
    user_id: '1',
    title: 'POL201 — Comparative Politics',
    description: 'Topic: Electoral systems and representation',
    start_time: '2026-05-13T14:00:00',
    end_time: '2026-05-13T15:30:00',
    type: 'class',
    source: 'platform',
    workspace_id: 'ws-1',
    course_id: 'c-2',
    location: 'Room 301',
    color: '#0891B2',
    created_at: '2026-01-15',
  },
  {
    id: 'ev-7',
    user_id: '1',
    title: 'Office Hours — Dr. Harrington (POL101)',
    description: 'Discuss essay outline and get feedback on thesis',
    start_time: '2026-05-13T14:00:00',
    end_time: '2026-05-13T14:30:00',
    type: 'appointment',
    source: 'platform',
    workspace_id: 'ws-1',
    course_id: 'c-1',
    location: 'Office 312',
    color: '#4F46E5',
    created_at: '2026-05-09',
  },
  {
    id: 'ev-8',
    user_id: '1',
    title: 'Mandato Aberto Team Meeting',
    description: 'Weekly sync — review wireframes, assign sprint tasks',
    start_time: '2026-05-14T18:00:00',
    end_time: '2026-05-14T19:00:00',
    type: 'meeting',
    source: 'platform',
    workspace_id: 'ws-6',
    location: 'Google Meet',
    color: '#D97706',
    created_at: '2026-05-01',
  },
  {
    id: 'ev-9',
    user_id: '1',
    title: 'FRE101 Vocabulary Quiz — Unit 6',
    description: 'Food and restaurant vocabulary quiz. Covers workbook pp. 78–82.',
    start_time: '2026-05-15T09:00:00',
    end_time: '2026-05-15T09:45:00',
    type: 'deadline',
    source: 'platform',
    workspace_id: 'ws-2',
    course_id: 'c-3',
    location: 'Language Lab 1',
    color: '#7C3AED',
    created_at: '2026-01-15',
  },
  {
    id: 'ev-10',
    user_id: '1',
    title: 'Study Block — DS101 Problem Set 3',
    description: 'Work on pandas data cleaning assignment in the computer lab',
    start_time: '2026-05-16T10:00:00',
    end_time: '2026-05-16T12:00:00',
    type: 'study',
    source: 'platform',
    workspace_id: 'ws-1',
    course_id: 'c-5',
    task_id: 't-2',
    color: '#059669',
    created_at: '2026-05-09',
  },
]

// ── Notes ─────────────────────────────────────────────────────
export const mockNotes: Note[] = [
  {
    id: 'n-1',
    user_id: '1',
    title: 'Hobbes & The Social Contract — Lecture Notes',
    content: `# Hobbes and the Social Contract

## The State of Nature
Hobbes describes the state of nature as a condition of perpetual war — "war of all against all" (bellum omnium contra omnes).
- Life in this state: "solitary, poor, nasty, brutish, and short" (Leviathan, Ch. 13)
- No morality, no justice, no property — only raw power
- Rational agents recognize this as catastrophic

## The Social Contract
- Individuals surrender natural rights to a sovereign in exchange for protection
- The sovereign's authority is absolute and indivisible
- Breaking the contract = return to state of nature

## Key Terms
- **Sovereign**: the Leviathan — could be a monarch or an assembly
- **Commonwealth**: the political body formed by the contract
- **Natural right**: the liberty each person has to use their power for self-preservation
- **Natural law**: a precept found by reason, forbidding self-destruction

## Questions for Essay
1. Is Hobbes's state of nature realistic or a thought experiment?
2. Does the absolutism follow necessarily from his premises?
3. Comparison with Locke: what happens when the sovereign fails to protect?`,
    summary: 'Hobbes argues that the state of nature is a condition of war, driving rational individuals to form a social contract granting absolute authority to a sovereign for the sake of security and order.',
    workspace_id: 'ws-1',
    course_id: 'c-1',
    tags: ['hobbes', 'social contract', 'political theory', 'leviathan', 'state of nature'],
    linked_drive_file_ids: ['df-1', 'df-6'],
    key_concepts: ['State of nature', 'Social contract', 'Sovereign authority', 'Leviathan', 'Natural rights', 'Bellum omnium contra omnes'],
    created_at: '2026-04-28',
    updated_at: '2026-05-08',
  },
  {
    id: 'n-2',
    user_id: '1',
    title: 'Electoral Systems — Proportional vs. Majoritarian',
    content: `# Electoral Systems: POL201 Lecture Notes

## Types of Electoral Systems

### Majoritarian Systems
- **First-Past-the-Post (FPTP)**: Candidate with most votes wins. Used in US, UK.
  - Tends to produce two-party systems (Duverger's Law)
  - Advantages: clear accountability, stable governments
  - Disadvantages: wasted votes, disproportional outcomes

- **Two-Round System**: If no majority in Round 1, top 2 candidates face off. France.

### Proportional Representation (PR)
- Seats allocated proportional to vote share
- Types: Party-list PR, Single Transferable Vote (STV), Mixed-Member PR
- Tends to produce multi-party systems
- Advantages: fewer wasted votes, more diverse representation
- Disadvantages: coalition governments, less direct accountability

## Key Theorists
- **Duverger**: electoral laws shape party systems
- **Lijphart**: consensus vs. majoritarian democracies
- **Dahl**: polyarchy — conditions for democratic rule

## Comparative Cases
| Country | System | # of Parties |
|---------|--------|--------------|
| USA | FPTP | 2 dominant |
| Germany | Mixed-Member PR | 5–6 |
| Netherlands | Party-list PR | 10+ |
| France | Two-Round | 4–5 |`,
    summary: 'Overview of electoral system types — majoritarian (FPTP, two-round) vs. proportional representation — and their effects on party systems, representation, and governance, drawing on Duverger, Lijphart, and Dahl.',
    workspace_id: 'ws-1',
    course_id: 'c-2',
    tags: ['electoral systems', 'proportional representation', 'FPTP', 'comparative politics', 'duverger'],
    linked_drive_file_ids: ['df-2'],
    key_concepts: ["Duverger's Law", 'First-Past-the-Post', 'Proportional Representation', 'Polyarchy', 'Majoritarian democracy', 'Coalition government'],
    created_at: '2026-05-05',
    updated_at: '2026-05-05',
  },
  {
    id: 'n-3',
    user_id: '1',
    title: 'Passé Composé avec Avoir — Grammar Notes',
    content: `# Le Passé Composé avec Avoir

## Formation
**Subject + avoir (present) + past participle**

Example: J'ai mangé (I ate / I have eaten)

## Conjugation of AVOIR
| Pronoun | Avoir |
|---------|-------|
| je | ai |
| tu | as |
| il/elle | a |
| nous | avons |
| vous | avez |
| ils/elles | ont |

## Regular Past Participles
- **-er verbs** → **-é**: parler → parlé, manger → mangé, travailler → travaillé
- **-ir verbs** → **-i**: finir → fini, choisir → choisi
- **-re verbs** → **-u**: vendre → vendu, attendre → attendu

## Irregular Past Participles (must memorize!)
| Infinitive | Past Participle | Meaning |
|-----------|----------------|---------|
| avoir | eu | had |
| être | été | been |
| faire | fait | done/made |
| prendre | pris | taken |
| voir | vu | seen |
| vouloir | voulu | wanted |
| pouvoir | pu | been able to |
| savoir | su | known |
| lire | lu | read |
| écrire | écrit | written |

## Negation
Ne... pas surrounds the auxiliary: Je **n'**ai **pas** mangé.

## Practice Sentences
1. Elle a fini ses devoirs. (She finished her homework.)
2. Nous avons vu un film hier. (We saw a film yesterday.)
3. Il n'a pas pris le bus. (He didn't take the bus.)`,
    summary: 'Grammar notes on the passé composé with avoir: formation rules, regular and irregular past participles, negation, and practice sentences.',
    workspace_id: 'ws-2',
    course_id: 'c-3',
    tags: ['french', 'grammar', 'passé composé', 'avoir', 'past tense'],
    linked_drive_file_ids: [],
    key_concepts: ['Passé composé', 'Avoir as auxiliary', 'Past participle', 'Irregular verbs', 'Negation'],
    created_at: '2026-05-06',
    updated_at: '2026-05-06',
  },
  {
    id: 'n-4',
    user_id: '1',
    title: 'Chinese Tones — The Four Tones + Neutral Tone',
    content: `# Mandarin Chinese: The Four Tones (声调)

## Overview
Mandarin is a tonal language — the same syllable can mean completely different things depending on tone.

## The Four Tones
| Tone | Mark | Pattern | Example | Meaning |
|------|------|---------|---------|---------|
| 1st | ā | High, flat | mā (妈) | mother |
| 2nd | á | Rising | má (麻) | hemp/numb |
| 3rd | ǎ | Dipping (low) | mǎ (马) | horse |
| 4th | à | Falling | mà (骂) | to scold |
| Neutral | a | Light/short | ma (吗) | question particle |

## Tone Sandhi Rules
- **Two 3rd tones together**: First one becomes 2nd tone
  - Example: nǐ hǎo → ní hǎo (你好 — Hello!)
- **不 (bù) before 4th tone**: becomes bú
  - Example: bú shì (不是 — is not)

## Common Tricky Pairs
| Pinyin | Meaning |
|--------|---------|
| mǎi (买) vs mài (卖) | buy vs. sell |
| lái (来) vs lài (赖) | come vs. depend on |
| shū (书) vs shú (熟) | book vs. cooked/familiar |

## Practice Strategy
1. Listen to audio, repeat 10× per new word
2. Record yourself and compare
3. Focus on 2nd/3rd tone contrast — most errors here
4. Use Anki with audio cards`,
    summary: 'Overview of Mandarin\'s four tones and neutral tone, including tone sandhi rules, common minimal pairs, and a practice strategy for accurate pronunciation.',
    workspace_id: 'ws-3',
    course_id: 'c-4',
    tags: ['chinese', 'mandarin', 'tones', 'pinyin', 'pronunciation', 'tone sandhi'],
    linked_drive_file_ids: [],
    key_concepts: ['Four tones', 'Tone marks', 'Tone sandhi', 'Neutral tone', 'Pinyin', 'Minimal pairs'],
    created_at: '2026-05-03',
    updated_at: '2026-05-07',
  },
  {
    id: 'n-5',
    user_id: '1',
    title: 'Misinformation Research — Literature Review Notes',
    content: `# Research Notes: Political Misinformation & Social Media

## Core Research Question
How does algorithmic amplification on social media platforms affect the spread of political misinformation, and what interventions show empirical evidence of effectiveness?

## Key Papers

### Vosoughi, Roy & Aral (2018) — Science
- "The Spread of True and False News Online"
- False news spreads faster, farther, deeper than true news
- Novelty of false news explains difference (not bots)
- **Key stat**: False news is 70% more likely to be retweeted

### Pennycook & Rand (2021) — Psychological Science
- Accuracy nudges reduce misinformation sharing
- Simply prompting users to think about accuracy before sharing reduces sharing of false headlines
- Cheap intervention with measurable effects

### Roozenbeek et al. (2020) — Nature
- "Prebunking" / inoculation theory approach
- Exposing people to weakened forms of manipulation techniques reduces susceptibility
- "Bad News" game study

## Theoretical Frameworks
1. **Motivated reasoning**: people accept info that confirms priors
2. **Inoculation theory**: forewarning + refutation builds resistance
3. **Nudge theory**: altering choice architecture affects behavior

## Research Gap (my angle)
Most studies focus on US/English-language contexts. Portuguese-language social media (WhatsApp in Brazil) has received less systematic attention despite being a documented vector for political misinformation.

## Next Steps
- Find 3 more Brazilian case studies
- Draft research question refinement
- Send abstract to Dr. Reyes by May 12`,
    summary: 'Literature review notes on political misinformation research, covering key papers on social media spread (Vosoughi 2018), accuracy nudges (Pennycook 2021), and inoculation theory (Roozenbeek 2020), with a research gap identified in Portuguese-language contexts.',
    workspace_id: 'ws-7',
    course_id: 'c-2',
    project_id: 'p-2',
    tags: ['misinformation', 'research', 'social media', 'political behavior', 'inoculation', 'brazil'],
    linked_drive_file_ids: ['df-7'],
    key_concepts: ['Algorithmic amplification', 'Inoculation theory', 'Motivated reasoning', 'Accuracy nudges', 'Prebunking', 'WhatsApp misinformation'],
    created_at: '2026-04-20',
    updated_at: '2026-05-08',
  },
  {
    id: 'n-6',
    user_id: '1',
    title: 'Intro to Data Science — Week 1 Concepts',
    content: `# DS101 — Data Science Foundations: Week 1

## What is Data Science?
Interdisciplinary field using scientific methods, algorithms, and systems to extract knowledge and insights from structured and unstructured data.

## Core Workflow
1. **Problem formulation**: What question are we answering?
2. **Data collection**: Where does the data come from?
3. **Data cleaning**: Handle missing values, duplicates, type errors
4. **Exploratory analysis (EDA)**: Summary statistics, visualizations
5. **Modeling**: Fit statistical or ML model
6. **Communication**: Report results, visualize findings

## Key Python Tools
- **pandas**: DataFrames, data manipulation
- **numpy**: Numerical arrays, math operations
- **matplotlib / seaborn**: Visualization
- **scikit-learn**: Machine learning (later in course)

## Basic pandas Operations
\`\`\`python
import pandas as pd

df = pd.read_csv('data.csv')
df.head()           # first 5 rows
df.info()           # data types, non-null counts
df.describe()       # summary statistics
df.isnull().sum()   # count missing values per column
df.dropna()         # remove rows with any NaN
df.fillna(0)        # replace NaN with 0
\`\`\`

## Problem Set 3 Requirements
- Load CSV, handle missing values
- Normalize 2 numeric columns (min-max scaling)
- Produce: mean, median, std for each feature
- One visualization (histogram or scatter plot)
- Due: May 14`,
    summary: 'Week 1 notes for DS101 covering the data science workflow, core Python tools (pandas, numpy, matplotlib), and key pandas operations, with a note on Problem Set 3 requirements.',
    workspace_id: 'ws-1',
    course_id: 'c-5',
    tags: ['data science', 'python', 'pandas', 'eda', 'week 1'],
    linked_drive_file_ids: ['df-5', 'df-8'],
    key_concepts: ['Data science workflow', 'EDA', 'pandas DataFrames', 'Data cleaning', 'Summary statistics', 'Visualization'],
    created_at: '2026-04-07',
    updated_at: '2026-05-06',
  },
  {
    id: 'n-7',
    user_id: '1',
    title: 'Political Behavior — Key Theories Cheat Sheet',
    content: `# Political Behavior: Core Theories and Models

## Voting Behavior

### The Michigan Model (Campbell et al., 1960)
- "The American Voter" — party identification as long-term psychological attachment
- Funnel of causality: party ID → issues → candidate evaluations → vote
- Party ID formed in childhood (family socialization)

### Rational Choice / Economic Voting (Downs, 1957)
- Voters choose candidate closest to their ideal policy position
- Spatial model — parties converge toward median voter
- Paradox of voting: why vote if cost > benefit?

### Retrospective Voting (Fiorina, 1981)
- Voters reward/punish incumbents based on past performance
- Economic voting: "It's the economy, stupid"
- Simpler information requirements than prospective voting

## Political Participation

### Resource Model (Verba, Schlozman & Brady, 1995)
- Time, money, civic skills — unequally distributed
- Explains participation gaps across class, race, gender

### Social Networks & Mobilization
- Mobilization by parties/organizations increases turnout
- Strength of weak ties (Granovetter) — information diffuses through diverse networks

## Attitude Formation
- **Framing effects**: presentation affects judgment
- **Priming**: media salience affects issue weighting
- **Confirmation bias**: people seek confirming information

## For Research Paper
- Focus: online information environments and political attitude formation
- Key gap: role of WhatsApp in low-information voter contexts`,
    summary: 'Cheat sheet of key political behavior theories: Michigan Model, Downs rational choice, Fiorina retrospective voting, Verba resource model, and framing/priming effects — with a note on research paper focus.',
    workspace_id: 'ws-1',
    course_id: 'c-2',
    project_id: 'p-2',
    tags: ['political behavior', 'voting', 'rational choice', 'michigan model', 'retrospective voting'],
    linked_drive_file_ids: [],
    key_concepts: ['Michigan Model', 'Rational choice', 'Retrospective voting', 'Resource model', 'Framing effects', 'Priming'],
    created_at: '2026-04-15',
    updated_at: '2026-05-01',
  },
  {
    id: 'n-8',
    user_id: '1',
    title: 'French Vocabulary — Food & Restaurant (Unit 6)',
    content: `# French Vocabulary: Food & Restaurant — Unit 6

## Au Restaurant (At the Restaurant)

### Roles
- le serveur / la serveuse — waiter / waitress
- le chef — chef
- le client / la cliente — customer
- le maître d'hôtel — maitre d'

### Meals
- le petit-déjeuner — breakfast
- le déjeuner — lunch
- le dîner — dinner
- le goûter — afternoon snack
- le brunch — brunch

### On the Table
- la carte / le menu — menu
- l'addition (f.) — the bill
- le pourboire — tip
- la réservation — reservation
- la table — table
- la chaise — chair

### Food Categories
- les entrées (f.pl.) — starters/appetizers
- le plat principal — main course
- le dessert — dessert
- la boisson — drink

### Common Foods
| French | English |
|--------|---------|
| le pain | bread |
| le beurre | butter |
| le fromage | cheese |
| la viande | meat |
| le poulet | chicken |
| le bœuf | beef |
| le poisson | fish |
| les légumes | vegetables |
| la soupe | soup |
| la salade | salad |

### Useful Phrases
- Je voudrais... — I would like...
- L'addition, s'il vous plaît. — The bill, please.
- C'est délicieux! — It's delicious!
- Avez-vous une table pour deux? — Do you have a table for two?
- Je suis allergique à... — I am allergic to...

## Quiz Prep Checklist
- [ ] Review all vocab with Anki (50 cards)
- [ ] Complete workbook pp. 78–82
- [ ] Practice dialogue with recording`,
    summary: 'French Unit 6 vocabulary for food and restaurants: roles, meals, table items, food categories, common foods, and useful phrases. Includes quiz prep checklist.',
    workspace_id: 'ws-2',
    course_id: 'c-3',
    tags: ['french', 'vocabulary', 'food', 'restaurant', 'unit 6', 'quiz prep'],
    linked_drive_file_ids: [],
    key_concepts: ['Restaurant vocabulary', 'Meal names', 'Food vocabulary', 'Useful phrases', 'Dialogue practice'],
    created_at: '2026-05-08',
    updated_at: '2026-05-08',
  },
]

// ── Drive Files ───────────────────────────────────────────────
export const mockDriveFiles: DriveFile[] = [
  {
    id: 'df-1',
    user_id: '1',
    google_file_id: 'gdoc-pol101-syllabus',
    name: 'POL101_Syllabus_Spring2026.pdf',
    mime_type: 'application/pdf',
    folder_path: 'University/POL101 Political Theory',
    web_url: 'https://drive.google.com/file/d/gdoc-pol101-syllabus',
    last_modified: '2026-01-10',
    detected_type: 'syllabus',
    detected_workspace_id: 'ws-1',
    detected_course_id: 'c-1',
    summary: 'Course syllabus for POL101 Introduction to Political Theory. Covers Hobbes, Locke, Rousseau, Mill, Marx. Assignments: 3 essays, 1 final exam. Office hours: Tuesdays 2–4 PM.',
    indexed_status: 'indexed',
    confidence: 0.97,
    created_at: '2026-01-15',
  },
  {
    id: 'df-2',
    user_id: '1',
    google_file_id: 'gdoc-pol201-syllabus',
    name: 'POL201_Comparative_Politics_Syllabus.pdf',
    mime_type: 'application/pdf',
    folder_path: 'University/POL201 Comparative Politics',
    web_url: 'https://drive.google.com/file/d/gdoc-pol201-syllabus',
    last_modified: '2026-01-12',
    detected_type: 'syllabus',
    detected_workspace_id: 'ws-1',
    detected_course_id: 'c-2',
    summary: 'Syllabus for POL201 Comparative Politics. Topics: electoral systems, party systems, regime types, democratization. Assignments: participation, research paper, midterm, final.',
    indexed_status: 'indexed',
    confidence: 0.95,
    created_at: '2026-01-15',
  },
  {
    id: 'df-3',
    user_id: '1',
    google_file_id: 'gdoc-fre101-syllabus',
    name: 'FRE101_French_I_Syllabus.pdf',
    mime_type: 'application/pdf',
    folder_path: 'University/FRE101 French I',
    web_url: 'https://drive.google.com/file/d/gdoc-fre101-syllabus',
    last_modified: '2026-01-11',
    detected_type: 'syllabus',
    detected_workspace_id: 'ws-2',
    detected_course_id: 'c-3',
    summary: 'Syllabus for FRE101 French I. Covers present tense, passé composé, futur proche, basic vocabulary. Weekly quizzes, oral exam, written final.',
    indexed_status: 'indexed',
    confidence: 0.96,
    created_at: '2026-01-15',
  },
  {
    id: 'df-4',
    user_id: '1',
    google_file_id: 'gdoc-chi101-syllabus',
    name: 'CHI101_Chinese_I_Syllabus.pdf',
    mime_type: 'application/pdf',
    folder_path: 'University/CHI101 Chinese I',
    web_url: 'https://drive.google.com/file/d/gdoc-chi101-syllabus',
    last_modified: '2026-01-13',
    detected_type: 'syllabus',
    detected_workspace_id: 'ws-3',
    detected_course_id: 'c-4',
    summary: 'Syllabus for CHI101 Chinese I. Tones, pinyin, 150 characters, basic grammar. Character quizzes weekly, oral assessment, written final.',
    indexed_status: 'indexed',
    confidence: 0.94,
    created_at: '2026-01-15',
  },
  {
    id: 'df-5',
    user_id: '1',
    google_file_id: 'gdoc-ds101-syllabus',
    name: 'DS101_DataScience_Syllabus_Spring2026.pdf',
    mime_type: 'application/pdf',
    folder_path: 'University/DS101 Data Science',
    web_url: 'https://drive.google.com/file/d/gdoc-ds101-syllabus',
    last_modified: '2026-01-14',
    detected_type: 'syllabus',
    detected_workspace_id: 'ws-1',
    detected_course_id: 'c-5',
    summary: 'Syllabus for DS101 Data Science Foundations. Python, pandas, visualization, intro ML. 5 problem sets, midterm project, final project.',
    indexed_status: 'indexed',
    confidence: 0.96,
    created_at: '2026-01-15',
  },
  {
    id: 'df-6',
    user_id: '1',
    google_file_id: 'gdoc-hobbes-reading',
    name: 'Hobbes_Leviathan_Chapters13-14.pdf',
    mime_type: 'application/pdf',
    folder_path: 'University/POL101 Political Theory/Readings',
    web_url: 'https://drive.google.com/file/d/gdoc-hobbes-reading',
    last_modified: '2026-03-01',
    detected_type: 'reading',
    detected_workspace_id: 'ws-1',
    detected_course_id: 'c-1',
    summary: 'Chapters 13–14 of Hobbes\'s Leviathan. Chapter 13: Of the Natural Condition of Mankind. Chapter 14: Of the First and Second Natural Laws and of Contracts.',
    indexed_status: 'indexed',
    confidence: 0.91,
    created_at: '2026-03-01',
  },
  {
    id: 'df-7',
    user_id: '1',
    google_file_id: 'gdoc-misinformation-lit',
    name: 'Misinformation_LitReview_Notes.docx',
    mime_type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    folder_path: 'Research/Political Behavior Paper',
    web_url: 'https://drive.google.com/file/d/gdoc-misinformation-lit',
    last_modified: '2026-05-07',
    detected_type: 'notes',
    detected_workspace_id: 'ws-7',
    detected_course_id: 'c-2',
    summary: 'Personal literature review notes on political misinformation — covers Vosoughi 2018, Pennycook 2021, Roozenbeek 2020. Research gap identified in Portuguese-language social media contexts.',
    indexed_status: 'indexed',
    confidence: 0.88,
    created_at: '2026-04-20',
  },
  {
    id: 'df-8',
    user_id: '1',
    google_file_id: 'gdoc-ds101-ps3',
    name: 'DS101_ProblemSet3_Instructions.pdf',
    mime_type: 'application/pdf',
    folder_path: 'University/DS101 Data Science/Assignments',
    web_url: 'https://drive.google.com/file/d/gdoc-ds101-ps3',
    last_modified: '2026-05-06',
    detected_type: 'assignment',
    detected_workspace_id: 'ws-1',
    detected_course_id: 'c-5',
    summary: 'Problem Set 3 instructions for DS101. Task: load CSV dataset, handle missing values, normalize columns, produce summary statistics and one visualization. Due May 14.',
    indexed_status: 'indexed',
    confidence: 0.93,
    created_at: '2026-05-06',
  },
]

// ── AI Inbox Items ────────────────────────────────────────────
export const mockAIInboxItems: AIInboxItem[] = [
  {
    id: 'ai-1',
    user_id: '1',
    type: 'task',
    title: 'Write abstract for research paper',
    extracted_data: {
      title: 'Draft 250-word abstract for political behavior research paper',
      priority: 'urgent',
      due_date: '2026-05-12',
      suggested_course: 'POL201',
    },
    source_type: 'capture',
    source_text: 'Need to submit a 250-word abstract to Dr. Reyes by Tuesday for the political behavior paper. She said it needs to be approved before I can start writing.',
    suggested_workspace_id: 'ws-7',
    suggested_course_id: 'c-2',
    confidence: 0.91,
    status: 'pending',
    created_at: '2026-05-08T14:22:00',
  },
  {
    id: 'ai-2',
    user_id: '1',
    type: 'deadline',
    title: 'POL101 Essay due May 13',
    extracted_data: {
      title: 'Hobbes essay submission deadline',
      due_date: '2026-05-13',
      course: 'POL101',
      description: 'Essay on Hobbes and the social contract, 1500 words',
    },
    source_type: 'drive',
    source_file_id: 'df-1',
    suggested_workspace_id: 'ws-1',
    suggested_course_id: 'c-1',
    confidence: 0.95,
    status: 'pending',
    created_at: '2026-05-08T09:10:00',
  },
  {
    id: 'ai-3',
    user_id: '1',
    type: 'event',
    title: 'Study session — DS101 Problem Set',
    extracted_data: {
      title: 'DS101 Problem Set 3 work session',
      suggested_start: '2026-05-13T13:00:00',
      suggested_end: '2026-05-13T15:00:00',
      type: 'study',
    },
    source_type: 'capture',
    source_text: 'I want to set aside time Tuesday afternoon to work on the pandas problem set before it\'s due Thursday.',
    suggested_workspace_id: 'ws-1',
    suggested_course_id: 'c-5',
    confidence: 0.78,
    status: 'pending',
    created_at: '2026-05-09T08:45:00',
  },
  {
    id: 'ai-4',
    user_id: '1',
    type: 'note',
    title: 'Captured idea: Mandato Aberto citizen form redesign',
    extracted_data: {
      title: 'Citizen form UX ideas',
      content: 'Use progressive disclosure — show fields step by step instead of all at once. Add progress bar. Mobile-first. Consider adding voice input for accessibility.',
      suggested_tags: ['UX', 'form design', 'accessibility', 'mobile'],
    },
    source_type: 'capture',
    source_text: 'Idea for Mandato Aberto: the citizen form is overwhelming. What if we used progressive disclosure — showing only one step at a time with a progress bar? Also should be mobile-first. Maybe even voice input for accessibility.',
    suggested_workspace_id: 'ws-6',
    confidence: 0.87,
    status: 'pending',
    created_at: '2026-05-09T11:30:00',
  },
  {
    id: 'ai-5',
    user_id: '1',
    type: 'course_info',
    title: 'Office hours slot detected in syllabus — CHI101',
    extracted_data: {
      course: 'CHI101',
      professor: 'Dr. Wei Zhang',
      office_hours: 'Mondays 1:00–3:00 PM',
      location: 'Office 108',
      note: 'Character quiz coming up — consider scheduling appointment',
    },
    source_type: 'drive',
    source_file_id: 'df-4',
    suggested_workspace_id: 'ws-3',
    suggested_course_id: 'c-4',
    confidence: 0.89,
    status: 'pending',
    created_at: '2026-05-07T16:00:00',
  },
]

// ── Projects ─────────────────────────────────────────────────
export const mockProjects: Project[] = [
  {
    id: 'p-1',
    user_id: '1',
    workspace_id: 'ws-6',
    title: 'Mandato Aberto — Website Redesign',
    description: 'Redesign the Mandato Aberto civic platform: new landing page, citizen engagement form, and improved accessibility. Deliver Figma prototypes and handoff to developer.',
    status: 'active',
    priority: 'high',
    deadline: '2026-06-01',
    progress: 35,
    milestones: [
      { id: 'ms-1a', project_id: 'p-1', title: 'Discovery & research complete', due_date: '2026-04-30', completed: true },
      { id: 'ms-1b', project_id: 'p-1', title: 'Wireframes approved by team', due_date: '2026-05-16', completed: false },
      { id: 'ms-1c', project_id: 'p-1', title: 'High-fidelity mockups complete', due_date: '2026-05-25', completed: false },
      { id: 'ms-1d', project_id: 'p-1', title: 'Developer handoff and documentation', due_date: '2026-06-01', completed: false },
    ],
    created_at: '2026-04-01',
  },
  {
    id: 'p-2',
    user_id: '1',
    workspace_id: 'ws-7',
    title: 'Political Behavior Research Paper',
    description: 'Original research paper on algorithmic amplification of political misinformation in Portuguese-language WhatsApp groups. For POL201 Comparative Politics.',
    status: 'active',
    priority: 'urgent',
    deadline: '2026-06-15',
    progress: 20,
    milestones: [
      { id: 'ms-2a', project_id: 'p-2', title: 'Literature review complete', due_date: '2026-05-10', completed: true },
      { id: 'ms-2b', project_id: 'p-2', title: 'Abstract approved by Dr. Reyes', due_date: '2026-05-12', completed: false },
      { id: 'ms-2c', project_id: 'p-2', title: 'First draft (5000 words)', due_date: '2026-06-01', completed: false },
      { id: 'ms-2d', project_id: 'p-2', title: 'Final submission', due_date: '2026-06-15', completed: false },
    ],
    created_at: '2026-04-10',
  },
  {
    id: 'p-3',
    user_id: '1',
    workspace_id: 'ws-8',
    title: 'Scholarship Applications — 2026–2027 Cycle',
    description: 'Applications for Rhodes Scholarship, Fulbright, and Rotary Peace Fellowship for the 2026–2027 academic year. Coordinate recommendation letters, essays, and transcripts.',
    status: 'active',
    priority: 'urgent',
    deadline: '2026-09-01',
    progress: 15,
    milestones: [
      { id: 'ms-3a', project_id: 'p-3', title: 'Identify all target scholarships', due_date: '2026-05-01', completed: true },
      { id: 'ms-3b', project_id: 'p-3', title: 'Request recommendation letters', due_date: '2026-05-20', completed: false },
      { id: 'ms-3c', project_id: 'p-3', title: 'Personal statement first drafts', due_date: '2026-06-15', completed: false },
      { id: 'ms-3d', project_id: 'p-3', title: 'All applications submitted', due_date: '2026-09-01', completed: false },
    ],
    created_at: '2026-04-25',
  },
]

// ── Opportunities ─────────────────────────────────────────────
export const mockOpportunities: Opportunity[] = [
  {
    id: 'opp-1',
    user_id: '1',
    name: 'Rhodes Scholarship',
    type: 'scholarship',
    institution: 'Rhodes Trust / University of Oxford',
    location: 'Oxford, United Kingdom',
    deadline: '2026-10-01',
    eligibility: 'US citizens ages 18–24, unmarried, strong academic record and leadership',
    required_materials: ['Personal statement', 'Academic transcripts', '5 recommendation letters', 'Short-answer questions', 'Interview (if selected)'],
    status: 'applying',
    priority: 'urgent',
    fit_score: 82,
    application_link: 'https://www.rhodeshouse.ox.ac.uk/scholarships/apply',
    notes: 'Focus personal statement on civic engagement work with Mandato Aberto and research on political misinformation. Ask Prof. Reyes and Prof. Harrington for recommendations.',
    related_documents: ['df-1', 'df-2'],
    created_at: '2026-04-25',
  },
  {
    id: 'opp-2',
    user_id: '1',
    name: 'Fulbright U.S. Student Program',
    type: 'fellowship',
    institution: 'U.S. Department of State',
    location: 'France (preferred) or Brazil',
    deadline: '2026-10-13',
    eligibility: 'US citizens with BA by start of grant; English-language project proposal',
    required_materials: ['Project statement', 'Personal statement', 'Language evaluation', '3 recommendation letters', 'Academic transcripts'],
    status: 'researching',
    priority: 'high',
    fit_score: 78,
    application_link: 'https://us.fulbrightonline.org',
    notes: 'French language skills and misinformation research could be strong angles. Consider proposing a project at Sciences Po Paris or a Brazilian university.',
    related_documents: [],
    created_at: '2026-04-25',
  },
  {
    id: 'opp-3',
    user_id: '1',
    name: 'Rotary Peace Fellowship',
    type: 'fellowship',
    institution: 'Rotary Foundation',
    location: 'Various (6 global universities)',
    deadline: '2026-05-31',
    eligibility: 'Bachelor\'s degree, 3 years relevant work/volunteer experience, language skills',
    required_materials: ['Application form', 'Essays', '3 Rotary sponsor letters', 'Academic transcripts', 'Professional references'],
    status: 'saved',
    priority: 'medium',
    fit_score: 65,
    application_link: 'https://www.rotary.org/en/our-programs/peace-fellowships',
    notes: 'Need to connect with a local Rotary club first for sponsorship letters. Check eligibility re: work experience requirement.',
    related_documents: [],
    created_at: '2026-05-01',
  },
  {
    id: 'opp-4',
    user_id: '1',
    name: 'Google Summer of Code',
    type: 'program',
    institution: 'Google / Open Source Community',
    location: 'Remote',
    deadline: '2026-04-08',
    eligibility: 'Students enrolled in accredited institution; open source coding project',
    required_materials: ['Project proposal', 'Code samples / GitHub profile', 'Student eligibility confirmation'],
    status: 'archived',
    priority: 'low',
    fit_score: 52,
    application_link: 'https://summerofcode.withgoogle.com',
    notes: 'Missed this cycle — deadline was April 8. Consider for 2027 cycle if Python skills improve significantly after DS101.',
    related_documents: [],
    created_at: '2026-03-15',
  },
]

// ── Language Items ────────────────────────────────────────────
export const mockLanguageItems: LanguageItem[] = [
  // French vocabulary
  {
    id: 'li-1',
    user_id: '1',
    language: 'french',
    type: 'vocabulary',
    title: 'le déjeuner',
    content: 'lunch | Example: On mange le déjeuner à midi. (We eat lunch at noon.)',
    status: 'learning',
    next_review_date: '2026-05-11',
    created_at: '2026-05-08',
  },
  {
    id: 'li-2',
    user_id: '1',
    language: 'french',
    type: 'vocabulary',
    title: 'le pourboire',
    content: 'tip (at a restaurant) | Example: Laissez un pourboire de 15%. (Leave a 15% tip.)',
    status: 'new',
    next_review_date: '2026-05-10',
    created_at: '2026-05-08',
  },
  {
    id: 'li-3',
    user_id: '1',
    language: 'french',
    type: 'grammar',
    title: 'Passé composé — irregular participles',
    content: 'avoir → eu | être → été | faire → fait | prendre → pris | voir → vu | vouloir → voulu | pouvoir → pu | savoir → su | lire → lu | écrire → écrit',
    status: 'learning',
    next_review_date: '2026-05-12',
    created_at: '2026-05-06',
  },
  {
    id: 'li-4',
    user_id: '1',
    language: 'french',
    type: 'phrase',
    title: "L'addition, s'il vous plaît",
    content: 'The bill, please. | Formal register. Use in a restaurant when ready to pay.',
    status: 'mastered',
    next_review_date: '2026-05-25',
    created_at: '2026-04-20',
  },
  {
    id: 'li-5',
    user_id: '1',
    language: 'french',
    type: 'vocabulary',
    title: 'le serveur / la serveuse',
    content: 'waiter / waitress | Example: Le serveur apporte les plats. (The waiter brings the dishes.)',
    status: 'learning',
    next_review_date: '2026-05-13',
    created_at: '2026-05-08',
  },
  // Chinese items
  {
    id: 'li-6',
    user_id: '1',
    language: 'chinese',
    type: 'character',
    title: '你好 (nǐ hǎo)',
    content: 'Hello | Tone: 3rd + 3rd (tone sandhi: ní hǎo) | Usage: Standard greeting for all contexts',
    status: 'mastered',
    next_review_date: '2026-06-01',
    created_at: '2026-02-01',
  },
  {
    id: 'li-7',
    user_id: '1',
    language: 'chinese',
    type: 'character',
    title: '买 / 卖 (mǎi / mài)',
    content: '买 (mǎi, 3rd tone) = to buy | 卖 (mài, 4th tone) = to sell | Common confusion pair — remember: 买 has more strokes (you spend more when you buy)',
    status: 'learning',
    next_review_date: '2026-05-11',
    created_at: '2026-05-03',
  },
  {
    id: 'li-8',
    user_id: '1',
    language: 'chinese',
    type: 'grammar',
    title: 'Measure words (量词 liàngcí)',
    content: '一本书 (yī běn shū) — one book | 一杯茶 (yī bēi chá) — one cup of tea | 一只猫 (yī zhī māo) — one cat | 一个人 (yī gè rén) — one person | 个 (gè) is the general measure word when unsure',
    status: 'learning',
    next_review_date: '2026-05-14',
    created_at: '2026-05-07',
  },
  {
    id: 'li-9',
    user_id: '1',
    language: 'chinese',
    type: 'vocabulary',
    title: '书 (shū) vs 熟 (shú)',
    content: '书 (shū, 1st tone) = book | 熟 (shú, 2nd tone) = cooked; familiar | Minimal pair — differentiate by tone and context',
    status: 'new',
    next_review_date: '2026-05-10',
    created_at: '2026-05-07',
  },
  {
    id: 'li-10',
    user_id: '1',
    language: 'chinese',
    type: 'phrase',
    title: '我想要... (Wǒ xiǎng yào...)',
    content: 'I would like... | Example: 我想要一杯咖啡。(Wǒ xiǎng yào yī bēi kāfēi.) — I would like a cup of coffee. | Polite way to order or request something',
    status: 'learning',
    next_review_date: '2026-05-15',
    created_at: '2026-05-05',
  },
]

// ── Lectures ──────────────────────────────────────────────────
export const mockLectures: Lecture[] = [
  // POL101 — Political Theory
  {
    id: 'lec-1',
    course_id: 'c-1',
    number: 1,
    date: '2026-04-20',
    topic: 'Introduction: What is Political Theory?',
    notes_status: 'complete',
    related_slides: 'gdrive-pol101-slides-1',
    related_readings: ['Plato, Republic Book I'],
    has_ai_summary: true,
    review_status: 'reviewed',
  },
  {
    id: 'lec-2',
    course_id: 'c-1',
    number: 2,
    date: '2026-04-27',
    topic: 'Hobbes: The State of Nature and Social Contract',
    notes_status: 'complete',
    related_slides: 'gdrive-pol101-slides-2',
    related_readings: ['Leviathan, Chapters 13–14'],
    has_ai_summary: true,
    review_status: 'reviewed',
  },
  {
    id: 'lec-3',
    course_id: 'c-1',
    number: 3,
    date: '2026-05-04',
    topic: 'Locke: Natural Rights and Consent of the Governed',
    notes_status: 'complete',
    related_slides: 'gdrive-pol101-slides-3',
    related_readings: ['Second Treatise of Government, Ch. 2, 8–9'],
    has_ai_summary: false,
    review_status: 'needs_review',
  },
  {
    id: 'lec-4',
    course_id: 'c-1',
    number: 4,
    date: '2026-05-11',
    topic: 'Rousseau: The General Will and Popular Sovereignty',
    notes_status: 'incomplete',
    related_slides: 'gdrive-pol101-slides-4',
    related_readings: ['The Social Contract, Book I–II'],
    has_ai_summary: false,
    review_status: 'not_started',
  },
  // POL201 — Comparative Politics
  {
    id: 'lec-5',
    course_id: 'c-2',
    number: 1,
    date: '2026-04-22',
    topic: 'Comparative Methods and Regime Types',
    notes_status: 'complete',
    related_slides: 'gdrive-pol201-slides-1',
    related_readings: ['Lijphart, Patterns of Democracy, Ch. 1'],
    has_ai_summary: true,
    review_status: 'reviewed',
  },
  {
    id: 'lec-6',
    course_id: 'c-2',
    number: 2,
    date: '2026-04-29',
    topic: 'Electoral Systems and Party Systems',
    notes_status: 'complete',
    related_slides: 'gdrive-pol201-slides-2',
    related_readings: ['Dahl, Polyarchy, Ch. 1–3'],
    has_ai_summary: true,
    review_status: 'reviewed',
  },
  {
    id: 'lec-7',
    course_id: 'c-2',
    number: 3,
    date: '2026-05-06',
    topic: 'Democratization: Waves and Reversals',
    notes_status: 'needs_review',
    related_slides: 'gdrive-pol201-slides-3',
    related_readings: ['Huntington, Third Wave, Ch. 1', 'Levitsky & Ziblatt, How Democracies Die, Ch. 1'],
    has_ai_summary: false,
    review_status: 'needs_review',
  },
]

// ── Readings ──────────────────────────────────────────────────
export const mockReadings: Reading[] = [
  {
    id: 'read-1',
    course_id: 'c-1',
    title: "Hobbes, Leviathan — Chapters 13–14",
    due_date: '2026-04-27',
    completed: true,
    pages: 'pp. 183–206',
    notes_linked: ['n-1'],
    has_ai_summary: true,
  },
  {
    id: 'read-2',
    course_id: 'c-1',
    title: 'Locke, Second Treatise of Government — Ch. 2, 8–9',
    due_date: '2026-05-04',
    completed: true,
    pages: 'pp. 6–30, 95–124',
    notes_linked: [],
    has_ai_summary: false,
  },
  {
    id: 'read-3',
    course_id: 'c-1',
    title: "Tocqueville, Democracy in America — Excerpt",
    due_date: '2026-05-07',
    completed: false,
    pages: 'pp. 1–40',
    notes_linked: [],
    has_ai_summary: false,
  },
  {
    id: 'read-4',
    course_id: 'c-2',
    title: 'Dahl, Polyarchy — Chapters 1–3',
    due_date: '2026-05-12',
    completed: false,
    pages: 'pp. 1–60',
    notes_linked: [],
    has_ai_summary: false,
  },
  {
    id: 'read-5',
    course_id: 'c-2',
    title: 'Huntington, The Third Wave — Chapter 1',
    due_date: '2026-05-06',
    completed: true,
    pages: 'pp. 3–30',
    notes_linked: [],
    has_ai_summary: false,
  },
  {
    id: 'read-6',
    course_id: 'c-2',
    title: 'Levitsky & Ziblatt, How Democracies Die — Chapter 1',
    due_date: '2026-05-06',
    completed: true,
    pages: 'pp. 1–22',
    notes_linked: [],
    has_ai_summary: false,
  },
]
