"use client";
import CustomSelect from "@/components/CustomSelect";

import type { ReactNode, ButtonHTMLAttributes, FormEvent } from "react";
import type { IntelligenceSnapshot } from "@/lib/intelligence/types";
import type { translate } from "@/lib/intelligence/locale";
export interface FeatureContext {
  data: IntelligenceSnapshot;
  perform: (action: string, input: Record<string, unknown>) => Promise<boolean>;
  busy: boolean;
  t: (key: Parameters<typeof translate>[1]) => string;
}
export function Panel({
  title,
  children,
  aside,
}: {
  title: string;
  children: ReactNode;
  aside?: ReactNode;
}) {
  return (
    <section className="ts-panel p-5 sm:p-6">
      <div className="mb-5 flex flex-wrap items-start justify-between gap-3">
        <h2 className="text-base font-semibold tracking-tight">{title}</h2>
        {aside}
      </div>
      {children}
    </section>
  );
}
export function Badge({
  children,
  tone = "neutral",
}: {
  children: ReactNode;
  tone?: "neutral" | "good" | "attention";
}) {
  return (
    <span
      className={
        "inline-flex rounded border px-2 py-1 text-[10px] font-medium " +
        (tone === "good"
          ? "border-lime/60 bg-lime/25 text-ink"
          : tone === "attention"
            ? "border-amber-200 bg-amber-50 text-amber-800"
            : "border-brand/10 bg-brand/5 text-brand")
      }
    >
      {children}
    </span>
  );
}
export function Button({
  children,
  className = "",
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      type="button"
      {...props}
      className={"ts-button disabled:opacity-40 " + className}
    >
      {children}
    </button>
  );
}
export function Field({
  label,
  children,
}: {
  label: string;
  children: ReactNode;
}) {
  return (
    <label className="block text-xs font-medium">
      <span className="mb-2 block">{label}</span>
      {children}
    </label>
  );
}
export function Note({ children }: { children: ReactNode }) {
  return (
    <p className="rounded-md border border-brand/10 bg-brand/5 p-4 text-xs leading-6 text-slate-600">
      {children}
    </p>
  );
}
export function Empty({ text }: { text: string }) {
  return (
    <p className="rounded-md border border-dashed border-[#dce3d3] p-6 text-sm text-slate-500">
      {text}
    </p>
  );
}
export function formValues(event: FormEvent<HTMLFormElement>) {
  event.preventDefault();
  return new FormData(event.currentTarget);
}
export function candidateName(data: IntelligenceSnapshot, id: string) {
  return (
    data.candidates.find((c) => c.id === id)?.name || "Removed sample candidate"
  );
}
export function jobName(data: IntelligenceSnapshot, id: string) {
  return (
    data.jobs.find((j) => j.id === id)?.title || "Role no longer available"
  );
}
export function RubricForm({
  criteria,
  onSubmit,
  busy,
  feedback = false,
  checks = [],
}: {
  criteria: { id: string; label: string; anchor: string }[];
  onSubmit: (input: Record<string, unknown>) => Promise<boolean>;
  busy: boolean;
  feedback?: boolean;
  checks?: string[];
}) {
  return (
    <form
      className="mt-5 space-y-4"
      onSubmit={async (e) => {
        const fields = formValues(e);
        await onSubmit({
          scores: criteria.map((c) => ({
            criterion: c.id,
            score: Number(fields.get("score-" + c.id)),
            reason: String(fields.get("reason-" + c.id) || ""),
          })),
          feedback: String(fields.get("feedback") || ""),
          checks: fields.getAll("checks"),
        });
      }}
    >
      {criteria.map((c) => (
        <div key={c.id} className="rounded border border-[#e1e6db] p-4">
          <div className="grid gap-4 sm:grid-cols-[1fr_100px]">
            <div>
              <h3 className="text-sm font-medium">{c.label}</h3>
              <p className="mt-2 text-xs leading-6 text-slate-500">
                {c.anchor}
              </p>
            </div>
            <Field label="Human score / 4">
              <CustomSelect
                name={"score-" + c.id}
                className="ts-auth-input"
                defaultValue="2"
              >
                {[0, 1, 2, 3, 4].map((score) => (
                  <option key={score}>{score}</option>
                ))}
              </CustomSelect>
            </Field>
          </div>
          <Field label="Evidence from the saved response">
            <textarea
              name={"reason-" + c.id}
              required
              maxLength={2000}
              className="ts-auth-input mt-2 min-h-20"
              placeholder="Cite the candidate’s answer or artifact and explain this rating."
            />
          </Field>
        </div>
      ))}
      {!!checks.length && (
        <fieldset className="space-y-3">
          <legend className="mb-3 text-xs font-semibold">
            Reviewer test-case checklist · manually checked
          </legend>
          {checks.map((check) => (
            <label
              key={check}
              className="flex items-start gap-3 text-xs leading-5"
            >
              <input
                name="checks"
                type="checkbox"
                value={check}
                className="mt-1 accent-brand"
              />
              {check}
            </label>
          ))}
        </fieldset>
      )}
      {feedback && (
        <Field label="Feedback to the candidate">
          <textarea
            required
            name="feedback"
            maxLength={3000}
            className="ts-auth-input min-h-24"
          />
        </Field>
      )}
      <Button type="submit" disabled={busy}>
        Publish human review
      </Button>
    </form>
  );
}
