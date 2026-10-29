import { intelligenceRoute } from "../intelligence/service";
import { CANDIDATE_ID, RECRUITER_ID, sampleQuestions } from "./seed";
import { readDemoDatabase, updateDemoDatabase } from "./store";
import type {
  DemoAssessment,
  DemoAssignment,
  DemoCandidate,
  DemoDatabase,
  DemoJob,
  DemoProfile,
  DemoQuestion,
  DemoUser,
} from "./types";

type Payload = Record<string, unknown>;
const now = () => new Date().toISOString();
const makeId = (kind: string) => kind + "-" + crypto.randomUUID();
function required<T>(value: T | null | undefined, label: string): T {
  if (value == null) throw new Error(label + " was not found in this preview.");
  return value;
}
function text(data: Payload, key: string, fallback = "") {
  return typeof data[key] === "string"
    ? (data[key] as string).trim()
    : fallback;
}
function integer(value: unknown, fallback: number, min: number, max: number) {
  const n = value == null ? fallback : Number(value);
  if (!Number.isInteger(n) || n < min || n > max)
    throw new Error(
      "Enter a whole number between " + min + " and " + max + ".",
    );
  return n;
}
function current(db: DemoDatabase) {
  return required(
    db.users.find((u) => u.id === db.sessionUserId),
    "Preview session",
  );
}
function recruiter(user: DemoUser) {
  if (user.role !== "recruiter")
    throw new Error("Switch to the recruiter preview for this action.");
}
function candidate(user: DemoUser) {
  if (user.role !== "candidate")
    throw new Error("Switch to the candidate preview for this action.");
}
function job(db: DemoDatabase, id: string) {
  return required(
    db.jobs.find((j) => j.id === id),
    "Job",
  );
}
function assessment(db: DemoDatabase, id: string) {
  return required(
    db.assessments.find((a) => a.id === id),
    "Assessment",
  );
}
function person(db: DemoDatabase, id: string) {
  return required(
    db.candidates.find((c) => c.id === id),
    "Candidate",
  );
}
function note(
  db: DemoDatabase,
  userId: string,
  title: string,
  message: string,
  referenceId?: string,
) {
  db.notifications.unshift({
    id: makeId("notification"),
    userId,
    title,
    message,
    type: "event",
    read: false,
    createdAt: now(),
    referenceId,
  });
}
function jobView(db: DemoDatabase, j: DemoJob) {
  const applicants = new Set([
    ...db.candidates.filter((c) => c.jobId === j.id).map((c) => c.id),
    ...db.applications
      .filter((a) => a.jobId === j.id)
      .map((a) => a.candidateId),
  ]);
  return { ...j, applicantCount: applicants.size };
}
function candidateView(db: DemoDatabase, c: DemoCandidate) {
  return {
    ...c,
    jobApplied: db.jobs.find((j) => j.id === c.jobId)?.title || "Talent pool",
  };
}
function assessmentView(db: DemoDatabase, a: DemoAssessment) {
  return { ...a, job: jobView(db, job(db, a.jobId)) };
}
function assignmentView(db: DemoDatabase, a: DemoAssignment, user: DemoUser) {
  const test = assessment(db, a.assessmentId);
  const keysVisible = user.role === "recruiter" || a.status === "evaluated";
  const questions = test.questions.map((q) => {
    const copy = { ...q, text: q.question };
    if (!keysVisible) delete copy.correctAnswer;
    return copy;
  });
  return {
    ...a,
    assignmentId: a.id,
    title: test.title,
    jobId: jobView(db, job(db, test.jobId)),
    assessment: { ...test, questions },
    questions,
    durationMinutes: test.durationMinutes,
    timeLimitPerQuestion: test.timeLimitPerQuestion,
    totalQuestions: test.totalQuestions,
    totalQuestionsCount: test.totalQuestions,
    totalMarks: test.totalMarks,
    passingScore: test.passingScore,
    verifiedCandidateName: a.candidateName,
    verifiedCandidateEmail: a.candidateEmail,
  };
}
function draft(db: DemoDatabase, data: Payload): DemoAssessment {
  const linked = job(db, text(data, "jobId"));
  const id = makeId("assessment");
  return {
    id,
    _id: id,
    jobId: linked.id,
    title: linked.title + " — Sample assessment",
    instructions:
      "Frontend preview with sample questions. No AI model is called. Local multiple-choice scoring only.",
    durationMinutes: 20,
    timeLimitPerQuestion: 120,
    status: "draft",
    questions: sampleQuestions(),
    totalQuestions: 5,
    totalMarks: 100,
    passingScore: 70,
    createdAt: now(),
    createdBy: RECRUITER_ID,
    jobType: "non-coding",
    jobCategory: "Sample workflow",
  };
}
function validateQuestions(value: unknown): DemoQuestion[] {
  if (!Array.isArray(value) || value.length === 0 || value.length > 100)
    throw new Error("An assessment needs between 1 and 100 questions.");
  const ids = new Set<number>();
  return value.map((raw: unknown, index) => {
    if (!raw || typeof raw !== "object")
      throw new Error("Each question must be an object.");
    const q = raw as Payload;
    const id = integer(q.id, index + 1, 1, 100000);
    if (ids.has(id)) throw new Error("Question IDs must be unique.");
    ids.add(id);
    const type = text(q, "type", "multiple_choice");
    if (
      ![
        "multiple_choice",
        "open_ended",
        "coding_problem",
        "real_world_problem",
      ].includes(type)
    )
      throw new Error("Unsupported question type.");
    const question = text(q, "question", text(q, "text"));
    if (!question) throw new Error("Question text is required.");
    const marks = integer(q.marks, 20, 1, 1000);
    const options = Array.isArray(q.options)
      ? q.options.map(String)
      : undefined;
    if (type === "multiple_choice" && (!options || options.length < 2))
      throw new Error("Multiple-choice questions need at least two options.");
    return {
      id,
      type: type as DemoQuestion["type"],
      category: text(q, "category", "General"),
      question,
      text: question,
      options,
      correctAnswer: text(q, "correctAnswer") || undefined,
      marks,
    };
  });
}
function recalculate(a: DemoAssessment) {
  a.totalQuestions = a.questions.length;
  a.totalMarks = a.questions.reduce((sum, q) => sum + q.marks, 0);
}
function profile(db: DemoDatabase, user: DemoUser): DemoProfile {
  return (
    db.profiles.find((p) => p.userId === user.id) || {
      userId: user.id,
      firstName: user.name.split(" ")[0],
      lastName: user.name.split(" ").slice(1).join(" "),
      email: user.email,
      headline: "",
      bio: "",
      location: "",
      mobileNumber: "",
      skills: [],
      workExperience: [],
      education: [],
      certifications: [],
      projects: [],
      availabilityStatus: "",
      employmentType: "",
      availableStartDate: "",
      linkedin: "",
      github: "",
      personalPortfolio: "",
    }
  );
}
async function payload(body?: BodyInit | null): Promise<Payload> {
  if (!body) return {};
  if (typeof FormData !== "undefined" && body instanceof FormData) {
    const result: Payload = {};
    body.forEach((value, key) => {
      result[key] =
        typeof value === "string"
          ? value
          : { name: value.name, size: value.size, type: value.type };
    });
    return result;
  }
  if (typeof body !== "string")
    throw new Error("Unsupported preview request body.");
  const result: unknown = JSON.parse(body);
  if (!result || typeof result !== "object" || Array.isArray(result))
    throw new Error("Expected an object.");
  return result as Payload;
}
function route(
  db: DemoDatabase,
  path: string,
  method: string,
  data: Payload,
  query: URLSearchParams,
): unknown {
  const parts = path.split("/").filter(Boolean);
  const [resource, id, action, questionId] = parts;
  if (path === "/auth/preview" && method === "POST") {
    const role = text(data, "role");
    if (role !== "candidate" && role !== "recruiter")
      throw new Error("Choose a preview role.");
    db.sessionUserId = role === "candidate" ? CANDIDATE_ID : RECRUITER_ID;
    return current(db);
  }
  const user = current(db);
  if (resource === "intelligence")
    return intelligenceRoute(db, parts.slice(1), method, data, user);
  if (path === "/auth/me" && method === "GET") return user;
  if (resource === "jobs") {
    if (method === "GET")
      return id ? jobView(db, job(db, id)) : db.jobs.map((j) => jobView(db, j));
    recruiter(user);
    if (method === "DELETE" && id) {
      job(db, id);
      const tests = db.assessments
        .filter((a) => a.jobId === id)
        .map((a) => a.id);
      db.jobs = db.jobs.filter((j) => j.id !== id);
      db.applications = db.applications.filter((a) => a.jobId !== id);
      db.screenings = db.screenings.filter((s) => s.jobId !== id);
      db.assessments = db.assessments.filter((a) => a.jobId !== id);
      db.assignments = db.assignments.filter(
        (a) => !tests.includes(a.assessmentId),
      );
      db.candidates.forEach((c) => {
        if (c.jobId === id) c.jobId = "";
      });
      return { message: "Sample job deleted." };
    }
    if (method === "POST" || method === "PATCH") {
      const existing =
        method === "PATCH" ? job(db, required(id, "Job ID")) : null;
      const title = text(data, "title", existing?.title);
      const company = text(data, "company", existing?.company);
      if (!title || !company)
        throw new Error("Job title and company are required.");
      const jobId = existing?.id || makeId("job");
      const value: DemoJob = {
        id: jobId,
        _id: jobId,
        title,
        company,
        department: text(data, "department", existing?.department),
        experienceLevel: text(
          data,
          "experienceLevel",
          existing?.experienceLevel || "Mid-Level",
        ),
        applicantsTarget: integer(
          data.applicantsTarget,
          existing?.applicantsTarget || 20,
          1,
          100000,
        ),
        location: text(data, "location", existing?.location || "Remote"),
        salaryRange: text(data, "salaryRange", existing?.salaryRange),
        description: text(
          data,
          "description",
          existing?.description || "Sample job created during frontend review.",
        ),
        status: existing?.status || "active",
        createdAt: existing?.createdAt || now(),
        createdBy: user.id,
      };
      if (existing) Object.assign(existing, value);
      else db.jobs.unshift(value);
      return jobView(db, value);
    }
  }
  if (resource === "candidates") {
    recruiter(user);
    if (method === "GET")
      return id
        ? candidateView(db, person(db, id))
        : db.candidates
            .filter(
              (c) => !query.get("jobId") || c.jobId === query.get("jobId"),
            )
            .map((c) => candidateView(db, c));
    if (method === "DELETE" && id) {
      person(db, id);
      db.candidates = db.candidates.filter((c) => c.id !== id);
      db.applications = db.applications.filter((a) => a.candidateId !== id);
      db.assignments = db.assignments.filter((a) => a.candidateId !== id);
      db.screenings.forEach((s) => {
        s.shortlist = s.shortlist.filter((c) => c.candidateId !== id);
      });
      return { message: "Sample candidate deleted." };
    }
    if (method === "POST" || method === "PATCH") {
      const existing =
        method === "PATCH" ? person(db, required(id, "Candidate ID")) : null;
      const name = text(data, "name", existing?.name),
        email = text(data, "email", existing?.email);
      if (!name || !email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))
        throw new Error("A name and valid email are required.");
      const linked = text(data, "jobId", existing?.jobId);
      if (linked) job(db, linked);
      const candidateId = existing?.id || makeId("candidate");
      const skills = Array.isArray(data.skills)
        ? data.skills.map(String)
        : text(data, "skills", existing?.skills.join(","))
            .split(",")
            .map((s) => s.trim())
            .filter(Boolean);
      const value: DemoCandidate = {
        id: candidateId,
        _id: candidateId,
        name,
        email,
        phone: text(data, "phone", existing?.phone),
        currentRole: text(data, "currentRole", existing?.currentRole),
        location: text(data, "location", existing?.location),
        skills,
        experience: text(data, "experience", existing?.experience),
        education: text(data, "education", existing?.education),
        summary: text(data, "summary", existing?.summary),
        jobId: linked,
        source: existing?.source || "manual",
        createdAt: existing?.createdAt || now(),
      };
      if (data.resume && typeof data.resume === "object")
        value.resumeName = String((data.resume as Payload).name || "");
      if (existing) Object.assign(existing, value);
      else db.candidates.unshift(value);
      return candidateView(db, value);
    }
  }
  if (resource === "profile") {
    const p = profile(db, user);
    if (method === "GET" && !id) return p;
    if (!db.profiles.some((item) => item.userId === user.id))
      db.profiles.push(p);
    if (
      method === "PATCH" &&
      ["basic-info", "availability", "social-links"].includes(id)
    ) {
      const keys = [
        "firstName",
        "lastName",
        "email",
        "headline",
        "bio",
        "location",
        "mobileNumber",
        "availabilityStatus",
        "employmentType",
        "availableStartDate",
        "linkedin",
        "github",
        "personalPortfolio",
      ] as const;
      for (const key of keys)
        if (typeof data[key] === "string") p[key] = text(data, key);
      const c = db.candidates.find((c) => c.id === user.id);
      if (c) {
        c.name = (p.firstName + " " + p.lastName).trim();
        c.email = p.email;
        c.location = p.location;
        c.currentRole = p.headline;
      }
      return p;
    }
    const lists = {
      skills: "skills",
      "work-experience": "workExperience",
      education: "education",
      certifications: "certifications",
      projects: "projects",
    } as const;
    if (method === "POST" && id in lists) {
      const key = lists[id as keyof typeof lists];
      if (!Object.values(data).some((v) => typeof v === "string" && v.trim()))
        throw new Error("Add the details before saving.");
      p[key].push({ ...data });
      return p;
    }
    if (method === "POST" && id === "resume") {
      const file = data.resume as Payload | undefined;
      if (!file || !file.name) throw new Error("Choose a résumé file.");
      if (Number(file.size) > 10 * 1024 * 1024)
        throw new Error("Choose a file smaller than 10 MB.");
      p.resumeName = String(file.name);
      delete p.resumeUrl;
      return p;
    }
    if (id === "change-password")
      throw new Error(
        "Passwords are not created, stored or changed in frontend preview mode.",
      );
  }
  if (resource === "applications") {
    const view = (a: DemoDatabase["applications"][number]) => ({
      ...a,
      jobId: jobView(db, job(db, a.jobId)),
      job: jobView(db, job(db, a.jobId)),
      candidate:
        db.users.find((u) => u.id === a.candidateId) ||
        db.candidates.find((c) => c.id === a.candidateId),
    });
    if (method === "GET" && id === "my") {
      candidate(user);
      return db.applications.filter((a) => a.candidateId === user.id).map(view);
    }
    if (method === "GET" && id === "job") {
      recruiter(user);
      job(db, action);
      return db.applications.filter((a) => a.jobId === action).map(view);
    }
    if (method === "POST" && !id) {
      candidate(user);
      const j = job(db, text(data, "jobId"));
      if (j.status !== "active")
        throw new Error("This sample job is not accepting applications.");
      if (
        db.applications.some(
          (a) => a.jobId === j.id && a.candidateId === user.id,
        )
      )
        throw new Error("You have already applied to this sample job.");
      const applicationId = makeId("application");
      const a = {
        id: applicationId,
        _id: applicationId,
        candidateId: user.id,
        jobId: j.id,
        status: "pending",
        createdAt: now(),
        appliedAt: now(),
      };
      db.applications.unshift(a);
      note(
        db,
        RECRUITER_ID,
        "Sample application received",
        user.name + " applied for " + j.title,
        a.id,
      );
      return view(a);
    }
    if (method === "PATCH" && action === "status") {
      recruiter(user);
      const a = required(
        db.applications.find((a) => a.id === id),
        "Application",
      );
      const status = text(data, "status");
      if (
        !["pending", "reviewed", "shortlisted", "rejected", "hired"].includes(
          status,
        )
      )
        throw new Error("Choose a valid application status.");
      a.status = status;
      note(
        db,
        a.candidateId,
        "Sample application updated",
        "Your sample application status is now " + status + ".",
        a.id,
      );
      return view(a);
    }
  }
  if (resource === "screening") {
    recruiter(user);
    if (method === "GET" && id === "all") return db.screenings;
    if (method === "GET" && id === "history")
      return db.screenings.filter((s) => s.jobId === action);
    if (method === "GET" && id)
      return required(
        db.screenings.find((s) => s.id === id),
        "Screening",
      );
    if (method === "POST" && id === "run") {
      const j = job(db, text(data, "jobId", text(data, "_id")));
      const people = db.candidates.filter(
        (c) =>
          c.jobId === j.id ||
          db.applications.some(
            (a) => a.candidateId === c.id && a.jobId === j.id,
          ),
      );
      if (!people.length)
        throw new Error(
          "Add a sample candidate or application before running a screening preview.",
        );
      const top = integer(data.topN, 10, 1, 100);
      const screeningId = makeId("screening");
      const value = {
        id: screeningId,
        _id: screeningId,
        jobId: j.id,
        jobTitle: j.title,
        totalCandidates: people.length,
        screenedAt: now(),
        createdAt: now(),
        shortlist: people.slice(0, top).map((c, i) => ({
          candidateId: c.id,
          name: c.name,
          email: c.email,
          matchScore: Math.max(40, 92 - i * 5),
          strengths: c.skills.slice(0, 2).map((s) => "Sample evidence: " + s),
          missingSkills: [],
          risks: [
            "Illustrative frontend output; not a real hiring recommendation",
          ],
          summary:
            "Deterministic sample reasoning for reviewing the interface. No model or backend was called.",
        })),
      };
      db.screenings.unshift(value);
      return value;
    }
    if (method === "POST" && id === "create-assessment") {
      const value = draft(db, data);
      db.assessments.unshift(value);
      return assessmentView(db, value);
    }
    if (id?.startsWith("upload"))
      throw new Error(
        "Bulk parsing is not enabled in this preview. Add sample candidates manually; files are not uploaded.",
      );
  }
  if (resource === "notifications") {
    if (method === "GET" && !id)
      return db.notifications.filter((n) => n.userId === user.id);
    if (method === "POST" && id === "read-all") {
      db.notifications
        .filter((n) => n.userId === user.id)
        .forEach((n) => {
          n.read = true;
        });
      return { success: true };
    }
    const n = required(
      db.notifications.find((n) => n.id === id && n.userId === user.id),
      "Notification",
    );
    if (method === "PATCH" && action === "read") {
      n.read = true;
      return n;
    }
    if (method === "DELETE") {
      db.notifications = db.notifications.filter((item) => item.id !== n.id);
      return { success: true };
    }
  }
  if (resource === "assessments") {
    if (method === "GET" && id === "my") {
      candidate(user);
      return db.assignments
        .filter((a) => a.candidateId === user.id)
        .map((a) => assignmentView(db, a, user));
    }
    if (method === "GET" && !id) {
      recruiter(user);
      return db.assignments.map((a) => assignmentView(db, a, user));
    }
    if (method === "GET" && id === "library") { recruiter(user); return db.assessments.map(item=>assessmentView(db,item)); }
    if (method === "GET" && id === "drafts") {
      recruiter(user);
      return db.assessments
        .filter((a) => a.status === "draft")
        .map((a) => assessmentView(db, a));
    }
    if (method === "GET" && id === "job") {
      recruiter(user);
      return db.assignments
        .filter((a) => assessment(db, a.assessmentId).jobId === action)
        .map((a) => assignmentView(db, a, user));
    }
    if (method === "POST" && (id === "generate-draft" || !id)) {
      recruiter(user);
      const a = draft(db, data);
      db.assessments.unshift(a);
      return assessmentView(db, a);
    }
    const assignmentId = id === "assignments" ? action : id;
    const assignmentAction = id === "assignments" ? questionId : action;
    const a = db.assignments.find((item) => item.id === assignmentId);
    if (a) {
      if (user.role === "candidate" && a.candidateId !== user.id)
        throw new Error("This sample assignment belongs to another candidate.");
      if (method === "GET" && !assignmentAction)
        return assignmentView(db, a, user);
      if (method === "DELETE" && id === "assignments") {
        recruiter(user);
        db.assignments = db.assignments.filter((item) => item.id !== a.id);
        return { success: true };
      }
      if (
        method === "POST" &&
        ["start", "answer", "submit-answer", "submit"].includes(
          assignmentAction,
        )
      ) {
        candidate(user);
        const test = assessment(db, a.assessmentId);
        if (test.status !== "active")
          throw new Error("This sample assessment is not active.");
        if (["submitted", "evaluated"].includes(a.status))
          throw new Error("This sample assessment has already been submitted.");
        if (a.status === "assigned") {
          a.status = "in_progress";
          a.startedAt = now();
        }
        if (
          assignmentAction === "answer" ||
          assignmentAction === "submit-answer"
        ) {
          const qId = integer(data.questionId ?? data.stepNumber, 0, 1, 100000);
          const q = required(
            test.questions.find((q) => q.id === qId),
            "Question",
          );
          const answer = text(data, "answer");
          const answerRecord = { questionId: q.id, answer, timestamp: now() };
          const index = a.answers.findIndex((item) => item.questionId === q.id);
          if (index >= 0) a.answers[index] = answerRecord;
          else a.answers.push(answerRecord);
        }
        if (assignmentAction === "submit") {
          a.submittedAt = now();
          a.timeTakenMinutes = integer(data.timeTakenMinutes, 0, 0, 100000);
          a.evaluatedAnswers = test.questions.map((q) => {
            const answer =
              a.answers
                .find((item) => item.questionId === q.id)
                ?.answer.trim() || "";
            const expected = q.correctAnswer?.trim().toUpperCase();
            const correct =
              q.type === "multiple_choice" &&
              !!expected &&
              (answer.toUpperCase() === expected ||
                answer.toUpperCase().startsWith(expected + ")") ||
                answer.toUpperCase().startsWith(expected + ". "));
            return {
              questionId: q.id,
              score: correct ? q.marks : 0,
              maxMarks: q.marks,
              feedback:
                q.type !== "multiple_choice"
                  ? "Awaiting human review; this preview does not perform AI grading."
                  : correct
                    ? "Correct sample answer."
                    : answer
                      ? "Incorrect sample answer."
                      : "No answer provided.",
              isCorrect: correct,
            };
          });
          a.score = a.evaluatedAnswers.reduce(
            (sum, answer) => sum + answer.score,
            0,
          );
          a.percentage = Math.round((a.score / test.totalMarks) * 100);
          a.correctAnswersCount = a.evaluatedAnswers.filter(
            (answer) => answer.isCorrect,
          ).length;
          const pending = test.questions.some(
            (q) => q.type !== "multiple_choice",
          );
          a.status = pending ? "submitted" : "evaluated";
          a.passed = !pending && a.percentage >= test.passingScore;
          a.grade = pending
            ? "—"
            : a.percentage >= 80
              ? "A"
              : a.percentage >= 65
                ? "B"
                : a.percentage >= 50
                  ? "C"
                  : "F";
          a.overallFeedback = pending
            ? "Open responses await human review. No AI evaluation occurs in this preview."
            : "Scored locally against the sample answer key. This is not a verified employment assessment.";
          note(
            db,
            RECRUITER_ID,
            "Sample assessment completed",
            a.candidateName + " submitted " + test.title,
            a.id,
          );
        }
        const value = assignmentView(db, a, user);
        return { ...value, score: a.percentage };
      }
      if (assignmentAction === "evaluate")
        throw new Error(
          "AI evaluation is disabled. This preview only scores sample multiple-choice questions locally.",
        );
    }
    recruiter(user);
    const test = assessment(db, id);
    if (method === "GET" && action === "assignments")
      return db.assignments
        .filter((a) => a.assessmentId === id)
        .map((a) => assignmentView(db, a, user));
    if (method === "GET" && !action) return assessmentView(db, test);
    if (method === "POST" && action === "archive") {
      if (test.status === "draft")
        throw new Error("Delete an unused draft instead of archiving it.");
      test.status = "archived";
      return assessmentView(db, test);
    }
    if (method === "POST" && action === "launch") {
      if (test.status !== "draft")
        throw new Error("Only a draft can be launched.");
      const latest = db.screenings.find((s) => s.jobId === test.jobId);
      const supplied = Array.isArray(data.candidateIds)
        ? data.candidateIds.map(String)
        : [];
      const recipients = [
        ...new Set(
          supplied.length
            ? supplied
            : latest?.shortlist
                .slice(0, integer(data.topN, 5, 1, 100))
                .map((c) => c.candidateId) || [],
        ),
      ];
      if (!recipients.length)
        throw new Error(
          "Choose candidates or create a sample shortlist before launching.",
        );
      recipients.forEach((id) => person(db, id));
      let assignmentsCreated = 0;
      for (const recipient of recipients) {
        if (
          db.assignments.some(
            (a) => a.assessmentId === test.id && a.candidateId === recipient,
          )
        )
          continue;
        const c = person(db, recipient);
        const value: DemoAssignment = {
          id: makeId("assignment"),
          _id: "",
          assessmentId: test.id,
          candidateId: c.id,
          candidateName: c.name,
          candidateEmail: c.email,
          candidateType:
            c.source === "portal" ? "portal_user" : "manual_candidate",
          status: "assigned",
          assignedAt: now(),
          createdAt: now(),
          answers: [],
          evaluatedAnswers: [],
          score: 0,
          percentage: 0,
          passed: false,
          correctAnswersCount: 0,
          timeTakenMinutes: 0,
          sessionIntegrity: 0,
          sessionStatus: "Demo — not proctored",
          integrityViolations: [],
          overallFeedback: "",
          strengths: [],
          weaknesses: [],
          grade: "",
        };
        value._id = value.id;
        db.assignments.unshift(value);
        assignmentsCreated++;
        note(db, c.id, "Sample assessment assigned", test.title, value.id);
      }
      test.status = "active";
      test.launchedAt = now();
      return { assessment: assessmentView(db, test), assignmentsCreated };
    }
    if (test.status !== "draft")
      throw new Error("Only draft assessments can be edited or deleted.");
    if (method === "DELETE" && !action) {
      db.assessments = db.assessments.filter((a) => a.id !== id);
      return { success: true };
    }
    if (action === "questions") {
      if (method === "POST") {
        const q = data.question as Payload;
        const question = validateQuestions([
          { ...q, id: Math.max(0, ...test.questions.map((q) => q.id)) + 1 },
        ])[0];
        test.questions.push(question);
      }
      if (method === "PATCH" || method === "DELETE") {
        const qId = integer(questionId, 0, 1, 100000);
        const index = test.questions.findIndex((q) => q.id === qId);
        if (index < 0) throw new Error("Question not found.");
        if (method === "DELETE") {
          if (test.questions.length === 1)
            throw new Error("Keep at least one question.");
          test.questions.splice(index, 1);
        } else
          test.questions[index] = validateQuestions([
            { ...test.questions[index], ...data, id: qId },
          ])[0];
      }
      recalculate(test);
      return assessmentView(db, test);
    }
    if (method === "PATCH" && !action) {
      if (data.questions) test.questions = validateQuestions(data.questions);
      if (data.title !== undefined) {
        const title = text(data, "title");
        if (!title) throw new Error("A title is required.");
        test.title = title;
      }
      if (data.instructions !== undefined)
        test.instructions = text(data, "instructions");
      if (data.durationMinutes !== undefined)
        test.durationMinutes = integer(data.durationMinutes, 20, 1, 600);
      if (data.timeLimitPerQuestion !== undefined)
        test.timeLimitPerQuestion = integer(
          data.timeLimitPerQuestion,
          120,
          5,
          3600,
        );
      if (data.passingScore !== undefined)
        test.passingScore = integer(data.passingScore, 70, 0, 100);
      recalculate(test);
      return assessmentView(db, test);
    }
  }
  throw new Error(
    "This action has not been modeled in the frontend preview: " +
      method +
      " " +
      path,
  );
}
/** Local transport only. There is deliberately no HTTP fallback or environment switch. */
export async function demoRequest<T>(
  path: string,
  options: RequestInit = {},
): Promise<T> {
  if (!path.startsWith("/") || path.startsWith("//") || path.includes("://"))
    throw new Error("Only local preview paths are supported.");
  if (options.signal?.aborted)
    throw new DOMException("Preview request cancelled.", "AbortError");
  const parsed = new URL(path, "https://frontend-preview.invalid");
  const method = (options.method || "GET").toUpperCase();
  if (!["GET", "POST", "PATCH", "DELETE"].includes(method))
    throw new Error("Unsupported preview method.");
  const data = await payload(options.body);
  const execute = (db: DemoDatabase) =>
    route(db, parsed.pathname, method, data, parsed.searchParams);
  return (
    method === "GET" ? readDemoDatabase(execute) : updateDemoDatabase(execute)
  ) as T;
}
