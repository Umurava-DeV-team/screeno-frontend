"use client";
import CustomSelect from "@/components/CustomSelect";

import { useState } from "react";
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
} from "./shared";
import {
  defaultPreferences,
  rediscoveryRequirements,
} from "@/lib/intelligence/seed";
export function AuditPanel({ data, perform, busy }: FeatureContext) {
  const cohorts = [
    { label: "Synthetic cohort A", applied: 12, selected: 4 },
    { label: "Synthetic cohort B", applied: 10, selected: 2 },
  ];
  return (
    <div className="space-y-5">
      <Note>
        Identity masking is a review aid, not a guarantee of anonymity or
        fairness. Source text may contain identifiers. Selection-rate
        differences need context and investigation; they do not establish
        discrimination or prove fairness.
      </Note>
      <Panel title="Review and privacy controls">
        <form
          className="space-y-4"
          onSubmit={async (event) => {
            const values = formValues(event);
            await perform("audit-settings", {
              maskIdentities: values.get("mask") === "on",
              aggregatePermission: values.get("aggregate") === "on",
              reason: values.get("reason"),
            });
          }}
        >
          <label className="flex items-start gap-3 text-sm">
            <input
              type="checkbox"
              name="mask"
              defaultChecked={data.maskIdentities}
              className="mt-1 accent-brand"
            />
            Hide names, contact details and unnecessary personal details in
            these review screens
          </label>
          <label className="flex items-start gap-3 text-sm">
            <input
              type="checkbox"
              name="aggregate"
              defaultChecked={data.aggregatePermission}
              className="mt-1 accent-brand"
            />
            Enable synthetic aggregate analysis for this preview; no real
            demographic records are collected
          </label>
          <Field label="Reason for changing review settings">
            <input
              required
              name="reason"
              maxLength={1000}
              className="ts-auth-input"
            />
          </Field>
          <Button type="submit" disabled={busy}>
            Save audited settings
          </Button>
        </form>
      </Panel>
      <Panel
        title="Selection-rate investigation"
        aside={<Badge tone="attention">Synthetic example · small sample</Badge>}
      >
        {!data.aggregatePermission ? (
          <Empty text="Aggregate analysis is disabled. Review the privacy control before opening the synthetic example." />
        ) : (
          <>
            <div className="grid gap-4 sm:grid-cols-2">
              {cohorts.map((c) => (
                <div
                  key={c.label}
                  className="rounded border border-[#e1e6d9] p-5"
                >
                  <p className="text-xs font-medium">{c.label}</p>
                  <p className="mt-3 text-3xl font-semibold">
                    {Math.round((c.selected / c.applied) * 100)}%
                  </p>
                  <p className="mt-2 text-xs text-slate-500">
                    {c.selected} selected / {c.applied} applicants
                  </p>
                </div>
              ))}
            </div>
            <p className="mt-4 text-xs leading-7 text-amber-800">
              Investigation flag: these illustrative groups are too small for a
              reliable conclusion. Review selection criteria, missing
              information and scoring consistency. A privacy-approved data
              source and an agreed analysis method are required before
              production use.
            </p>
          </>
        )}
      </Panel>
      <Panel title="Review consistency">
        {data.screenings
          .filter((s) => s.scores.length)
          .map((s) => {
            const scores = s.scores.map((r) => r.score);
            const range = Math.max(...scores) - Math.min(...scores);
            return (
              <p
                key={s.id}
                className="border-t border-[#e1e6db] py-4 text-sm leading-7"
              >
                {candidateName(data, s.candidateId)} · rubric score range{" "}
                {range}/4{" "}
                {range >= 3
                  ? "· review the evidence behind this variation"
                  : "· no wide within-rubric range flagged"}
                . Different competencies can legitimately receive different
                ratings.
              </p>
            );
          })}
        {!data.screenings.some((s) => s.scores.length) && (
          <Empty text="No human rubric scores have been recorded yet. Reviewer disagreement cannot be inferred without independent reviewer ratings." />
        )}
      </Panel>
      <Panel
        title="Decision and action history"
        aside={<Badge>{data.audit.length} records</Badge>}
      >
        <div className="space-y-4">
          {data.audit.map((record) => (
            <article key={record.id} className="border-t border-[#e3e8dc] pt-4">
              <p className="text-xs font-semibold">
                {record.action.replaceAll("_", " ")} · {record.actor}
              </p>
              <p className="mt-2 text-sm leading-7">{record.reason}</p>
              {(record.before || record.after) && (
                <p className="mt-2 whitespace-pre-wrap break-all text-xs text-brand">
                  {record.before || "—"} → {record.after || "—"}
                </p>
              )}
              <p className="mt-2 text-[10px] text-slate-400">
                {new Date(record.at).toLocaleString()} · record{" "}
                {record.entityId}
              </p>
            </article>
          ))}
        </div>
        {!data.audit.length && (
          <Empty text="Corrections, overrides, consent changes and workflow approvals will appear here. This browser log is not a tamper-proof production audit trail." />
        )}
      </Panel>
    </div>
  );
}
export function RediscoveryPanel({ data, perform, busy, t }: FeatureContext) {
  const consent = data.consents.find((c) => c.candidateId === data.userId);
  const [search, setSearch] = useState("");
  const [job, setJob] = useState(data.jobs[0]?.id || "");
  if (data.role === "candidate")
    return (
      <Panel title={t("consent")}>
        <Note>{t("deletionNote")}</Note>
        {consent ? (
          <form
            key={[
              consent.discoverable,
              consent.contactAllowed,
              consent.expiresAt,
              consent.deletionRequested,
            ].join("-")}
            className="mt-5 space-y-5"
            onSubmit={async (event) => {
              const values = formValues(event);
              await perform("consent", {
                discoverable: values.get("discoverable") === "on",
                contactAllowed: values.get("contact") === "on",
                expiresAt: values.get("expiry"),
              });
            }}
          >
            <label className="flex items-start gap-3 text-sm">
              <input
                name="discoverable"
                type="checkbox"
                defaultChecked={consent.discoverable}
                disabled={consent.deletionRequested}
                className="mt-1 accent-brand"
              />
              {t("discoverable")}
            </label>
            <label className="flex items-start gap-3 text-sm">
              <input
                name="contact"
                type="checkbox"
                defaultChecked={consent.contactAllowed}
                disabled={consent.deletionRequested}
                className="mt-1 accent-brand"
              />
              {t("contact")}
            </label>
            <Field label={t("expires")}>
              <input
                name="expiry"
                type="date"
                required
                defaultValue={consent.expiresAt}
                className="ts-auth-input max-w-xs"
              />
            </Field>
            <div className="flex flex-wrap gap-3">
              <Button
                type="submit"
                disabled={busy || consent.deletionRequested}
              >
                {t("save")}
              </Button>
              <Button
                className="secondary"
                disabled={busy || consent.deletionRequested}
                onClick={() => {
                  if (window.confirm(t("deletion") + "?"))
                    void perform("consent", {
                      expiresAt: consent.expiresAt,
                      deletionRequested: true,
                    });
                }}
              >
                {consent.deletionRequested ? t("pending") : t("deletion")}
              </Button>
            </div>
          </form>
        ) : (
          <Empty text={t("noRecords")} />
        )}
      </Panel>
    );
  const targetJob = data.jobs.find((j) => j.id === job);
  const requirements = targetJob ? rediscoveryRequirements(targetJob) : [];
  const results = data.rediscovery.filter(
    (c) =>
      requirements.some((required) =>
        c.skills.some(
          (skill) => skill.toLowerCase() === required.toLowerCase(),
        ),
      ) &&
      (c.name + " " + c.skills.join(" "))
        .toLowerCase()
        .includes(search.toLowerCase()) &&
      !data.applications.some(
        (a) =>
          a.candidateId === c.candidateId &&
          a.jobId === job &&
          !["rejected", "withdrawn"].includes(a.status),
      ),
  );
  return (
    <div className="space-y-5">
      <Note>
        Only candidates with current discovery consent appear. Expired consent
        and deletion requests immediately remove matches. Skill reasons describe
        declared evidence, not a verified suitability score.
      </Note>
      <Panel title="Match declared skills to a new vacancy">
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="New vacancy">
            <CustomSelect
              value={job}
              onChange={(e) => setJob(e.target.value)}
              className="ts-auth-input"
            >
              {data.jobs.map((j) => (
                <option key={j.id} value={j.id}>
                  {j.title}
                </option>
              ))}
            </CustomSelect>
          </Field>
          <Field label="Search declared skills or candidate alias">
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="ts-auth-input"
              placeholder="React, testing…"
            />
          </Field>
        </div>
      </Panel>
      {results.map((person) => {
        const consent = data.consents.find(
          (c) => c.candidateId === person.candidateId,
        );
        return (
          <Panel
            key={person.candidateId}
            title={person.name}
            aside={<Badge tone="good">Discovery consent active</Badge>}
          >
            <div className="flex flex-wrap gap-2">
              {person.skills.map((skill) => (
                <Badge key={skill}>{skill}</Badge>
              ))}
            </div>
            <ul className="mt-4 space-y-2 text-xs leading-6 text-slate-500">
              {person.reasons
                .filter((reason) =>
                  requirements.some((skill) =>
                    reason.toLowerCase().includes(skill.toLowerCase()),
                  ),
                )
                .map((reason) => (
                  <li key={reason}>{reason}</li>
                ))}
            </ul>
            <p className="mt-3 text-xs text-slate-400">
              Consent expires {person.expiresAt}. Existing active applications
              to the selected vacancy are excluded.
            </p>
            <Button
              disabled={busy || !consent?.contactAllowed || !job}
              className="mt-5 secondary"
              onClick={() =>
                perform("workflow-create", {
                  candidateId: person.candidateId,
                  jobId: job,
                  kind: "outreach",
                  title: "Review rediscovery outreach",
                  body:
                    "Review this candidate’s declared skills for " +
                    (data.jobs.find((j) => j.id === job)?.title ||
                      "the selected vacancy") +
                    ". Confirm evidence and preferences before any contact.",
                })
              }
            >
              Prepare outreach for approval
            </Button>
            {!consent?.contactAllowed && (
              <p className="mt-2 text-xs text-amber-700">
                Contact permission has not been granted.
              </p>
            )}
          </Panel>
        );
      })}
      {!results.length && (
        <Empty text="No consented candidates match this search. Try another skill or vacancy." />
      )}
    </div>
  );
}
export function VerificationPanel({ data, perform, busy, t }: FeatureContext) {
  const recruiter = data.role === "recruiter";
  return (
    <div className="space-y-5">
      <Note>
        No issuer, reference or certificate service is connected. Consent
        authorizes a future check; it never changes a claim to verified.
        Conflicting information needs clarification, not an automatic fraud
        label.
      </Note>
      <Panel
        title={
          recruiter ? "Add a claim for verification review" : t("credentials")
        }
      >
        <form
          className="space-y-4"
          onSubmit={async (event) => {
            const form = event.currentTarget;
            const values = formValues(event);
            if (
              await perform("credential-add", {
                ...Object.fromEntries(values),
                candidateId: recruiter
                  ? values.get("candidateId")
                  : data.userId,
              })
            )
              form.reset();
          }}
        >
          {recruiter && (
            <Field label="Candidate">
              <CustomSelect name="candidateId" className="ts-auth-input">
                {data.candidates.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </CustomSelect>
            </Field>
          )}
          <Field label="Claim type">
            <CustomSelect name="kind" className="ts-auth-input">
              <option value="qualification">Qualification</option>
              <option value="certificate">Certificate</option>
              <option value="reference">Reference</option>
            </CustomSelect>
          </Field>
          <Field label="Qualification, certificate or reference claim">
            <input
              name="claim"
              required
              maxLength={500}
              className="ts-auth-input"
            />
          </Field>
          <Field label="Issuer or reference organization">
            <input
              name="issuer"
              required
              maxLength={300}
              className="ts-auth-input"
            />
          </Field>
          <Button type="submit" disabled={busy}>
            {t("save")}
          </Button>
        </form>
      </Panel>
      {data.credentials.map((credential) => (
        <Panel
          key={credential.id}
          title={credential.claim}
          aside={
            <Badge
              tone={credential.status === "conflict" ? "attention" : "neutral"}
            >
              {t(credential.status)}
            </Badge>
          }
        >
          <p className="text-xs text-slate-400">
            {candidateName(data, credential.candidateId)} · {credential.kind} ·{" "}
            {credential.issuer}
          </p>
          <p className="mt-4 text-sm leading-7">{credential.note}</p>
          <p className="mt-3 text-xs text-slate-500">
            Consent: {credential.consent ? "recorded" : "not granted"} · Issuer
            check: not performed
          </p>
          {recruiter ? (
            <div className="mt-5 space-y-5">
              <Button
                disabled={
                  busy ||
                  credential.consent ||
                  credential.consentRequested ||
                  credential.status === "consent_requested"
                }
                className="secondary"
                onClick={() =>
                  perform("verification-request", { id: credential.id })
                }
              >
                Request candidate consent in portal
              </Button>
              <form
                className="space-y-3"
                onSubmit={async (event) => {
                  const values = formValues(event);
                  await perform("verification-flag", {
                    id: credential.id,
                    reason: values.get("reason"),
                  });
                }}
              >
                <Field label="Information requiring human clarification">
                  <textarea
                    required
                    name="reason"
                    maxLength={2000}
                    className="ts-auth-input min-h-20"
                  />
                </Field>
                <Button type="submit" disabled={busy} className="secondary">
                  Record clarification request
                </Button>
              </form>
            </div>
          ) : (
            <Button
              disabled={busy}
              className="mt-5 secondary"
              onClick={() =>
                perform("verification-consent", {
                  id: credential.id,
                  consent: !credential.consent,
                })
              }
            >
              {credential.consent
                ? "Withdraw verification consent"
                : t("grant")}
            </Button>
          )}
        </Panel>
      ))}
      {!data.credentials.length && <Empty text={t("noRecords")} />}
    </div>
  );
}
export function InclusionPanel({ data, perform, busy, t }: FeatureContext) {
  const prefs = data.preferences[data.userId] || defaultPreferences();
  return (
    <div className="space-y-5">
      <Note>{t("translation")}</Note>
      <Panel title={t("inclusion")}>
        <form
          className="space-y-5"
          onSubmit={async (event) => {
            const values = formValues(event);
            await perform("preferences", {
              locale: values.get("locale"),
              largeText: values.get("largeText") === "on",
              lowBandwidth: values.get("lowBandwidth") === "on",
              format: values.get("format"),
              adjustment: values.get("adjustment"),
            });
          }}
        >
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label={t("language")}>
              <CustomSelect
                name="locale"
                key={prefs.locale}
                defaultValue={prefs.locale}
                className="ts-auth-input"
              >
                <option value="en">English</option>
                <option value="fr">Français</option>
                <option value="rw">Ikinyarwanda</option>
              </CustomSelect>
            </Field>
            <Field label={t("format")}>
              <CustomSelect
                name="format"
                defaultValue={prefs.format}
                className="ts-auth-input"
              >
                <option value="text">{t("text")}</option>
                <option value="accessible-text">{t("accessible")}</option>
                <option value="voice-request">{t("voice")}</option>
              </CustomSelect>
            </Field>
          </div>
          <label className="flex items-start gap-3 text-sm">
            <input
              type="checkbox"
              name="largeText"
              defaultChecked={prefs.largeText}
              className="mt-1 accent-brand"
            />
            {t("large")}
          </label>
          <label className="flex items-start gap-3 text-sm">
            <input
              type="checkbox"
              name="lowBandwidth"
              defaultChecked={prefs.lowBandwidth}
              className="mt-1 accent-brand"
            />
            {t("bandwidth")}
          </label>
          <Field label={t("adjustment")}>
            <textarea
              name="adjustment"
              defaultValue={prefs.adjustment}
              maxLength={2000}
              className="ts-auth-input min-h-28"
            />
          </Field>
          <p className="text-xs leading-7 text-slate-500">
            {t("preferenceNote")}
          </p>
          <Button type="submit" disabled={busy}>
            {t("save")}
          </Button>
        </form>
      </Panel>
      {data.role === "recruiter" && (
        <Panel title="Candidate-selected accommodations">
          {Object.entries(data.preferences)
            .filter(([id]) => id !== data.userId)
            .map(([id, p]) => (
              <div className="border-t border-[#e3e8dc] py-4" key={id}>
                <p className="text-sm font-medium">{candidateName(data, id)}</p>
                <p className="mt-2 text-xs leading-6 text-slate-500">
                  {p.locale} · {p.format} ·{" "}
                  {p.largeText ? "large text" : "standard text"} ·{" "}
                  {p.lowBandwidth ? "low-bandwidth" : "standard bandwidth"}
                </p>
                {p.adjustment && (
                  <p className="mt-2 text-sm leading-7">{p.adjustment}</p>
                )}
              </div>
            ))}
        </Panel>
      )}
    </div>
  );
}
