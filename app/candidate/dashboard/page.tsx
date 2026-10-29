"use client";
import { useEffect } from "react";
import Link from "next/link";
import {
  ArrowRight,
  ArrowUpRight,
  Briefcase,
  Check,
  CheckCircle2,
  Clock,
  FileCheck2,
  MapPin,
  Trophy,
} from "lucide-react";
import { useAppDispatch, useAppSelector } from "@/lib/store/hooks";
import { fetchMyApplications } from "@/lib/store/features/applicationSlice";
import { fetchProfile } from "@/lib/store/features/profileSlice";
import { fetchJobs } from "@/lib/store/features/jobsSlice";
import { fetchMyAssessments } from "@/lib/store/features/assessmentSlice";
import MetricCard from "@/components/MetricCard";

export default function CandidateDashboard() {
  const dispatch = useAppDispatch();
  const { user } = useAppSelector((s) => s.auth);
  const { myApplications, error: appsError } = useAppSelector(
    (s) => s.application,
  );
  const { profile } = useAppSelector((s) => s.profile);
  const { jobs, error: jobsError } = useAppSelector((s) => s.jobs);
  const { assessments } = useAppSelector((s) => s.assessments);
  useEffect(() => {
    dispatch(fetchMyApplications());
    dispatch(fetchProfile());
    dispatch(fetchJobs());
    dispatch(fetchMyAssessments());
  }, [dispatch]);
  const completed = assessments.filter((a) =>
    ["submitted", "evaluated"].includes(a.status),
  ).length;
  const shortlisted = myApplications.filter(
    (a) => a.status.toLowerCase() === "shortlisted",
  ).length;
  const checklist = [
    {
      label: "Tell us about yourself",
      done: !!(profile?.firstName && profile?.lastName && profile?.headline),
    },
    { label: "Add your skills", done: !!profile?.skills?.length },
    { label: "Share your experience", done: !!profile?.workExperience?.length },
    { label: "Add your education", done: !!profile?.education?.length },
  ];
  const completion = Math.round(
    (checklist.filter((c) => c.done).length / checklist.length) * 100,
  );
  const pending = assessments.filter(
    (a) => !["submitted", "evaluated"].includes(a.status),
  );
  return (
    <div className="space-y-7">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <p className="ts-eyebrow mb-2 text-brand">Your next chapter</p>
          <h1 className="text-[28px]">
            A world of possibility, {user?.name?.split(" ")[0] || "there"}.
          </h1>
          <p className="mt-2 text-xs text-slate-500">
            Small steps today. Great opportunities tomorrow.
          </p>
        </div>
        <Link href="/candidate/jobs" className="ts-button">
          Explore opportunities <ArrowUpRight size={15} />
        </Link>
      </div>
      {(appsError || jobsError) && (
        <p
          role="alert"
          className="rounded border border-amber-200 bg-amber-50 p-3 text-xs text-amber-800"
        >
          Some workspace records could not be loaded. Please try again later.
        </p>
      )}
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <MetricCard
          label="Your applications"
          value={String(myApplications.length)}
          icon={Briefcase}
        />
        <MetricCard
          label="Shortlisted"
          value={String(shortlisted)}
          icon={CheckCircle2}
        />
        <MetricCard
          label="Assessments completed"
          value={String(completed)}
          icon={Trophy}
        />
        <MetricCard
          label="Opportunities to explore"
          value={String(jobs.length)}
          icon={ArrowUpRight}
        />
      </div>
      <div className="grid gap-6 xl:grid-cols-[1.6fr_1fr]">
        <div className="space-y-6">
          <section className="ts-panel">
            <div className="flex items-center justify-between border-b border-[#e5e9df] p-5">
              <div>
                <h2 className="text-sm font-semibold">Make your next move.</h2>
                <p className="mt-1 text-[11px] text-slate-400">
                  Explore the latest opportunities
                </p>
              </div>
              <Link
                href="/candidate/jobs"
                className="flex items-center gap-1 text-xs text-brand"
              >
                View all <ArrowUpRight size={14} />
              </Link>
            </div>
            {jobs.length ? (
              jobs.slice(0, 4).map((job) => (
                <Link
                  href="/candidate/jobs"
                  key={job._id}
                  className="flex items-center justify-between gap-3 border-b border-[#edf0e7] px-5 py-5 last:border-0 hover:bg-canvas"
                >
                  <div className="flex items-center gap-3">
                    <span className="flex size-10 shrink-0 items-center justify-center rounded border border-[#e2e7d9] bg-canvas text-sm font-semibold text-brand">
                      {job.company?.slice(0, 1) || "T"}
                    </span>
                    <div>
                      <h3 className="text-sm font-medium">{job.title}</h3>
                      <p className="mt-2 flex flex-wrap items-center gap-2 text-[11px] text-slate-400">
                        {job.company}
                        <span>·</span>
                        <MapPin size={11} />
                        {job.location}
                      </p>
                    </div>
                  </div>
                  <ArrowUpRight size={16} className="shrink-0 text-slate-400" />
                </Link>
              ))
            ) : (
              <div className="px-5 py-14 text-center">
                <Briefcase size={25} className="mx-auto text-slate-300" />
                <p className="mt-4 text-sm font-medium">
                  Good things are on their way.
                </p>
                <p className="mt-2 text-xs text-slate-400">
                  New opportunities will appear here when they are posted.
                </p>
              </div>
            )}
          </section>
          <section className="ts-panel p-5">
            <div className="flex justify-between">
              <div>
                <h2 className="text-sm font-semibold">Your next step</h2>
                <p className="mt-1 text-[11px] text-slate-400">
                  Assessments waiting for your attention
                </p>
              </div>
              <Clock size={18} className="text-brand" />
            </div>
            {pending.length ? (
              <div className="mt-4 divide-y divide-[#edf0e7]">
                {pending.slice(0, 3).map((a) => (
                  <Link
                    key={a.id || a._id}
                    href={`/candidate/assessments/${a.id || a._id}`}
                    className="flex items-center justify-between py-4 text-xs"
                  >
                    <span className="flex items-center gap-2">
                      <FileCheck2 size={15} className="text-brand" />
                      {a.jobId?.title || "Assigned assessment"}
                    </span>
                    <ArrowRight size={15} />
                  </Link>
                ))}
              </div>
            ) : (
              <p className="mt-6 rounded bg-canvas px-4 py-5 text-xs text-slate-500">
                You’re all caught up. New assignments will appear here.
              </p>
            )}
          </section>
        </div>
        <div className="space-y-6">
          <section className="ts-panel p-6">
            <div className="flex justify-between">
              <h2 className="text-sm font-semibold">Your first impression</h2>
              <span className="text-xs font-semibold text-brand">
                {completion}%
              </span>
            </div>
            <p className="mt-2 text-xs leading-6 text-slate-500">
              Help recruiters see the person behind the application.
            </p>
            <div
              className="mt-4 h-1.5 overflow-hidden rounded-full bg-[#edf2e6]"
              role="progressbar"
              aria-label="Profile completion"
              aria-valuenow={completion}
              aria-valuemin={0}
              aria-valuemax={100}
            >
              <div
                className="h-full rounded-full bg-brand transition-all"
                style={{ width: completion + "%" }}
              />
            </div>
            <div className="mt-6 space-y-4">
              {checklist.map((c) => (
                <Link
                  key={c.label}
                  href="/candidate/profile"
                  className="flex items-center gap-3 text-xs"
                >
                  <span
                    className={`flex size-5 items-center justify-center rounded-full border ${c.done ? "border-brand bg-brand text-white" : "border-[#dbe3d2] bg-white"}`}
                  >
                    {c.done && <Check size={12} />}
                  </span>
                  <span className={c.done ? "text-slate-400" : "text-ink"}>
                    {c.label}
                  </span>
                  {!c.done && (
                    <ArrowUpRight
                      size={12}
                      className="ml-auto text-slate-400"
                    />
                  )}
                </Link>
              ))}
            </div>
            <Link
              href="/candidate/profile"
              className="ts-button secondary mt-7 w-full"
            >
              {completion === 100
                ? "Review your profile"
                : "Complete your profile"}{" "}
              <ArrowRight size={14} />
            </Link>
          </section>
          <section className="rounded-md bg-lime p-6">
            <p className="ts-eyebrow text-brand">A little reminder</p>
            <h2 className="mt-4 text-2xl font-semibold leading-tight tracking-tight">
              Your strengths
              <br />
              deserve to be seen.
            </h2>
            <p className="mt-3 text-xs leading-6 text-ink/65">
              Add specific skills and real examples of your work to make your
              profile more useful to hiring teams.
            </p>
            <Link
              href="/candidate/profile"
              className="mt-5 inline-flex items-center gap-2 text-xs font-semibold"
            >
              Tell your story <ArrowUpRight size={14} />
            </Link>
          </section>
        </div>
      </div>
    </div>
  );
}
