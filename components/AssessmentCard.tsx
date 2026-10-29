'use client';

import { Calendar, Clock, ArrowRight, CheckCircle2 } from 'lucide-react';
import Link from 'next/link';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

interface AssessmentCardProps {
  title: string;
  company: string;
  type: string;
  deadline: string;
  status: 'Pending' | 'Completed' | 'Passed' | 'Failed' | 'In Progress';
  score?: number;
  token?: string;
}

export default function AssessmentCard({
  title,
  company,
  type,
  deadline,
  status,
  score,
  token
}: AssessmentCardProps) {
  const isPending = status === 'Pending';

  return (
    <div className="bg-white rounded-lg border border-slate-100 p-6 hover:shadow-sm hover:shadow-blue-900/5 transition-all group flex flex-col md:flex-row md:items-center justify-between gap-6 overflow-hidden">
      <div className="flex items-center gap-5">
        <div className={cn(
          "w-14 h-14 rounded-xl flex items-center justify-center shrink-0 border",
          isPending
            ? "bg-blue-50 text-brand border-blue-100 shadow-sm"
            : "bg-slate-50 text-slate-300 border-slate-100"
        )}>
          {isPending ? <Clock className="w-6 h-6" strokeWidth={2.5} /> : <CheckCircle2 className="w-6 h-6" />}
        </div>
        <div>
          <div className="flex items-center gap-2 mb-1.5 px-0.5">
            <span className="text-[10px] font-medium text-slate-300 tracking-[0.15em]">{type}</span>
            <div className="w-1 h-1 rounded-full bg-slate-200" />
            <span className="text-[10px] font-medium text-slate-400 tracking-wide">{company}</span>
          </div>
          <h3 className="text-xl font-medium text-slate-900 group-hover:text-brand transition-colors tracking-tight">{title}</h3>
        </div>
      </div>

      <div className="flex flex-col md:items-end gap-2 shrink-0">
        {isPending ? (
          <div className="flex items-center gap-4">
            <div className="text-[11px] font-medium text-brand/40 flex items-center gap-1.5 tracking-wide px-3 py-1 bg-slate-50 rounded-lg border border-slate-100">
               <Calendar className="w-3.5 h-3.5" />
               {deadline}
            </div>
            <Link
              href={`/candidate/assessments/${token || 'sample-token'}`}
              className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-brand text-white font-medium text-sm hover:shadow-lg hover:shadow-blue-900/30 transition-all active:scale-95"
            >
              Start
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        ) : (
          <div className="flex flex-col items-end gap-3">
            <div className="flex items-center gap-3 mb-1 justify-end">
               {score !== undefined && (
                 <span className="text-2xl font-medium text-slate-900 tracking-tighter">{score}%</span>
               )}
               <span className={cn(
                 "px-2.5 py-1 rounded-lg text-[10px] font-medium tracking-wide border",
                 status === 'Passed' ? "bg-emerald-50 text-emerald-600 border-emerald-100" :
                 status === 'Failed' ? "bg-red-50 text-red-600 border-red-100" : "bg-slate-100 text-slate-400 border-slate-200"
               )}>
                 {status}
               </span>
            </div>
            <Link
              href={`/candidate/assessments/${token}/results`}
              className="inline-flex items-center gap-2 px-5 py-2 rounded-xl bg-slate-900 text-white font-medium text-[10px] tracking-wide hover:bg-black transition-all active:scale-95 shadow-lg shadow-slate-900/10"
            >
              View Results
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
