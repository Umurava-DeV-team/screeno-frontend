'use client';
import { useState } from 'react';
import Link from 'next/link';
import { ArrowRight, ArrowUpRight, BriefcaseBusiness, Check, CheckCircle2, ClipboardList, FileText, MapPin, Send, Users } from 'lucide-react';
import { usePreviewResource } from '@/lib/demo/usePreviewResource';
import MetricRail from './MetricRail';
import DataTable, { type Column } from './DataTable';
import { CandidateResourceState } from './CandidateWorkspace';
import { CandidateEmpty, CandidateHeading, CandidateStatus, candidateDate, statusLabel, type CandidateApplication } from './CandidateWorkspace';

const statusDetails: Record<string, string> = {
  pending: 'Your application has been received. The hiring team will review your profile.',
  reviewed: 'The hiring team has reviewed your application. Follow this page for the next update.',
  shortlisted: 'You’re on the shortlist for this role. Check My assessments for any assigned tasks.',
  rejected: 'The hiring team has not selected this application. You can keep exploring other roles.',
  hired: 'The hiring team has marked this application as hired. Contact the team for the next steps.',
};
export default function CandidateApplications() {
  const resource = usePreviewResource<CandidateApplication[]>('/applications/my');
  const [view, setView] = useState('all'), [selectedId, setSelectedId] = useState('');
  if (resource.loading || !resource.data) return <CandidateResourceState loading={resource.loading} error={resource.error} onRetry={resource.refresh} />;
  const records = resource.data.slice().sort((a, b) => Date.parse(b.createdAt) - Date.parse(a.createdAt));
  const active = records.filter(item => !['rejected', 'hired'].includes(item.status));
  const shortlist = records.filter(item => item.status === 'shortlisted');
  const closed = records.filter(item => ['rejected', 'hired'].includes(item.status));
  const visible = view === 'active' ? active : view === 'shortlisted' ? shortlist : view === 'closed' ? closed : records;
  const selected = visible.find(item => item.id === selectedId) || visible[0];
  const columns: Column<CandidateApplication>[] = [
    { header: 'Role / company', accessor: item => <span className="candidate-application-cell"><span className="candidate-company-mark">{item.jobId.company.slice(0, 1)}</span><div><strong>{item.jobId.title}</strong><small>{item.jobId.company}</small></div></span> },
    { header: 'Applied', accessor: item => candidateDate(item.appliedAt || item.createdAt) },
    { header: 'Status', accessor: item => <CandidateStatus status={item.status} /> },
  ];
  return <div className="candidate-workspace"><CandidateHeading kicker="YOUR APPLICATIONS" title="Every application. One clear view." description="Keep track of the roles you’ve applied for and see the latest status from each team." action={<Link className="flow-button secondary" href="/candidate/jobs">Explore opportunities<ArrowUpRight size={13} /></Link>} />
    <MetricRail metrics={[{ label: 'Applications sent', value: records.length, icon: Send }, { label: 'In progress', value: active.length, icon: Users }, { label: 'Shortlisted', value: shortlist.length, icon: CheckCircle2 }, { label: 'Hired', value: records.filter(item => item.status === 'hired').length, icon: BriefcaseBusiness }]} />
    <nav className="candidate-view-switcher" aria-label="Application views">{[{ value: 'all', label: 'All applications', count: records.length }, { value: 'active', label: 'In progress', count: active.length }, { value: 'shortlisted', label: 'Shortlisted', count: shortlist.length }, { value: 'closed', label: 'Closed', count: closed.length }].map(tab => <button key={tab.value} aria-pressed={view === tab.value} onClick={() => { setView(tab.value); setSelectedId(''); }}>{tab.label}<span>{tab.count}</span></button>)}</nav>
    {!records.length ? <CandidateEmpty title="Your next step starts with a role." description="Once you apply, your applications and their latest status will appear here." href="/candidate/jobs" /> : <div className="candidate-applications-layout"><DataTable key={view} title="Application history" columns={columns} data={visible} rowKey="id" selectedRowKey={selected?.id} onRowSelect={item => setSelectedId(item.id)} searchPlaceholder="Search role, company or status…" emptyState={{ title: 'No applications in this view', description: 'Choose another status to see your other applications.' }} />
      {selected ? <aside className="candidate-application-detail" aria-label="Selected application details"><div className="candidate-detail-label">APPLICATION DETAILS<ArrowUpRight size={13} /></div><span className="candidate-company-mark large">{selected.jobId.company.slice(0, 1)}</span><p className="candidate-detail-company">{selected.jobId.company}</p><h2>{selected.jobId.title}</h2><p className="candidate-role-location"><MapPin size={12} />{selected.jobId.location}</p><CandidateStatus status={selected.status} /><dl className="candidate-application-facts"><div><dt>Applied on</dt><dd>{candidateDate(selected.appliedAt || selected.createdAt)}</dd></div><div><dt>Department</dt><dd>{selected.jobId.department}</dd></div><div><dt>Experience</dt><dd>{selected.jobId.experienceLevel}</dd></div></dl><section className="candidate-status-history"><h3>Your application</h3><div><span className="candidate-history-dot complete"><Check size={11} /></span><div><strong>Application sent</strong><small>{candidateDate(selected.appliedAt || selected.createdAt)}</small></div></div><div><span className="candidate-history-dot"><FileText size={11} /></span><div><strong>{statusLabel(selected.status)}</strong><small>Latest status from the hiring team</small><p>{statusDetails[selected.status] || 'Check this page for updates from the hiring team.'}</p></div></div></section><Link className="flow-button primary" href={selected.status === 'rejected' ? '/candidate/jobs' : '/candidate/assessments'}>{selected.status === 'rejected' ? 'Explore other roles' : 'View my assessments'}<ArrowRight size={13} /></Link></aside> : <aside className="candidate-application-detail"><CandidateEmpty title="No application selected" description="Choose another view to see an application’s details." /></aside>}</div>}
    <section className="candidate-bottom-note"><ClipboardList size={18} /><div><strong>Your status comes from the hiring team.</strong><p>Check your notifications for updates and My assessments for any tasks assigned to you.</p></div><Link href="/candidate/notifications">View notifications<ArrowRight size={13} /></Link></section>
  </div>;
}
