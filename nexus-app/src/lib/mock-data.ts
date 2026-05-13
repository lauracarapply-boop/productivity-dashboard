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

export const mockUser: User = {
  id: '1',
  name: 'Your Name',
  email: 'your@email.com',
  avatar: undefined,
  created_at: new Date().toISOString().split('T')[0],
}

export const mockWorkspaces: Workspace[]     = []
export const mockCourses: Course[]           = []
export const mockTasks: Task[]               = []
export const mockCalendarEvents: CalendarEvent[] = []
export const mockNotes: Note[]               = []
export const mockDriveFiles: DriveFile[]     = []
export const mockAIInboxItems: AIInboxItem[] = []
export const mockProjects: Project[]         = []
export const mockOpportunities: Opportunity[]= []
export const mockLanguageItems: LanguageItem[]= []
export const mockLectures: Lecture[]         = []
export const mockReadings: Reading[]         = []
