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
} from "./shared";
export function WorkflowPanel({ data, perform, busy }: FeatureContext) {
  const [job, setJob] = useState(data.jobs[0]?.id || "");
  return (
    <div className="space-y-5">
      <Note>
        This local rule-based assistant prepares reviewable work. Sensitive
        actions require approval. External delivery remains disconnected; an
        approved email or schedule draft is never presented as sent.
      </Note>
      <Panel
        title="Campaign assistant"
        aside={<Badge>Human approval required</Badge>}
      >
        <div className="flex flex-wrap items-end gap-3">
          <Field label="Hiring campaign">
            <CustomSelect
              className="ts-auth-input"
              value={job}
              onChange={(e) => setJob(e.target.value)}
            >
              {data.jobs.map((j) => (
                <option key={j.id} value={j.id}>
                  {j.title}
                </option>
              ))}
            </CustomSelect>
          </Field>
          <Button
            disabled={busy || !job}
            onClick={() => perform("workflow-plan", { jobId: job })}
          >
            Prepare campaign actions
          </Button>
        </div>
        <p className="mt-4 text-xs leading-6 text-slate-500">
          Find pending applications, missing evidence and briefing needs.
          Existing open tasks are reused instead of duplicated.
        </p>
      </Panel>
      <div className="grid gap-4 sm:grid-cols-3">
        {(["suggested", "approved", "ready_for_integration"] as const).map(
          (status) => (
            <div className="ts-panel p-5" key={status}>
              <p className="text-3xl font-semibold">
                {data.tasks.filter((t) => t.status === status).length}
              </p>
              <p className="mt-2 text-xs text-slate-500">
                {status.replaceAll("_", " ")}
              </p>
            </div>
          ),
        )}
      </div>
      {data.tasks.map((task) => (
        <Panel
          key={task.id}
          title={task.title}
          aside={
            <Badge
              tone={
                task.status === "approved" ||
                task.status === "preview_completed"
                  ? "good"
                  : "neutral"
              }
            >
              {task.status.replaceAll("_", " ")}
            </Badge>
          }
        >
          <p className="text-xs text-slate-400">
            {candidateName(data, task.candidateId)} ·{" "}
            {jobName(data, task.jobId)} · {task.kind}
          </p>
          <p className="mt-4 whitespace-pre-wrap text-sm leading-7">
            {task.body}
          </p>
          <p className="mt-3 text-xs leading-6 text-slate-500">{task.reason}</p>
          {task.status === "suggested" && (
            <form
              className="mt-5 space-y-4"
              onSubmit={async (event) => {
                const values = formValues(event);
                await perform("workflow-decide", {
                  id: task.id,
                  reason: values.get("reason"),
                  body: values.get("body"),
                  approve: values.get("decision") === "approve",
                });
              }}
            >
              <Field label="Review or edit the draft">
                <textarea
                  name="body"
                  className="ts-auth-input min-h-24"
                  required
                  defaultValue={task.body}
                  maxLength={4000}
                />
              </Field>
              <div className="grid gap-4 sm:grid-cols-2">
                <Field label="Decision">
                  <CustomSelect className="ts-auth-input" name="decision">
                    <option value="approve">Approve local preview</option>
                    <option value="reject">Reject</option>
                  </CustomSelect>
                </Field>
                <Field label="Approval or rejection reason">
                  <input
                    required
                    name="reason"
                    maxLength={2000}
                    className="ts-auth-input"
                  />
                </Field>
              </div>
              <Button type="submit" disabled={busy}>
                Record decision
              </Button>
            </form>
          )}
          {task.status === "approved" && (
            <Button
              className="mt-5"
              disabled={busy}
              onClick={() => perform("workflow-run", { id: task.id })}
            >
              Run approved local preview
            </Button>
          )}
        </Panel>
      ))}
      {!data.tasks.length && <Empty text="No assistant actions are waiting." />}
      <Panel title="Create a controlled workflow action">
        <form
          className="space-y-4"
          onSubmit={async (event) => {
            const form = event.currentTarget;
            const values = formValues(event);
            if (await perform("workflow-create", Object.fromEntries(values)))
              form.reset();
          }}
        >
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Candidate">
              <CustomSelect required name="candidateId" className="ts-auth-input">
                {data.candidates.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </CustomSelect>
            </Field>
            <Field label="Action">
              <CustomSelect name="kind" className="ts-auth-input">
                {[
                  "organize",
                  "document",
                  "update",
                  "schedule",
                  "brief",
                  "exception",
                ].map((kind) => (
                  <option key={kind}>{kind}</option>
                ))}
              </CustomSelect>
            </Field>
          </div>
          <Field label="Action title">
            <input
              required
              name="title"
              maxLength={150}
              className="ts-auth-input"
            />
          </Field>
          <Field label="Draft, proposed slots, interviewer brief or exception">
            <textarea
              required
              name="body"
              maxLength={4000}
              className="ts-auth-input min-h-28"
            />
          </Field>
          <Button type="submit" disabled={busy}>
            Save for approval
          </Button>
        </form>
      </Panel>
    </div>
  );
}
export function JourneyPanel({ data, perform, busy, t }: FeatureContext) {
  const recruiter = data.role === "recruiter";
  const stages = ["pending", "reviewed", "shortlisted", "hired"];
  return (
    <div className="space-y-5">
      {data.applications.map((a) => {
        const journey = data.journeys.find((j) => j.id === a.id);
        const index = stages.indexOf(a.status);
        return (
          <Panel
            key={a.id}
            title={jobName(data, a.jobId)}
            aside={
              <Badge
                tone={
                  ["rejected", "withdrawn"].includes(a.status)
                    ? "attention"
                    : "good"
                }
              >
                {a.status === "withdrawn" ? t("withdrawn") : a.status}
              </Badge>
            }
          >
            {recruiter && (
              <p className="mb-5 text-xs text-slate-400">
                {candidateName(data, a.candidateId)}
              </p>
            )}
            <ol
              aria-label={t("timeline")}
              className="grid grid-cols-2 gap-3 sm:grid-cols-4"
            >
              {stages.map((stage, i) => (
                <li
                  key={stage}
                  aria-current={a.status === stage ? "step" : undefined}
                  className={
                    "rounded border p-3 text-xs " +
                    (index >= i
                      ? "border-brand/20 bg-brand/5 text-brand"
                      : "border-[#e1e7db] text-slate-400")
                  }
                >
                  <span className="mb-2 block text-[10px]">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  {
                    [
                      "Application received",
                      "Evidence review",
                      "Shortlist & interview",
                      "Decision",
                    ][i]
                  }
                </li>
              ))}
            </ol>
            <div className="mt-5 grid gap-4 sm:grid-cols-2">
              <div className="rounded bg-canvas p-4">
                <h3 className="text-xs font-semibold">{t("next")}</h3>
                <p className="mt-2 text-sm leading-7">
                  {journey?.nextStep || t("resource2")}
                </p>
              </div>
              <div className="rounded bg-canvas p-4">
                <h3 className="text-xs font-semibold">{t("date")}</h3>
                <p className="mt-2 text-sm leading-7">
                  {journey?.expectedDate || t("unknownDate")}
                </p>
                <p className="mt-2 text-xs text-slate-400">
                  Sample hiring plan; not a guaranteed response date.
                </p>
              </div>
            </div>
            {journey?.history.length ? (
              <details className="mt-5">
                <summary className="cursor-pointer text-xs font-medium">
                  {t("history")}
                </summary>
                <ol className="mt-4 space-y-3">
                  {journey.history.map((event, i) => (
                    <li
                      key={i}
                      className="border-l-2 border-lime pl-4 text-xs leading-6"
                    >
                      <strong>{event.stage}</strong> ·{" "}
                      {new Date(event.at).toLocaleDateString()}
                      <p className="text-slate-500">{event.note}</p>
                    </li>
                  ))}
                </ol>
              </details>
            ) : null}
            {recruiter ? (
              <form
                className="mt-6 space-y-4 border-t border-[#e3e8dd] pt-5"
                onSubmit={async (event) => {
                  const values = formValues(event);
                  await perform("journey-stage", {
                    id: a.id,
                    ...Object.fromEntries(values),
                  });
                }}
              >
                <div className="grid gap-4 sm:grid-cols-2">
                  <Field label="Application stage">
                    <CustomSelect
                      name="status"
                      className="ts-auth-input"
                      defaultValue={a.status}
                    >
                      {[
                        "pending",
                        "reviewed",
                        "shortlisted",
                        "hired",
                        "rejected",
                        "withdrawn",
                      ].map((stage) => (
                        <option key={stage}>{stage}</option>
                      ))}
                    </CustomSelect>
                  </Field>
                  <Field label="Expected update date (optional)">
                    <input
                      type="date"
                      name="expectedDate"
                      defaultValue={journey?.expectedDate}
                      className="ts-auth-input"
                    />
                  </Field>
                </div>
                <Field label="Next step visible to the candidate">
                  <input
                    name="nextStep"
                    maxLength={2000}
                    className="ts-auth-input"
                    defaultValue={journey?.nextStep}
                  />
                </Field>
                <Field label="Reason for this update">
                  <textarea
                    required
                    name="reason"
                    maxLength={2000}
                    className="ts-auth-input min-h-20"
                  />
                </Field>
                <Button type="submit" disabled={busy}>
                  Update local timeline
                </Button>
              </form>
            ) : (
              !["hired", "rejected", "withdrawn"].includes(a.status) && (
                <Button
                  disabled={busy}
                  className="secondary mt-6"
                  onClick={() => {
                    if (window.confirm(t("withdraw") + "?"))
                      void perform("journey-withdraw", { id: a.id });
                  }}
                >
                  {t("withdraw")}
                </Button>
              )
            )}
          </Panel>
        );
      })}
      {!data.applications.length && <Empty text={t("noRecords")} />}
      <Panel title={t("practice")}>
        <p className="text-sm leading-7 text-slate-500">{t("resource1")}</p>
        <p className="mt-3 text-sm leading-7 text-slate-500">
          {t("resource2")}
        </p>
        <div className="mt-5 flex flex-wrap gap-3">
          <Link
            className="ts-button secondary"
            href={
              recruiter
                ? "/recruiter/intelligence/simulations"
                : "/candidate/experience/simulations"
            }
          >
            {t("simulations")}
          </Link>
          <Link
            className="ts-button secondary"
            href={
              recruiter
                ? "/recruiter/intelligence/inclusion"
                : "/candidate/experience/inclusion"
            }
          >
            {t("inclusion")}
          </Link>
        </div>
      </Panel>
      {data.role === "candidate" &&
        data.tasks.map((task) => (
          <Panel key={task.id} title={task.title}>
            <p className="whitespace-pre-wrap text-sm leading-7">{task.body}</p>
            <p className="mt-3 text-xs text-slate-400">
              Local portal update. No external email or calendar invite was
              sent.
            </p>
          </Panel>
        ))}
    </div>
  );
}
export function RoiPanel({ data, perform, busy }: FeatureContext) {
  const [job, setJob] = useState(data.jobs[0]?.id || "");
  const [kind, setKind] = useState("cost");
  const costs = data.costs.filter((c) => c.jobId === job);
  const times = data.times.filter((t) => t.jobId === job);
  const apps = data.applications.filter((a) => a.jobId === job);
  const hires = apps.filter((a) => a.status === "hired");
  const perCandidate = (phase: string) => {
    const rows = times.filter((t) => t.phase === phase);
    const count = rows.reduce((n, r) => n + r.candidateCount, 0);
    return count ? rows.reduce((n, r) => n + r.minutes, 0) / count : null;
  };
  const before = perCandidate("baseline"),
    after = perCandidate("assisted");
  const cost = costs.reduce((n, r) => n + r.amount, 0);
  const hiredDurations = hires.flatMap((a) => {
    const event = data.journeys
      .find((j) => j.id === a.id)
      ?.history.find((e) => e.stage === "hired");
    if (!event) return [];
    return [
      Math.max(
        0,
        (new Date(event.at).getTime() - new Date(a.appliedAt).getTime()) /
          86400000,
      ),
    ];
  });
  const responses = data.simulations;
  const finished = responses.filter((r) => r.status !== "draft").length;
  const stageDurations: Record<string, number[]> = {};
  for (const application of apps) {
    const history =
      data.journeys.find((j) => j.id === application.id)?.history || [];
    history.forEach((event, index) => {
      if (["hired", "rejected", "withdrawn"].includes(event.stage)) return;
      const start = new Date(event.at).getTime();
      const end = new Date(history[index + 1]?.at || data.asOf).getTime();
      if (Number.isFinite(start) && Number.isFinite(end) && end >= start)
        (stageDurations[event.stage] ??= []).push((end - start) / 86400000);
    });
  }
  const metrics = [
    [
      "Recorded campaign costs",
      new Intl.NumberFormat("en-US", {
        style: "currency",
        currency: "USD",
      }).format(cost),
    ],
    [
      "Cost per recorded hire",
      hires.length ? "$" + (cost / hires.length).toFixed(2) : "Not available",
    ],
    [
      "Minutes per applicant · baseline",
      before == null ? "Not recorded" : before.toFixed(1),
    ],
    [
      "Minutes per applicant · assisted",
      after == null ? "Not recorded" : after.toFixed(1),
    ],
    [
      "Descriptive time difference",
      before && after != null
        ? (((before - after) / before) * 100).toFixed(1) + "%"
        : "Not available",
    ],
    [
      "Recorded time to hire",
      hiredDurations.length
        ? (
            hiredDurations.reduce((a, b) => a + b, 0) / hiredDurations.length
          ).toFixed(1) + " days"
        : "Not available",
    ],
    [
      "Campaign withdrawal rate",
      apps.length
        ? apps.filter((a) => a.status === "withdrawn").length +
          "/" +
          apps.length
        : "No applications",
    ],
    [
      "Work-sample completion · all roles",
      responses.length ? finished + "/" + responses.length : "No responses",
    ],
  ];
  return (
    <div className="space-y-5">
      <Note>
        Metrics are calculated from recorded fictional costs, time observations
        and events. Before/after differences are descriptive, not proof that
        automation caused an improvement. Missing data remains unavailable; no
        retention or hiring-quality score is invented.
      </Note>
      <Field label="Campaign">
        <CustomSelect
          value={job}
          onChange={(e) => setJob(e.target.value)}
          className="ts-auth-input max-w-md"
        >
          {data.jobs.map((j) => (
            <option key={j.id} value={j.id}>
              {j.title}
            </option>
          ))}
        </CustomSelect>
      </Field>
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {metrics.map(([label, value]) => (
          <div key={label} className="ts-panel p-5">
            <p className="text-xs leading-5 text-slate-500">{label}</p>
            <p className="mt-5 text-2xl font-semibold">{value}</p>
          </div>
        ))}
      </div>
      <Panel title="Add a measurement">
        <form
          className="space-y-4"
          onSubmit={async (event) => {
            const values = formValues(event);
            await perform("roi-entry", {
              ...Object.fromEntries(values),
              jobId: job,
              kind,
            });
          }}
        >
          <Field label="Record type">
            <CustomSelect
              value={kind}
              onChange={(e) => setKind(e.target.value)}
              className="ts-auth-input"
            >
              <option value="cost">Actual recorded cost (USD)</option>
              <option value="time">Screening time observation</option>
            </CustomSelect>
          </Field>
          <div className="grid gap-4 sm:grid-cols-2">
            {kind === "cost" ? (
              <>
                <Field label="Category">
                  <input
                    required
                    name="category"
                    maxLength={100}
                    className="ts-auth-input"
                    placeholder="Interview panel time"
                  />
                </Field>
                <Field label="Amount in USD">
                  <input
                    required
                    type="number"
                    name="amount"
                    min="0"
                    max="10000000"
                    step="0.01"
                    className="ts-auth-input"
                  />
                </Field>
              </>
            ) : (
              <>
                <Field label="Measurement phase">
                  <CustomSelect name="phase" className="ts-auth-input">
                    <option value="baseline">Baseline</option>
                    <option value="assisted">Assisted</option>
                  </CustomSelect>
                </Field>
                <Field label="Total screening minutes">
                  <input
                    required
                    name="minutes"
                    type="number"
                    min="0"
                    max="1000000"
                    step="0.1"
                    className="ts-auth-input"
                  />
                </Field>
                <Field label="Applicant observations in this batch">
                  <input
                    required
                    name="candidateCount"
                    type="number"
                    min="1"
                    max="100000"
                    className="ts-auth-input"
                  />
                </Field>
              </>
            )}
          </div>
          <Field label="Measurement source and scope">
            <textarea
              required
              name="note"
              maxLength={1000}
              className="ts-auth-input min-h-20"
              placeholder="Describe the fictional cost record or timed sample session."
            />
          </Field>
          <Button type="submit" disabled={busy || !job}>
            Save local measurement
          </Button>
        </form>
      </Panel>
      <div className="grid gap-5 xl:grid-cols-2">
        <Panel title="Recorded costs">
          {costs.map((c) => (
            <div key={c.id} className="border-t border-[#e4e8df] py-4">
              <p className="text-sm font-medium">
                {c.category} · USD {c.amount.toFixed(2)}
              </p>
              <p className="mt-2 text-xs leading-6 text-slate-500">{c.note}</p>
            </div>
          ))}
          {!costs.length && <Empty text="No costs recorded." />}
        </Panel>
        <Panel title="Time observations">
          {times.map((r) => (
            <div key={r.id} className="border-t border-[#e4e8df] py-4">
              <p className="text-sm font-medium">
                {r.phase} · {r.minutes} minutes / {r.candidateCount} applicant
                observations
              </p>
              <p className="mt-2 text-xs leading-6 text-slate-500">{r.note}</p>
            </div>
          ))}
        </Panel>
      </div>
      <Panel title="Time recorded at each stage">
        {Object.entries(stageDurations).map(([stage, durations]) => (
          <div
            key={stage}
            className="flex flex-wrap justify-between gap-3 border-t border-[#e1e6db] py-4 text-sm"
          >
            <span>{stage}</span>
            <span>
              {(
                durations.reduce((a, b) => a + b, 0) / durations.length
              ).toFixed(1)}{" "}
              days average · {durations.length} application intervals
            </span>
          </div>
        ))}
        {!Object.keys(stageDurations).length && (
          <Empty text="Stage timestamps have not been recorded for this campaign." />
        )}
        <p className="mt-4 text-xs leading-6 text-slate-500">
          Derived from recorded timeline events as of{" "}
          {new Date(data.asOf).toLocaleString()}. Open stages run to the
          snapshot time; missing history is not reconstructed.
        </p>
      </Panel>
      <Panel title="Quality and retention">
        <Empty text="Longitudinal retention and validated quality-of-hire outcomes have not been collected. Structured rubric results are available in screening and simulation reviews." />
      </Panel>
    </div>
  );
}
