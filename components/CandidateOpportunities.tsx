'use client';
import { useState } from 'react';
import Link from 'next/link';
import { ArrowRight, ArrowUpRight, BriefcaseBusiness, CheckCircle2, MapPin, SlidersHorizontal, UserRound } from 'lucide-react';
import { usePreviewResource } from '@/lib/demo/usePreviewResource';
import { apiFetch } from '@/lib/api';
import type { DemoJob, DemoProfile } from '@/lib/demo/types';
import { isProfileComplete } from '@/lib/store/features/profileSlice';
import CustomSelect from './CustomSelect';
import Modal from './modals/Modal';
import DataTable, { type Column } from './DataTable';
import { CandidateResourceState } from './CandidateWorkspace';
import { CandidateHeading, candidateDate, type CandidateApplication } from './CandidateWorkspace';

export default function CandidateOpportunities() {
  const jobs = usePreviewResource<DemoJob[]>('/jobs'), applications = usePreviewResource<CandidateApplication[]>('/applications/my'), profile = usePreviewResource<DemoProfile>('/profile');
  const [location, setLocation] = useState('all'), [level, setLevel] = useState('all'), [view, setView] = useState('all'), [sort, setSort] = useState('newest'), [reset, setReset] = useState(0);
  const [selectedId, setSelectedId] = useState<string | null>(null), [confirm, setConfirm] = useState(false), [busy, setBusy] = useState(false), [error, setError] = useState(''), [message, setMessage] = useState('');
  if (jobs.loading || applications.loading || profile.loading || !jobs.data || !applications.data || !profile.data) return <CandidateResourceState loading={jobs.loading || applications.loading || profile.loading} error={jobs.error || applications.error || profile.error} onRetry={() => { jobs.refresh(); applications.refresh(); profile.refresh(); }} />;
  const open = jobs.data.filter(job => job.status === 'active');
  const applied = new Set(applications.data.map(application => application.jobId.id || application.jobId._id));
  const ready = isProfileComplete(profile.data), selected = jobs.data.find(job => job.id === selectedId);
  const roles = open.filter(job => (location === 'all' || job.location === location) && (level === 'all' || job.experienceLevel === level) && (view === 'all' || (view === 'applied' ? applied.has(job.id) : !applied.has(job.id)))).sort((a, b) => sort === 'title' ? a.title.localeCompare(b.title) : Date.parse(b.createdAt) - Date.parse(a.createdAt));
  function resetFilters() { setLocation('all'); setLevel('all'); setView('all'); setSort('newest'); setReset(value => value + 1); }
  function openRole(job: DemoJob) { setSelectedId(job.id); setConfirm(false); setError(''); }
  const columns: Column<DemoJob>[] = [
    { header: 'Role / company', accessor: job => <span className="candidate-opportunity-cell"><span className="candidate-company-mark">{job.company.slice(0, 1) || 'S'}</span><span><strong>{job.title}</strong><small>{job.company} · {candidateDate(job.createdAt)}</small></span></span> },
    { header: 'Location', accessor: job => <span className="candidate-opportunity-location"><MapPin size={12} />{job.location}</span> },
    { header: 'Experience', accessor: 'experienceLevel' },
    { header: 'Compensation', accessor: job => <span className="candidate-opportunity-salary">{job.salaryRange || 'Not specified'}</span> },
    { header: 'Status', accessor: job => <span className={applied.has(job.id) ? 'candidate-applied-tag' : 'candidate-status'}>{applied.has(job.id) ? 'Applied' : 'Open'}</span> },
    { header: 'Actions', accessor: job => <button className="candidate-table-action" aria-label={'View ' + job.title} onClick={() => openRole(job)}>View role<ArrowUpRight size={12} /></button> },
  ];
  async function apply() {
    if (!selected || busy) return;
    setBusy(true); setError('');
    try { await apiFetch('/applications', { method: 'POST', body: JSON.stringify({ jobId: selected.id }) }); setMessage('Your application for ' + selected.title + ' is saved. Follow its progress in My applications.'); setConfirm(false); setSelectedId(null); applications.refresh(); }
    catch (cause) { setError(cause instanceof Error ? cause.message : 'Unable to save your application.'); }
    finally { setBusy(false); }
  }
  return <div className="candidate-workspace"><CandidateHeading kicker="OPPORTUNITIES" title="Find a role that fits you." description="Explore the work, compare the details, and apply when you’re ready." action={<Link href="/candidate/applications" className="flow-button secondary">My applications<ArrowUpRight size={13} /></Link>} />
    <section className="candidate-discovery-banner"><div><span className="candidate-banner-icon"><BriefcaseBusiness size={22} /></span><div><strong>{open.length} open {open.length === 1 ? 'role' : 'roles'}. Your next step.</strong><p>Search by role, company or location. Every application starts with your profile.</p></div></div><Link href="/candidate/profile" className="candidate-profile-link"><span><UserRound size={15} />{ready ? 'Profile ready to apply' : 'Complete your profile'}</span><ArrowUpRight size={14} /></Link></section>
    <div className="candidate-filters"><CustomSelect aria-label="Opportunity location" value={location} onChange={event => { setLocation(event.target.value); }}><option value="all">All locations</option>{[...new Set(open.map(job => job.location))].sort().map(value => <option key={value} value={value}>{value}</option>)}</CustomSelect><CustomSelect aria-label="Experience level" value={level} onChange={event => { setLevel(event.target.value); }}><option value="all">Any experience level</option>{[...new Set(open.map(job => job.experienceLevel))].sort().map(value => <option key={value} value={value}>{value}</option>)}</CustomSelect><button className="candidate-reset" onClick={resetFilters} aria-label="Reset opportunity filters"><SlidersHorizontal size={14} />Reset</button></div>
    <div className="candidate-list-toolbar"><nav className="candidate-view-switcher" aria-label="Opportunity views">{[{ value: 'all', label: 'All roles', count: open.length }, { value: 'new', label: 'Not applied', count: open.filter(job => !applied.has(job.id)).length }, { value: 'applied', label: 'Applied', count: open.filter(job => applied.has(job.id)).length }].map(tab => <button key={tab.value} aria-pressed={view === tab.value} onClick={() => { setView(tab.value); }}>{tab.label}<span>{tab.count}</span></button>)}</nav><CustomSelect aria-label="Sort opportunities" value={sort} onChange={event => { setSort(event.target.value); }}><option value="newest">Newest first</option><option value="title">Job title A–Z</option></CustomSelect></div>
    {message && <p className="candidate-success" role="status"><CheckCircle2 size={15} />{message}</p>}
    <div className="candidate-opportunities-table"><DataTable key={[location, level, view, sort, reset].join('|')} title="Open opportunities" columns={columns} data={roles} rowKey="id" onRowSelect={openRole} selectedRowKey={selectedId || undefined} searchPlaceholder="Search role, company, location or keyword…" emptyState={{ title: 'No roles match these filters', description: 'Try another keyword, location or experience level.', actionLabel: 'Reset filters', onAction: resetFilters, icon: <BriefcaseBusiness size={25} /> }} /></div>
    <Modal isOpen={!!selected} onClose={() => { if (!busy) { setSelectedId(null); setConfirm(false); } }} title={confirm ? 'Review your application' : 'Role details'} width="max-w-4xl">{selected && <div className="candidate-role-dialog"><div className="candidate-dialog-role"><span className="candidate-company-mark">{selected.company.slice(0, 1)}</span><div><small>{selected.company}</small><h2>{selected.title}</h2><p><MapPin size={12} />{selected.location}</p></div></div>{confirm ? <><section className="candidate-application-review"><span>APPLYING WITH YOUR PROFILE</span><h3>{profile.data.firstName} {profile.data.lastName}</h3><p>{profile.data.headline}</p><div><span>{profile.data.skills.length} skills</span><span>{profile.data.workExperience.length} experience records</span></div><Link href="/candidate/profile">Review my profile<ArrowUpRight size={12} /></Link></section><p className="candidate-local-note">Frontend demo: this application is saved on this device. No external application or email is sent.</p></> : <><dl className="candidate-dialog-facts">{[['Department', selected.department], ['Experience', selected.experienceLevel], ['Compensation', selected.salaryRange || 'Not specified'], ['Posted', candidateDate(selected.createdAt)]].map(([label, value]) => <div key={label}><dt>{label}</dt><dd>{value}</dd></div>)}</dl><section className="candidate-role-description"><h3>About the role</h3><p>{selected.description || 'No further description has been provided.'}</p></section></>}{error && <p className="builder-error" role="alert">{error}</p>}<footer className="candidate-dialog-footer">{applied.has(selected.id) ? <><span className="candidate-applied-tag"><CheckCircle2 size={14} />You’ve applied to this role</span><Link className="flow-button primary" href="/candidate/applications">Track application<ArrowRight size={13} /></Link></> : !ready ? <><p>Complete your details, skills, experience and education to apply.</p><Link className="flow-button primary" href="/candidate/profile">Complete profile<ArrowRight size={13} /></Link></> : confirm ? <><button className="flow-button secondary" disabled={busy} onClick={() => setConfirm(false)}>Back to role</button><button className="flow-button primary" disabled={busy} onClick={() => void apply()}>{busy ? 'Saving…' : 'Submit application'}<ArrowRight size={13} /></button></> : <><span>Your profile will be shared with the hiring team.</span><button className="flow-button primary" onClick={() => setConfirm(true)}>Review application<ArrowRight size={13} /></button></>}</footer></div>}</Modal>
  </div>;
}
