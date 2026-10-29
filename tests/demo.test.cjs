/* eslint-disable @typescript-eslint/no-require-imports */
const { test, beforeEach, after } = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const Module = require("node:module");
const ts = require("typescript");
const root = path.resolve(__dirname, "..");
const originalResolve = Module._resolveFilename;
Module._resolveFilename = function (request, ...args) {
  return originalResolve.call(
    this,
    request.startsWith("@/") ? path.join(root, request.slice(2)) : request,
    ...args,
  );
};
require.extensions[".ts"] = function (module, filename) {
  const source = fs.readFileSync(filename, "utf8");
  const output = ts.transpileModule(source, {
    fileName: filename,
    compilerOptions: {
      module: ts.ModuleKind.CommonJS,
      jsx: ts.JsxEmit.ReactJSX,
      target: ts.ScriptTarget.ES2022,
      esModuleInterop: true,
    },
  });
  module._compile(output.outputText, filename);
};
require.extensions[".tsx"] = require.extensions[".ts"];
const storage = new Map();
const events = new EventTarget();
global.window = {
  localStorage: {
    getItem: (key) => storage.get(key) ?? null,
    setItem: (key, value) => storage.set(key, value),
    removeItem: (key) => storage.delete(key),
  },
  dispatchEvent: (event) => events.dispatchEvent(event),
  addEventListener: (...args) => events.addEventListener(...args),
  removeEventListener: (...args) => events.removeEventListener(...args),
};
let networkCalls = 0;
global.fetch = async () => {
  networkCalls++;
  throw Error("Network access is forbidden in frontend review tests.");
};
global.WebSocket = class {
  constructor() {
    networkCalls++;
    throw Error("Sockets are forbidden in frontend review tests.");
  }
};
const { apiFetch } = require("../lib/api.ts");
const store = require("../lib/demo/store.ts");
const { makeStore } = require("../lib/store/store.ts");
const {
  enterPreviewSession,
  logout,
} = require("../lib/store/features/authSlice.ts");
const { fetchJobs } = require("../lib/store/features/jobsSlice.ts");
const { fetchProfile } = require("../lib/store/features/profileSlice.ts");
const request = (url, method = "GET", data) =>
  apiFetch(url, { method, ...(data ? { body: JSON.stringify(data) } : {}) });
const enter = (role) => request("/auth/preview", "POST", { role });
beforeEach(() => {
  store.resetDemoDatabase();
  networkCalls = 0;
});
after(() => {
  assert.equal(networkCalls, 0, "No network or socket calls were attempted.");
});

test("explicit demo access, no credential persistence or live URL fallback", async () => {
  await assert.rejects(request("/jobs"), /Preview session/);
  const user = await request("/auth/preview", "POST", {
    role: "recruiter",
    password: "NEVER_PERSIST_THIS",
    token: "NEVER_PERSIST_TOKEN",
  });
  assert.equal(user.role, "recruiter");
  const serialized = storage.get(store.DEMO_STORAGE_KEY);
  assert.ok(!serialized.includes("NEVER_PERSIST"));
  assert.ok(!serialized.includes('"token"'));
  await assert.rejects(
    request("https://api.example.invalid/jobs"),
    /Only local/,
  );
  await assert.rejects(request("//example.invalid/jobs"), /Only local/);
  assert.equal(networkCalls, 0);
});

test("job CRUD is persisted and failed changes roll back atomically", async () => {
  await enter("recruiter");
  const before = await request("/jobs");
  const job = await request("/jobs", "POST", {
    title: "Sample accessibility engineer",
    company: "Fictional Studio",
    applicantsTarget: 12,
  });
  assert.equal((await request("/jobs")).length, before.length + 1);
  await request("/jobs/" + job.id, "PATCH", { title: "Updated sample role" });
  assert.equal((await request("/jobs/" + job.id)).title, "Updated sample role");
  const snapshot = storage.get(store.DEMO_STORAGE_KEY);
  await assert.rejects(
    request("/jobs/" + job.id, "PATCH", {
      title: "Should not save",
      applicantsTarget: -5,
    }),
    /whole number/,
  );
  assert.equal(storage.get(store.DEMO_STORAGE_KEY), snapshot);
  await request("/jobs/" + job.id, "DELETE");
  await assert.rejects(request("/jobs/" + job.id), /not found/);
});

test("candidate CRUD and cloned reads do not mutate stored records", async () => {
  await enter("recruiter");
  const sample = await request("/candidates", "POST", {
    name: "Fictional Person",
    email: "fictional@example.invalid",
    skills: "React, Testing",
    jobId: "job-1",
  });
  assert.deepEqual(sample.skills, ["React", "Testing"]);
  sample.skills.push("Unpersisted");
  assert.deepEqual((await request("/candidates/" + sample.id)).skills, [
    "React",
    "Testing",
  ]);
  await request("/candidates/" + sample.id, "PATCH", {
    name: "Updated fictional person",
  });
  assert.equal(
    (await request("/candidates/" + sample.id)).name,
    "Updated fictional person",
  );
  await request("/candidates/" + sample.id, "DELETE");
  await assert.rejects(request("/candidates/" + sample.id), /not found/);
});

test("candidate permissions and profile ownership cannot be changed by submitted fields", async () => {
  await enter("candidate");
  await assert.rejects(request("/candidates"), /recruiter preview/);
  await assert.rejects(request("/jobs/job-1", "DELETE"), /recruiter preview/);
  const profile = await request("/profile/basic-info", "PATCH", {
    userId: "demo-recruiter",
    role: "recruiter",
    headline: "Local frontend engineer",
  });
  assert.equal(profile.userId, "candidate-1");
  assert.equal(profile.headline, "Local frontend engineer");
  assert.equal((await request("/auth/me")).role, "candidate");
  await request("/profile/skills", "POST", {
    name: "Accessibility",
    proficiency: "Advanced",
  });
  assert.equal((await request("/profile")).skills.at(-1).name, "Accessibility");
});

test("application workflow persists, deduplicates and creates recipient notifications", async () => {
  await enter("candidate");
  const application = await request("/applications", "POST", {
    jobId: "job-2",
  });
  assert.equal(application.jobId.id, "job-2");
  await assert.rejects(
    request("/applications", "POST", { jobId: "job-2" }),
    /already applied/,
  );
  await enter("recruiter");
  const applications = await request("/applications/job/job-2");
  assert.equal(
    applications.find((a) => a.id === application.id).candidateId,
    "candidate-1",
  );
  await request("/applications/" + application.id + "/status", "PATCH", {
    status: "reviewed",
  });
  await enter("candidate");
  assert.equal(
    (await request("/applications/my")).find((a) => a.id === application.id)
      .status,
    "reviewed",
  );
  assert.ok(
    (await request("/notifications")).some(
      (n) => n.referenceId === application.id,
    ),
  );
});

test("screening is clearly sample data and linked to actual sample records", async () => {
  await enter("recruiter");
  const result = await request("/screening/run", "POST", {
    jobId: "job-1",
    topN: 2,
  });
  assert.equal(result.shortlist.length, 2);
  assert.ok(
    result.shortlist.every((c) => c.summary.includes("No model or backend")),
  );
  assert.equal((await request("/screening/" + result.id)).jobId, "job-1");
  const draft = await request("/screening/create-assessment", "POST", {
    jobId: "job-1",
  });
  assert.equal(draft.status, "draft");
});

test("launch validation is atomic, deduplicates selected people and locks active drafts", async () => {
  await enter("recruiter");
  const snapshot = storage.get(store.DEMO_STORAGE_KEY);
  await assert.rejects(
    request("/assessments/assessment-1/launch", "POST", {
      candidateIds: ["candidate-1", "missing"],
    }),
    /not found/,
  );
  assert.equal(storage.get(store.DEMO_STORAGE_KEY), snapshot);
  const result = await request("/assessments/assessment-1/launch", "POST", {
    candidateIds: ["candidate-1", "candidate-1", "candidate-3"],
  });
  assert.equal(result.assignmentsCreated, 2);
  assert.equal(result.assessment.status, "active");
  assert.equal(
    (await request("/assessments/assessment-1/assignments")).length,
    2,
  );
  await assert.rejects(
    request("/assessments/assessment-1", "PATCH", { title: "Cannot edit" }),
    /Only draft/,
  );
});

test("candidate session saves, resumes and scores against the actual question IDs", async () => {
  await enter("recruiter");
  await request("/assessments/assessment-1", "PATCH", {
    questions: [
      {
        id: 9,
        type: "multiple_choice",
        question: "Choose the sample key",
        options: ["A) Yes", "B) No"],
        correctAnswer: "A",
        marks: 20,
      },
    ],
  });
  await request("/assessments/assessment-1/launch", "POST", {
    candidateIds: ["candidate-1"],
  });
  const assignments = await request("/assessments/assessment-1/assignments");
  const id = assignments[0].id;
  await enter("candidate");
  const initial = await request("/assessments/" + id);
  assert.equal(initial.questions[0].id, 9);
  assert.equal(initial.questions[0].correctAnswer, undefined);
  await request("/assessments/" + id + "/start", "POST");
  const started = (await request("/assessments/" + id)).startedAt;
  await assert.rejects(
    request("/assessments/" + id + "/answer", "POST", {
      questionId: 1,
      answer: "A",
    }),
    /Question/,
  );
  await request("/assessments/" + id + "/answer", "POST", {
    questionId: 9,
    answer: "A) Yes",
  });
  assert.equal(
    (await request("/assessments/" + id)).answers[0].answer,
    "A) Yes",
  );
  await request("/assessments/" + id + "/start", "POST");
  assert.equal((await request("/assessments/" + id)).startedAt, started);
  const result = await request("/assessments/" + id + "/submit", "POST", {
    timeTakenMinutes: 2,
  });
  assert.equal(result.status, "evaluated");
  assert.equal(result.percentage, 100);
  assert.equal(result.passed, true);
  assert.equal(
    (await request("/assessments/" + id)).questions[0].correctAnswer,
    "A",
  );
  await assert.rejects(
    request("/assessments/" + id + "/answer", "POST", {
      questionId: 9,
      answer: "B",
    }),
    /already been submitted/,
  );
  await assert.rejects(
    request("/assessments/" + id + "/submit", "POST"),
    /already been submitted/,
  );
});

test("open responses remain pending human review and cross-candidate results are blocked", async () => {
  await enter("recruiter");
  await request("/assessments/assessment-1", "PATCH", {
    questions: [
      {
        id: 12,
        type: "open_ended",
        question: "Describe your approach",
        marks: 20,
      },
    ],
  });
  await request("/assessments/assessment-1/launch", "POST", {
    candidateIds: ["candidate-1"],
  });
  const id = (await request("/assessments/assessment-1/assignments"))[0].id;
  await enter("candidate");
  await assert.rejects(
    request("/assessments/assignment-2"),
    /another candidate/,
  );
  await request("/assessments/" + id + "/answer", "POST", {
    questionId: 12,
    answer: "A fictional response",
  });
  const result = await request("/assessments/" + id + "/submit", "POST");
  assert.equal(result.status, "submitted");
  assert.equal(result.passed, false);
  assert.match(result.overallFeedback, /human review/);
});

test("notifications stay scoped to the current sample recipient", async () => {
  await enter("recruiter");
  const recruiterNotifications = await request("/notifications");
  await enter("candidate");
  await assert.rejects(
    request(
      "/notifications/" + recruiterNotifications[0].id + "/read",
      "PATCH",
    ),
    /not found/,
  );
  await request("/notifications/read-all", "POST");
  assert.ok((await request("/notifications")).every((n) => n.read));
  await enter("recruiter");
  assert.equal((await request("/notifications"))[0].read, false);
});

test("files keep metadata only and unsupported services fail explicitly", async () => {
  await enter("candidate");
  const data = new FormData();
  data.append(
    "resume",
    new Blob(["DO_NOT_PERSIST_FILE_CONTENTS"], { type: "application/pdf" }),
    "fictional-resume.pdf",
  );
  const profile = await apiFetch("/profile/resume", {
    method: "POST",
    body: data,
  });
  assert.equal(profile.resumeName, "fictional-resume.pdf");
  assert.equal(profile.resumeUrl, undefined);
  assert.ok(
    !storage
      .get(store.DEMO_STORAGE_KEY)
      .includes("DO_NOT_PERSIST_FILE_CONTENTS"),
  );
  await assert.rejects(
    request("/profile/change-password", "PATCH", {
      newPassword: "DO_NOT_PERSIST_PASSWORD",
    }),
    /not created/,
  );
  await enter("recruiter");
  await assert.rejects(request("/screening/upload", "POST"), /not enabled/);
  await assert.rejects(
    request("/unmodeled-action", "POST"),
    /not been modeled/,
  );
  assert.equal(networkCalls, 0);
});

test("abort signals are respected before a preview mutation", async () => {
  await enter("recruiter");
  const controller = new AbortController();
  controller.abort();
  const snapshot = storage.get(store.DEMO_STORAGE_KEY);
  await assert.rejects(
    apiFetch("/jobs", {
      method: "POST",
      signal: controller.signal,
      body: JSON.stringify({ title: "Cancelled", company: "Fictional" }),
    }),
    { name: "AbortError" },
  );
  assert.equal(storage.get(store.DEMO_STORAGE_KEY), snapshot);
});

test("role switches and logout clear the previous Redux workspace", async () => {
  const redux = makeStore();
  await redux.dispatch(enterPreviewSession("recruiter"));
  await redux.dispatch(fetchJobs());
  await redux.dispatch(fetchProfile());
  assert.ok(redux.getState().jobs.jobs.length);
  assert.equal(redux.getState().profile.profile.userId, "demo-recruiter");
  await redux.dispatch(enterPreviewSession("candidate"));
  assert.equal(redux.getState().jobs.jobs.length, 0);
  assert.equal(redux.getState().profile.profile, null);
  assert.equal(redux.getState().auth.role, "candidate");
  redux.dispatch(logout());
  assert.equal(redux.getState().auth.isAuthenticated, false);
  await assert.rejects(request("/auth/me"), /Preview session/);
});

test("local edits survive a transport reload and reset restores the seed", async () => {
  await enter("recruiter");
  await request("/jobs", "POST", {
    title: "Persisted sample",
    company: "Fictional",
  });
  delete require.cache[require.resolve("../lib/demo/store.ts")];
  delete require.cache[require.resolve("../lib/demo/transport.ts")];
  const reloadedStore = require("../lib/demo/store.ts");
  const { demoRequest } = require("../lib/demo/transport.ts");
  assert.ok(
    (await demoRequest("/jobs")).some((j) => j.title === "Persisted sample"),
  );
  reloadedStore.resetDemoDatabase();
  assert.equal(reloadedStore.getDemoDatabase().jobs.length, 6);
  assert.equal(reloadedStore.getDemoDatabase().sessionUserId, null);
});

test("frontend source has no live HTTP, socket, microphone or camera wiring", () => {
  const files = [];
  function walk(dir) {
    for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
      const location = path.join(dir, entry.name);
      if (entry.isDirectory()) walk(location);
      else if (/\.tsx?$/.test(location)) files.push(location);
    }
  }
  for (const dir of ["app", "components", "lib"]) walk(path.join(root, dir));
  for (const file of files) {
    const ast = ts.createSourceFile(
      file,
      fs.readFileSync(file, "utf8"),
      ts.ScriptTarget.Latest,
      true,
      /\.tsx$/.test(file) ? ts.ScriptKind.TSX : ts.ScriptKind.TS,
    );
    function visit(node) {
      if (ts.isCallExpression(node) || ts.isNewExpression(node)) {
        const name = node.expression.getText(ast);
        const staticFont = name === "fetch" && ts.isStringLiteral(node.arguments[0]) && ["/fonts/manrope/Manrope-Regular.ttf", "/fonts/manrope/Manrope-Bold.ttf"].includes(node.arguments[0].text);
        assert.ok(
          staticFont || !/(^|\.)(fetch|WebSocket|EventSource|SpeechRecognition|webkitSpeechRecognition|getUserMedia)$/.test(
            name,
          ),
          "Forbidden live wiring in " + path.relative(root, file) + ": " + name,
        );
      }
      if (ts.isImportDeclaration(node))
        assert.ok(
          !/socket\.io|axios|SocketProvider/.test(node.moduleSpecifier.text),
          "Live dependency imported in " + file,
        );
      ts.forEachChild(node, visit);
    }
    visit(ast);
  }
  assert.equal(fs.existsSync(path.join(root, "lib/socket.ts")), false);
  assert.equal(
    fs.existsSync(path.join(root, "components/providers/SocketProvider.tsx")),
    false,
  );
});

test("intelligence migrates existing preview data without replacing edits and scopes candidate records", async () => {
  await enter("recruiter");
  await request("/jobs/job-1", "PATCH", { title: "Preserved fictional role" });
  const recruiter = await request("/intelligence");
  assert.equal(recruiter.templates.length, 4);
  assert.ok(
    recruiter.candidates.every((c) => c.email === "Hidden during review"),
  );
  assert.equal(
    recruiter.jobs.find((j) => j.id === "job-1").title,
    "Preserved fictional role",
  );
  await enter("candidate");
  const view = await request("/intelligence");
  assert.ok(view.evidence.every((e) => e.candidateId === "candidate-1"));
  assert.ok(view.credentials.every((c) => c.candidateId === "candidate-1"));
  assert.equal(view.costs.length, 0);
  assert.equal(view.audit.length, 0);
  assert.equal(view.rediscovery.length, 0);
  await assert.rejects(
    request("/intelligence/workflow-plan", "POST", { jobId: "job-1" }),
    /recruiter/i,
  );
});

test("candidate corrections require human decisions and retain original source evidence", async () => {
  await enter("candidate");
  let view = await request("/intelligence");
  const evidence = view.evidence[0];
  view = await request("/intelligence/evidence-correct", "POST", {
    id: evidence.id,
    text: "My role was implementation and testing.",
  });
  assert.equal(view.evidence[0].correction.status, "pending");
  await assert.rejects(
    request("/intelligence/evidence-correct", "POST", {
      id: evidence.id,
      text: "Duplicate",
    }),
    /already/,
  );
  await assert.rejects(
    request("/intelligence/evidence-correct", "POST", {
      id: "evidence-candidate-2-0",
      text: "Cannot edit another person",
    }),
    /another candidate/,
  );
  await enter("recruiter");
  await assert.rejects(
    request("/intelligence/evidence-resolve", "POST", {
      id: evidence.id,
      status: "supported",
      accept: true,
    }),
    /reason/,
  );
  view = await request("/intelligence/evidence-resolve", "POST", {
    id: evidence.id,
    status: "supported",
    accept: true,
    reason: "Reviewed the source and candidate clarification.",
  });
  const changed = view.evidence.find((e) => e.id === evidence.id);
  assert.equal(changed.claim, "My role was implementation and testing.");
  assert.equal(changed.excerpt, evidence.excerpt);
  assert.equal(changed.correction.status, "accepted");
  assert.ok(view.audit.some((a) => a.action === "evidence_override"));
});

test("local extraction leaves declared skills unverified and records provenance", async () => {
  await enter("candidate");
  const view = await request("/intelligence/evidence-extract", "POST", {
    source: "Portfolio",
    content: "A fictional project built with React and TypeScript.",
    jobId: "job-1",
  });
  const extracted = view.evidence.filter(
    (e) => e.reference === "Pasted sample text",
  );
  assert.ok(extracted.length >= 2);
  assert.ok(
    extracted.every(
      (e) => e.status === "unverified" && e.source === "Portfolio",
    ),
  );
  await assert.rejects(
    request("/intelligence/evidence-extract", "POST", {
      candidateId: "candidate-2",
      source: "CV",
      content: "React",
    }),
    /another candidate/,
  );
});

test("structured screening clarifies short answers and preserves a common rubric without machine scoring", async () => {
  await enter("candidate");
  let view = await request("/intelligence/screening-start", "POST", {
    jobId: "job-1",
  });
  const session = view.screenings[0];
  view = await request("/intelligence/screening-answer", "POST", {
    id: session.id,
    answer: "I built a feature.",
  });
  assert.equal(view.screenings[0].turns.at(-1).followUp, true);
  assert.equal(view.screenings[0].competency, 0);
  for (let i = 0; i < 3; i++)
    view = await request("/intelligence/screening-answer", "POST", {
      id: session.id,
      answer:
        "I clarified the requirement, implemented a sample solution, reviewed the trade-offs, added tests and documented the observable result for the stakeholder.",
    });
  assert.equal(view.screenings[0].status, "awaiting_review");
  assert.deepEqual(view.screenings[0].scores, []);
  await assert.rejects(
    request("/intelligence/screening-answer", "POST", {
      id: session.id,
      answer: "Cannot resubmit",
    }),
    /already/,
  );
  await enter("recruiter");
  const criteria = require("../lib/intelligence/seed.ts").competencies(
    view.jobs.find((j) => j.id === "job-1"),
  );
  view = await request("/intelligence/screening-review", "POST", {
    id: session.id,
    scores: criteria.map((criterion) => ({
      criterion,
      score: 3,
      reason: "The saved response describes actions, trade-offs and tests.",
    })),
  });
  assert.equal(view.screenings[0].status, "reviewed");
  assert.equal(view.screenings[0].scores.length, criteria.length);
});

test("simulation drafts resume and submitted artifacts require complete human rubric review", async () => {
  await enter("candidate");
  let view = await request("/intelligence/simulation-save", "POST", {
    templateId: "debug",
    answer: "Fictional code and explanation. Tools used: documentation.",
  });
  assert.equal(view.simulations[0].status, "draft");
  assert.match(
    (await request("/intelligence")).simulations[0].answer,
    /Fictional code/,
  );
  view = await request("/intelligence/simulation-save", "POST", {
    templateId: "debug",
    answer: "Updated fictional code and tests.",
    submit: true,
  });
  const response = view.simulations[0];
  assert.equal(response.status, "submitted");
  assert.equal(response.scores.length, 0);
  await assert.rejects(
    request("/intelligence/simulation-save", "POST", {
      templateId: "debug",
      answer: "Later edit",
    }),
    /already/,
  );
  await enter("recruiter");
  await assert.rejects(
    request("/intelligence/simulation-review", "POST", {
      id: response.id,
      scores: [],
      feedback: "Incomplete",
    }),
    /every rubric/,
  );
  const template = view.templates.find((t) => t.id === "debug");
  view = await request("/intelligence/simulation-review", "POST", {
    id: response.id,
    scores: template.rubric.map((r) => ({
      criterion: r.id,
      score: 3,
      reason: "The saved artifact addresses this criterion.",
    })),
    feedback: "Clear explanation. Add a decimal-precision example.",
    checks: [template.checks[0], "Unknown test"],
  });
  assert.equal(view.simulations[0].status, "reviewed");
  assert.deepEqual(view.simulations[0].checks, [template.checks[0]]);
});

test("workflow planning deduplicates actions and approved organization updates the real local application", async () => {
  await enter("candidate");
  const application = await request("/applications", "POST", {
    jobId: "job-2",
  });
  await enter("recruiter");
  let view = await request("/intelligence/workflow-plan", "POST", {
    jobId: "job-2",
  });
  const count = view.tasks.length;
  view = await request("/intelligence/workflow-plan", "POST", {
    jobId: "job-2",
  });
  assert.equal(view.tasks.length, count);
  const task = view.tasks.find(
    (t) =>
      t.kind === "organize" &&
      t.candidateId === "candidate-1" &&
      t.jobId === "job-2",
  );
  await assert.rejects(
    request("/intelligence/workflow-run", "POST", { id: task.id }),
    /Approve/,
  );
  await request("/intelligence/workflow-decide", "POST", {
    id: task.id,
    approve: true,
    reason: "Review intake with the agreed criteria.",
  });
  view = await request("/intelligence/workflow-run", "POST", { id: task.id });
  assert.equal(
    view.applications.find((a) => a.id === application.id).status,
    "reviewed",
  );
  assert.equal(
    view.tasks.find((t) => t.id === task.id).status,
    "preview_completed",
  );
  assert.ok(
    view.journeys
      .find((j) => j.id === application.id)
      .history.some((e) => e.stage === "reviewed"),
  );
  await assert.rejects(
    request("/intelligence/workflow-run", "POST", { id: task.id }),
    /Approve/,
  );
});

test("approved external workflow drafts never claim email or calendar delivery", async () => {
  await enter("recruiter");
  let view = await request("/intelligence");
  const task = view.tasks.find((t) => t.kind === "schedule");
  await request("/intelligence/workflow-decide", "POST", {
    id: task.id,
    approve: true,
    reason: "Approve proposed slots for local review.",
    body: "Draft slots only; calendar availability has not been checked.",
  });
  view = await request("/intelligence/workflow-run", "POST", { id: task.id });
  const result = view.tasks.find((t) => t.id === task.id);
  assert.equal(result.status, "ready_for_integration");
  assert.match(result.reason, /No message, calendar invite/);
});

test("journey changes notify the candidate and closed applications cannot be silently reopened", async () => {
  await enter("recruiter");
  let view = await request("/intelligence/journey-stage", "POST", {
    id: "application-1",
    status: "shortlisted",
    reason: "Evidence review complete.",
    nextStep: "Prepare a work sample.",
    expectedDate: "2099-01-01",
  });
  assert.ok(
    view.journeys[0].history.some(
      (e) => e.note === "Evidence review complete.",
    ),
  );
  await enter("candidate");
  view = await request("/intelligence");
  assert.equal(view.journeys[0].nextStep, "Prepare a work sample.");
  assert.ok(
    (await request("/notifications")).some(
      (n) => n.title === "Application timeline updated",
    ),
  );
  await request("/intelligence/journey-withdraw", "POST", {
    id: "application-1",
  });
  await enter("recruiter");
  await assert.rejects(
    request("/intelligence/journey-stage", "POST", {
      id: "application-1",
      status: "pending",
      reason: "Cannot reopen",
    }),
    /closed application/,
  );
});

test("audit controls are recruiter-only and changes require a reason", async () => {
  await enter("candidate");
  await assert.rejects(
    request("/intelligence/audit-settings", "POST", {
      maskIdentities: false,
      reason: "Not permitted",
    }),
    /recruiter/i,
  );
  await enter("recruiter");
  await assert.rejects(
    request("/intelligence/audit-settings", "POST", { maskIdentities: false }),
    /reason/,
  );
  const view = await request("/intelligence/audit-settings", "POST", {
    maskIdentities: false,
    aggregatePermission: true,
    reason: "Review synthetic aggregate example.",
  });
  assert.equal(view.aggregatePermission, true);
  assert.equal(view.candidates[0].name, "Amara Niyonzima");
  assert.ok(view.audit.some((a) => a.action === "audit_settings"));
});

test("ROI measurements reject invalid data atomically and retain actual record sources", async () => {
  await enter("recruiter");
  const before = storage.get(store.DEMO_STORAGE_KEY);
  await assert.rejects(
    request("/intelligence/roi-entry", "POST", {
      kind: "cost",
      jobId: "job-1",
      category: "Time",
      amount: -1,
      note: "Invalid",
    }),
    /valid amount/,
  );
  assert.equal(storage.get(store.DEMO_STORAGE_KEY), before);
  const view = await request("/intelligence/roi-entry", "POST", {
    kind: "time",
    jobId: "job-1",
    phase: "assisted",
    minutes: 30,
    candidateCount: 6,
    note: "Recorded fictional screening batch.",
  });
  assert.equal(view.times.at(-1).candidateCount, 6);
  assert.equal(view.times.at(-1).minutes, 30);
});

test("rediscovery consent is respected at discovery, draft creation and execution", async () => {
  await enter("candidate");
  await request("/intelligence/consent", "POST", {
    discoverable: true,
    contactAllowed: true,
    expiresAt: "2099-01-01",
  });
  await enter("recruiter");
  let view = await request("/intelligence");
  assert.ok(view.rediscovery.some((c) => c.candidateId === "candidate-1"));
  view = await request("/intelligence/workflow-create", "POST", {
    kind: "outreach",
    candidateId: "candidate-1",
    jobId: "job-2",
    title: "Draft relevant outreach",
    body: "Review the declared skills before contact.",
  });
  const task = view.tasks[0];
  await request("/intelligence/workflow-decide", "POST", {
    id: task.id,
    approve: true,
    reason: "Relevant sample vacancy.",
  });
  await enter("candidate");
  await request("/intelligence/consent", "POST", {
    discoverable: false,
    contactAllowed: false,
    expiresAt: "2099-01-01",
  });
  await enter("recruiter");
  view = await request("/intelligence");
  assert.ok(!view.rediscovery.some((c) => c.candidateId === "candidate-1"));
  await assert.rejects(
    request("/intelligence/workflow-run", "POST", { id: task.id }),
    /withdrawn/,
  );
});

test("expired consent can be withdrawn and deletion review immediately disables discovery", async () => {
  await enter("candidate");
  await request("/intelligence/consent", "POST", {
    discoverable: false,
    contactAllowed: false,
    expiresAt: "2020-01-01",
  });
  await assert.rejects(
    request("/intelligence/consent", "POST", {
      discoverable: true,
      contactAllowed: true,
      expiresAt: "2020-01-01",
    }),
    /future/,
  );
  let view = await request("/intelligence/consent", "POST", {
    discoverable: true,
    contactAllowed: true,
    expiresAt: "2099-01-01",
  });
  assert.equal(view.consents[0].discoverable, true);
  view = await request("/intelligence/consent", "POST", {
    deletionRequested: true,
    expiresAt: "2099-01-01",
  });
  assert.equal(view.consents[0].discoverable, false);
  assert.equal(view.consents[0].deletionRequested, true);
  await assert.rejects(
    request("/intelligence/consent", "POST", {
      discoverable: true,
      expiresAt: "2099-01-01",
    }),
    /deletion request/,
  );
  await enter("recruiter");
  assert.ok(
    (await request("/intelligence")).tasks.some(
      (t) => t.title === "Deletion review requested",
    ),
  );
});

test("verification consent never becomes issuer verification or erases a conflict", async () => {
  await enter("recruiter");
  await request("/intelligence/verification-request", "POST", {
    id: "credential-candidate-1",
  });
  await enter("candidate");
  let view = await request("/intelligence/verification-consent", "POST", {
    id: "credential-candidate-1",
    consent: true,
  });
  assert.equal(view.credentials[0].status, "ready_for_verification");
  assert.match(view.credentials[0].note, /not verified/);
  await assert.rejects(
    request("/intelligence/verification-consent", "POST", {
      id: "credential-candidate-2",
      consent: true,
    }),
    /another candidate/,
  );
  await enter("recruiter");
  await request("/intelligence/verification-flag", "POST", {
    id: "credential-candidate-1",
    reason: "Two supplied records show different dates.",
  });
  await enter("candidate");
  view = await request("/intelligence/verification-consent", "POST", {
    id: "credential-candidate-1",
    consent: false,
  });
  assert.equal(view.credentials[0].status, "conflict");
  assert.equal(view.credentials[0].consent, false);
});

test("language and accessibility preferences persist and create a reviewable adjustment request", async () => {
  await enter("candidate");
  let view = await request("/intelligence/preferences", "POST", {
    locale: "rw",
    largeText: true,
    lowBandwidth: true,
    format: "voice-request",
    adjustment: "Please provide a text alternative.",
  });
  assert.equal(view.preferences["candidate-1"].locale, "rw");
  assert.equal(view.preferences["candidate-1"].largeText, true);
  await assert.rejects(
    request("/intelligence/preferences", "POST", { locale: "unsupported" }),
    /Unsupported language/,
  );
  const {
    translate,
    screeningPrompt,
  } = require("../lib/intelligence/locale.ts");
  assert.equal(translate("fr", "save"), "Enregistrer");
  assert.match(screeningPrompt("rw", "Testing"), /Sobanura/);
  await enter("recruiter");
  view = await request("/intelligence");
  assert.ok(view.tasks.some((t) => t.title === "Accessibility adjustment"));
  assert.equal(view.preferences["candidate-1"].format, "voice-request");
});

test("sample reset clears feature work while preserving the existing no-backend architecture", async () => {
  await enter("candidate");
  await request("/intelligence/simulation-save", "POST", {
    templateId: "analysis",
    answer: "Fictional draft to reset.",
  });
  store.resetDemoDatabase();
  await enter("candidate");
  assert.equal((await request("/intelligence")).simulations.length, 0);
  assert.equal(networkCalls, 0);
});

test("unfinished screening answers can be saved and resumed without advancing the rubric", async () => {
  await enter("candidate");
  let view = await request("/intelligence/screening-start", "POST", {
    jobId: "job-1",
  });
  const id = view.screenings[0].id;
  await request("/intelligence/screening-draft", "POST", {
    id,
    answer: "An unfinished fictional example...",
  });
  view = await request("/intelligence");
  assert.equal(
    view.screenings[0].draftAnswer,
    "An unfinished fictional example...",
  );
  assert.equal(view.screenings[0].competency, 0);
  view = await request("/intelligence/screening-answer", "POST", {
    id,
    answer:
      "A complete fictional answer about a technical example, the actions I took, the trade-offs I assessed and the evidence supporting the outcome.",
  });
  assert.equal(view.screenings[0].draftAnswer, undefined);
});
test("reference and certificate claims are added as unchecked and ownership is enforced", async () => {
  await enter("candidate");
  let view = await request("/intelligence/credential-add", "POST", {
    kind: "reference",
    claim: "Sample professional reference",
    issuer: "Fictional employer",
  });
  const credential = view.credentials.at(-1);
  assert.equal(credential.kind, "reference");
  assert.equal(credential.status, "not_checked");
  assert.equal(credential.consent, false);
  await assert.rejects(
    request("/intelligence/credential-add", "POST", {
      candidateId: "candidate-2",
      kind: "certificate",
      claim: "Cannot add",
      issuer: "Sample",
    }),
    /another candidate/,
  );
});
test("all ten recruiter feature panels render with realistic local records without servers", async () => {
  await enter("candidate");
  let candidateView = await request("/intelligence/screening-start", "POST", {
    jobId: "job-1",
  });
  const screeningId = candidateView.screenings[0].id;
  for (let i = 0; i < 3; i++)
    candidateView = await request("/intelligence/screening-answer", "POST", {
      id: screeningId,
      answer:
        "I clarified the requirement, implemented the example, documented trade-offs, tested edge cases and explained the observable outcome with evidence.",
    });
  await request("/intelligence/simulation-save", "POST", {
    templateId: "debug",
    answer: "Sample artifact, reasoning and tests.",
    submit: true,
  });
  await enter("recruiter");
  const data = await request("/intelligence");
  const React = require("react");
  const { renderToStaticMarkup } = require("react-dom/server");
  const assessments = require("../components/intelligence/EvidenceAndAssessment.tsx");
  const operations = require("../components/intelligence/RecruitmentOperations.tsx");
  const trust = require("../components/intelligence/TrustAndAccess.tsx");
  const { translate } = require("../lib/intelligence/locale.ts");
  const props = {
    data,
    busy: false,
    perform: async () => true,
    t: (key) => translate("en", key),
  };
  const panels = [
    assessments.EvidencePanel,
    assessments.ScreeningPanel,
    assessments.SimulationsPanel,
    operations.WorkflowPanel,
    operations.JourneyPanel,
    trust.AuditPanel,
    operations.RoiPanel,
    trust.RediscoveryPanel,
    trust.VerificationPanel,
    trust.InclusionPanel,
  ];
  for (const Panel of panels) {
    const html = renderToStaticMarkup(React.createElement(Panel, props));
    assert.ok(
      html.includes("<section"),
      Panel.name + " should render a functional panel",
    );
    assert.ok(
      !/NaN|Infinity/.test(html),
      Panel.name + " should avoid fabricated numeric output",
    );
  }
});
test("candidate feature panels render in every supported locale without exposing other candidates", async () => {
  await enter("candidate");
  const data = await request("/intelligence");
  const React = require("react");
  const { renderToStaticMarkup } = require("react-dom/server");
  const a = require("../components/intelligence/EvidenceAndAssessment.tsx"),
    o = require("../components/intelligence/RecruitmentOperations.tsx"),
    p = require("../components/intelligence/TrustAndAccess.tsx");
  const { translate } = require("../lib/intelligence/locale.ts");
  for (const locale of ["en", "fr", "rw"])
    for (const Panel of [
      a.EvidencePanel,
      a.ScreeningPanel,
      a.SimulationsPanel,
      o.JourneyPanel,
      p.RediscoveryPanel,
      p.VerificationPanel,
      p.InclusionPanel,
    ]) {
      const html = renderToStaticMarkup(
        React.createElement(Panel, {
          data,
          busy: false,
          perform: async () => true,
          t: (key) => translate(locale, key),
        }),
      );
      assert.ok(html.includes("<section"));
      assert.ok(!html.includes("Liam Okafor"));
    }
});

test("public opportunity search combines keywords and location and hides inactive roles", () => {
  const { filterPublicJobs } = require("../lib/publicJobs.ts");
  const { createDemoSeed } = require("../lib/demo/seed.ts");
  const jobs = createDemoSeed().jobs;
  assert.equal(filterPublicJobs(jobs, "Frontend", "Kigali").length, 1);
  assert.equal(filterPublicJobs(jobs, "Frontend", "Remote").length, 0);
  assert.ok(
    filterPublicJobs(jobs, "", "Remote").every((j) => j.location === "Remote"),
  );
  const inactive = jobs.map((j) => ({ ...j, status: "draft" }));
  assert.equal(filterPublicJobs(inactive, "", "").length, 0);
  const publicRecord = filterPublicJobs(jobs, "", "")[0];
  assert.equal(publicRecord.createdBy, undefined);
  assert.equal(publicRecord.status, undefined);
});

test("custom location picker keyboard navigation wraps and supports Home and End", () => {
  const {
    opportunityLocations,
    moveLocationOption,
    locationOptionIndex,
  } = require("../lib/locations.ts");
  const last = opportunityLocations.length - 1;
  assert.equal(moveLocationOption(0, "ArrowUp"), last);
  assert.equal(moveLocationOption(last, "ArrowDown"), 0);
  assert.equal(moveLocationOption(2, "Home"), 0);
  assert.equal(moveLocationOption(2, "End"), last);
  assert.equal(locationOptionIndex("Cape Town"), 4);
  assert.equal(locationOptionIndex("Unknown place"), 0);
});
test("custom location control posts the selected value and keeps an accessible trigger", () => {
  const React = require("react"),
    { renderToStaticMarkup } = require("react-dom/server");
  const HeroSearch = require("../components/HeroSearch.tsx").default;
  const html = renderToStaticMarkup(
    React.createElement(HeroSearch, {
      query: "Designer",
      location: "Cape Town",
    }),
  );
  assert.match(html, /name="location" value="Cape Town"/);
  assert.match(html, /aria-haspopup="listbox"/);
  assert.match(html, /aria-expanded="false"/);
  assert.ok(html.includes("Preferred location: Cape Town"));
  assert.ok(!html.includes("<select"));
  assert.ok(html.includes('action="/opportunities"'));
});
test("expanded landing sections have valid navigation targets and contextual calls to action", () => {
  const React = require("react"),
    { renderToStaticMarkup } = require("react-dom/server");
  const Home = require("../app/page.tsx").default;
  const html = renderToStaticMarkup(React.createElement(Home));
  const ids = new Set(
    [...html.matchAll(/\bid="([^"]+)"/g)].map((match) => match[1]),
  );
  for (const match of html.matchAll(/href="\/?#([^"]+)"/g))
    assert.ok(ids.has(match[1]), "Missing target: " + match[1]);
  assert.equal((html.match(/<section/g) || []).length, 7);
  assert.ok(html.indexOf('id="services"') > html.indexOf('id="hero-title"'));
  assert.ok(html.includes("Hiring team"));
  assert.ok(html.includes("Your next hire"));
  assert.ok(!html.includes("Less guesswork. More context."));
  assert.ok(html.includes("Screeno home"));
  assert.ok(html.includes("Your hiring workspace"));
  assert.ok(!html.includes("TalentScreen"));
  assert.ok(html.includes("screeno-marquee-backing"));
});

test("demo verification enforces role, expiry, attempt limits and one-use challenges", () => {
  const auth = require("../lib/authPreview.ts");
  auth.beginAuthPreview("recruiter", "verify", 1000);
  assert.equal(auth.verifyAuthPreview("candidate", "123456", 1100).ok, false);
  assert.equal(auth.verifyAuthPreview("recruiter", "123456", 1100).ok, true);
  assert.equal(auth.verifyAuthPreview("recruiter", "123456", 1200).ok, false);
  auth.beginAuthPreview("recruiter", "verify", 1000);
  for (let i=0;i<5;i++) assert.equal(auth.verifyAuthPreview("recruiter", "000000", 1200).ok,false);
  assert.equal(auth.verifyAuthPreview("recruiter", "123456", 1300).ok,false);
  auth.beginAuthPreview("recruiter", "verify", 1000);
  assert.equal(auth.verifyAuthPreview("recruiter", "123456", 301000).ok,false);
});
test("demo reset challenges cannot verify sign-in or be reused", () => {
  const auth=require("../lib/authPreview.ts");
  auth.beginAuthPreview("recruiter","reset",1000);
  assert.equal(auth.verifyAuthPreview("recruiter","123456",1100).ok,false);
  assert.equal(auth.completeResetPreview("candidate",1100),false);
  assert.equal(auth.completeResetPreview("recruiter",1100),false);
  assert.equal(auth.verifyResetPreview("recruiter","123456",1100).ok,true);
  assert.equal(auth.completeResetPreview("recruiter",1100),true);
  assert.equal(auth.completeResetPreview("recruiter",1100),false);
  auth.beginAuthPreview("recruiter","reset",1000);
  assert.equal(auth.completeResetPreview("recruiter",301000),false);
});
test("password preview validation rejects short or mismatched values", () => {
  const {passwordError}=require("../lib/authPreview.ts");
  assert.ok(passwordError("short","short"));
  assert.ok(passwordError("LongPassword123","different"));
  assert.equal(passwordError("LongPassword123","LongPassword123"),"");
});
test("recruitment activity uses Johannesburg calendar days and excludes invalid or out-of-period dates",()=>{
 const {buildRecruitmentAnalytics}=require("../lib/recruitmentAnalytics.ts");
 const result=buildRecruitmentAnalytics([
 {_id:"a",createdAt:"2026-10-26T23:00:00Z"},
 {_id:"b",createdAt:"2026-10-20T10:00:00Z"},
 {_id:"c",createdAt:"2026-10-28T10:00:00Z"},
 {_id:"d",createdAt:"not-a-date"}
 ],[{screenedAt:"2026-10-26T23:00:00Z",shortlist:[]},{screenedAt:"2026-10-20T10:00:00Z",shortlist:[]}],7,new Date("2026-10-27T10:00:00Z"));
 assert.equal(result.daily.length,7);
 assert.equal(result.daily[0].date,"2026-10-21");
 assert.equal(result.daily[6].count,1);
 assert.equal(result.newCandidates,1);
 assert.equal(result.undated,1);
 assert.equal(result.sessions,1);
});
test("country grouping is exclusive, respects explicit countries, and reconciles remote or unknown records",()=>{
 const {buildRecruitmentAnalytics,resolveApplicantCountry}=require("../lib/recruitmentAnalytics.ts");
 const result=buildRecruitmentAnalytics([{_id:"a",location:"Kigali, Rwanda"},{_id:"b",location:"Kigali, Kenya"},{_id:"c",location:"Remote"},{_id:"d",location:"Not supplied"},{_id:"e",location:"Lagos, Nigeria"}],[],30);
 assert.equal(result.total,5);assert.equal(result.unmapped,2);
 assert.equal(result.countries.reduce((sum,item)=>sum+item.count,0)+result.unmapped,result.total);
 assert.equal(result.countries.find(item=>item.name==="Rwanda").count,1);
 assert.equal(result.countries.find(item=>item.name==="Kenya").count,1);
 assert.equal(resolveApplicantCountry("USA"),"United States of America");
 assert.equal(resolveApplicantCountry("UK"),"United Kingdom");
});
test("shortlist coverage deduplicates people and excludes IDs missing from applicant records",()=>{
 const {buildRecruitmentAnalytics}=require("../lib/recruitmentAnalytics.ts");
 const result=buildRecruitmentAnalytics([{_id:"a"},{_id:"b"},{_id:"c"}],[{shortlist:[{candidateId:"a"},{candidateId:"a"},{candidateId:"deleted"}]},{shortlist:[{candidateId:"b"},{candidateId:"a"}]}],30);
 assert.equal(result.shortlisted,2);assert.equal(result.other,1);
 assert.equal(result.shortlisted+result.other,result.total);
});
test("larger activity bars preserve every daily count and the shorter last interval",()=>{
 const {groupApplicantDays}=require("../lib/recruitmentAnalytics.ts");
 const days=Array.from({length:31},(_,index)=>({date:"2026-10-"+String(index+1).padStart(2,"0"),count:index%4}));
 const {size,points}=groupApplicantDays(days);
 assert.equal(size,4);assert.equal(points.length,8);
 assert.deepEqual(points[0],{startDate:"2026-10-01",endDate:"2026-10-04",count:6});
 assert.deepEqual(points[7],{startDate:"2026-10-29",endDate:"2026-10-31",count:3});
 assert.equal(points.reduce((sum,item)=>sum+item.count,0),45);
 assert.equal(groupApplicantDays(days.slice(0,7)).size,1);
 assert.deepEqual(groupApplicantDays([]).points,[]);
});
test("reset OTP requires the correct purpose and permits the final valid attempt once",()=>{
 const auth=require("../lib/authPreview.ts");
 auth.beginAuthPreview("recruiter","reset",1000);
 for(let attempt=0;attempt<4;attempt++)assert.equal(auth.verifyResetPreview("recruiter","999999",1100).ok,false);
 assert.equal(auth.verifyResetPreview("candidate","123456",1100).ok,false);
 assert.equal(auth.verifyResetPreview("recruiter","123456",1100).ok,true);
 assert.equal(auth.completeResetPreview("recruiter",1200),true);
 assert.equal(auth.completeResetPreview("recruiter",1200),false);
 auth.beginAuthPreview("recruiter","verify",1000);
 assert.equal(auth.verifyResetPreview("recruiter","123456",1100).ok,false);
});
test("assessment library is recruiter-only and includes templates rather than candidate assignments",async()=>{
 await enter("candidate");await assert.rejects(request("/assessments/library"),/recruiter/i);
 await enter("recruiter");const library=await request("/assessments/library");
 assert.ok(library.length>0);assert.ok(library.every(item=>Array.isArray(item.questions)&&item.job?.title&&["draft","active","archived"].includes(item.status)));
});
test("CSV exports protect spreadsheet formulas and preserve commas, quotes and line breaks",()=>{
 const {reportCsv}=require("../lib/reportExport.ts");
 const csv=reportCsv({title:"Report",columns:["Name","Notes"],rows:[[" =SUM(A1:A2)",'She said "yes", then paused'],["Jane","Line one\nLine two"]]});
 assert.ok(csv.startsWith("\uFEFF"));
 assert.ok(csv.includes("\"' =SUM(A1:A2)\""));
 assert.ok(csv.includes('"She said ""yes"", then paused"'));
 assert.ok(csv.includes('"Line one\nLine two"'));
});
test("expired signup metadata preserves its resend purpose without granting authentication",()=>{
 const auth=require("../lib/authPreview.ts");
 auth.beginAuthPreview("recruiter","verify",1000,"signup","taylor@example.test");
 assert.equal(auth.authPreviewDetails("recruiter","verify").intent,"signup");
 assert.equal(auth.authPreviewDetails("candidate","verify"),null);
 assert.equal(auth.verifyAuthPreview("recruiter","123456",301000).ok,false);
 assert.equal(auth.authPreviewDetails("recruiter","verify").intent,"signup");
});