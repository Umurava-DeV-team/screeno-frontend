"use client";
import CustomSelect from "@/components/CustomSelect";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowRight } from "lucide-react";
import Modal from "./Modal";
import { useAppDispatch } from "@/lib/store/hooks";
import { runScreening } from "@/lib/store/features/screeningSlice";
import type { ApiJob } from "@/lib/store/features/jobsSlice";
export default function AIScreeningModal({
  isOpen,
  onClose,
  job,
}: {
  isOpen: boolean;
  onClose: () => void;
  job: ApiJob | null;
}) {
  const dispatch = useAppDispatch();
  const router = useRouter();
  const [topN, setTopN] = useState(5);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  if (!job) return null;
  async function run() {
    if (!job) return;
    const jobId = job._id || job.id;
    if (!jobId) {
      setError("Choose a sample job first.");
      return;
    }
    setBusy(true);
    setError("");
    const result = await dispatch(runScreening({ jobId, topN }));
    setBusy(false);
    if (runScreening.fulfilled.match(result)) {
      onClose();
      router.push("/recruiter/screenings/" + result.payload.id);
    } else
      setError(String(result.payload || "Unable to create sample results."));
  }
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Screening preview"
      width="max-w-xl"
    >
      <div className="space-y-6 p-6">
        <div>
          <p className="ts-eyebrow text-brand">
            Review the shortlist experience
          </p>
          <h2 className="mt-3 text-xl font-semibold">{job.title}</h2>
          <p className="mt-3 text-sm leading-7 text-slate-500">
            Create illustrative results from this job’s sample candidates.
            Scores follow a fixed sample pattern; no AI model evaluates skills
            or makes a hiring recommendation.
          </p>
        </div>
        <label className="block text-xs font-medium">
          Maximum sample shortlist size
          <CustomSelect
            value={topN}
            onChange={(e) => setTopN(Number(e.target.value))}
            className="ts-auth-input mt-2"
          >
            {[5, 10, 20, 50].map((value) => (
              <option key={value} value={value}>
                {value} candidates
              </option>
            ))}
          </CustomSelect>
        </label>
        {error && (
          <p role="alert" className="text-xs text-red-600">
            {error}
          </p>
        )}
        <div className="flex gap-3">
          <button
            disabled={busy}
            onClick={run}
            className="ts-button disabled:opacity-50"
          >
            {busy ? "Preparing local sample…" : "View sample results"}
            <ArrowRight size={15} />
          </button>
          <button onClick={onClose} className="ts-button secondary">
            Cancel
          </button>
        </div>
      </div>
    </Modal>
  );
}
