"use client";
import { useParams } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { usePreviewResource } from "@/lib/demo/usePreviewResource";
import type { DemoAssignment, DemoAssessment } from "@/lib/demo/types";
import PreviewResourceState from "@/components/PreviewResourceState";
type Response = DemoAssignment & { assessment: DemoAssessment };
export default function CandidateSubmissionPage() {
  const { id, candidateId } = useParams();
  const resource = usePreviewResource<Response[]>(
    "/assessments/" + String(id) + "/assignments",
  );
  if (resource.loading || !resource.data)
    return (
      <PreviewResourceState loading={resource.loading} error={resource.error} />
    );
  const response = resource.data.find((a) => a.candidateId === candidateId);
  if (!response)
    return (
      <PreviewResourceState
        loading={false}
        error="No sample assignment exists for this candidate."
      />
    );
  return (
    <div className="space-y-6">
      <Link
        href={"/recruiter/assessments/" + String(id)}
        className="inline-flex items-center gap-2 text-xs text-slate-500"
      >
        <ArrowLeft size={14} />
        Assessment details
      </Link>
      <div>
        <p className="ts-eyebrow text-brand">Local sample response</p>
        <h1 className="mt-2 text-3xl">{response.candidateName}</h1>
        <p className="mt-2 text-xs text-slate-500">
          {response.assessment.title} · {response.status}
        </p>
      </div>
      <div className="ts-panel p-6">
        <p className="text-sm leading-7">
          {response.overallFeedback ||
            "This sample assignment has not been submitted."}
        </p>
        <p className="mt-3 text-xs text-slate-500">
          Proctoring: not performed. AI evaluation: disabled.
        </p>
      </div>
      {response.assessment.questions.map((q) => {
        const answer = response.answers.find((a) => a.questionId === q.id),
          evaluation = response.evaluatedAnswers.find(
            (a) => a.questionId === q.id,
          );
        return (
          <article key={q.id} className="ts-panel p-6">
            <h2 className="text-sm font-semibold">{q.question}</h2>
            <p className="mt-4 rounded bg-canvas p-4 text-sm leading-7">
              {answer?.answer || "No answer saved."}
            </p>
            {evaluation && (
              <p className="mt-3 text-xs text-slate-500">
                {evaluation.score}/{evaluation.maxMarks} · {evaluation.feedback}
              </p>
            )}
          </article>
        );
      })}
    </div>
  );
}
