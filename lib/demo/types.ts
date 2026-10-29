export type DemoRole = "recruiter" | "candidate";
export type DemoStatus = "assigned" | "in_progress" | "submitted" | "evaluated";
export interface DemoUser {
  id: string;
  name: string;
  email: string;
  role: DemoRole;
  company?: string;
}
export interface DemoJob {
  id: string;
  _id: string;
  title: string;
  company: string;
  department: string;
  experienceLevel: string;
  applicantsTarget: number;
  location: string;
  salaryRange: string;
  description: string;
  status: "active" | "draft" | "closed" | "archived";
  createdAt: string;
  createdBy: string;
}
export interface DemoCandidate {
  id: string;
  _id: string;
  name: string;
  email: string;
  phone: string;
  currentRole: string;
  location: string;
  skills: string[];
  experience: string;
  education: string;
  summary: string;
  jobId: string;
  source: "portal" | "manual";
  createdAt: string;
  resumeName?: string;
}
export interface DemoProfile {
  userId: string;
  firstName: string;
  lastName: string;
  email: string;
  headline: string;
  bio: string;
  location: string;
  mobileNumber: string;
  skills: Record<string, unknown>[];
  workExperience: Record<string, unknown>[];
  education: Record<string, unknown>[];
  certifications: Record<string, unknown>[];
  projects: Record<string, unknown>[];
  availabilityStatus: string;
  employmentType: string;
  availableStartDate: string;
  linkedin: string;
  github: string;
  personalPortfolio: string;
  resumeName?: string;
  resumeUrl?: string;
}
export interface DemoApplication {
  id: string;
  _id: string;
  candidateId: string;
  jobId: string;
  status: string;
  createdAt: string;
  appliedAt: string;
}
export interface DemoQuestion {
  id: number;
  type:
    | "multiple_choice"
    | "open_ended"
    | "coding_problem"
    | "real_world_problem";
  category: string;
  question: string;
  text: string;
  options?: string[];
  correctAnswer?: string;
  marks: number;
}
export interface DemoAssessment {
  id: string;
  _id: string;
  jobId: string;
  title: string;
  instructions: string;
  durationMinutes: number;
  timeLimitPerQuestion: number;
  status: "draft" | "active" | "archived";
  questions: DemoQuestion[];
  totalQuestions: number;
  totalMarks: number;
  passingScore: number;
  createdAt: string;
  createdBy: string;
  launchedAt?: string;
  jobType: string;
  jobCategory: string;
}
export interface DemoAnswer {
  questionId: number;
  answer: string;
  timestamp: string;
}
export interface DemoEvaluation {
  questionId: number;
  score: number;
  maxMarks: number;
  feedback: string;
  isCorrect: boolean;
}
export interface DemoAssignment {
  id: string;
  _id: string;
  assessmentId: string;
  candidateId: string;
  candidateName: string;
  candidateEmail: string;
  candidateType: "portal_user" | "manual_candidate";
  status: DemoStatus;
  assignedAt: string;
  createdAt: string;
  startedAt?: string;
  submittedAt?: string;
  answers: DemoAnswer[];
  evaluatedAnswers: DemoEvaluation[];
  score: number;
  percentage: number;
  passed: boolean;
  correctAnswersCount: number;
  timeTakenMinutes: number;
  sessionIntegrity: number;
  sessionStatus: string;
  integrityViolations: unknown[];
  overallFeedback: string;
  strengths: string[];
  weaknesses: string[];
  grade: string;
}
export interface DemoMatch {
  candidateId: string;
  name: string;
  email: string;
  matchScore: number;
  strengths: string[];
  missingSkills: string[];
  risks: string[];
  summary: string;
}
export interface DemoScreening {
  id: string;
  _id: string;
  jobId: string;
  jobTitle: string;
  totalCandidates: number;
  shortlist: DemoMatch[];
  screenedAt: string;
  createdAt: string;
}
export interface DemoNotification {
  id: string;
  userId: string;
  title: string;
  message: string;
  type:
    | "application"
    | "screening"
    | "assessment"
    | "status"
    | "view"
    | "event";
  read: boolean;
  createdAt: string;
  referenceId?: string;
}
export interface DemoDatabase {
  intelligence?: import("../intelligence/types").IntelligenceState;
  schemaVersion: 1;
  revision: number;
  sessionUserId: string | null;
  users: DemoUser[];
  jobs: DemoJob[];
  candidates: DemoCandidate[];
  profiles: DemoProfile[];
  applications: DemoApplication[];
  assessments: DemoAssessment[];
  assignments: DemoAssignment[];
  screenings: DemoScreening[];
  notifications: DemoNotification[];
}
