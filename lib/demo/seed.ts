import type {
  DemoAssessment,
  DemoAssignment,
  DemoDatabase,
  DemoProfile,
  DemoQuestion,
} from "./types";
export const RECRUITER_ID = "demo-recruiter";
export const CANDIDATE_ID = "candidate-1";
export function sampleQuestions(): DemoQuestion[] {
  const items = [
    [
      "Which evidence best supports a claim of job-related skill?",
      [
        "A) A relevant work sample",
        "B) A longer résumé",
        "C) Social follower count",
        "D) A profile photograph",
      ],
      "A",
    ],
    [
      "A requirement is unclear. What is the best first step?",
      [
        "A) Guess and ship",
        "B) Clarify the goal with the stakeholder",
        "C) Ignore it",
        "D) Add unrelated features",
      ],
      "B",
    ],
    [
      "How should competing tasks be prioritized?",
      [
        "A) Alphabetically",
        "B) By who asks loudest",
        "C) By impact, urgency and dependencies",
        "D) At random",
      ],
      "C",
    ],
    [
      "What makes a useful acceptance criterion?",
      [
        "A) An unmeasurable feeling",
        "B) A vague promise",
        "C) An unrelated metric",
        "D) A specific, observable outcome",
      ],
      "D",
    ],
    [
      "What should a progress update communicate?",
      [
        "A) Outcomes, blockers and next steps",
        "B) Only successes",
        "C) No evidence",
        "D) Unverified claims",
      ],
      "A",
    ],
  ] as const;
  return items.map(([question, options, correctAnswer], i) => ({
    id: i + 1,
    type: "multiple_choice",
    category: "Workplace problem solving",
    question,
    text: question,
    options: [...options],
    correctAnswer,
    marks: 20,
  }));
}
export function createDemoSeed(now = new Date()): DemoDatabase {
  const ago = (days: number) =>
    new Date(now.getTime() - days * 86400000).toISOString();
  const users = [
    {
      id: RECRUITER_ID,
      name: "Jordan Ellis",
      email: "recruiter@example.invalid",
      role: "recruiter" as const,
      company: "Northstar Studio",
    },
    {
      id: CANDIDATE_ID,
      name: "Amara Niyonzima",
      email: "candidate@example.invalid",
      role: "candidate" as const,
    },
  ];
  const jobTitles = [
    "Senior Frontend Engineer",
    "Product Designer",
    "Customer Success Manager",
    "Data Analyst",
    "Operations Lead",
    "Backend Engineer",
  ];
  const jobs = jobTitles.map((title, i) => ({
    id: "job-" + (i + 1),
    _id: "job-" + (i + 1),
    title,
    company: "Northstar Studio",
    department: [
      "Engineering",
      "Design",
      "Customer experience",
      "Data",
      "Operations",
      "Engineering",
    ][i],
    experienceLevel: i % 2 ? "Mid-Level" : "Senior",
    applicantsTarget: 20 + i * 5,
    location: [
      "Kigali, Rwanda",
      "Remote",
      "Nairobi, Kenya",
      "Cape Town, South Africa",
      "Accra, Ghana",
      "Remote",
    ][i],
    salaryRange: [
      "USD 3,000–4,500 / month",
      "USD 2,500–4,000 / month",
      "USD 1,800–3,000 / month",
      "USD 2,200–3,500 / month",
      "USD 2,000–3,200 / month",
      "USD 3,000–5,000 / month",
    ][i],
    description:
      "Join a collaborative team building useful products. We value clear communication, relevant work samples and thoughtful problem solving. This fictional role is for frontend design review.",
    status: "active" as const,
    createdAt: ago(28 - i * 3),
    createdBy: RECRUITER_ID,
  }));
  const names = [
    "Amara Niyonzima",
    "Liam Okafor",
    "Aisha Mwangi",
    "Daniel Mensah",
    "Sofia Patel",
    "Noah Williams",
    "Fatima Diallo",
    "Ethan Chen",
    "Grace Kamau",
    "Oliver Smith",
    "Zuri Mbeki",
    "Lucas Silva",
    "Maya Sharma",
    "James Brown",
    "Imani Kone",
    "Leo Martin",
    "Nia Adeyemi",
    "Adam Hassan",
    "Chloe Dubois",
    "Samuel Mutua",
    "Leila Abebe",
    "Ben Wilson",
    "Aya Nakamura",
    "David Banda",
  ];
  const candidates = names.map((name, i) => ({
    id: "candidate-" + (i + 1),
    _id: "candidate-" + (i + 1),
    name,
    email: "candidate" + (i + 1) + "@example.invalid",
    phone: "",
    currentRole: jobTitles[i % 6],
    location: [
      "Kigali, Rwanda",
      "Lagos, Nigeria",
      "Nairobi, Kenya",
      "Accra, Ghana",
      "Cape Town, South Africa",
      "London, United Kingdom",
    ][i % 6],
    skills:
      i % 2
        ? ["Research", "Communication", "Product thinking", "Figma"]
        : ["React", "TypeScript", "Testing", "Accessibility"],
    experience: 3 + (i % 6) + " years of relevant experience",
    education: "Sample professional qualification",
    summary: "Fictional candidate profile for local frontend review.",
    jobId: "job-" + ((i % 6) + 1),
    source: i % 3 ? ("manual" as const) : ("portal" as const),
    createdAt: ago(i + 1),
  }));
  candidates[0].email = users[1].email;
  const profile: DemoProfile = {
    userId: CANDIDATE_ID,
    firstName: "Amara",
    lastName: "Niyonzima",
    email: users[1].email,
    headline: "Frontend engineer building accessible products",
    bio: "I enjoy turning complex requirements into simple, useful experiences.",
    location: "Kigali, Rwanda",
    mobileNumber: "",
    skills: [
      { name: "React", level: "Advanced" },
      { name: "TypeScript", level: "Intermediate" },
    ],
    workExperience: [
      {
        role: "Frontend engineer",
        companyName: "Example Studio",
        duration: "2022–2026",
        description:
          "Built accessible interfaces and worked across product and engineering.",
      },
    ],
    education: [
      {
        degree: "BSc Computer Science",
        institution: "Example University",
        year: "2022",
      },
    ],
    certifications: [],
    projects: [],
    availabilityStatus: "Open to opportunities",
    employmentType: "Full-time",
    availableStartDate: "",
    linkedin: "",
    github: "",
    personalPortfolio: "",
  };
  const draft: DemoAssessment = {
    id: "assessment-1",
    _id: "assessment-1",
    jobId: "job-1",
    title: "Frontend Engineer — Sample Assessment",
    instructions:
      "Local design preview. Select one answer per question. No AI model or external grading is used.",
    durationMinutes: 20,
    timeLimitPerQuestion: 120,
    status: "draft",
    questions: sampleQuestions(),
    totalQuestions: 5,
    totalMarks: 100,
    passingScore: 70,
    createdAt: ago(4),
    createdBy: RECRUITER_ID,
    jobType: "non-coding",
    jobCategory: "Workplace problem solving",
  };
  const active: DemoAssessment = {
    ...structuredClone(draft),
    id: "assessment-2",
    _id: "assessment-2",
    title: "Product Thinking — Sample Assessment",
    status: "active",
    jobId: "job-2",
    createdAt: ago(8),
    launchedAt: ago(5),
  };
  const assignment: DemoAssignment = {
    id: "assignment-1",
    _id: "assignment-1",
    assessmentId: active.id,
    candidateId: CANDIDATE_ID,
    candidateName: candidates[0].name,
    candidateEmail: candidates[0].email,
    candidateType: "portal_user",
    status: "assigned",
    assignedAt: ago(5),
    createdAt: ago(5),
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
  const completed: DemoAssignment = {
    ...structuredClone(assignment),
    id: "assignment-2",
    _id: "assignment-2",
    candidateId: "candidate-2",
    candidateName: candidates[1].name,
    candidateEmail: candidates[1].email,
    status: "evaluated",
    startedAt: ago(4),
    submittedAt: ago(4),
    answers: active.questions.map((q) => ({
      questionId: q.id,
      answer: q.options?.[q.id === 5 ? 0 : q.id - 1] || "",
      timestamp: ago(4),
    })),
    evaluatedAnswers: active.questions.map((q) => ({
      questionId: q.id,
      score: 20,
      maxMarks: 20,
      feedback: "Correct sample answer.",
      isCorrect: true,
    })),
    score: 100,
    percentage: 100,
    passed: true,
    correctAnswersCount: 5,
    timeTakenMinutes: 12,
    overallFeedback:
      "Illustrative completed result. No external assessment or AI evaluation took place.",
    grade: "A",
  };
  const screenings = jobs
    .slice(0, 3)
    .map((job, i) => ({
      id: "screening-" + (i + 1),
      _id: "screening-" + (i + 1),
      jobId: job.id,
      jobTitle: job.title,
      totalCandidates: 8,
      shortlist: candidates
        .slice(0, 8)
        .map((c, n) => ({
          candidateId: c.id,
          name: c.name,
          email: c.email,
          matchScore: 92 - n * 4,
          strengths: ["Sample skills evidence", "Relevant experience"],
          missingSkills: n % 2 ? ["More role-specific evidence"] : [],
          risks: ["Illustrative result; not an employment recommendation"],
          summary:
            "Sample reasoning provided for frontend review. No model was called.",
        })),
      screenedAt: ago(i + 2),
      createdAt: ago(i + 2),
    }));
  return {
    schemaVersion: 1,
    revision: 0,
    sessionUserId: null,
    users,
    jobs,
    candidates,
    profiles: [profile],
    applications: [
      {
        id: "application-1",
        _id: "application-1",
        candidateId: CANDIDATE_ID,
        jobId: "job-1",
        status: "shortlisted",
        createdAt: ago(9),
        appliedAt: ago(9),
      },
    ],
    assessments: [draft, active],
    assignments: [assignment, completed],
    screenings,
    notifications: [
      {
        id: "notification-1",
        userId: RECRUITER_ID,
        title: "Your review workspace is ready",
        message:
          "Explore sample candidates, jobs, screening and assessments. All changes stay in this browser.",
        type: "event",
        read: false,
        createdAt: ago(0),
      },
      {
        id: "notification-2",
        userId: CANDIDATE_ID,
        title: "Sample assessment assigned",
        message:
          "You have a sample assessment to explore. No camera, microphone or external grading is required.",
        type: "assessment",
        read: false,
        createdAt: ago(1),
        referenceId: assignment.id,
      },
    ],
  };
}
