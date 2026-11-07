"use client";
import { useEffect } from "react";
import Link from "next/link";
import { Briefcase, Users, ShieldCheck, Target, Plus, ArrowUpRight } from "lucide-react";
import { useAppDispatch, useAppSelector } from "@/lib/store/hooks";
import { fetchJobs } from "@/lib/store/features/jobsSlice";
import { fetchCandidates } from "@/lib/store/features/candidateSlice";
import { fetchScreeningHistory } from "@/lib/store/features/screeningSlice";
import MetricRail from "@/components/MetricRail";
import RecruitmentInsights from "@/components/RecruitmentInsights";
import DataTable from "@/components/DataTable";

export default function RecruiterDashboard() {
  const dispatch = useAppDispatch();
  const jobs = useAppSelector(state => state.jobs);
  const people = useAppSelector(state => state.candidate);
  const reviews = useAppSelector(state => state.screening);
  useEffect(() => { void dispatch(fetchJobs()); void dispatch(fetchCandidates()); void dispatch(fetchScreeningHistory("all")); }, [dispatch]);
  const candidateIds = new Set(people.candidates.map(person => person._id));
  const shortlisted = new Set(reviews.history.flatMap(review => review.shortlist.map(person => person.candidateId)).filter(id => candidateIds.has(id))).size;
  const loading = jobs.loading || people.loading || reviews.loading;
  return <div className="studio-page recruiter-dashboard">
    <header className="studio-heading"><div><span className="studio-kicker">YOUR HIRING AT A GLANCE</span><h1>Recruitment overview</h1><p>Track your open roles, applicants, and latest screening activity.</p></div><Link href="/recruiter/jobs/new" className="studio-primary"><Plus size={15} />Create a job</Link></header>
    <MetricRail loading={loading} metrics={[
      { label: "Active jobs", value: jobs.jobs.filter(job => job.status === "active").length, icon: Briefcase, href: "/recruiter/jobs" },
      { label: "Candidates", value: people.candidates.length, icon: Users, href: "/recruiter/candidates" },
      { label: "Screening reviews", value: reviews.history.length, icon: ShieldCheck, href: "/recruiter/screenings" },
      { label: "Shortlisted people", value: shortlisted, icon: Target, href: "/recruiter/screenings" },
    ]} />
    {(jobs.error || people.error || reviews.error) && <p role="alert" className="screeno-inline-error">{jobs.error || people.error || reviews.error}</p>}
    <RecruitmentInsights standalone={false} />
    <DataTable title="Your roles" data={jobs.jobs} rowKey="_id" columns={[
      { header: "Role", accessor: "title" }, { header: "Department", accessor: "department" }, { header: "Location", accessor: "location" },
      { header: "Status", accessor: job => <span className={"studio-status " + job.status}>{job.status || "Not set"}</span> },
      { header: "Details", exportable: false, accessor: job => <Link className="studio-text-link" href={"/recruiter/jobs/" + job._id}>View role<ArrowUpRight size={13} /></Link> },
    ]} />
  </div>;
}
