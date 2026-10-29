"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, ArrowRight, CheckCircle2, Clock } from "lucide-react";
import { usePreviewResource } from "@/lib/demo/usePreviewResource";
import { apiFetch } from "@/lib/api";
import type { DemoAssignment, DemoQuestion } from "@/lib/demo/types";
type Assignment = DemoAssignment & {
  title: string;
  questions: DemoQuestion[];
  durationMinutes: number;
};
export default function CandidateAssessmentSession() {
  const { token } = useParams();
  const router = useRouter();
  const path = "/assessments/" + String(token);
  const resource = usePreviewResource<Assignment>(path);
  const [index, setIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [clock, setClock] = useState(0);
  useEffect(() => {
    const timer = setInterval(() => setClock(Date.now()), 1000);
    return () => clearInterval(timer);
  }, []);
  const data = resource.data;
  if (resource.loading || !data)
    return (
      <div className="mx-auto max-w-3xl p-8">
        <p
          role={resource.error ? "alert" : "status"}
          className="ts-panel p-8 text-sm"
        >
          {resource.error || "Loading sample assessment…"}
        </p>
        <Link
          href="/candidate/assessments"
          className="mt-5 inline-flex text-xs text-brand"
        >
          Back to assessments
        </Link>
      </div>
    );
  const question = data.questions[Math.min(index, data.questions.length - 1)];
  const answer = question
    ? (answers[question.id] ??
      data.answers.find((a) => a.questionId === question.id)?.answer ??
      "")
    : "";
  const completed = ["submitted", "evaluated"].includes(data.status);
  const remaining =
    data.startedAt && clock
      ? Math.max(
          0,
          Math.ceil(
            (new Date(data.startedAt).getTime() +
              data.durationMinutes * 60000 -
              clock) /
              1000,
          ),
        )
      : data.durationMinutes * 60;
  async function start() {
    setBusy(true);
    setError("");
    try {
      await apiFetch(path + "/start", { method: "POST" });
      resource.refresh();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Unable to start the sample.");
    } finally {
      setBusy(false);
    }
  }
  async function save(final = false, direction = 1) {
    if (!data || !question) return;
    setBusy(true);
    setError("");
    try {
      await apiFetch(path + "/answer", {
        method: "POST",
        body: JSON.stringify({ questionId: question.id, answer }),
      });
      if (final) {
        const elapsed = data.startedAt
          ? Math.max(
              0,
              Math.ceil(
                (Date.now() - new Date(data.startedAt).getTime()) / 60000,
              ),
            )
          : 0;
        await apiFetch(path + "/submit", {
          method: "POST",
          body: JSON.stringify({ timeTakenMinutes: elapsed }),
        });
        router.push("/candidate/assessments/" + String(token) + "/results");
      } else
        setIndex(
          Math.max(0, Math.min(index + direction, data.questions.length - 1)),
        );
    } catch (e) {
      setError(
        e instanceof Error
          ? e.message
          : "Your sample response could not be saved. Please retry.",
      );
    } finally {
      setBusy(false);
    }
  }
  return (
    <div className="min-h-svh bg-canvas pb-24">
      <header className="border-b border-[#dfe5d7] bg-white px-5 py-5">
        <div className="mx-auto flex max-w-4xl items-center justify-between">
          <Link
            href="/candidate/assessments"
            className="inline-flex items-center gap-2 text-xs text-slate-500"
          >
            <ArrowLeft size={14} />
            Your assessments
          </Link>
          <span className="rounded bg-brand/5 px-3 py-2 text-[10px] font-medium text-brand">
            Sample session · No proctoring
          </span>
        </div>
      </header>
      <main className="mx-auto max-w-3xl space-y-6 px-5 pt-10">
        <div>
          <p className="ts-eyebrow text-brand">Show your thinking</p>
          <h1 className="mt-3 text-3xl font-semibold tracking-tight">
            {data.title}
          </h1>
          <p className="mt-3 text-sm leading-7 text-slate-500">
            A local preview with sample questions. Your responses stay in this
            browser. No microphone, camera, AI service or email is used.
          </p>
        </div>
        {completed ? (
          <section className="ts-panel p-8">
            <CheckCircle2 size={28} className="text-brand" />
            <h2 className="mt-4 text-xl font-semibold">
              This sample session is complete.
            </h2>
            <p className="mt-3 text-sm text-slate-500">
              Your saved sample responses are available in the local results
              view.
            </p>
            <Link
              href={"/candidate/assessments/" + String(token) + "/results"}
              className="ts-button mt-6"
            >
              View sample results <ArrowRight size={15} />
            </Link>
          </section>
        ) : data.status === "assigned" ? (
          <section className="ts-panel p-8">
            <h2 className="text-lg font-semibold">Ready when you are.</h2>
            <ul className="mt-5 space-y-3 text-sm text-slate-500">
              <li>
                {data.questions.length} questions · {data.durationMinutes}{" "}
                minutes of sample session time
              </li>
              <li>
                Multiple-choice questions are scored against a local sample key.
              </li>
              <li>
                Open responses wait for human review. No automated grading is
                simulated.
              </li>
              <li>
                Saved answers persist when you refresh. This is not a secure
                production exam.
              </li>
            </ul>
            <button disabled={busy} onClick={start} className="ts-button mt-7">
              Start sample session <ArrowRight size={15} />
            </button>
          </section>
        ) : question ? (
          <section className="ts-panel p-6 sm:p-8">
            <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
              <span className="text-xs text-slate-500">
                Question {index + 1} of {data.questions.length}
              </span>
              <span className="inline-flex items-center gap-2 text-xs text-slate-500">
                <Clock size={14} />
                {Math.floor(remaining / 60)}:
                {String(remaining % 60).padStart(2, "0")} · local timer
              </span>
            </div>
            <h2 className="text-lg font-semibold leading-8">
              {question.question}
            </h2>
            {question.type === "multiple_choice" ? (
              <fieldset className="mt-6 space-y-3">
                <legend className="sr-only">Select an answer</legend>
                {question.options?.map((option) => (
                  <label
                    key={option}
                    className={
                      "flex cursor-pointer items-start gap-3 rounded-md border p-4 text-sm " +
                      (answer === option
                        ? "border-brand bg-brand/5"
                        : "border-[#e0e6d8]")
                    }
                  >
                    <input
                      type="radio"
                      name={"question-" + question.id}
                      value={option}
                      checked={answer === option}
                      onChange={() =>
                        setAnswers({ ...answers, [question.id]: option })
                      }
                      className="mt-1 accent-brand"
                    />
                    <span>{option}</span>
                  </label>
                ))}
              </fieldset>
            ) : (
              <label className="mt-6 block text-xs font-medium">
                Your response
                <textarea
                  value={answer}
                  onChange={(e) =>
                    setAnswers({ ...answers, [question.id]: e.target.value })
                  }
                  className="ts-auth-input mt-2 min-h-48"
                  placeholder="Explain your approach in your own words."
                />
              </label>
            )}
            <div className="mt-7 flex flex-wrap justify-between gap-3">
              <button
                disabled={index === 0 || busy}
                onClick={() => save(false, -1)}
                className="ts-button secondary disabled:opacity-40"
              >
                Previous
              </button>
              <button
                disabled={busy}
                onClick={() => save(index === data.questions.length - 1)}
                className="ts-button disabled:opacity-50"
              >
                {busy
                  ? "Saving…"
                  : index === data.questions.length - 1
                    ? "Save & submit sample"
                    : "Save & next"}
                <ArrowRight size={15} />
              </button>
            </div>
            {remaining === 0 && (
              <p className="mt-4 text-xs text-amber-700">
                The local preview timer has ended. Submit your saved work when
                ready; production deadline enforcement will be
                server-controlled.
              </p>
            )}
          </section>
        ) : (
          <p className="ts-panel p-6 text-sm">
            No sample questions are available.
          </p>
        )}
        {error && (
          <p
            role="alert"
            className="rounded border border-red-200 bg-red-50 p-4 text-xs text-red-700"
          >
            {error}
          </p>
        )}
      </main>
    </div>
  );
}
