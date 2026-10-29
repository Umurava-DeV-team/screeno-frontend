"use client";
import { useParams } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, CheckCircle2 } from "lucide-react";
import { usePreviewResource } from "@/lib/demo/usePreviewResource";
import type { DemoAssignment, DemoQuestion } from "@/lib/demo/types";
type Result = DemoAssignment & {
  title: string;
  questions: DemoQuestion[];
  passingScore: number;
};
export default function ResultsPage() {
  const { token } = useParams();
  const resource = usePreviewResource<Result>("/assessments/" + String(token));
  if (resource.loading || !resource.data)
    return (
      <div className="ts-panel p-8" role={resource.error ? "alert" : "status"}>
        {resource.error || "Loading local sample results…"}
      </div>
    );
  const data = resource.data;
  const pending = data.status === "submitted";
  const completed = ["submitted", "evaluated"].includes(data.status);
  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <Link
        href="/candidate/assessments"
        className="inline-flex items-center gap-2 text-xs text-slate-500"
      >
        <ArrowLeft size={14} />
        Your assessments
      </Link>
      <div>
        <p className="ts-eyebrow text-brand">Your sample results</p>
        <h1 className="mt-2 text-3xl">{data.title}</h1>
        <p className="mt-3 text-sm text-slate-500">
          Local sample output. No external assessment, AI evaluation, email or
          verified proctoring took place.
        </p>
      </div>
      {!completed ? (
        <section className="ts-panel p-8">
          <p className="text-sm">
            This sample assignment has not been submitted.
          </p>
          <Link
            href={"/candidate/assessments/" + String(token)}
            className="ts-button mt-5"
          >
            Continue sample session
          </Link>
        </section>
      ) : (
        <>
          <section className="ts-panel p-6">
            <div className="flex flex-wrap items-center gap-6">
              <CheckCircle2 size={28} className="text-brand" />
              <div>
                <p className="text-3xl font-semibold">
                  {pending
                    ? "Review pending"
                    : Math.round(data.percentage) + "%"}
                </p>
                <p className="mt-2 text-xs text-slate-500">
                  {pending
                    ? "Open responses need a human review."
                    : data.passed
                      ? "Passed the sample threshold"
                      : "Below the sample threshold"}{" "}
                  · threshold {data.passingScore}%
                </p>
              </div>
              <p className="ml-auto text-xs text-slate-500">
                {data.timeTakenMinutes} minutes · local session
              </p>
            </div>
            <p className="mt-5 text-sm leading-7 text-slate-500">
              {data.overallFeedback}
            </p>
          </section>
          {data.questions.map((q) => {
            const answer = data.answers.find((a) => a.questionId === q.id),
              evaluation = data.evaluatedAnswers.find(
                (a) => a.questionId === q.id,
              );
            return (
              <article key={q.id} className="ts-panel p-6">
                <h2 className="text-sm font-semibold">{q.question}</h2>
                <p className="mt-4 rounded bg-canvas p-4 text-sm leading-6">
                  {answer?.answer || "No answer saved."}
                </p>
                {evaluation && (
                  <p className="mt-3 text-xs text-slate-500">
                    {evaluation.feedback}
                    {q.type === "multiple_choice"
                      ? " · " + evaluation.score + "/" + evaluation.maxMarks
                      : ""}
                  </p>
                )}
              </article>
            );
          })}
        </>
      )}
    </div>
  );
}
