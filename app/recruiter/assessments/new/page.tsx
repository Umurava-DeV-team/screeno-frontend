'use client';
import { Suspense, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { ArrowRight, BriefcaseBusiness, ClipboardList, Check, MapPin } from 'lucide-react';
import CustomSelect from '@/components/CustomSelect';
import AssessmentFlowHeader from '@/components/studio/AssessmentFlowHeader';
import { usePreviewResource } from '@/lib/demo/usePreviewResource';
import type { DemoJob } from '@/lib/demo/types';
import { apiFetch } from '@/lib/api';
import PreviewResourceState from '@/components/PreviewResourceState';

export default function NewAssessmentPage() { return <Suspense fallback={<PreviewResourceState loading />}><Setup /></Suspense>; }
function Setup() {
  const router = useRouter(), query = useSearchParams();
  const jobs = usePreviewResource<DemoJob[]>('/jobs');
  const [jobId, setJobId] = useState(query.get('jobId') || ''), [title, setTitle] = useState('');
  const [busy, setBusy] = useState(false), [error, setError] = useState('');
  async function create(event: React.FormEvent) {
    event.preventDefault(); setBusy(true); setError('');
    try {
      const value = await apiFetch<{ id: string }>('/assessments/generate-draft', { method: 'POST', body: JSON.stringify({ jobId, title: title.trim() || undefined }) });
      if (title.trim()) await apiFetch('/assessments/' + value.id, { method: 'PATCH', body: JSON.stringify({ title: title.trim() }) });
      router.push('/recruiter/assessments/edit/' + value.id);
    } catch (cause) { setError(cause instanceof Error ? cause.message : 'Unable to create a draft.'); setBusy(false); }
  }
  if (jobs.loading || !jobs.data) return <PreviewResourceState loading={jobs.loading} error={jobs.error} />;
  const job = jobs.data.find(item => item.id === jobId);
  return <div className="assessment-builder"><AssessmentFlowHeader /><div className="builder-title"><span className="flow-kicker">ASSESSMENT BUILDER</span><h1>A better way to see their skills.</h1><p>Start with a role. Make the questions your own.</p></div><div className="builder-setup-grid"><form onSubmit={create} className="builder-surface"><header className="builder-section-header"><span className="flow-section-number">01</span><div><h2>Set the foundation</h2><p>Choose who you’re hiring and name this assessment.</p></div></header><div className="builder-form-fields"><label>Hiring role<CustomSelect required value={jobId} onChange={event => setJobId(event.target.value)} aria-label="Hiring role"><option value="">Select a role</option>{jobs.data.map(item => <option key={item.id} value={item.id}>{item.title}</option>)}</CustomSelect></label><label>Assessment name <small>Optional</small><input value={title} onChange={event => setTitle(event.target.value)} maxLength={160} placeholder={job ? job.title + ' assessment' : 'e.g. Frontend engineering skills'} /></label><p className="builder-field-help">You can change the name, questions, timing and pass mark in the next step.</p>{error && <p className="builder-error" role="alert">{error}</p>}</div><footer className="builder-form-footer"><span><Check size={13} />Nothing is assigned yet</span><button className="flow-button primary" disabled={busy || !job} type="submit">{busy ? 'Creating draft…' : 'Continue to questions'}<ArrowRight size={14} /></button></footer></form><aside className="builder-setup-aside"><div className="builder-role-preview"><span className="builder-preview-label">YOUR STARTING POINT</span><div className="builder-preview-symbol"><BriefcaseBusiness size={27} /></div><h2>{job?.title || 'A role worth finding the right person for.'}</h2>{job ? <p><MapPin size={13} />{job.location} · {job.experienceLevel}</p> : <p>Select a role to connect the assessment to your hiring plan.</p>}<div className="builder-preview-facts"><span><strong>05</strong>Sample questions</span><span><strong>20 <small>min</small></strong>Starting duration</span></div></div><div className="builder-tip"><ClipboardList size={18} /><div><h3>Your draft. Your decision.</h3><p>Review the template, check the candidate preview, then choose who receives it. This frontend demo saves locally and sends no emails.</p></div></div></aside></div></div>;
}
