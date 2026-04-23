// Tipi dominio MPCoach — condivisi tra web e mobile.
// Mirror dello schema Supabase (vedi supabase/migrations). Tenere allineato.

export type UserRole = "student" | "coach" | "founder";
export type CoachTone = "ink" | "ember" | "sand";
export type AnnotationType = "ok" | "tip" | "warn";
export type InvitationStatus = "pending" | "accepted" | "expired" | "revoked";

export interface Profile {
  id: string;
  email: string;
  fullName: string;
  initials: string;
  role: UserRole;
  avatarUrl: string | null;
  createdAt: string;
}

export interface Coach {
  id: string; // = profile.id
  role: string;
  tagline: string;
  bio: string;
  tone: CoachTone;
  specialties: string[];
  locked: boolean;
  maxStudents: number;
  avgResponseTime: string;
  feedbackThisWeek: number;
}

export interface Student {
  id: string; // = profile.id
  level: string;
  progress: number;
  lastActive: string;
  flag: string | null;
  coachId: string;
}

export interface Lesson {
  id: string;
  title: string;
  description: string;
  durationMinutes: number;
  level: string;
  thumbnailUrl: string | null;
  videoStoragePath: string | null;
  createdBy: string; // coach id
  publishedAt: string | null;
}

export interface Exercise {
  id: string;
  studentId: string;
  assignedByCoachId: string;
  title: string;
  description: string;
  dueDate: string | null;
  status: "assigned" | "submitted" | "reviewed";
}

export interface Submission {
  id: string;
  exerciseId: string;
  studentId: string;
  videoStoragePath: string;
  studentNote: string | null;
  submittedAt: string;
}

export interface Feedback {
  id: string;
  submissionId: string;
  coachId: string;
  summary: string | null;
  createdAt: string;
}

export interface Annotation {
  id: string;
  feedbackId: string;
  atSeconds: number;
  type: AnnotationType;
  note: string;
}

export interface FeedbackRating {
  feedbackId: string;
  tempo: number;
  tecnica: number;
  groove: number;
  espressione: number;
  orecchio: number;
}

export interface ChatThread {
  id: string;
  studentId: string;
  coachId: string;
  lastMessageAt: string;
  unreadCount: number;
}

export interface ChatMessage {
  id: string;
  threadId: string;
  senderId: string;
  body: string;
  attachmentUrl: string | null;
  createdAt: string;
  readAt: string | null;
}

export interface Invitation {
  id: string;
  email: string;
  invitedByCoachId: string;
  contractUrl: string | null;
  planCode: string;
  planDurationMonths: number;
  planPriceEur: number;
  startDate: string;
  status: InvitationStatus;
  expiresAt: string;
}
