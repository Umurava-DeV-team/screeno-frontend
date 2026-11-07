"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowRight, ArrowLeft, Users, Plus, ShieldCheck, Target, Briefcase, Mail, Phone, Eye } from "lucide-react";
import { useAppDispatch, useAppSelector } from "@/lib/store/hooks";
import { fetchJobs } from "@/lib/store/features/jobsSlice";
import { fetchCandidates, type ApiCandidate } from "@/lib/store/features/candidateSlice";
import { fetchScreeningHistory, runScreening, createAssessmentDraft } from "@/lib/store/features/screeningSlice";
import CustomSelect from "../CustomSelect";
import DataTable, { type Column } from "../DataTable";
import MetricRail from "../MetricRail";
import ExportMenu from "../ExportMenu";
import CandidateDetailsPanel from "../CandidateDetailsPanel";
import CandidateViewModal from "../modals/CandidateViewModal";
import EditCandidateModal from "../modals/EditCandidateModal";
import Modal from "../modals/Modal";

function dateLabel(value?: string) {
  if (!value || !Number.isFinite(new Date(value).getTime())) return "—";
  return new Date(value).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });
}

export default function ScreeningStudio({ reviewId }: { reviewId?: string }) {
  const dispatch = useAppDispatch(), router = useRouter();
  const jobsState = useAppSelector(state => state.jobs), peopleState = useAppSelector(state => state.candidate);
  const { history, loading, error } = useAppSelector(state => state.screening);
  const jobs = jobsState.jobs, candidates = peopleState.candidates;
  const [view, setView] = useState("all"), [roleFilter, setRoleFilter] = useState("all");
  const [selectedId, setSelectedId] = useState(""), [checkedIds, setCheckedIds] = useState<(string | number)[]>([]);
  const [modal, setModal] = useState<"view" | "edit" | null>(null);
  const [setup, setSetup] = useState(false), [jobId, setJobId] = useState(""), [topN, setTopN] = useState(3);
  const [busy, setBusy] = useState(false), [notice, setNotice] = useState("");
  useEffect(() => { void dispatch(fetchJobs()); void dispatch(fetchCandidates()); void dispatch(fetchScreeningHistory("all")); }, [dispatch]);

  const review = history.find(item => item.id === reviewId), selected = candidates.find(person => person._id === selectedId);
  const candidateIds = new Set(candidates.map(person => person._id));
  const shortlisted = new Set(history.flatMap(item => item.shortlist.map(person => person.candidateId)).filter(id => candidateIds.has(id)));
  const latestReviews = [...history].sort((a, b) => new Date(b.screenedAt).getTime() - new Date(a.screenedAt).getTime());
  const latestFor = (id: string) => latestReviews.find(item => item.shortlist.some(person => person.candidateId === id));
  const visible = candidates.filter(person => (roleFilter === "all" || person.jobId === roleFilter) && (view !== "shortlisted" || shortlisted.has(person._id)));
  const selectedPeople = candidates.filter(person => checkedIds.includes(person._id));
  const rolePeople = candidates.filter(person => person.jobId === jobId), job = jobs.find(item => item._id === jobId);
  const pending = loading || peopleState.loading || jobsState.loading;
  const problem = notice || error || peopleState.error || jobsState.error;

  async function run() {
    if (busy || !jobId || !rolePeople.length) return;
    setBusy(true); setNotice("");
    try {
      const record = await dispatch(runScreening({ jobId, topN: Math.min(topN, rolePeople.length) })).unwrap();
      setSetup(false); router.push("/recruiter/screenings/" + record.id);
    } catch (issue) { setNotice(String(issue)); }
    finally { setBusy(false); }
  }
  async function assessment() {
    if (!review || busy) return;
    setBusy(true); setNotice("");
    try { const draft = await dispatch(createAssessmentDraft({ jobId: review.jobId })).unwrap(); router.push("/recruiter/assessments/edit/" + draft.id); }
    catch (issue) { setNotice(String(issue)); }
    finally { setBusy(false); }
  }
  const columns: Column<ApiCandidate>[] = [
    { header: "Candidate", accessor: person => <div className="screeno-applicant-cell"><span>{person.name.split(" ").map(part => part[0]).slice(0, 2).join("")}</span><div><strong>{person.name}</strong><small>{person.currentRole || "Role not provided"}</small></div></div> },
    { header: "Role", accessor: person => person.jobApplied || jobs.find(item => item._id === person.jobId)?.title || "Talent pool" },
    { header: "Review status", accessor: person => <span className={"screening-flag " + (shortlisted.has(person._id) ? "is-reviewed" : "is-waiting")}><i aria-hidden="true" />{shortlisted.has(person._id) ? "Shortlisted" : "No shortlist record"}</span> },
    { header: "Skills", accessor: person => <div className="screeno-table-skills">{person.skills.slice(0, 2).map(skill => <span key={skill}>{skill}</span>)}</div> },
    { header: "Latest shortlist", accessor: person => dateLabel(latestFor(person._id)?.screenedAt) },
    { header: "Contact & review", exportable: false, accessor: person => <div className="workspace-row-actions">
      {person.email && <a href={"mailto:" + person.email} aria-label={"Email " + person.name} title="Email candidate"><Mail size={14} /></a>}
      {person.phone && <a href={"tel:" + person.phone} aria-label={"Call " + person.name} title="Call candidate"><Phone size={14} /></a>}
      <button type="button" onClick={() => { setSelectedId(person._id); setModal("view"); }} aria-label={"View " + person.name} title="View profile"><Eye size={15} /></button>
      {latestFor(person._id) && <Link href={"/recruiter/screenings/" + latestFor(person._id)!.id} aria-label={"Open review for " + person.name} title="Open review"><ArrowRight size={14} /></Link>}
    </div> },
  ];
  return <div className="studio-page screening-studio">
    <header className="studio-heading"><div><span className="studio-kicker">YOUR SCREENING DESK</span><h1>{reviewId ? "Screening review" : "Screenings"}</h1><p>{reviewId ? "Review the sample shortlist alongside each person’s profile." : "Keep candidate profiles, shortlists, and screening reviews together."}</p></div>{reviewId ? <Link href="/recruiter/screenings" className="screeno-outline-button"><ArrowLeft size={14} />All screenings</Link> : <button className="studio-primary" type="button" onClick={() => { setJobId(roleFilter === "all" ? "" : roleFilter); setNotice(""); setSetup(true); }}><Plus size={15} />New screening</button>}</header>
    {!reviewId && <MetricRail loading={pending && !candidates.length} metrics={[
      { label: "Candidates", value: candidates.length, icon: Users },
      { label: "Screening reviews", value: history.length, icon: ShieldCheck },
      { label: "Roles reviewed", value: new Set(history.map(item => item.jobId)).size, icon: Briefcase },
      { label: "Shortlisted people", value: shortlisted.size, icon: Target },
    ]} />}
    {problem && <p className="screeno-inline-error" role="alert">{problem}</p>}
    {!reviewId && <>
      <div className="screening-desk-toolbar"><nav aria-label="Screening views">{[{ id: "all", label: "All candidates" }, { id: "shortlisted", label: "Shortlisted" }, { id: "history", label: "Screening reviews" }].map(tab => <button key={tab.id} type="button" aria-pressed={view === tab.id} onClick={() => setView(tab.id)}>{tab.label}</button>)}</nav><span>{view === "history" ? history.length + " reviews" : visible.length + " candidates"}</span></div>
      {view !== "history" && <div className="screening-selection-bar"><span><b>{selectedPeople.length}</b> selected</span><button type="button" disabled={!selectedPeople.length} onClick={() => setCheckedIds([])}>Clear selection</button><CustomSelect aria-label="Filter screenings by role" value={roleFilter} onChange={event => setRoleFilter(event.target.value)}><option value="all">All roles</option>{jobs.map(item => <option key={item._id} value={item._id}>{item.title}</option>)}</CustomSelect>{selectedPeople.length > 0 && <ExportMenu report={{ title: "Selected screening candidates", columns: ["Name", "Email", "Role", "Location"], rows: selectedPeople.map(person => [person.name, person.email, person.jobApplied || "Talent pool", person.location]) }} />}</div>}
      <div className="screening-roster">
        {view === "history" ? <DataTable title="Screening reviews" data={history} rowKey="id" columns={[
          { header: "Role", accessor: "jobTitle" }, { header: "Candidates considered", accessor: "totalCandidates" },
          { header: "Shortlist", accessor: item => item.shortlist.length }, { header: "Created", accessor: item => dateLabel(item.screenedAt) },
          { header: "Review", exportable: false, accessor: item => <Link className="studio-text-link" href={"/recruiter/screenings/" + item.id}>Open review<ArrowRight size={13} /></Link> },
        ]} /> : <div className={selected ? "screening-roster-with-detail" : ""}><DataTable title="Candidate list" data={visible} rowKey="_id" columns={columns} onRowSelect={person => setSelectedId(person._id)} selectedRowKey={selectedId} selectedKeys={checkedIds} onSelectionChange={setCheckedIds} searchPlaceholder="Search candidates, roles, or skills…" emptyState={{ title: pending ? "Loading candidates…" : "No candidates in this view", description: "Try another role or add candidates to your workspace." }} />{selected && <CandidateDetailsPanel candidate={selected} onView={() => setModal("view")} onEdit={() => setModal("edit")} />}</div>}
      </div>
    </>}
    {reviewId && review && <section className="studio-review-result"><header className="studio-heading"><div><h2>{review.jobTitle}</h2><p>{review.totalCandidates} candidates considered · {review.shortlist.length} profiles shortlisted · {dateLabel(review.screenedAt)}</p></div><button className="screeno-soft-button" disabled={busy} type="button" onClick={() => void assessment()}><Plus size={14} />Build an assessment</button></header><p className="studio-notice">These are sample match scores for frontend review. No AI model runs, and people make the hiring decisions.</p><div className={selected ? "screeno-candidate-database" : ""}><DataTable title="Shortlist" data={review.shortlist} rowKey="candidateId" onRowSelect={person => setSelectedId(person.candidateId)} selectedRowKey={selectedId} columns={[
      { header: "Candidate", accessor: "name" }, { header: "Sample match", accessor: person => person.matchScore + "%" },
      { header: "Strengths", accessor: person => person.strengths.join(", ") }, { header: "Missing context", accessor: person => person.missingSkills.join(", ") || "No gaps recorded" },
    ]} />{selected && <CandidateDetailsPanel candidate={selected} onView={() => setModal("view")} onEdit={() => setModal("edit")} />}</div></section>}
    {reviewId && !review && <p className="studio-notice" role="status">{loading ? "Loading screening…" : "Screening not found. Open another review from Screenings."}</p>}
    <Modal isOpen={setup} onClose={() => { if (!busy) setSetup(false); }} title="New screening" width="max-w-lg"><form className="screening-create-form" onSubmit={event => { event.preventDefault(); void run(); }}>
      <p>Choose a role and how many profiles to include in the sample shortlist. The review considers every candidate assigned to that role.</p>
      <label className="studio-field">Role<CustomSelect required aria-label="Screening role" value={jobId} onChange={event => setJobId(event.target.value)}><option value="">Choose a role</option>{jobs.map(item => <option key={item._id} value={item._id}>{item.title}</option>)}</CustomSelect></label>
      {job && <p className="studio-notice">{rolePeople.length} candidates assigned to {job.title}.</p>}
      <label className="studio-field">Shortlist size<CustomSelect aria-label="Shortlist size" disabled={!rolePeople.length} value={Math.min(topN, Math.max(1, rolePeople.length))} onChange={event => setTopN(Number(event.target.value))}>{Array.from({ length: Math.max(1, Math.min(rolePeople.length, 10)) }, (_, index) => <option key={index + 1} value={index + 1}>{index + 1} {index ? "people" : "person"}</option>)}</CustomSelect></label>
      {notice && <p className="screeno-inline-error" role="alert">{notice}</p>}
      <p className="studio-help">Frontend demo: sample results only. No AI model or external service is used.</p><div className="studio-actions"><button type="button" className="screeno-outline-button" disabled={busy} onClick={() => setSetup(false)}>Cancel</button><button type="submit" className="screeno-soft-button" disabled={busy || !jobId || !rolePeople.length}>{busy ? "Preparing…" : "Create screening"}<ArrowRight size={14} /></button></div>
    </form></Modal>
    <CandidateViewModal isOpen={modal === "view"} onClose={() => setModal(null)} candidate={selected || null} />
    <EditCandidateModal isOpen={modal === "edit"} onClose={() => setModal(null)} onSuccess={() => { setModal(null); void dispatch(fetchCandidates()); }} candidate={selected || null} />
  </div>;
}
