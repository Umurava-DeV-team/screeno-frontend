"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowLeft, ArrowUpRight, MapPin, Briefcase } from "lucide-react";
import { readDemoDatabase } from "@/lib/demo/store";
import { filterPublicJobs } from "@/lib/publicJobs";
import type { DemoJob } from "@/lib/demo/types";
import HeroSearch from "./HeroSearch";
export default function PublicOpportunities({
  query,
  location,
}: {
  query: string;
  location: string;
}) {
  const [jobs, setJobs] = useState<DemoJob[] | null>(null);
  const [error, setError] = useState("");
  useEffect(() => {
    let active = true;
    void Promise.resolve().then(() => {
      try {
        const records = readDemoDatabase((db) => db.jobs);
        if (active) setJobs(records);
      } catch (e) {
        if (active)
          setError(
            e instanceof Error ? e.message : "Unable to load sample roles.",
          );
      }
    });
    return () => {
      active = false;
    };
  }, []);
  const matches = jobs ? filterPublicJobs(jobs, query, location) : [];
  return (
    <main className="mx-auto max-w-5xl px-5 py-10 sm:py-16">
      <Link
        href="/"
        className="inline-flex items-center gap-2 text-xs text-slate-500"
      >
        <ArrowLeft size={14} />
        Back to Screeno
      </Link>
      <div className="mt-9 text-center">
        <p className="ts-eyebrow text-brand">Your next chapter</p>
        <h1 className="mt-4 text-3xl font-semibold tracking-tight sm:text-4xl">
          Find work that values your skills.
        </h1>
        <p className="mx-auto mt-4 max-w-xl text-sm leading-7 text-slate-500">
          Browse fictional opportunities in this frontend preview. No live
          vacancies or external job services are connected.
        </p>
        <div className="mx-auto mt-7 max-w-xl">
          <HeroSearch query={query} location={location} />
        </div>
      </div>
      {error ? (
        <p role="alert" className="ts-panel mt-10 p-6 text-sm text-red-700">
          {error}
        </p>
      ) : !jobs ? (
        <p role="status" className="mt-10 text-center text-sm text-slate-500">
          Loading sample opportunities…
        </p>
      ) : (
        <section aria-label="Search results" className="mt-12 space-y-4">
          <p role="status" className="mb-6 text-xs text-slate-500">
            {matches.length} sample{" "}
            {matches.length === 1 ? "opportunity" : "opportunities"}
            {query ? " for “" + query + "”" : ""}
            {location ? " · " + location : ""}
          </p>
          {matches.map((job) => (
            <article key={job.id} className="ts-panel p-6">
              <div className="flex flex-wrap items-start justify-between gap-5">
                <div>
                  <p className="text-xs text-slate-500">{job.company}</p>
                  <h2 className="mt-2 text-lg font-semibold">{job.title}</h2>
                  <div className="mt-3 flex flex-wrap gap-4 text-xs text-slate-500">
                    <span className="inline-flex items-center gap-1.5">
                      <MapPin size={13} />
                      {job.location}
                    </span>
                    <span className="inline-flex items-center gap-1.5">
                      <Briefcase size={13} />
                      {job.experienceLevel}
                    </span>
                  </div>
                </div>
                <p className="rounded bg-lime/25 px-3 py-2 text-xs font-medium">
                  {job.salaryRange || "Compensation not specified"}
                </p>
              </div>
              <details className="mt-5 border-t border-[#e2e7db] pt-4">
                <summary className="cursor-pointer text-xs font-medium text-brand">
                  About this sample role
                </summary>
                <p className="mt-4 whitespace-pre-wrap text-sm leading-7 text-slate-500">
                  {job.description}
                </p>
              </details>
              <Link
                href="/auth/candidate/login"
                className="mt-5 inline-flex items-center gap-2 text-xs font-semibold text-brand"
              >
                Explore the candidate demo <ArrowUpRight size={14} />
              </Link>
            </article>
          ))}
          {!matches.length && (
            <div className="ts-panel p-10 text-center">
              <h2 className="text-lg font-semibold">
                A different search could open a new door.
              </h2>
              <p className="mt-3 text-sm leading-7 text-slate-500">
                Try a broader keyword or choose any location to explore the
                sample roles.
              </p>
              <Link href="/opportunities" className="ts-button secondary mt-5">
                Clear search
              </Link>
            </div>
          )}
        </section>
      )}
    </main>
  );
}
