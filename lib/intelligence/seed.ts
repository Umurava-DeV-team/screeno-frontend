import type { DemoDatabase, DemoJob } from "../demo/types";
import type {
  IntelligenceState,
  Preferences,
  SimulationTemplate,
} from "./types";
export const defaultPreferences = (): Preferences => ({
  locale: "en",
  largeText: false,
  lowBandwidth: false,
  format: "text",
  adjustment: "",
});
export function competencies(job: DemoJob) {
  const title = job.title.toLowerCase();
  if (/design/.test(title))
    return ["Research", "Interaction design", "Accessibility"];
  if (/support|success/.test(title))
    return ["Customer empathy", "Problem diagnosis", "Communication"];
  if (/sales/.test(title))
    return ["Discovery", "Objection handling", "Communication"];
  if (/data|analyst/.test(title))
    return ["Data quality", "Analysis", "Communication"];
  if (/operation/.test(title))
    return ["Prioritization", "Process design", "Communication"];
  return ["Technical reasoning", "Testing", "Communication"];
}
export const simulationTemplates: SimulationTemplate[] = [
  {
    id: "debug",
    title: "Repair a checkout total",
    role: "Developer",
    brief:
      "A checkout calculation concatenates prices and ignores quantities. Propose a fix, explain the root cause and describe tests for empty carts, decimal prices and invalid quantities. Submit code as text; this preview does not execute it.",
    assetLabel: "checkout.js",
    asset:
      'function total(items) { return items.reduce((sum, item) => sum + item.price, 0); }\nSample input: [{ price: "12.50", quantity: 2 }, { price: "5.00", quantity: 1 }]\nExpected total: 30.00',
    rubric: [
      {
        id: "diagnosis",
        label: "Diagnosis",
        anchor:
          "0: no diagnosis · 2: identifies one issue · 4: explains coercion, quantities and input validation",
      },
      {
        id: "solution",
        label: "Solution quality",
        anchor:
          "0: no solution · 2: partial fix · 4: robust, readable solution with clear assumptions",
      },
      {
        id: "testing",
        label: "Testing",
        anchor:
          "0: no tests · 2: happy path · 4: covers stated edge cases and precision",
      },
    ],
    checks: [
      "Correct sample total: 30.00",
      "Empty cart behavior explained",
      "Invalid quantities handled",
      "Decimal precision considered",
    ],
    toolPolicy:
      "AI and documentation may be used. Disclose tools and explain your own contribution.",
    estimatedMinutes: 25,
  },
  {
    id: "support",
    title: "Resolve a delayed delivery",
    role: "Customer support",
    brief:
      "A customer paid for express delivery. Their order is three days late and tracking has not changed. Write your reply and internal escalation note. A refund requires supervisor approval; do not promise an unauthorized refund.",
    assetLabel: "Customer message",
    asset:
      "I paid extra because this was a birthday gift. Tracking has been stuck for three days. I want an answer today.",
    rubric: [
      {
        id: "empathy",
        label: "Empathy",
        anchor:
          "0: dismissive · 2: polite · 4: acknowledges the specific impact without empty promises",
      },
      {
        id: "resolution",
        label: "Resolution",
        anchor:
          "0: no next step · 2: vague action · 4: clear, authorized steps and escalation",
      },
      {
        id: "clarity",
        label: "Communication",
        anchor:
          "0: confusing · 2: understandable · 4: concise ownership and follow-up expectations",
      },
    ],
    checks: [
      "Acknowledges customer impact",
      "Checks shipment information",
      "Escalates refund approval",
      "Sets a realistic update expectation",
    ],
    toolPolicy:
      "Writing tools are allowed. Disclose assistance; no real customer data should be entered.",
    estimatedMinutes: 15,
  },
  {
    id: "sales",
    title: "Respond to a pricing objection",
    role: "Sales",
    brief:
      "A buyer says your product costs 20% more than their existing tool. Draft a response and three discovery questions. Avoid inventing ROI claims or offering an unauthorized discount.",
    assetLabel: "Buyer context",
    asset:
      "Team of 18. Current workflow requires manual exports. Budget is fixed this quarter. Buyer has not quantified the time spent on exports.",
    rubric: [
      {
        id: "discovery",
        label: "Discovery",
        anchor:
          "0: no discovery · 2: generic questions · 4: questions establish impact, constraints and decision criteria",
      },
      {
        id: "value",
        label: "Value reasoning",
        anchor:
          "0: invented claims · 2: generic value · 4: relevant hypotheses with explicit uncertainty",
      },
      {
        id: "next",
        label: "Next step",
        anchor:
          "0: no next step · 2: vague follow-up · 4: a concrete, proportionate next step",
      },
    ],
    checks: [
      "Acknowledges the objection",
      "Asks about manual workload",
      "Avoids unverified ROI promises",
      "Suggests an appropriate next step",
    ],
    toolPolicy:
      "AI assistance is allowed if disclosed. Evaluate reasoning, not typing speed.",
    estimatedMinutes: 15,
  },
  {
    id: "analysis",
    title: "Investigate a conversion drop",
    role: "Data analyst",
    brief:
      "Investigate this sample funnel. Identify data-quality limitations, compare conversion rates and propose the next investigation. Explain why the table cannot establish causation.",
    assetLabel: "funnel.csv",
    asset:
      "period,device,visits,purchases\nBefore,Mobile,1000,80\nAfter,Mobile,1200,60\nBefore,Desktop,500,60\nAfter,Desktop,600,72\nNote: tracking changed between periods; user mix is unknown.",
    rubric: [
      {
        id: "accuracy",
        label: "Analytical accuracy",
        anchor:
          "0: incorrect · 2: partial rates · 4: correct rates with relevant comparisons",
      },
      {
        id: "quality",
        label: "Data quality",
        anchor:
          "0: ignores limitations · 2: mentions tracking · 4: explains instrumentation and mix limitations",
      },
      {
        id: "judgment",
        label: "Judgment",
        anchor:
          "0: causal overclaim · 2: cautious conclusion · 4: prioritized investigation grounded in uncertainty",
      },
    ],
    checks: [
      "Mobile: 8% before, 5% after",
      "Desktop: 12% in both periods",
      "Tracking change considered",
      "Causation is not claimed",
    ],
    toolPolicy:
      "Spreadsheets, code and AI are allowed. Disclose tools and validate calculations.",
    estimatedMinutes: 20,
  },
];
export function createIntelligenceSeed(db: DemoDatabase): IntelligenceState {
  const preferences: Record<string, Preferences> = {};
  db.users.forEach((u) => {
    preferences[u.id] = defaultPreferences();
  });
  const evidence = db.candidates.flatMap((c, index) => {
    const job = db.jobs.find((j) => j.id === c.jobId) || db.jobs[0];
    if (!job) return [];
    const criteria = competencies(job);
    return criteria.map((skill, i) => ({
      id: "evidence-" + c.id + "-" + i,
      candidateId: c.id,
      jobId: job.id,
      competency: skill,
      requirement: "Demonstrate " + skill.toLowerCase() + " in relevant work.",
      claim:
        i === 2
          ? "No relevant artifact supplied."
          : "Sample claim of " + skill.toLowerCase() + " experience.",
      source: i === 0 ? "Portfolio" : i === 1 ? "CV" : "Not supplied",
      reference:
        i === 0
          ? "sample-work-" + (index + 1)
          : i === 1
            ? "sample-cv-" + (index + 1)
            : "",
      excerpt:
        i === 0
          ? "Fictional work sample: documented a problem, explained trade-offs and showed the resulting implementation."
          : i === 1
            ? "Fictional CV mentions relevant experience, without supporting work attached."
            : "",
      status:
        i === 0
          ? ("supported" as const)
          : i === 1
            ? ("unverified" as const)
            : ("missing" as const),
    }));
  });
  const expiry = new Date(Date.now() + 90 * 86400000)
    .toISOString()
    .slice(0, 10);
  return {
    version: 1,
    evidence,
    screenings: [],
    simulations: [],
    tasks: db.candidates.slice(0, 4).map((c, i) => ({
      id: "task-" + i,
      candidateId: c.id,
      jobId: c.jobId,
      kind: (["document", "update", "schedule", "exception"] as const)[i],
      title: [
        "Request missing work sample",
        "Prepare application update",
        "Propose interview slots",
        "Review evidence discrepancy",
      ][i],
      body: [
        "Please add a relevant work sample to your application.",
        "Your sample application is being reviewed. We will update your timeline.",
        "Proposed slots: Tuesday 10:00 or Wednesday 14:00, Africa/Kigali. Calendar availability has not been checked.",
        "Clarify a difference between a profile claim and its supporting evidence.",
      ][i],
      requiresApproval: true,
      status: "suggested",
      reason: "Awaiting recruiter review.",
      createdAt: c.createdAt,
    })),
    journeys: db.applications.map((a) => ({
      id: a.id,
      candidateId: a.candidateId,
      jobId: a.jobId,
      nextStep: "Review the role criteria and prepare a relevant work sample.",
      expectedDate: "",
      history: [
        {
          stage: a.status,
          at: a.appliedAt,
          note: "Seeded application state for frontend review.",
        },
      ],
    })),
    audit: [],
    costs: [
      {
        id: "cost-sample",
        jobId: db.jobs[0]?.id || "",
        category: "Recruiter time",
        amount: 120,
        currency: "USD",
        note: "Fictional recorded campaign cost.",
      },
    ],
    times: [
      {
        id: "time-before",
        jobId: db.jobs[0]?.id || "",
        phase: "baseline",
        minutes: 120,
        candidateCount: 12,
        note: "Fictional baseline screening session.",
      },
      {
        id: "time-after",
        jobId: db.jobs[0]?.id || "",
        phase: "assisted",
        minutes: 60,
        candidateCount: 12,
        note: "Fictional assisted screening session. Descriptive comparison only.",
      },
    ],
    consents: db.candidates.map((c, i) => ({
      candidateId: c.id,
      discoverable: i > 0 && i % 3 === 0,
      contactAllowed: i > 0 && i % 3 === 0,
      expiresAt: expiry,
      deletionRequested: false,
    })),
    credentials: db.candidates.slice(0, 8).map((c, i) => ({
      id: "credential-" + c.id,
      candidateId: c.id,
      kind: i % 2 ? "certificate" : "qualification",
      claim: c.education,
      issuer: "Fictional training institution",
      status: i === 2 ? "conflict" : "not_checked",
      consent: false,
      note:
        i === 2
          ? "Sample discrepancy: qualification date differs between two supplied records. Human clarification required."
          : "No issuer check has been performed.",
    })),
    preferences,
    maskIdentities: true,
    aggregatePermission: false,
  };
}
export function rediscoveryRequirements(job: DemoJob): string[] {
  const title = job.title.toLowerCase();
  if (/design/.test(title)) return ["Research", "Figma", "Accessibility"];
  if (/support|success|sales/.test(title))
    return ["Communication", "Customer empathy", "Product thinking"];
  if (/data|analyst/.test(title)) return ["Analysis", "SQL", "Communication"];
  if (/engineer|developer|frontend|backend/.test(title))
    return ["React", "TypeScript", "Testing", "Accessibility"];
  return ["Communication", "Research", "Testing"];
}
