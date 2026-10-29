import type {
  DemoApplication,
  DemoCandidate,
  DemoJob,
  DemoRole,
} from "../demo/types";
export type Locale = "en" | "fr" | "rw";
export type EvidenceStatus = "supported" | "unverified" | "missing";
export interface Evidence {
  id: string;
  candidateId: string;
  jobId: string;
  competency: string;
  requirement: string;
  claim: string;
  source: string;
  reference: string;
  excerpt: string;
  status: EvidenceStatus;
  correction?: { text: string; status: "pending" | "accepted" | "declined" };
}
export interface Turn {
  id: string;
  kind: "prompt" | "response";
  text: string;
  competency: number;
  followUp: boolean;
}
export interface RubricScore {
  criterion: string;
  score: number;
  reason: string;
}
export interface Screening {
  draftAnswer?: string;
  id: string;
  candidateId: string;
  jobId: string;
  turns: Turn[];
  competency: number;
  status: "in_progress" | "awaiting_review" | "reviewed";
  scores: RubricScore[];
}
export interface SimulationTemplate {
  id: string;
  title: string;
  role: string;
  brief: string;
  asset: string;
  assetLabel: string;
  rubric: { id: string; label: string; anchor: string }[];
  checks: string[];
  toolPolicy: string;
  estimatedMinutes: number;
}
export interface SimulationResponse {
  id: string;
  candidateId: string;
  templateId: string;
  answer: string;
  status: "draft" | "submitted" | "reviewed";
  updatedAt: string;
  scores: RubricScore[];
  checks: string[];
  feedback: string;
}
export type WorkflowKind =
  | "organize"
  | "document"
  | "update"
  | "schedule"
  | "brief"
  | "exception"
  | "outreach";
export interface WorkflowTask {
  id: string;
  candidateId: string;
  jobId: string;
  kind: WorkflowKind;
  title: string;
  body: string;
  requiresApproval: boolean;
  status:
    | "suggested"
    | "approved"
    | "rejected"
    | "preview_completed"
    | "ready_for_integration";
  reason: string;
  createdAt: string;
}
export interface JourneyEvent {
  stage: string;
  at: string;
  note: string;
}
export interface Journey {
  id: string;
  candidateId: string;
  jobId: string;
  nextStep: string;
  expectedDate: string;
  history: JourneyEvent[];
}
export interface AuditRecord {
  id: string;
  candidateId?: string;
  actor: string;
  action: string;
  entityId: string;
  reason: string;
  before: string;
  after: string;
  at: string;
}
export interface CostEntry {
  id: string;
  jobId: string;
  category: string;
  amount: number;
  currency: "USD";
  note: string;
}
export interface TimeEntry {
  id: string;
  jobId: string;
  phase: "baseline" | "assisted";
  minutes: number;
  candidateCount: number;
  note: string;
}
export interface DiscoveryConsent {
  candidateId: string;
  discoverable: boolean;
  contactAllowed: boolean;
  expiresAt: string;
  deletionRequested: boolean;
}
export interface Credential {
  consentRequested?: boolean;
  id: string;
  candidateId: string;
  kind: "qualification" | "certificate" | "reference";
  claim: string;
  issuer: string;
  status:
    | "not_checked"
    | "consent_requested"
    | "ready_for_verification"
    | "conflict";
  consent: boolean;
  note: string;
}
export interface Preferences {
  locale: Locale;
  largeText: boolean;
  lowBandwidth: boolean;
  format: "text" | "accessible-text" | "voice-request";
  adjustment: string;
}
export interface IntelligenceState {
  version: 1;
  evidence: Evidence[];
  screenings: Screening[];
  simulations: SimulationResponse[];
  tasks: WorkflowTask[];
  journeys: Journey[];
  audit: AuditRecord[];
  costs: CostEntry[];
  times: TimeEntry[];
  consents: DiscoveryConsent[];
  credentials: Credential[];
  preferences: Record<string, Preferences>;
  maskIdentities: boolean;
  aggregatePermission: boolean;
}
export interface RediscoveryResult {
  candidateId: string;
  name: string;
  skills: string[];
  reasons: string[];
  expiresAt: string;
}
export interface IntelligenceSnapshot extends IntelligenceState {
  asOf: string;
  role: DemoRole;
  userId: string;
  candidates: DemoCandidate[];
  jobs: DemoJob[];
  applications: DemoApplication[];
  templates: SimulationTemplate[];
  rediscovery: RediscoveryResult[];
}
