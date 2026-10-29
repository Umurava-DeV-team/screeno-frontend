"use client";
import CustomSelect from "@/components/CustomSelect";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { usePreviewResource } from "@/lib/demo/usePreviewResource";
import type { DemoJob } from "@/lib/demo/types";
import { apiFetch } from "@/lib/api";
import PreviewResourceState from "@/components/PreviewResourceState";
export default function NewAssessmentPage() {
  const router = useRouter();
  const jobs = usePreviewResource<DemoJob[]>("/jobs");
  const [jobId, setJobId] = useState("");
  const [title, setTitle] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  async function create(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError("");
    try {
      const value = await apiFetch<{ id: string }>(
        "/assessments/generate-draft",
        { method: "POST", body: JSON.stringify({ jobId }) },
      );
      if (title.trim())
        await apiFetch("/assessments/" + value.id, {
          method: "PATCH",
          body: JSON.stringify({ title: title.trim() }),
        });
      router.push("/recruiter/assessments/edit/" + value.id);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Unable to create a draft.");
    } finally {
      setBusy(false);
    }
  }
  if (jobs.loading || !jobs.data)
    return <PreviewResourceState loading={jobs.loading} error={jobs.error} />;
  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <Link
        href="/recruiter/assessments/drafts"
        className="inline-flex items-center gap-2 text-xs text-slate-500"
      >
        <ArrowLeft size={14} />
        Assessment drafts
      </Link>
      <div>
        <p className="ts-eyebrow text-brand">A thoughtful next step</p>
        <h1 className="mt-2 text-3xl">Build a sample assessment.</h1>
        <p className="mt-3 text-sm leading-7 text-slate-500">
          Start with a local question template, then review the questions,
          timing and passing threshold before assigning it to sample candidates.
        </p>
      </div>
      <form onSubmit={create} className="ts-panel space-y-5 p-6">
        <label className="block text-xs font-medium">
          Job
          <CustomSelect
            required
            value={jobId}
            onChange={(e) => setJobId(e.target.value)}
            className="ts-auth-input mt-2"
          >
            <option value="">Choose a sample job</option>
            {jobs.data.map((j) => (
              <option key={j.id} value={j.id}>
                {j.title}
              </option>
            ))}
          </CustomSelect>
        </label>
        <label className="block text-xs font-medium">
          Assessment title{" "}
          <span className="font-normal text-slate-400">(optional)</span>
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="ts-auth-input mt-2"
            placeholder="Use the job title, or add your own"
          />
        </label>
        <p className="rounded bg-canvas p-4 text-xs leading-6 text-slate-500">
          This preview uses five sample multiple-choice questions. AI
          generation, coding execution, external invitations and proctoring are
          disconnected.
        </p>
        {error && (
          <p role="alert" className="text-xs text-red-600">
            {error}
          </p>
        )}
        <button
          disabled={busy || !jobs.data.length}
          className="ts-button disabled:opacity-50"
        >
          {busy ? "Creating sample draft…" : "Create draft"}
          <ArrowRight size={15} />
        </button>
      </form>
    </div>
  );
}
