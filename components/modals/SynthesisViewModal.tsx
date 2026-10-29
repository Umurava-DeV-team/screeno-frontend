'use client';

import React from 'react';
import Modal from './Modal';
import { FileSearch2, ListChecks, MonitorCheck, Zap, CheckCircle2, AlertCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

interface SynthesisViewModalProps {
  isOpen: boolean;
  onClose: () => void;
  match: any;
}

export default function SynthesisViewModal({ isOpen, onClose, match }: SynthesisViewModalProps) {
  if (!match) return null;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="AI Talent Synthesis" width="max-w-2xl">
      <div className="p-10 space-y-8 font-sans bg-white">
        <div className="flex items-center gap-4">
           <div className="w-12 h-12 rounded-lg bg-blue-50 flex items-center justify-center text-brand border border-blue-100 shadow-sm">
              <FileSearch2 className="w-6 h-6" />
           </div>
           <div>
              <h3 className="text-2xl font-semibold text-ink tracking-tight">{match.name}</h3>
              <p className="text-[10px] font-medium text-slate-400 tracking-wide">{match.email}</p>
           </div>
        </div>

        <div className="p-8 bg-slate-50 border border-slate-100 rounded-lg relative overflow-hidden">
           <div className="absolute top-0 right-0 p-4 opacity-10">
              <Zap className="w-20 h-20 text-ink" />
           </div>
           <p className="text-[13px] font-medium text-slate-600 leading-relaxed italic relative z-10">
             "{match.summary}"
           </p>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
           <div className="space-y-4">
              <div className="flex items-center gap-2 text-emerald-600 bg-emerald-50 w-fit px-3 py-1 rounded-lg border border-emerald-100">
                 <ListChecks className="w-3.5 h-3.5" />
                 <span className="text-[9px] font-semibold tracking-wide">Key Strengths</span>
              </div>
              <ul className="space-y-3">
                 {match.strengths.map((s: string, i: number) => (
                   <li key={i} className="flex items-start gap-3 group">
                      <CheckCircle2 className="w-4 h-4 text-emerald-500 mt-0.5 shrink-0" />
                      <span className="text-[11px] font-medium text-slate-500 group-hover:text-slate-900 transition-colors leading-tight">{s}</span>
                   </li>
                 ))}
              </ul>
           </div>

           <div className="space-y-4">
              <div className="flex items-center gap-2 text-orange-600 bg-orange-50 w-fit px-3 py-1 rounded-lg border border-orange-100">
                 <MonitorCheck className="w-3.5 h-3.5" />
                 <span className="text-[9px] font-semibold tracking-wide">Areas for Review</span>
              </div>
              <ul className="space-y-3">
                 {match.risks.map((r: string, i: number) => (
                   <li key={i} className="flex items-start gap-3 group">
                      <div className="w-1.5 h-1.5 rounded-full bg-orange-400 mt-1.5 shrink-0" />
                      <span className="text-[11px] font-medium text-slate-500 group-hover:text-slate-900 transition-colors leading-tight">{r}</span>
                   </li>
                 ))}
              </ul>
           </div>
        </div>

        <div className="flex justify-end pt-6 border-t border-slate-50">
           <button onClick={onClose} className="px-10 py-4 bg-slate-100 text-slate-400 rounded-lg font-medium text-[12px] tracking-wide hover:bg-slate-200 transition-all active:scale-95">
              Close
           </button>
        </div>
      </div>
    </Modal>
  );
}
