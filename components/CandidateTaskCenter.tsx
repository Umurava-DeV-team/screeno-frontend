'use client';
import { useState } from 'react';
import Link from 'next/link';
import { ArrowRight, ArrowUpRight, CheckCircle2, ChevronDown, ClipboardCheck, Clock3, FileText, Headphones, MessageSquare, Play, ShieldCheck } from 'lucide-react';
import { usePreviewResource } from '@/lib/demo/usePreviewResource';
import MetricRail from './MetricRail';
import DataTable, { type Column } from './DataTable';
import { CandidateResourceState } from './CandidateWorkspace';
import { CandidateHeading, CandidateStatus, candidateDate, type CandidateTask } from './CandidateWorkspace';

function taskAction(task: CandidateTask) {
  return task.status === 'in_progress' ? 'Resume assessment' : task.status === 'submitted' ? 'View submission' : task.status === 'evaluated' ? 'View feedback' : 'Review instructions';
}
export default function CandidateTaskCenter() {
  const resource = usePreviewResource<CandidateTask[]>('/assessments/my');
  const [view, setView] = useState('all');
  if (resource.loading || !resource.data) return <CandidateResourceState loading={resource.loading} error={resource.error} onRetry={resource.refresh} />;
  const records = resource.data;
  const todo = records.filter(task => ['assigned', 'in_progress'].includes(task.status));
  const waiting = records.filter(task => task.status === 'submitted');
  const reviewed = records.filter(task => task.status === 'evaluated');
  const next = todo.find(task => task.status === 'in_progress') || todo[0];
  const visible = view === 'todo' ? todo : view === 'submitted' ? waiting : view === 'reviewed' ? reviewed : records;
  const columns: Column<CandidateTask>[] = [
    { header: 'Assessment / role', accessor: task => <div className="candidate-assessment-cell"><span><ClipboardCheck size={17} /></span><div><strong>{task.title}</strong><small>{task.jobId.title} · {task.jobId.company}</small></div></div> },
    { header: 'Details', accessor: task => <div className="candidate-assessment-meta"><span><Clock3 size={12} />{task.durationMinutes} min</span><span><FileText size={12} />{task.totalQuestions} questions</span></div> },
    { header: 'Status', accessor: task => <div className="candidate-assessment-status"><CandidateStatus status={task.status} />{task.status === 'evaluated' && <small>Score: {Math.round(task.percentage)}%</small>}</div> },
    { header: 'Actions', accessor: task => <Link className="candidate-table-action" href={'/candidate/assessments/' + task.id}>{taskAction(task)}<ArrowUpRight size={12} /></Link> },
  ];
  return <div className="candidate-workspace"><CandidateHeading kicker="YOUR ASSESSMENTS" title="Show what you can do." description="See what’s ready to start, pick up where you left off, and find your feedback." action={<Link className="flow-button secondary" href="/candidate/applications">My applications<ArrowUpRight size={13} /></Link>} />
    <details className="candidate-preparation">
      <summary><span className="candidate-preparation-emblem"><ShieldCheck size={17} /></span><span className="candidate-preparation-label"><strong>Before you begin</strong><small>Three quick tips to help you get ready.</small></span><span className="candidate-preparation-toggle"><span className="when-closed">View tips</span><span className="when-open">Hide tips</span></span><ChevronDown className="candidate-preparation-chevron" size={14} /></summary>
      <div className="candidate-preparation-checks">
        {[
          { title: 'Read the instructions', icon: FileText, description: 'Check the time limit, task details and allowed tools.' },
          { title: 'Make room to focus', icon: Headphones, description: 'Find a quiet space and set aside enough uninterrupted time.' },
          { title: 'Ask if you need support', icon: MessageSquare, description: 'Use the hiring team’s contact details in your instructions to request help or an adjustment.' },
        ].map(({ title, icon: Icon, description }) => <article key={title}><Icon size={17} /><div><h3>{title}</h3><p>{description}</p></div></article>)}
      </div>
    </details>
    <MetricRail metrics={[{ label: 'Ready to start', value: records.filter(task => task.status === 'assigned').length, icon: ClipboardCheck }, { label: 'In progress', value: records.filter(task => task.status === 'in_progress').length, icon: Play }, { label: 'Awaiting review', value: waiting.length, icon: Clock3 }, { label: 'Feedback ready', value: reviewed.length, icon: CheckCircle2 }]} />
    {next ? <section className="candidate-next-task"><div className="candidate-next-task-copy"><span className="candidate-next-label">{next.status === 'in_progress' ? 'PICK UP WHERE YOU LEFT OFF' : 'YOUR NEXT ASSESSMENT'}</span><h2>{next.title}</h2><p>{next.jobId.company} · {next.jobId.title}</p><div><span><Clock3 size={13} />{next.durationMinutes} minutes</span><span><FileText size={13} />{next.totalQuestions} questions</span><span>Assigned {candidateDate(next.assignedAt)}</span></div></div><Link className="flow-button primary" href={'/candidate/assessments/' + next.id}>{taskAction(next)}<ArrowRight size={14} /></Link><span className="candidate-task-orbit" aria-hidden="true"><ClipboardCheck size={45} /></span></section> : <section className="candidate-up-to-date"><CheckCircle2 size={21} /><div><h2>{records.length ? 'You’re up to date.' : 'Your assessments will appear here.'}</h2><p>{records.length ? 'There are no assessments waiting for you to complete. Check below for submissions and feedback.' : 'When a hiring team assigns a task, you can review its instructions and time limit here.'}</p></div></section>}
    <nav className="candidate-view-switcher" aria-label="My assessment views">{[{ value: 'all', label: 'All assessments', count: records.length }, { value: 'todo', label: 'To complete', count: todo.length }, { value: 'submitted', label: 'Awaiting review', count: waiting.length }, { value: 'reviewed', label: 'Feedback ready', count: reviewed.length }].map(tab => <button key={tab.value} aria-pressed={view === tab.value} onClick={() => setView(tab.value)}>{tab.label}<span>{tab.count}</span></button>)}</nav>
    <DataTable key={view} title="Assessment activity" columns={columns} data={visible} rowKey="id" searchPlaceholder="Search assessment, role or company…" emptyState={{ title: 'No assessments in this view', description: 'Choose another view to see your tasks and feedback.', icon: <ClipboardCheck size={25} /> }} />

  </div>;
}
