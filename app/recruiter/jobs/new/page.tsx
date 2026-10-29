"use client";
import CustomSelect from "@/components/CustomSelect";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { apiFetch } from "@/lib/api";
export default function NewJobPage() {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  async function save(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    setBusy(true);
    setError("");
    try {
      await apiFetch("/jobs", { method: "POST", body: form });
      router.push("/recruiter/jobs");
    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : "Unable to save this sample job.",
      );
    } finally {
      setBusy(false);
    }
  }
  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <Link
        href="/recruiter/jobs"
        className="inline-flex items-center gap-2 text-xs text-slate-500"
      >
        <ArrowLeft size={14} />
        Your jobs
      </Link>
      <div>
        <p className="ts-eyebrow text-brand">Make room for great talent</p>
        <h1 className="mt-2 text-3xl">Create a sample job.</h1>
        <p className="mt-3 text-sm text-slate-500">
          Review the hiring workflow with a fictional role. This does not
          publish a real vacancy.
        </p>
      </div>
      <form onSubmit={save} className="ts-panel space-y-6 p-6">
        <div className="grid gap-5 md:grid-cols-2">
          {[
            ["title", "Job title"],
            ["company", "Company"],
            ["department", "Department"],
            ["location", "Location"],
            ["salaryRange", "Salary range"],
          ].map(([name, label]) => (
            <label key={name} className="block text-xs font-medium">
              {label}
              {["title", "company"].includes(name) ? " *" : ""}
              <input
                name={name}
                required={["title", "company"].includes(name)}
                className="ts-auth-input mt-2"
                placeholder={label}
              />
            </label>
          ))}
          <label className="block text-xs font-medium">
            Experience level
            <CustomSelect
              name="experienceLevel"
              className="ts-auth-input mt-2"
              defaultValue="Mid-Level"
            >
              {["Entry-Level", "Mid-Level", "Senior", "Lead"].map((level) => (
                <option key={level}>{level}</option>
              ))}
            </CustomSelect>
          </label>
          <label className="block text-xs font-medium">
            Applicant target
            <input
              name="applicantsTarget"
              type="number"
              min={1}
              max={100000}
              defaultValue={20}
              required
              className="ts-auth-input mt-2"
            />
          </label>
        </div>
        <label className="block text-xs font-medium">
          Job description
          <textarea
            name="description"
            className="ts-auth-input mt-2 min-h-40"
            placeholder="Describe the responsibilities, outcomes and criteria for this fictional role."
          />
        </label>
        {error && (
          <p role="alert" className="text-xs text-red-600">
            {error}
          </p>
        )}
        <div className="flex gap-3">
          <button disabled={busy} className="ts-button disabled:opacity-50">
            {busy ? "Saving sample…" : "Save sample job"}
            <ArrowRight size={15} />
          </button>
          <Link href="/recruiter/jobs" className="ts-button secondary">
            Cancel
          </Link>
        </div>
      </form>
    </div>
  );
}
