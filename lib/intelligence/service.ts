import type { DemoDatabase, DemoUser } from "../demo/types";
import {
  competencies,
  createIntelligenceSeed,
  defaultPreferences,
  simulationTemplates,
} from "./seed";
import { screeningPrompt } from "./locale";
import type {
  AuditRecord,
  EvidenceStatus,
  IntelligenceSnapshot,
  IntelligenceState,
  Locale,
  Preferences,
  RubricScore,
  WorkflowKind,
} from "./types";
type Input = Record<string, unknown>;
const id = () => crypto.randomUUID();
const now = () => new Date().toISOString();
function str(data: Input, key: string, max = 12000) {
  const value =
    typeof data[key] === "string" ? (data[key] as string).trim() : "";
  if (value.length > max) throw Error(key + " is too long.");
  return value;
}
function need<T>(value: T | undefined, label: string): T {
  if (!value) throw Error(label + " was not found.");
  return value;
}
function required(data: Input, key: string, max = 12000) {
  const value = str(data, key, max);
  if (!value) throw Error(key + " is required.");
  return value;
}
function number(data: Input, key: string, min: number, max: number) {
  const value = Number(data[key]);
  if (
    data[key] == null ||
    !Number.isFinite(value) ||
    value < min ||
    value > max
  )
    throw Error("Enter a valid " + key + ".");
  return value;
}
function recruiter(user: DemoUser) {
  if (user.role !== "recruiter") throw Error("Recruiter access required.");
}
function candidate(user: DemoUser) {
  if (user.role !== "candidate") throw Error("Candidate access required.");
}
function own(user: DemoUser, candidateId: string) {
  if (user.role === "candidate" && user.id !== candidateId)
    throw Error("This record belongs to another candidate.");
}
function audit(
  s: IntelligenceState,
  u: DemoUser,
  action: string,
  entityId: string,
  reason: string,
  candidateId?: string,
  before = "",
  after = "",
) {
  const record: AuditRecord = {
    id: id(),
    actor: u.role === "recruiter" ? "Recruiter" : "Candidate",
    action,
    entityId,
    reason,
    candidateId,
    before,
    after,
    at: now(),
  };
  s.audit.unshift(record);
}
function notification(
  db: DemoDatabase,
  userId: string,
  title: string,
  message: string,
) {
  db.notifications.unshift({
    id: id(),
    userId,
    title,
    message,
    type: "event",
    read: false,
    createdAt: now(),
  });
}
function scoreInput(data: Input, criteria: string[]): RubricScore[] {
  if (!Array.isArray(data.scores) || data.scores.length !== criteria.length)
    throw Error("Score every rubric criterion.");
  return criteria.map((criterion) => {
    const row = need(
      (data.scores as Input[]).find((s) => s.criterion === criterion),
      "Rubric criterion",
    );
    const score = number(row, "score", 0, 4);
    if (!Number.isInteger(score))
      throw Error("Use whole-number rubric scores from 0 to 4.");
    return { criterion, score, reason: required(row, "reason", 2000) };
  });
}
function snapshot(
  db: DemoDatabase,
  s: IntelligenceState,
  user: DemoUser,
): IntelligenceSnapshot {
  const isRecruiter = user.role === "recruiter";
  const filter = <T extends { candidateId: string }>(rows: T[]) =>
    isRecruiter ? rows : rows.filter((r) => r.candidateId === user.id);
  const jobs = db.jobs;
  const candidates = (
    isRecruiter ? db.candidates : db.candidates.filter((c) => c.id === user.id)
  ).map((c) =>
    isRecruiter && s.maskIdentities
      ? {
          ...c,
          name: "Candidate " + c.id.replace("candidate-", "").slice(0, 8),
          email: "Hidden during review",
          phone: "",
          location: "",
          education: "Hidden during review",
        }
      : c,
  );
  const rediscovery = isRecruiter
    ? db.candidates.flatMap((c) => {
        const consent = s.consents.find((v) => v.candidateId === c.id);
        if (
          !consent?.discoverable ||
          consent.deletionRequested ||
          new Date(consent.expiresAt + "T23:59:59Z").getTime() < Date.now()
        )
          return [];
        return [
          {
            candidateId: c.id,
            name: candidates.find((p) => p.id === c.id)?.name || "Candidate",
            skills: c.skills,
            reasons: c.skills
              .slice(0, 3)
              .map(
                (skill) =>
                  "Declared skill: " + skill + " — verification may be needed",
              ),
            expiresAt: consent.expiresAt,
          },
        ];
      })
    : [];
  return {
    ...s,
    evidence: filter(s.evidence),
    screenings: filter(s.screenings),
    simulations: filter(s.simulations),
    tasks: isRecruiter
      ? s.tasks
      : s.tasks.filter(
          (t) =>
            t.candidateId === user.id &&
            ["document", "update", "schedule"].includes(t.kind) &&
            ["preview_completed", "ready_for_integration"].includes(t.status),
        ),
    journeys: filter(s.journeys),
    audit: isRecruiter ? s.audit : [],
    costs: isRecruiter ? s.costs : [],
    times: isRecruiter ? s.times : [],
    consents: filter(s.consents),
    credentials: filter(s.credentials),
    preferences: isRecruiter
      ? s.preferences
      : { [user.id]: s.preferences[user.id] || defaultPreferences() },
    asOf: now(),
    role: user.role,
    userId: user.id,
    candidates,
    jobs,
    applications: isRecruiter
      ? db.applications
      : db.applications.filter((a) => a.candidateId === user.id),
    templates: simulationTemplates,
    rediscovery,
  };
}
export function intelligenceRoute(
  db: DemoDatabase,
  parts: string[],
  method: string,
  data: Input,
  user: DemoUser,
): unknown {
  const s = structuredClone(db.intelligence || createIntelligenceSeed(db));
  const action = parts[0];
  for (const assignment of db.assignments.filter(
    (a) => a.status === "evaluated",
  )) {
    const test = db.assessments.find((t) => t.id === assignment.assessmentId);
    if (test && !s.evidence.some((e) => e.id === "result-" + assignment.id))
      s.evidence.push({
        id: "result-" + assignment.id,
        candidateId: assignment.candidateId,
        jobId: test.jobId,
        competency: "Assessment work",
        requirement: "Demonstrate the role’s assessed competencies.",
        claim: "Saved sample assessment: " + assignment.percentage + "%.",
        source: "Assessment",
        reference: assignment.id,
        excerpt:
          assignment.overallFeedback ||
          "Local sample assessment response and score.",
        status: assignment.passed ? "supported" : "unverified",
      });
  }
  if (method === "GET" && !action) return snapshot(db, s, user);
  if (method !== "POST") throw Error("Unsupported intelligence action.");
  db.intelligence = s;
  const candidateId =
    user.role === "candidate" ? user.id : str(data, "candidateId");
  if (
    user.role === "candidate" &&
    data.candidateId &&
    data.candidateId !== user.id
  )
    throw Error("This record belongs to another candidate.");
  if (action === "preferences") {
    const p = { ...(s.preferences[user.id] || defaultPreferences()) };
    if (data.locale !== undefined) {
      if (!["en", "fr", "rw"].includes(String(data.locale)))
        throw Error("Unsupported language.");
      p.locale = data.locale as Locale;
    }
    if (data.format !== undefined) {
      if (
        !["text", "accessible-text", "voice-request"].includes(
          String(data.format),
        )
      )
        throw Error("Unsupported screening format.");
      p.format = data.format as Preferences["format"];
    }
    if (typeof data.largeText === "boolean") p.largeText = data.largeText;
    if (typeof data.lowBandwidth === "boolean")
      p.lowBandwidth = data.lowBandwidth;
    if (data.adjustment !== undefined)
      p.adjustment = str(data, "adjustment", 2000);
    s.preferences[user.id] = p;
    audit(
      s,
      user,
      "preferences_saved",
      user.id,
      "Candidate-selected language and accessibility preferences.",
      user.id,
    );
    if (p.adjustment || p.format === "voice-request") {
      const existing = s.tasks.find(
        (t) =>
          t.kind === "exception" &&
          t.candidateId === user.id &&
          t.title === "Accessibility adjustment",
      );
      if (existing)
        existing.body = p.adjustment || "Voice alternative requested.";
      else
        s.tasks.unshift({
          id: id(),
          candidateId: user.id,
          jobId: db.candidates.find((c) => c.id === user.id)?.jobId || "",
          kind: "exception",
          title: "Accessibility adjustment",
          body: p.adjustment || "Voice alternative requested.",
          requiresApproval: true,
          status: "suggested",
          reason: "A recruiter should confirm a suitable alternative.",
          createdAt: now(),
        });
    }
  } else if (action === "evidence-extract") {
    const c = need(
      db.candidates.find((c) => c.id === candidateId),
      "Candidate",
    );
    own(user, c.id);
    const source = required(data, "source", 100);
    const content = required(data, "content", 6000);
    const job = need(
      db.jobs.find((j) => j.id === (str(data, "jobId") || c.jobId)),
      "Job",
    );
    const terms = [...new Set([...c.skills, ...competencies(job)])].filter(
      (term) => content.toLowerCase().includes(term.toLowerCase()),
    );
    if (!terms.length)
      throw Error(
        "No known sample skills were found. Add a clear skill reference to the text.",
      );
    for (const term of terms)
      s.evidence.unshift({
        id: id(),
        candidateId: c.id,
        jobId: job.id,
        competency: term,
        requirement: "Provide relevant evidence of " + term,
        claim: "Local keyword preview found: " + term,
        source,
        reference: "Pasted sample text",
        excerpt: content,
        status: "unverified",
      });
    audit(
      s,
      user,
      "evidence_extracted",
      c.id,
      "Local keyword matching only; claims remain unverified.",
      c.id,
    );
  } else if (action === "evidence-correct") {
    candidate(user);
    const e = need(
      s.evidence.find((e) => e.id === str(data, "id")),
      "Evidence",
    );
    own(user, e.candidateId);
    if (e.correction?.status === "pending")
      throw Error("A correction is already awaiting review.");
    e.correction = { text: required(data, "text", 2000), status: "pending" };
    audit(
      s,
      user,
      "correction_requested",
      e.id,
      e.correction.text,
      e.candidateId,
    );
    notification(
      db,
      "demo-recruiter",
      "Evidence correction requested",
      "A sample candidate requested a correction.",
    );
  } else if (action === "evidence-resolve") {
    recruiter(user);
    const e = need(
      s.evidence.find((e) => e.id === str(data, "id")),
      "Evidence",
    );
    const reason = required(data, "reason", 2000);
    const status = required(data, "status");
    if (!["supported", "unverified", "missing"].includes(status))
      throw Error("Choose an evidence state.");
    if (status === "supported" && !e.excerpt.trim())
      throw Error(
        "A supporting source excerpt is required before marking evidence supported.",
      );
    const before = e.status;
    if (e.correction?.status === "pending") {
      const accept = data.accept === true;
      e.correction.status = accept ? "accepted" : "declined";
      if (accept) e.claim = e.correction.text;
    }
    e.status = status as EvidenceStatus;
    audit(
      s,
      user,
      "evidence_override",
      e.id,
      reason,
      e.candidateId,
      before,
      e.status,
    );
    notification(
      db,
      e.candidateId,
      "Evidence review updated",
      "Your correction or evidence state has been reviewed.",
    );
  } else if (action === "screening-start") {
    candidate(user);
    const job = need(
      db.jobs.find((j) => j.id === str(data, "jobId")),
      "Job",
    );
    if (
      s.screenings.some((x) => x.candidateId === user.id && x.jobId === job.id)
    )
      throw Error("A sample screening already exists for this role.");
    const criteria = competencies(job);
    const locale = s.preferences[user.id]?.locale || "en";
    s.screenings.push({
      id: id(),
      candidateId: user.id,
      jobId: job.id,
      competency: 0,
      status: "in_progress",
      scores: [],
      turns: [
        {
          id: id(),
          kind: "prompt",
          text: screeningPrompt(locale, criteria[0]),
          competency: 0,
          followUp: false,
        },
      ],
    });
  } else if (action === "screening-draft") {
    candidate(user);
    const session = need(
      s.screenings.find((x) => x.id === str(data, "id")),
      "Screening",
    );
    own(user, session.candidateId);
    if (session.status !== "in_progress")
      throw Error("This screening has already been submitted.");
    session.draftAnswer = str(data, "answer", 6000);
  } else if (action === "screening-answer") {
    candidate(user);
    const session = need(
      s.screenings.find((x) => x.id === str(data, "id")),
      "Screening",
    );
    own(user, session.candidateId);
    if (session.status !== "in_progress")
      throw Error("This screening has already been submitted.");
    const response = required(data, "answer", 6000);
    delete session.draftAnswer;
    const job = need(
      db.jobs.find((j) => j.id === session.jobId),
      "Job",
    );
    const criteria = competencies(job);
    const previous = session.turns[session.turns.length - 1];
    if (previous.kind !== "prompt")
      throw Error("A prompt is required before an answer.");
    session.turns.push({
      id: id(),
      kind: "response",
      text: response,
      competency: session.competency,
      followUp: previous.followUp,
    });
    const locale = s.preferences[user.id]?.locale || "en";
    if (response.length < 100 && !previous.followUp)
      session.turns.push({
        id: id(),
        kind: "prompt",
        text: screeningPrompt(locale, criteria[session.competency], true),
        competency: session.competency,
        followUp: true,
      });
    else if (session.competency + 1 < criteria.length) {
      session.competency++;
      session.turns.push({
        id: id(),
        kind: "prompt",
        text: screeningPrompt(locale, criteria[session.competency]),
        competency: session.competency,
        followUp: false,
      });
    } else {
      session.status = "awaiting_review";
      audit(
        s,
        user,
        "screening_submitted",
        session.id,
        "Structured text responses saved; human rubric review required.",
        user.id,
      );
      notification(
        db,
        "demo-recruiter",
        "Screening ready for review",
        "A sample structured transcript is available.",
      );
    }
  } else if (action === "screening-review") {
    recruiter(user);
    const session = need(
      s.screenings.find((x) => x.id === str(data, "id")),
      "Screening",
    );
    if (session.status === "in_progress")
      throw Error("Wait for the candidate to finish.");
    const job = need(
      db.jobs.find((j) => j.id === session.jobId),
      "Job",
    );
    const previousScores = JSON.stringify(session.scores);
    session.scores = scoreInput(data, competencies(job));
    session.status = "reviewed";
    audit(
      s,
      user,
      "screening_reviewed",
      session.id,
      "Human scores anchored to saved transcript responses.",
      session.candidateId,
      previousScores,
      JSON.stringify(session.scores),
    );
  } else if (action === "simulation-save") {
    candidate(user);
    const template = need(
      simulationTemplates.find((t) => t.id === str(data, "templateId")),
      "Simulation",
    );
    let response = s.simulations.find(
      (r) => r.candidateId === user.id && r.templateId === template.id,
    );
    if (response && response.status !== "draft")
      throw Error("This work sample has already been submitted.");
    const answer = required(data, "answer", 20000);
    if (!response) {
      response = {
        id: id(),
        candidateId: user.id,
        templateId: template.id,
        answer,
        status: "draft",
        updatedAt: now(),
        scores: [],
        checks: [],
        feedback: "",
      };
      s.simulations.push(response);
    }
    response.answer = answer;
    response.updatedAt = now();
    if (data.submit === true) {
      response.status = "submitted";
      audit(
        s,
        user,
        "simulation_submitted",
        response.id,
        "Artifact saved for human rubric review.",
        user.id,
      );
    }
  } else if (action === "simulation-review") {
    recruiter(user);
    const response = need(
      s.simulations.find((r) => r.id === str(data, "id")),
      "Simulation response",
    );
    if (response.status === "draft")
      throw Error("The candidate has not submitted this work.");
    const template = need(
      simulationTemplates.find((t) => t.id === response.templateId),
      "Template",
    );
    const previousReview = JSON.stringify({
      scores: response.scores,
      feedback: response.feedback,
    });
    response.scores = scoreInput(
      data,
      template.rubric.map((r) => r.id),
    );
    response.feedback = required(data, "feedback", 3000);
    response.checks = Array.isArray(data.checks)
      ? data.checks
          .map(String)
          .filter((check) => template.checks.includes(check))
      : [];
    response.status = "reviewed";
    audit(
      s,
      user,
      "simulation_reviewed",
      response.id,
      response.feedback,
      response.candidateId,
      previousReview,
      JSON.stringify({ scores: response.scores, feedback: response.feedback }),
    );
  } else if (action === "workflow-plan") {
    recruiter(user);
    const job = need(
      db.jobs.find((j) => j.id === str(data, "jobId")),
      "Job",
    );
    const people = db.candidates.filter(
      (c) =>
        c.jobId === job.id ||
        db.applications.some(
          (a) => a.jobId === job.id && a.candidateId === c.id,
        ),
    );
    for (const c of people) {
      const actions: WorkflowKind[] = ["brief"];
      if (
        db.applications.some(
          (a) =>
            a.jobId === job.id &&
            a.candidateId === c.id &&
            a.status === "pending",
        )
      )
        actions.push("organize");
      if (
        s.evidence.some(
          (e) =>
            e.candidateId === c.id &&
            e.jobId === job.id &&
            e.status === "missing",
        )
      )
        actions.push("document");
      for (const kind of actions) {
        if (
          s.tasks.some(
            (t) =>
              t.candidateId === c.id &&
              t.jobId === job.id &&
              t.kind === kind &&
              t.status !== "rejected",
          )
        )
          continue;
        const evidence = s.evidence.filter(
          (e) => e.candidateId === c.id && e.jobId === job.id,
        );
        s.tasks.unshift({
          id: id(),
          candidateId: c.id,
          jobId: job.id,
          kind,
          title:
            kind === "brief"
              ? "Prepare evidence-linked interviewer brief"
              : kind === "organize"
                ? "Move incoming application to review"
                : "Request missing evidence",
          body:
            kind === "brief"
              ? evidence
                  .map(
                    (e) => e.competency + ": " + e.status + " · " + e.reference,
                  )
                  .join("\n")
              : kind === "organize"
                ? "Move this incoming sample application to the review stage. This is not a hiring decision."
                : "Please provide a relevant work sample for: " +
                  evidence
                    .filter((e) => e.status === "missing")
                    .map((e) => e.competency)
                    .join(", ") +
                  ". An accessible alternative can be requested.",
          requiresApproval: true,
          status: "suggested",
          reason: "Rule-based campaign suggestion; review before executing.",
          createdAt: now(),
        });
      }
    }
    audit(
      s,
      user,
      "campaign_planned",
      job.id,
      "Prepared deduplicated local application, document and briefing actions.",
    );
  } else if (action === "workflow-create") {
    recruiter(user);
    const c = need(
      db.candidates.find((c) => c.id === candidateId),
      "Candidate",
    );
    const kind = required(data, "kind") as WorkflowKind;
    if (
      ![
        "organize",
        "document",
        "update",
        "schedule",
        "brief",
        "exception",
        "outreach",
      ].includes(kind)
    )
      throw Error("Unsupported workflow type.");
    if (kind === "outreach") {
      const consent = s.consents.find((x) => x.candidateId === c.id);
      if (
        !consent?.discoverable ||
        !consent.contactAllowed ||
        consent.deletionRequested ||
        new Date(consent.expiresAt + "T23:59:59Z").getTime() < Date.now()
      )
        throw Error("Current discovery and contact consent is required.");
    }
    s.tasks.unshift({
      id: id(),
      candidateId: c.id,
      jobId: str(data, "jobId") || c.jobId,
      kind,
      title: required(data, "title", 150),
      body: required(data, "body", 4000),
      requiresApproval: true,
      status: "suggested",
      reason: "Awaiting recruiter approval.",
      createdAt: now(),
    });
    audit(s, user, "workflow_drafted", c.id, kind, c.id);
  } else if (action === "workflow-decide") {
    recruiter(user);
    const task = need(
      s.tasks.find((t) => t.id === str(data, "id")),
      "Task",
    );
    if (task.status !== "suggested")
      throw Error("Only suggested actions can be approved or rejected.");
    task.reason = required(data, "reason", 2000);
    if (data.body !== undefined) task.body = required(data, "body", 4000);
    task.status = data.approve === true ? "approved" : "rejected";
    audit(
      s,
      user,
      "workflow_" + task.status,
      task.id,
      task.reason,
      task.candidateId,
    );
  } else if (action === "workflow-run") {
    recruiter(user);
    const task = need(
      s.tasks.find((t) => t.id === str(data, "id")),
      "Task",
    );
    if (task.status !== "approved")
      throw Error("Approve this task before executing its local preview.");
    if (task.kind === "outreach") {
      const c = s.consents.find((c) => c.candidateId === task.candidateId);
      if (
        !c?.discoverable ||
        !c.contactAllowed ||
        c.deletionRequested ||
        new Date(c.expiresAt + "T23:59:59Z").getTime() < Date.now()
      )
        throw Error("Consent has expired or been withdrawn.");
    }
    if (task.kind === "organize") {
      const application = db.applications.find(
        (a) =>
          a.candidateId === task.candidateId &&
          a.jobId === task.jobId &&
          a.status === "pending",
      );
      if (!application)
        throw Error("No pending application remains for this action.");
      application.status = "reviewed";
      let journey = s.journeys.find((j) => j.id === application.id);
      if (!journey) {
        journey = {
          id: application.id,
          candidateId: application.candidateId,
          jobId: application.jobId,
          nextStep: "Evidence review is the next step.",
          expectedDate: "",
          history: [],
        };
        s.journeys.push(journey);
      }
      journey.history.push({
        stage: "reviewed",
        at: now(),
        note: "Recruiter approved moving the incoming application into review.",
      });
      notification(
        db,
        application.candidateId,
        "Application moved to review",
        "Your local sample application is in evidence review.",
      );
      task.status = "preview_completed";
      task.reason = "Sample application moved from pending to reviewed.";
    } else if (task.kind === "brief") {
      task.status = "preview_completed";
      task.reason = "Interviewer brief prepared locally from approved draft.";
    } else {
      task.status = "ready_for_integration";
      task.reason =
        "Approved local draft only. No message, calendar invite or external action was sent.";
      if (["document", "update", "schedule"].includes(task.kind))
        notification(db, task.candidateId, "Sample hiring update", task.body);
    }
    audit(s, user, "workflow_preview", task.id, task.reason, task.candidateId);
  } else if (action === "journey-stage" || action === "journey-withdraw") {
    const application = need(
      db.applications.find((a) => a.id === str(data, "id")),
      "Application",
    );
    own(user, application.candidateId);
    if (action === "journey-stage") recruiter(user);
    else candidate(user);
    const status =
      action === "journey-withdraw" ? "withdrawn" : required(data, "status");
    if (
      ![
        "pending",
        "reviewed",
        "shortlisted",
        "hired",
        "rejected",
        "withdrawn",
      ].includes(status)
    )
      throw Error("Unsupported application stage.");
    if (
      ["hired", "rejected", "withdrawn"].includes(application.status) &&
      status !== application.status
    )
      throw Error("A closed application cannot be reopened in this preview.");
    const reason =
      action === "journey-withdraw"
        ? "Candidate withdrew this sample application."
        : required(data, "reason", 2000);
    const before = application.status;
    application.status = status;
    let journey = s.journeys.find((j) => j.id === application.id);
    if (!journey) {
      journey = {
        id: application.id,
        candidateId: application.candidateId,
        jobId: application.jobId,
        nextStep: "",
        expectedDate: "",
        history: [],
      };
      s.journeys.push(journey);
    }
    journey.nextStep = str(data, "nextStep", 2000) || reason;
    const date = str(data, "expectedDate");
    if (date && !/^\d{4}-\d{2}-\d{2}$/.test(date))
      throw Error("Choose a valid update date.");
    journey.expectedDate = date;
    journey.history.push({ stage: status, at: now(), note: reason });
    audit(
      s,
      user,
      "application_stage",
      application.id,
      reason,
      application.candidateId,
      before,
      status,
    );
    notification(
      db,
      application.candidateId,
      "Application timeline updated",
      reason,
    );
  } else if (action === "audit-settings") {
    recruiter(user);
    const reason = required(data, "reason", 1000);
    if (typeof data.maskIdentities === "boolean")
      s.maskIdentities = data.maskIdentities;
    if (typeof data.aggregatePermission === "boolean")
      s.aggregatePermission = data.aggregatePermission;
    audit(s, user, "audit_settings", "review-settings", reason);
  } else if (action === "roi-entry") {
    recruiter(user);
    const jobId = required(data, "jobId");
    need(
      db.jobs.find((j) => j.id === jobId),
      "Job",
    );
    const note = required(data, "note", 1000);
    if (data.kind === "cost")
      s.costs.push({
        id: id(),
        jobId,
        category: required(data, "category", 100),
        amount: number(data, "amount", 0, 10000000),
        currency: "USD",
        note,
      });
    else if (data.kind === "time") {
      const phase = required(data, "phase");
      if (!["baseline", "assisted"].includes(phase))
        throw Error("Choose a measurement phase.");
      const count = number(data, "candidateCount", 1, 100000);
      if (!Number.isInteger(count))
        throw Error("Candidate count must be a whole number.");
      s.times.push({
        id: id(),
        jobId,
        phase: phase as "baseline" | "assisted",
        minutes: number(data, "minutes", 0, 1000000),
        candidateCount: count,
        note,
      });
    } else throw Error("Choose a cost or time record.");
    audit(s, user, "roi_recorded", jobId, note);
  } else if (action === "consent") {
    candidate(user);
    const c = need(
      s.consents.find((c) => c.candidateId === user.id),
      "Discovery preference",
    );
    if (c.deletionRequested && data.deletionRequested !== true)
      throw Error(
        "A pending deletion request must be reviewed before matching can resume.",
      );
    const expiry = required(data, "expiresAt");
    if (
      !/^\d{4}-\d{2}-\d{2}$/.test(expiry) ||
      !Number.isFinite(new Date(expiry + "T23:59:59Z").getTime()) ||
      (data.discoverable === true &&
        new Date(expiry + "T23:59:59Z").getTime() <= Date.now())
    )
      throw Error("Choose a future consent expiry date.");
    c.expiresAt = expiry;
    c.discoverable = data.discoverable === true;
    c.contactAllowed = c.discoverable && data.contactAllowed === true;
    if (data.deletionRequested === true) {
      c.deletionRequested = true;
      c.discoverable = false;
      c.contactAllowed = false;
      s.tasks.unshift({
        id: id(),
        candidateId: user.id,
        jobId: "",
        kind: "exception",
        title: "Deletion review requested",
        body: "Review data retention and the candidate’s deletion request. Rediscovery is already disabled.",
        requiresApproval: true,
        status: "suggested",
        reason: "Human review required.",
        createdAt: now(),
      });
    }
    audit(
      s,
      user,
      "discovery_consent",
      user.id,
      c.deletionRequested
        ? "Deletion review requested; matching stopped."
        : "Candidate updated matching and contact consent.",
      user.id,
    );
  } else if (action === "credential-add") {
    const person = need(
      db.candidates.find((c) => c.id === candidateId),
      "Candidate",
    );
    own(user, person.id);
    const kind = required(data, "kind");
    if (!["qualification", "certificate", "reference"].includes(kind))
      throw Error("Choose a credential type.");
    s.credentials.push({
      id: id(),
      candidateId: person.id,
      kind: kind as "qualification" | "certificate" | "reference",
      claim: required(data, "claim", 500),
      issuer: required(data, "issuer", 300),
      status: "not_checked",
      consent: false,
      note: "Candidate-supplied claim. No issuer, certificate or reference check has occurred.",
    });
    audit(
      s,
      user,
      "credential_added",
      person.id,
      "Unverified claim recorded for consent-led review.",
      person.id,
    );
  } else if (
    action === "verification-request" ||
    action === "verification-consent" ||
    action === "verification-flag"
  ) {
    const credential = need(
      s.credentials.find((c) => c.id === str(data, "id")),
      "Credential",
    );
    own(user, credential.candidateId);
    if (action === "verification-request") {
      recruiter(user);
      if (credential.consent)
        throw Error(
          "Consent is already recorded; issuer integration is pending.",
        );
      if (credential.consentRequested)
        throw Error("Consent has already been requested.");
      credential.consentRequested = true;
      if (credential.status !== "conflict") {
        credential.status = "consent_requested";
        credential.note =
          "Candidate consent is requested in the portal. No issuer contact has occurred.";
      }
      notification(
        db,
        credential.candidateId,
        "Credential consent requested",
        credential.claim,
      );
    } else if (action === "verification-consent") {
      candidate(user);
      credential.consent = data.consent === true;
      credential.consentRequested = false;
      if (credential.status !== "conflict") {
        credential.status = credential.consent
          ? "ready_for_verification"
          : "not_checked";
        credential.note = credential.consent
          ? "Consent recorded. No issuer service is connected; this claim is not verified."
          : "Consent withdrawn. No issuer verification is authorized.";
      }
    } else {
      recruiter(user);
      credential.status = "conflict";
      credential.note = required(data, "reason", 2000);
    }
    audit(
      s,
      user,
      action,
      credential.id,
      credential.note,
      credential.candidateId,
    );
  } else throw Error("This intelligence action is not supported.");
  return snapshot(db, s, user);
}
