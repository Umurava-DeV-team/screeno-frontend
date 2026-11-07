'use client';
import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Check } from 'lucide-react';

export default function AssessmentFlowHeader() {
  const path = usePathname();
  const phase = path.includes('/new') ? 0 : path.includes('/edit/') ? 1 : path.includes('/preview/') ? 2 : 3;
  if (!['/new', '/edit/', '/preview/', '/launch/'].some(segment => path.includes(segment))) return <header className="builder-progress"><Link className="flow-back" href="/recruiter/assessments"><ArrowLeft size={14} />Assessments</Link><small>ASSESSMENT RESULTS</small></header>;
  const id = path.split('/').at(-1);
  const routes = ['/recruiter/assessments/new', '/recruiter/assessments/edit/' + id, '/recruiter/assessments/preview/' + id, '/recruiter/assessments/launch/' + id];
  return <header className="builder-progress"><Link className="flow-back" href="/recruiter/assessments"><ArrowLeft size={14} />Assessments</Link><ol aria-label="Assessment setup progress">{['Choose a role', 'Build questions', 'Preview', 'Assign'].map((label, index) => <li key={label} data-current={phase === index} data-complete={phase > index} aria-current={phase === index ? 'step' : undefined}><span>{phase > index ? <Check size={12} /> : '0' + (index + 1)}</span>{index < phase && index > 0 ? <Link href={routes[index]}>{label}</Link> : <strong>{label}</strong>}</li>)}</ol><small>STEP {phase + 1} OF 4</small></header>;
}
