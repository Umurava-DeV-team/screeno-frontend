'use client';

import { useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, ArrowUpRight, BriefcaseBusiness, MapPin, Pencil, Users, ClipboardList, CalendarDays, Building2 } from 'lucide-react';
import { usePreviewResource } from '@/lib/demo/usePreviewResource';
import type { DemoJob, DemoApplication, DemoCandidate } from '@/lib/demo/types';
import PreviewResourceState from '@/components/PreviewResourceState';
import EditJobModal from '@/components/modals/EditJobModal';
import DataTable, { type Column } from '@/components/DataTable';

type Applicant = DemoApplication & { candidate?: DemoCandidate };
const date = (value: string) => Number.isNaN(Date.parse(value)) ? 'Not recorded' : new Date(value).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });

export default function JobDetailsPage() {
  const { id } = useParams();
  const resource = usePreviewResource<DemoJob>('/jobs/' + String(id));
  const applicants = usePreviewResource<Applicant[]>('/applications/job/' + String(id));
  const [tab, setTab] = useState<'overview' | 'applicants'>('overview');
  const [editing, setEditing] = useState(false);
  if (resource.loading || !resource.data) return <PreviewResourceState loading={resource.loading} error={resource.error} />;
  const job = resource.data, people = applicants.data || [];
  const columns: Column<Applicant>[] = [
    { header: 'Applicant', accessor: person => <div className="role-applicant"><span>{person.candidate?.name?.slice(0, 1) || '?'}</span><div><strong>{person.candidate?.name || 'Applicant'}</strong><small>{person.candidate?.email || 'No email provided'}</small></div></div> },
    { header: 'Applied', accessor: person => date(person.appliedAt || person.createdAt) },
    { header: 'Status', accessor: person => <span className="role-status">{person.status.replaceAll('_', ' ')}</span> },
  ];
  return <div className="role-detail">
    <Link className="flow-back" href="/recruiter/jobs"><ArrowLeft size={14} />All jobs</Link>
    <header className="role-heading">
      <div className="role-heading-icon"><BriefcaseBusiness size={25} /></div>
      <div className="role-heading-copy"><div className="role-kicker">{job.company || 'Hiring workspace'}<span className="role-status" data-active={job.status === 'active'}>{job.status}</span></div><h1>{job.title}</h1><p><span><Building2 size={13} />{job.department}</span><span><MapPin size={13} />{job.location}</span><span><CalendarDays size={13} />Posted {date(job.createdAt)}</span></p></div>
      <button className="flow-button secondary" onClick={() => setEditing(true)}><Pencil size={13} />Edit job</button>
    </header>
    <div className="role-snapshot"><div><span>Applicants</span><strong>{applicants.loading ? '—' : people.length}</strong><small>Applications received</small></div><div><span>Recruitment target</span><strong>{job.applicantsTarget}</strong><small>Applicants to reach</small></div><div><span>Experience level</span><strong>{job.experienceLevel || 'Not specified'}</strong><small>For this role</small></div><div><span>Compensation</span><strong className="role-salary">{job.salaryRange || 'Not specified'}</strong><small>Listed salary range</small></div></div>
    <nav className="role-tabs" aria-label="Job sections"><button aria-pressed={tab === 'overview'} onClick={() => setTab('overview')}>Job overview</button><button aria-pressed={tab === 'applicants'} onClick={() => setTab('applicants')}>Applicants <span>{applicants.loading ? '—' : people.length}</span></button></nav>
    {tab === 'overview' ? <div className="role-content-grid"><section className="role-brief"><header><span className="flow-section-number">01</span><div><h2>About this role</h2><p>The brief your hiring team works from.</p></div><FileBrief /></header><div className="role-description">{job.description || 'No job description has been added yet. Edit this job to update the role details.'}</div><div className="role-brief-footer"><span><CalendarDays size={13} />Created {date(job.createdAt)}</span><button onClick={() => setTab('applicants')}>View applicants<ArrowUpRight size={13} /></button></div></section><aside className="role-side"><section className="role-facts"><h2>Role details</h2><dl>{[['Company', job.company], ['Department', job.department], ['Location', job.location], ['Experience', job.experienceLevel]].map(([label, value]) => <div key={label}><dt>{label}</dt><dd>{value || 'Not specified'}</dd></div>)}</dl></section><section className="role-next"><span className="role-next-icon"><ClipboardList size={20} /></span><h2>Make the next step count.</h2><p>Build an assessment for this role, review each question, and assign it when you’re ready.</p><Link className="flow-button primary" href={'/recruiter/assessments/new?jobId=' + encodeURIComponent(job.id)}>Create assessment<ArrowUpRight size={14} /></Link></section></aside></div> : <section className="role-applicants-section">{applicants.loading || applicants.error ? <PreviewResourceState loading={applicants.loading} error={applicants.error} /> : <DataTable title="Applicants for this role" columns={columns} data={people} searchPlaceholder="Search name, email or status…" emptyState={{ title: 'No applications yet', description: 'Applications for this role will appear here.', icon: <Users size={24} /> }} />}</section>}
    <EditJobModal isOpen={editing} job={job} onClose={() => setEditing(false)} onSuccess={() => { setEditing(false); resource.refresh(); }} />
  </div>;
}

function FileBrief() { return <ClipboardList className="role-brief-icon" size={20} />; }
