"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { Plus, FileText, ArrowRight, ClipboardCheck, Pencil, CheckCircle2, Clock, Users } from "lucide-react";
import { apiFetch } from "@/lib/api";
import type { DemoAssessment, DemoAssignment, DemoJob } from "@/lib/demo/types";
import DataTable, { type Column } from "../DataTable";
import MetricRail from "../MetricRail";
import Modal from "../modals/Modal";
import AssessmentRowActions from "./AssessmentRowActions";

type Assessment = DemoAssessment & { job: DemoJob };
type Submission = DemoAssignment & { jobId: DemoJob; title: string; assessmentId: string };

export default function AssessmentStudio({ initialView = "all" }: { initialView?: string }) {
  const [tests, setTests] = useState<Assessment[]>([]);
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [view, setView] = useState(initialView);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [action, setAction] = useState<{ id: string; title: string; kind: "delete" | "archive" } | null>(null);
  const [busy, setBusy] = useState(false);

  async function load() {
    setLoading(true); setError("");
    try {
      const [library, records] = await Promise.all([apiFetch<Assessment[]>("/assessments/library"), apiFetch<Submission[]>("/assessments")]);
      setTests(library); setSubmissions(records);
    } catch (problem) { setError(problem instanceof Error ? problem.message : "Could not load assessments."); }
    finally { setLoading(false); }
  }
  useEffect(() => { void load(); }, []);

  async function confirmAction() {
    if (!action || busy) return;
    setBusy(true); setError("");
    try {
      await apiFetch("/assessments/" + action.id + (action.kind === "archive" ? "/archive" : ""), { method: action.kind === "archive" ? "POST" : "DELETE" });
      setAction(null); await load();
    } catch (problem) { setError(problem instanceof Error ? problem.message : "Could not update this assessment."); }
    finally { setBusy(false); }
  }

  const columns: Column<Assessment>[] = [
    { header: "Assessment / role", className: "assessment-title-column", accessor: test => <div className="assessment-name-cell"><span className="assessment-file-icon"><FileText size={18} strokeWidth={1.6} /></span><div className="workspace-record-title"><strong>{test.title}</strong><small>{test.job?.title || "Role not available"}</small></div></div> },
    { header: "Status", accessor: test => <span className={"studio-status " + test.status}>{test.status}</span> },
    { header: "Questions", accessor: test => <span className="assessment-cell-meta"><ClipboardCheck size={13} />{test.totalQuestions}</span> },
    { header: "Time limit", accessor: test => <span className="assessment-cell-meta"><Clock size={13} />{test.durationMinutes} min</span> },
    { header: "Assigned", accessor: test => <span className="assessment-cell-meta"><Users size={13} />{submissions.filter(record => record.assessmentId === test.id).length}</span> },
    { header: "Actions", exportable: false, accessor: test => <AssessmentRowActions id={test.id} title={test.title} status={test.status} onAction={kind => { setError(""); setAction({ id: test.id, title: test.title, kind }); }} /> },
  ];
  const visible = tests.filter(test => view === "all" || test.status === view);
  const tabs = [
    { value: "all", label: "All assessments", count: tests.length },
    { value: "draft", label: "Drafts", count: tests.filter(test => test.status === "draft").length },
    { value: "active", label: "Active", count: tests.filter(test => test.status === "active").length },
    { value: "archived", label: "Archived", count: tests.filter(test => test.status === "archived").length },
    { value: "submissions", label: "Submissions", count: submissions.length },
  ];
  return <div className="studio-page assessment-studio">
    <header className="studio-heading"><div><span className="studio-kicker">DESIGN · ASSIGN · REVIEW</span><h1>Assessments</h1><p>Manage drafts, assign tasks, and review submitted work in one place.</p></div><Link href="/recruiter/assessments/new" className="studio-primary"><Plus size={15} />Create assessment</Link></header>
    <MetricRail loading={loading && !tests.length} metrics={[
      { label: "Total assessments", value: tests.length, icon: FileText },
      { label: "Drafts", value: tests.filter(test => test.status === "draft").length, icon: Pencil },
      { label: "Active", value: tests.filter(test => test.status === "active").length, icon: CheckCircle2 },
      { label: "Completed submissions", value: submissions.filter(record => record.status === "submitted" || record.status === "evaluated").length, icon: ClipboardCheck },
    ]} />
    <div className="assessment-view-switcher"><nav aria-label="Assessment views">{tabs.map(tab => <button key={tab.value} type="button" aria-pressed={view === tab.value} onClick={() => setView(tab.value)}>{tab.label}<span>{tab.count}</span></button>)}</nav></div>
    {error && <p role="alert" className="screeno-inline-error">{error}<button type="button" onClick={() => void load()}>Try again</button></p>}
    {loading && !tests.length ? <p className="studio-loading" role="status">Loading assessments…</p> : view === "submissions" ? <DataTable title="Applicant submissions" data={submissions} rowKey="id" columns={[
      { header: "Applicant", accessor: "candidateName" }, { header: "Assessment", accessor: "title" },
      { header: "Status", accessor: record => <span className={"studio-status " + record.status}>{record.status.replaceAll("_", " ")}</span> },
      { header: "Score", accessor: record => record.status === "evaluated" ? Math.round(record.percentage) + "%" : "Awaiting review" },
      { header: "Review", exportable: false, accessor: record => <Link className="studio-text-link" href={"/recruiter/assessments/" + record.assessmentId + "/submission/" + record.candidateId}>Open submission<ArrowRight size={13} /></Link> },
    ]} /> : <DataTable key={view} title="Assessment library" data={visible} rowKey="id" columns={columns} searchPlaceholder="Search assessments or roles…" emptyState={{ title: "No assessments in this view", description: "Choose another view or create an assessment to get started." }} />}
    <Modal isOpen={!!action} onClose={() => { if (!busy) setAction(null); }} title={action?.kind === "archive" ? "Archive assessment" : "Delete assessment draft"} width="max-w-md">
      {error && <p role="alert" className="screeno-inline-error">{error}</p>}
      <div className="p-6 space-y-5"><p className="text-xs leading-6 text-slate-600">{action?.kind === "archive" ? "Archive" : "Delete"} <strong>{action?.title}</strong>? {action?.kind === "archive" ? "Existing submissions will remain available for review." : "Only unused drafts can be deleted. This cannot be undone."}</p><div className="flex justify-end gap-3"><button type="button" className="screeno-outline-button" disabled={busy} onClick={() => setAction(null)}>Cancel</button><button type="button" className="screeno-soft-button" disabled={busy} onClick={() => void confirmAction()}>{busy ? "Saving…" : action?.kind === "archive" ? "Archive assessment" : "Delete draft"}</button></div></div>
    </Modal>
  </div>;
}
