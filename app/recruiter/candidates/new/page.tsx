"use client";
import CustomSelect from "@/components/CustomSelect";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { apiFetch } from "@/lib/api";
import { usePreviewResource } from "@/lib/demo/usePreviewResource";
import type { DemoJob } from "@/lib/demo/types";
export default function NewCandidatePage() {
  const router = useRouter();
  const jobs = usePreviewResource<DemoJob[]>("/jobs");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  async function save(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    setBusy(true);
    setError("");
    try {
      await apiFetch("/candidates", { method: "POST", body: form });
      router.push("/recruiter/candidates");
    } catch (e) {
      setError(
        e instanceof Error ? e.message : "Unable to save the sample candidate.",
      );
    } finally {
      setBusy(false);
    }
  }
  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <Link
        href="/recruiter/candidates"
        className="inline-flex items-center gap-2 text-xs text-slate-500"
      >
        <ArrowLeft size={14} />
        Talent pool
      </Link>
      <div>
        <p className="ts-eyebrow text-brand">A new connection</p>
        <h1 className="mt-2 text-3xl">Add a sample candidate.</h1>
        <p className="mt-3 text-sm text-slate-500">
          Use fictional information. This record stays in the current browser.
        </p>
      </div>
      <form onSubmit={save} className="ts-panel space-y-6 p-6">
        <div className="grid gap-5 md:grid-cols-2">
          {[
            ["name", "Full name", "text"],
            ["email", "Email address", "email"],
            ["phone", "Phone", "tel"],
            ["location", "Location", "text"],
            ["currentRole", "Current role", "text"],
          ].map(([name, label, type]) => (
            <label key={name} className="block text-xs font-medium">
              {label}
              {["name", "email"].includes(name) ? " *" : ""}
              <input
                name={name}
                type={type}
                required={["name", "email"].includes(name)}
                className="ts-auth-input mt-2"
                placeholder={
                  name === "email" ? "sample@example.invalid" : label
                }
              />
            </label>
          ))}
          <label className="block text-xs font-medium">
            Associated job
            <CustomSelect
              name="jobId"
              className="ts-auth-input mt-2"
              disabled={jobs.loading || !!jobs.error}
            >
              <option value="">Talent pool only</option>
              {jobs.data?.map((j) => (
                <option key={j.id} value={j.id}>
                  {j.title}
                </option>
              ))}
            </CustomSelect>
          </label>
        </div>
        {jobs.error && (
          <p role="alert" className="text-xs text-red-600">
            {jobs.error}
          </p>
        )}
        <label className="block text-xs font-medium">
          Skills
          <input
            name="skills"
            className="ts-auth-input mt-2"
            placeholder="React, TypeScript, Accessibility"
          />
          <span className="mt-2 block text-[11px] font-normal text-slate-400">
            Separate skills with commas.
          </span>
        </label>
        {[
          ["experience", "Experience"],
          ["education", "Education"],
          ["summary", "Candidate summary"],
        ].map(([name, label]) => (
          <label key={name} className="block text-xs font-medium">
            {label}
            <textarea name={name} className="ts-auth-input mt-2 min-h-24" />
          </label>
        ))}
        {error && (
          <p role="alert" className="text-xs text-red-600">
            {error}
          </p>
        )}
        <div className="flex gap-3">
          <button disabled={busy} className="ts-button disabled:opacity-50">
            {busy ? "Saving sample…" : "Save sample candidate"}
            <ArrowRight size={15} />
          </button>
          <Link href="/recruiter/candidates" className="ts-button secondary">
            Cancel
          </Link>
        </div>
      </form>
    </div>
  );
}
