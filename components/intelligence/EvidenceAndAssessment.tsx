"use client";
import CustomSelect from "@/components/CustomSelect";

import { useState } from "react";
import Link from "next/link";
import type { FeatureContext } from "./shared";
import {
  Panel,
  Badge,
  Button,
  Field,
  Note,
  Empty,
  formValues,
  candidateName,
  jobName,
  RubricForm,
} from "./shared";
import { competencies } from "@/lib/intelligence/seed";
import type { SimulationTemplate } from "@/lib/intelligence/types";
export function EvidencePanel({ data, perform, busy, t }: FeatureContext) {
  const recruiter = data.role === "recruiter";
  const [person, setPerson] = useState(
    recruiter ? data.candidates[0]?.id || "" : data.userId,
  );
  const evidence = data.evidence.filter((e) => e.candidateId === person);
  const selected = data.candidates.find((c) => c.id === person);
  return (
    <div className="space-y-5">
      {recruiter && (
        <Field label="Candidate">
          <CustomSelect
            className="ts-auth-input max-w-md"
            value={person}
            onChange={(e) => setPerson(e.target.value)}
          >
            {data.candidates.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </CustomSelect>
        </Field>
      )}
      <Note>
        Evidence support and issuer verification are different states. Sample
        excerpts support review; they do not establish that a qualification is
        verified. Missing evidence is not proof of missing ability.
      </Note>
      <div className="grid gap-4 sm:grid-cols-3">
        {(["supported", "unverified", "missing"] as const).map((status) => (
          <div className="ts-panel p-5" key={status}>
            <p className="text-3xl font-semibold">
              {evidence.filter((e) => e.status === status).length}
            </p>
            <p className="mt-2 text-xs text-slate-500">{t(status)}</p>
          </div>
        ))}
      </div>
      {evidence.map((e) => (
        <Panel
          key={e.id}
          title={e.competency}
          aside={
            <Badge
              tone={
                e.status === "supported"
                  ? "good"
                  : e.status === "missing"
                    ? "attention"
                    : "neutral"
              }
            >
              {t(e.status)}
            </Badge>
          }
        >
          <p className="text-xs text-slate-400">{e.requirement}</p>
          <p className="mt-3 text-sm leading-7">{e.claim}</p>
          <details className="mt-4 rounded border border-[#e4e8df] p-4">
            <summary className="cursor-pointer text-xs font-medium">
              {t("source")}: {e.source} · {e.reference || t("missing")}
            </summary>
            <p className="mt-3 whitespace-pre-wrap text-xs leading-7 text-slate-500">
              {e.excerpt || t("missing")}
            </p>
            {e.source === "Assessment" && e.reference && (
              <Link
                className="mt-3 inline-block text-xs text-brand"
                href={
                  recruiter
                    ? "/recruiter/assessments"
                    : "/candidate/assessments/" + e.reference + "/results"
                }
              >
                Open saved assessment
              </Link>
            )}
          </details>
          {e.correction && (
            <div className="mt-4 rounded bg-canvas p-4">
              <Badge>
                {e.correction.status === "pending"
                  ? t("pendingCorrection")
                  : e.correction.status === "accepted"
                    ? t("approved")
                    : t("declined")}
              </Badge>
              <p className="mt-3 text-sm leading-6">{e.correction.text}</p>
            </div>
          )}
          {!recruiter ? (
            e.correction?.status !== "pending" && (
              <form
                className="mt-4 space-y-3"
                onSubmit={async (event) => {
                  const form = event.currentTarget;
                  const values = formValues(event);
                  if (
                    await perform("evidence-correct", {
                      id: e.id,
                      text: values.get("text"),
                    })
                  )
                    form.reset();
                }}
              >
                <Field label={t("correction")}>
                  <textarea
                    required
                    name="text"
                    maxLength={2000}
                    className="ts-auth-input min-h-20"
                  />
                </Field>
                <Button disabled={busy} type="submit" className="secondary">
                  {t("correct")}
                </Button>
              </form>
            )
          ) : (
            <details className="mt-5">
              <summary className="cursor-pointer text-xs font-medium text-brand">
                Review evidence or correction
              </summary>
              <form
                className="mt-4 space-y-4"
                onSubmit={async (event) => {
                  const values = formValues(event);
                  await perform("evidence-resolve", {
                    id: e.id,
                    status: values.get("status"),
                    reason: values.get("reason"),
                    accept: values.get("accept") === "yes",
                  });
                }}
              >
                <Field label="Evidence state">
                  <CustomSelect
                    name="status"
                    className="ts-auth-input"
                    defaultValue={e.status}
                  >
                    {(["supported", "unverified", "missing"] as const).map(
                      (s) => (
                        <option key={s} value={s}>
                          {t(s)}
                        </option>
                      ),
                    )}
                  </CustomSelect>
                </Field>
                {e.correction?.status === "pending" && (
                  <Field label="Correction decision">
                    <CustomSelect name="accept" className="ts-auth-input">
                      <option value="yes">Accept candidate correction</option>
                      <option value="no">Decline with a recorded reason</option>
                    </CustomSelect>
                  </Field>
                )}
                <Field label="Review reason">
                  <textarea
                    required
                    name="reason"
                    className="ts-auth-input min-h-20"
                    maxLength={2000}
                  />
                </Field>
                <Button type="submit" disabled={busy}>
                  Save traceable review
                </Button>
              </form>
            </details>
          )}
        </Panel>
      ))}
      {!evidence.length && <Empty text={t("noRecords")} />}
      <Panel title="Local extraction preview">
        <p className="mb-4 text-xs leading-6 text-slate-500">
          Paste fictional CV, profile, portfolio or work-history text. The local
          keyword matcher identifies declared skills; all extracted claims
          remain unverified. PDF parsing and AI extraction are disconnected.
        </p>
        <form
          className="space-y-4"
          onSubmit={async (event) => {
            const values = formValues(event);
            await perform("evidence-extract", {
              candidateId: person,
              jobId: selected?.jobId,
              source: values.get("source"),
              content: values.get("content"),
            });
          }}
        >
          <Field label={t("source")}>
            <CustomSelect name="source" className="ts-auth-input">
              {["CV", "Profile", "Portfolio", "Work history"].map((s) => (
                <option key={s}>{s}</option>
              ))}
            </CustomSelect>
          </Field>
          <Field label={t("artifact")}>
            <textarea
              name="content"
              required
              maxLength={6000}
              className="ts-auth-input min-h-28"
              placeholder="Fictional sample: I used React and TypeScript to build an accessible interface."
            />
          </Field>
          <Button type="submit" disabled={busy || !selected}>
            Preview declared skills
          </Button>
        </form>
      </Panel>
    </div>
  );
}
export function ScreeningPanel({ data, perform, busy, t }: FeatureContext) {
  const [job, setJob] = useState(data.jobs[0]?.id || "");
  const [answer, setAnswer] = useState(
    () => data.screenings.find((s) => s.jobId === job)?.draftAnswer || "",
  );
  if (data.role === "recruiter")
    return (
      <div className="space-y-5">
        <Note>
          Comparable role competencies are shared across candidates. The local
          preview adds one clarifying follow-up for short answers. It does not
          run an AI model or assign an automated score.
        </Note>
        {!data.screenings.length && (
          <Empty text="Switch to the candidate demo to start a structured screening. Completed transcripts will appear here." />
        )}
        {data.screenings.map((s) => {
          const role = data.jobs.find((j) => j.id === s.jobId);
          return (
            <Panel
              key={s.id}
              title={
                candidateName(data, s.candidateId) +
                " · " +
                jobName(data, s.jobId)
              }
              aside={<Badge>{s.status.replaceAll("_", " ")}</Badge>}
            >
              <Transcript turns={s.turns} />
              {s.scores.map((score) => (
                <div
                  key={score.criterion}
                  className="mt-4 rounded bg-canvas p-4"
                >
                  <p className="text-xs font-semibold">
                    {score.criterion} · {score.score}/4 · human review
                  </p>
                  <p className="mt-2 text-xs leading-6">{score.reason}</p>
                </div>
              ))}
              {s.status !== "in_progress" && role && (
                <RubricForm
                  busy={busy}
                  criteria={competencies(role).map((c) => ({
                    id: c,
                    label: c,
                    anchor:
                      "0: no relevant example · 2: partial evidence · 4: clear personal actions, reasoning, outcome and supporting evidence",
                  }))}
                  onSubmit={(input) =>
                    perform("screening-review", { id: s.id, ...input })
                  }
                />
              )}
            </Panel>
          );
        })}
      </div>
    );
  const session = data.screenings.find((s) => s.jobId === job);
  return (
    <div className="space-y-5">
      <Note>{t("screeningNote")}</Note>
      <Panel title={t("screening")}>
        <Field label={t("job")}>
          <CustomSelect
            value={job}
            onChange={(e) => {
              setJob(e.target.value);
              setAnswer(
                data.screenings.find((s) => s.jobId === e.target.value)
                  ?.draftAnswer || "",
              );
            }}
            className="ts-auth-input"
          >
            {data.jobs.map((j) => (
              <option key={j.id} value={j.id}>
                {j.title}
              </option>
            ))}
          </CustomSelect>
        </Field>
        <div className="mt-4 flex flex-wrap gap-2">
          {data.jobs.find((j) => j.id === job) &&
            competencies(data.jobs.find((j) => j.id === job)!).map((c) => (
              <Badge key={c}>{c}</Badge>
            ))}
        </div>
        {!session ? (
          <Button
            disabled={busy || !job}
            className="mt-6"
            onClick={() => perform("screening-start", { jobId: job })}
          >
            {t("start")}
          </Button>
        ) : (
          <div className="mt-6">
            <Transcript turns={session.turns} />
            {session.status === "in_progress" ? (
              <form
                className="mt-5 space-y-4"
                onSubmit={async (e) => {
                  e.preventDefault();
                  if (
                    await perform("screening-answer", {
                      id: session.id,
                      answer,
                    })
                  )
                    setAnswer("");
                }}
              >
                <Field label={t("answer")}>
                  <textarea
                    value={answer}
                    onChange={(e) => setAnswer(e.target.value)}
                    required
                    maxLength={6000}
                    className="ts-auth-input min-h-36"
                  />
                </Field>
                <Button type="submit" disabled={busy || !answer.trim()}>
                  {t("continue")}
                </Button>
                <Button
                  className="secondary ml-3"
                  disabled={busy}
                  onClick={() =>
                    perform("screening-draft", { id: session.id, answer })
                  }
                >
                  {t("saveDraft")}
                </Button>
                <p className="text-xs text-slate-400">{t("draftNote")}</p>
              </form>
            ) : (
              <div className="mt-5">
                <Badge tone="good">
                  {session.status === "reviewed" ? t("reviewed") : t("pending")}
                </Badge>
                {session.scores.map((score) => (
                  <p key={score.criterion} className="mt-4 text-sm leading-7">
                    {score.criterion}: {score.score}/4 · {score.reason}
                  </p>
                ))}
              </div>
            )}
          </div>
        )}
      </Panel>
      <Panel title={t("practice")}>
        <p className="text-sm leading-7 text-slate-500">{t("resource1")}</p>
        <Link
          href="/candidate/experience/inclusion"
          className="mt-4 inline-block text-xs text-brand"
        >
          {t("inclusion")} →
        </Link>
      </Panel>
    </div>
  );
}
function Transcript({
  turns,
}: {
  turns: { id: string; kind: string; text: string; followUp: boolean }[];
}) {
  return (
    <ol className="space-y-3">
      {turns.map((turn) => (
        <li
          key={turn.id}
          className={
            "rounded-md border p-4 " +
            (turn.kind === "prompt"
              ? "border-brand/10 bg-brand/5"
              : "border-[#e2e7db] bg-white")
          }
        >
          <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">
            {turn.kind === "prompt"
              ? "Structured prompt" + (turn.followUp ? " · clarification" : "")
              : "Candidate response"}
          </p>
          <p className="mt-2 whitespace-pre-wrap text-sm leading-7">
            {turn.text}
          </p>
        </li>
      ))}
    </ol>
  );
}
export function SimulationsPanel(context: FeatureContext) {
  const { data, t } = context;
  const [template, setTemplate] = useState(data.templates[0]?.id || "");
  const current = data.templates.find((t) => t.id === template);
  if (data.role === "recruiter")
    return (
      <div className="space-y-5">
        <Note>
          Review saved artifacts against published role rubrics. Test-case
          checks are human attestations; no code or external test runner is
          executed.
        </Note>
        {!data.simulations.filter((r) => r.status !== "draft").length && (
          <Empty text="Candidate-submitted work samples will appear here for human review." />
        )}
        {data.simulations
          .filter((r) => r.status !== "draft")
          .map((r) => {
            const spec = data.templates.find((t) => t.id === r.templateId);
            if (!spec) return null;
            return (
              <Panel
                key={r.id}
                title={candidateName(data, r.candidateId) + " · " + spec.title}
                aside={<Badge>{r.status}</Badge>}
              >
                <pre className="max-h-96 overflow-auto whitespace-pre-wrap rounded bg-canvas p-5 text-xs leading-7">
                  {r.answer}
                </pre>
                {r.feedback && (
                  <p className="mt-5 text-sm leading-7">{r.feedback}</p>
                )}
                {r.scores.map((score) => (
                  <p key={score.criterion} className="mt-3 text-xs leading-6">
                    {spec.rubric.find((c) => c.id === score.criterion)?.label}:{" "}
                    {score.score}/4 · {score.reason}
                  </p>
                ))}
                <RubricForm
                  criteria={spec.rubric}
                  checks={spec.checks}
                  feedback
                  busy={context.busy}
                  onSubmit={(input) =>
                    context.perform("simulation-review", { id: r.id, ...input })
                  }
                />
              </Panel>
            );
          })}
      </div>
    );
  return (
    <div className="space-y-5">
      <Note>{t("simulationNote")}</Note>
      <div className="grid gap-3 sm:grid-cols-2">
        {data.templates.map((spec) => (
          <button
            aria-pressed={spec.id === template}
            key={spec.id}
            onClick={() => setTemplate(spec.id)}
            className={
              "rounded-md border p-5 text-left " +
              (spec.id === template
                ? "border-brand bg-brand/5"
                : "border-[#e1e6d9] bg-white")
            }
          >
            <p className="text-[10px] text-brand">{spec.role}</p>
            <p className="mt-2 text-sm font-semibold">{spec.title}</p>
          </button>
        ))}
      </div>
      {current && (
        <CandidateSimulation key={current.id} template={current} {...context} />
      )}
    </div>
  );
}
function CandidateSimulation({
  template,
  data,
  perform,
  busy,
  t,
}: FeatureContext & { template: SimulationTemplate }) {
  const response = data.simulations.find(
    (r) => r.candidateId === data.userId && r.templateId === template.id,
  );
  const [answer, setAnswer] = useState(response?.answer || "");
  const complete = response && response.status !== "draft";
  return (
    <Panel
      title={template.title}
      aside={<Badge>{response ? t(response.status) : t("draft")}</Badge>}
    >
      <p className="text-sm leading-7 text-slate-500">{template.brief}</p>
      <p className="mt-3 text-xs text-slate-400">
        {template.estimatedMinutes} · {t("time")}
      </p>
      <details className="mt-5 rounded border border-[#e1e6db] p-4" open>
        <summary className="cursor-pointer text-xs font-semibold">
          {template.assetLabel}
        </summary>
        <pre className="mt-4 overflow-auto whitespace-pre-wrap text-xs leading-7">
          {template.asset}
        </pre>
      </details>
      <div className="mt-5 rounded bg-canvas p-4">
        <h3 className="text-xs font-semibold">{t("tools")}</h3>
        <p className="mt-2 text-xs leading-6">{template.toolPolicy}</p>
      </div>
      <h3 className="mt-6 text-xs font-semibold">{t("rubric")}</h3>
      <ul className="mt-3 space-y-3">
        {template.rubric.map((c) => (
          <li key={c.id} className="text-xs leading-6">
            <strong>{c.label}</strong> · {c.anchor}
          </li>
        ))}
      </ul>
      {!complete ? (
        <div className="mt-6 space-y-4">
          <Field label={t("work")}>
            <textarea
              value={answer}
              onChange={(e) => setAnswer(e.target.value)}
              maxLength={20000}
              className="ts-auth-input min-h-64 font-mono"
              placeholder={t("answer")}
            />
          </Field>
          <div className="flex flex-wrap gap-3">
            <Button
              disabled={busy || !answer.trim()}
              className="secondary"
              onClick={() =>
                perform("simulation-save", { templateId: template.id, answer })
              }
            >
              {t("saveDraft")}
            </Button>
            <Button
              disabled={busy || !answer.trim()}
              onClick={() =>
                perform("simulation-save", {
                  templateId: template.id,
                  answer,
                  submit: true,
                })
              }
            >
              {t("submit")}
            </Button>
          </div>
          <p className="text-xs text-slate-400">{t("draftNote")}</p>
        </div>
      ) : (
        <div className="mt-6">
          <pre className="whitespace-pre-wrap rounded bg-canvas p-5 text-xs leading-7">
            {response.answer}
          </pre>
          <p className="mt-4 text-sm">
            {response.status === "reviewed" ? t("reviewed") : t("pending")}
          </p>
          {response.feedback && (
            <p className="mt-3 text-sm leading-7">{response.feedback}</p>
          )}
          {response.scores.map((score) => (
            <p key={score.criterion} className="mt-3 text-xs leading-6">
              {template.rubric.find((c) => c.id === score.criterion)?.label}:{" "}
              {score.score}/4 · {score.reason}
            </p>
          ))}
        </div>
      )}
    </Panel>
  );
}
