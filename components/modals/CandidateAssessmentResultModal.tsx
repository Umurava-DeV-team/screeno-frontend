"use client";
import Modal from "./Modal";
import { Download } from "lucide-react";
import type { DemoEvaluation } from "@/lib/demo/types";
interface Result {
  id?: string;
  status?: string;
  percentage?: number;
  timeTakenMinutes?: number;
  passingScore?: number;
  title?: string;
  verifiedCandidateName?: string;
  verifiedCandidateEmail?: string;
  overallFeedback?: string;
  evaluatedAnswers?: DemoEvaluation[];
}
export default function CandidateAssessmentResultModal({
  isOpen,
  onClose,
  result,
}: {
  isOpen: boolean;
  onClose: () => void;
  result: Result | null;
}) {
  if (!result) return null;
  const evaluated = result.status === "evaluated";
  const complete = evaluated || result.status === "submitted";
  const threshold = result.passingScore ?? 70;
  const percentage = Math.round(result.percentage ?? 0);
  const state = evaluated
    ? percentage >= threshold
      ? "Sample threshold met"
      : "Below sample threshold"
    : complete
      ? "Human review pending"
      : "Not submitted";
  function download() {
    if (!result) return;
    const content = [
      "SCREENO — LOCAL SAMPLE REPORT",
      result.title || "Sample assessment",
      "Candidate: " + (result.verifiedCandidateName || "Sample candidate"),
      "Status: " + state,
      "Local sample score: " + (evaluated ? percentage + "%" : "Pending"),
      "Threshold: " + threshold + "%",
      "Time: " + (result.timeTakenMinutes ?? 0) + " minutes",
      "Proctoring: not performed. AI evaluation: disabled.",
      result.overallFeedback || "",
      "No hiring recommendation is made by this preview.",
    ].join("\n");
    const href = URL.createObjectURL(
      new Blob([content], { type: "text/plain;charset=utf-8" }),
    );
    const link = document.createElement("a");
    link.href = href;
    link.download = "screeno-sample-report.txt";
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(href);
  }
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Sample assessment result"
      width="max-w-2xl"
    >
      <div className="space-y-6 p-6">
        <div>
          <p className="ts-eyebrow text-brand">Local preview</p>
          <h2 className="mt-3 text-xl font-semibold">
            {result.verifiedCandidateName || "Sample candidate"}
          </h2>
          <p className="mt-2 text-xs text-slate-500">
            {result.verifiedCandidateEmail}
          </p>
        </div>
        <div className="rounded border border-brand/15 bg-brand/5 p-5">
          <p className="text-2xl font-semibold">
            {evaluated ? percentage + "%" : state}
          </p>
          <p className="mt-2 text-xs text-slate-500">
            {state} · threshold {threshold}%
          </p>
        </div>
        <p className="text-sm leading-7 text-slate-500">
          {result.overallFeedback ||
            "No sample response has been submitted yet."}
        </p>
        <p className="text-xs leading-6 text-slate-400">
          Proctoring is not performed. AI evaluation is disabled. Sample scores
          are not verified evidence or automatic hiring recommendations.
        </p>
        {result.evaluatedAnswers?.map((item) => (
          <div key={item.questionId} className="border-t border-[#e3e8dc] pt-4">
            <p className="text-xs font-medium">
              Question {item.questionId} · {item.score}/{item.maxMarks}
            </p>
            <p className="mt-2 text-xs leading-6 text-slate-500">
              {item.feedback}
            </p>
          </div>
        ))}
        <button onClick={download} className="ts-button secondary">
          <Download size={15} />
          Download local sample report
        </button>
      </div>
    </Modal>
  );
}
