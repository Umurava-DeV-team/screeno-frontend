"use client";
import { useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { usePreviewResource } from "@/lib/demo/usePreviewResource";
import type { DemoAssessment, DemoCandidate } from "@/lib/demo/types";
import { apiFetch } from "@/lib/api";
import PreviewResourceState from "@/components/PreviewResourceState";
export default function LaunchAssessmentPage() {
  const { id } = useParams();
  const router = useRouter();
  const test = usePreviewResource<DemoAssessment>("/assessments/" + String(id));
  const people = usePreviewResource<DemoCandidate[]>("/candidates");
  const [selected, setSelected] = useState<string[]>([]);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  if (test.loading || people.loading || !test.data || !people.data)
    return (
      <PreviewResourceState
        loading={test.loading || people.loading}
        error={test.error || people.error}
      />
    );
  async function launch() {
    setBusy(true);
    setError("");
    try {
      await apiFetch("/assessments/" + String(id) + "/launch", {
        method: "POST",
        body: JSON.stringify({ candidateIds: selected }),
      });
      router.push("/recruiter/assessments/" + String(id));
    } catch (e) {
      setError(
        e instanceof Error
          ? e.message
          : "Unable to assign this sample assessment.",
      );
    } finally {
      setBusy(false);
    }
  }
  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <Link
        href={"/recruiter/assessments/edit/" + String(id)}
        className="inline-flex items-center gap-2 text-xs text-slate-500"
      >
        <ArrowLeft size={14} />
        Back to draft
      </Link>
      <div>
        <p className="ts-eyebrow text-brand">Ready for a review</p>
        <h1 className="mt-2 text-3xl">Assign the sample assessment.</h1>
        <p className="mt-3 text-sm leading-7 text-slate-500">
          {test.data.title} · {test.data.totalQuestions} questions ·{" "}
          {test.data.durationMinutes} minutes
        </p>
      </div>
      <section className="ts-panel space-y-5 p-6">
        <p className="rounded bg-brand/5 p-4 text-xs leading-6 text-slate-500">
          Assignments are created locally. No invitations or emails are sent.
          Select Amara Niyonzima to try this assessment in the candidate
          preview. Editing closes once the sample assessment is active.
        </p>
        {test.data.status !== "draft" ? (
          <p className="text-sm text-slate-500">
            This assessment is already {test.data.status}.
          </p>
        ) : (
          <>
            <h2 className="text-sm font-semibold">
              Select sample candidates · {selected.length} selected
            </h2>
            <div className="max-h-96 divide-y divide-[#e4e8de] overflow-auto rounded border border-[#e4e8de]">
              {people.data.map((c) => (
                <label
                  key={c.id}
                  className="flex cursor-pointer items-start gap-3 p-4 text-sm hover:bg-canvas"
                >
                  <input
                    type="checkbox"
                    checked={selected.includes(c.id)}
                    onChange={() =>
                      setSelected(
                        selected.includes(c.id)
                          ? selected.filter((id) => id !== c.id)
                          : [...selected, c.id],
                      )
                    }
                    className="mt-1 accent-brand"
                  />
                  <span>
                    <span className="block font-medium">{c.name}</span>
                    <span className="mt-1 block text-xs text-slate-400">
                      {c.currentRole} · {c.email}
                    </span>
                  </span>
                </label>
              ))}
            </div>
            {!people.data.length && (
              <p className="text-sm text-slate-500">
                Add a sample candidate first.
              </p>
            )}
            <button
              onClick={launch}
              disabled={busy || selected.length === 0}
              className="ts-button disabled:opacity-40"
            >
              {busy
                ? "Creating local assignments…"
                : "Assign to " +
                  selected.length +
                  " sample candidate" +
                  (selected.length === 1 ? "" : "s")}
              <ArrowRight size={15} />
            </button>
          </>
        )}
        {error && (
          <p role="alert" className="text-xs text-red-600">
            {error}
          </p>
        )}
      </section>
    </div>
  );
}
