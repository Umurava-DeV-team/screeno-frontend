'use client';
import Link from 'next/link';
import type { ReactNode } from 'react';
import { ArrowRight, ArrowLeft, BriefcaseBusiness, Loader2 } from 'lucide-react';
import type { DemoApplication, DemoAssignment, DemoJob } from '@/lib/demo/types';

export type CandidateApplication = Omit<DemoApplication, 'jobId'> & { jobId: DemoJob };
export type CandidateTask = DemoAssignment & { title: string; jobId: DemoJob; durationMinutes: number; totalQuestions: number };

export function candidateDate(value?: string) {
  return value && !Number.isNaN(Date.parse(value)) ? new Date(value).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }) : 'Not recorded';
}
export function statusLabel(status: string) {
  return ({ pending: 'Submitted', reviewed: 'In review', shortlisted: 'Shortlisted', rejected: 'Not selected', hired: 'Hired', assigned: 'Ready to start', in_progress: 'In progress', submitted: 'Awaiting review', evaluated: 'Feedback ready' } as Record<string, string>)[status] || status.replaceAll('_', ' ');
}
export function CandidateStatus({ status }: { status: string }) {
  return <span className="candidate-status" data-status={status}><i aria-hidden="true" />{statusLabel(status)}</span>;
}
export function CandidateHeading({ kicker, title, description, action }: { kicker: string; title: string; description: string; action?: ReactNode }) {
  return <header className="candidate-page-heading"><div><span className="flow-kicker">{kicker}</span><h1>{title}</h1><p>{description}</p></div>{action}</header>;
}
export function CandidateEmpty({ title, description, href, action }: { title: string; description: string; href?: string; action?: string }) {
  return <div className="candidate-empty"><span><BriefcaseBusiness size={25} /></span><h2>{title}</h2><p>{description}</p>{href && <Link className="flow-button secondary" href={href}>{action || 'Explore opportunities'}<ArrowRight size={13} /></Link>}</div>;
}
export function CandidatePager({ page, pages, total, start, end, onChange }: { page: number; pages: number; total: number; start: number; end: number; onChange: (page: number) => void }) {
  return <footer className="candidate-card-pagination"><span>Showing {total ? start : 0}–{end} of {total} roles</span><nav aria-label="Opportunities pagination"><button type="button" aria-label="Previous page" disabled={page === 1} onClick={() => onChange(page - 1)}><ArrowLeft size={13} /></button>{Array.from({ length: pages }, (_, index) => index + 1).filter(value => value === 1 || value === pages || Math.abs(page - value) <= 1).map((value, index, values) => <span key={value}>{index > 0 && value - values[index - 1] > 1 && <i>…</i>}<button type="button" aria-label={'Page ' + value} aria-current={page === value ? 'page' : undefined} onClick={() => onChange(value)}>{value}</button></span>)}<button type="button" aria-label="Next page" disabled={page === pages} onClick={() => onChange(page + 1)}><ArrowRight size={13} /></button></nav></footer>;
}

export function CandidateResourceState({ loading, error, onRetry }: { loading: boolean; error?: string | null; onRetry: () => void }) {
  return <section className="candidate-empty" role={loading ? 'status' : 'alert'}>{loading ? <Loader2 size={24} className="animate-spin" /> : <BriefcaseBusiness size={24} />}<h2>{loading ? 'Loading your workspace…' : 'We couldn’t load this page.'}</h2><p>{loading ? 'Your roles and activity will be ready in a moment.' : error || 'Please try again.'}</p>{!loading && <button className="flow-button secondary" onClick={onRetry}>Try again<ArrowRight size={13} /></button>}</section>;
}
