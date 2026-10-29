'use client';

import { X, CheckCircle2, TrendingUp, AlertTriangle, MessageSquare } from 'lucide-react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

interface ReasoningDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  data: any;
  candidateName: string;
}

export default function ReasoningDrawer({ isOpen, onClose, data, candidateName }: ReasoningDrawerProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />

      {/* Drawer */}
      <div className="relative w-full max-w-xl bg-white h-screen shadow-sm flex flex-col animate-in slide-in-from-right duration-300">
        <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
          <div>
            <h3 className="text-xl font-medium text-slate-900">AI Reasoning</h3>
            <p className="text-sm text-slate-500">Analysis for {candidateName}</p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-white rounded-xl transition-colors shadow-sm">
            <X className="w-5 h-5 text-slate-400" />
          </button>
        </div>

        <div className="grow overflow-y-auto p-8 space-y-10">
          {/* Recommendation */}
          <section className="space-y-4">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-emerald-100 text-emerald-700 rounded-lg text-xs font-medium tracking-wider">
              <TrendingUp className="w-4 h-4" />
              {data.recommendation}
            </div>
            <div className="p-6 bg-indigo-50 rounded-lg border border-indigo-100 text-slate-700 leading-relaxed italic">
              "{data.aiReasoning}"
            </div>
          </section>

          {/* Score Breakdown */}
          <section className="space-y-6">
            <h4 className="text-sm font-medium text-slate-400 tracking-wide">Score Breakdown</h4>
            <div className="space-y-6">
              {[
                { label: 'Technical Skills', score: data.scoreBreakdown.skills, color: 'bg-indigo-500' },
                { label: 'Work Experience', score: data.scoreBreakdown.experience, color: 'bg-blue-500' },
                { label: 'Education', score: data.scoreBreakdown.education, color: 'bg-teal-500' },
              ].map((item) => (
                <div key={item.label} className="space-y-2">
                  <div className="flex items-center justify-between text-sm font-medium">
                    <span className="text-slate-700">{item.label}</span>
                    <span className="text-slate-900">{item.score}%</span>
                  </div>
                  <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                    <div className={cn("h-full rounded-full transition-all duration-1000", item.color)} style={{ width: `${item.score}%` }} />
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* Strengths & Gaps */}
          <div className="grid grid-cols-2 gap-8">
            <section className="space-y-4">
              <h4 className="flex items-center gap-2 text-sm font-medium text-emerald-600 tracking-wide">
                <CheckCircle2 className="w-4 h-4" />
                Strengths
              </h4>
              <ul className="space-y-3">
                {data.strengths.map((s: string) => (
                  <li key={s} className="text-sm text-slate-600 flex gap-2">
                    <span className="w-1 h-1 rounded-full bg-emerald-400 mt-2 shrink-0" />
                    {s}
                  </li>
                ))}
              </ul>
            </section>
            <section className="space-y-4">
              <h4 className="flex items-center gap-2 text-sm font-medium text-amber-600 tracking-wide">
                <AlertTriangle className="w-4 h-4" />
                Gaps
              </h4>
              <ul className="space-y-3">
                {data.gaps.map((g: string) => (
                  <li key={g} className="text-sm text-slate-600 flex gap-2">
                    <span className="w-1 h-1 rounded-full bg-amber-400 mt-2 shrink-0" />
                    {g}
                  </li>
                ))}
              </ul>
            </section>
          </div>

          <section className="space-y-4">
            <h4 className="flex items-center gap-2 text-sm font-medium text-slate-400 tracking-wide">
              <MessageSquare className="w-4 h-4" />
              Recruiter Notes
            </h4>
            <textarea
              rows={4}
              className="w-full px-4 py-3 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-recruiter/20 focus:border-recruiter text-sm"
              placeholder="Add your thoughts about this candidate..."
            ></textarea>
          </section>
        </div>

        <div className="p-6 border-t border-slate-100 grid grid-cols-2 gap-4">
          <button className="py-4 rounded-lg border border-slate-200 text-slate-600 font-medium hover:bg-slate-50 transition-colors">
            Reject
          </button>
          <button className="py-4 rounded-lg bg-recruiter text-white font-medium hover:shadow-sm transition-all">
            Approve for Interview
          </button>
        </div>
      </div>
    </div>
  );
}
