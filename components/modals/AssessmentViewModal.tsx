'use client';

import React from 'react';
import Modal from './Modal';
import { Target, ListChecks, Shield, Clock, Brain, FileText } from 'lucide-react';
import { cn } from '@/lib/utils';

interface AssessmentViewModalProps {
  isOpen: boolean;
  onClose: () => void;
  assessment: any;
}

export default function AssessmentViewModal({ isOpen, onClose, assessment }: AssessmentViewModalProps) {
  if (!assessment) return null;

  const jobTitle = assessment.jobId?.title || assessment.title || assessment.assessment?.job?.title || 'General Recruitment';
  const totalQuestions = assessment.questionsCount || assessment.totalQuestions || assessment.assessment?.totalQuestions || assessment.questions?.length || 0;
  const duration = assessment.durationMinutes || assessment.assessment?.durationMinutes || 0;
  const passingScore = assessment.passingScore || assessment.assessment?.passingScore || 0;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Assessment Intelligence Center" width="max-w-2xl">
      <div className="p-10 space-y-10 font-sans bg-white">
        <div className="flex items-center justify-between">
           <div className="space-y-1">
              <h3 className="text-2xl font-semibold text-slate-900 tracking-tight leading-none">{jobTitle}</h3>
              <p className="text-[10px] font-medium text-slate-400 tracking-wide">Intelligence Campaign Configuration</p>
           </div>
           <div className={cn(
             "px-4 py-2 rounded-xl text-[10px] font-semibold tracking-wide border shadow-sm",
             assessment.status === 'active' ? "bg-emerald-50 text-emerald-600 border-emerald-100" :
             "bg-slate-50 text-slate-400 border-slate-100"
           )}>
             {assessment.status || 'Draft'}
           </div>
        </div>

        {/* Campaign Metrics */}
        <div className="grid grid-cols-3 gap-4">
           <div className="p-6 bg-slate-50 border border-slate-100 rounded-lg space-y-2">
              <div className="flex items-center gap-2 text-brand">
                 <ListChecks className="w-4 h-4" />
                 <span className="text-[10px] font-semibold tracking-wide">Questions</span>
              </div>
              <p className="text-3xl font-semibold text-ink">{totalQuestions}</p>
           </div>

           <div className="p-6 bg-slate-50 border border-slate-100 rounded-lg space-y-2">
              <div className="flex items-center gap-2 text-indigo-900">
                 <Clock className="w-4 h-4" />
                 <span className="text-[10px] font-semibold tracking-wide">Time Limit</span>
              </div>
              <p className="text-3xl font-semibold text-ink">{duration}m</p>
           </div>

           <div className="p-6 bg-[#0649b5] rounded-lg space-y-2">
              <div className="flex items-center gap-2 text-white/40">
                 <Target className="w-4 h-4" />
                 <span className="text-[10px] font-semibold tracking-wide text-white/60">Pass Score</span>
              </div>
              <p className="text-3xl font-semibold text-white">{passingScore}%</p>
           </div>
        </div>

        {/* Assessment Focus Areas */}
        <div className="space-y-6">
           <h4 className="text-[11px] font-semibold text-slate-400 tracking-wide">Intelligence Focus Areas</h4>
           <div className="grid grid-cols-2 gap-4">
              <div className="p-4 border border-slate-100 rounded-xl flex items-center gap-4 group hover:border-[#0649b5] transition-all">
                 <div className="w-10 h-10 rounded-lg bg-slate-50 flex items-center justify-center text-slate-400 group-hover:bg-[#0649b5] group-hover:text-white transition-all">
                    <Brain className="w-5 h-5" />
                 </div>
                 <div>
                    <p className="text-[11px] font-medium text-slate-900">Logic & Reasoning</p>
                    <p className="text-[9px] font-medium text-slate-400 tracking-tighter">Core Evaluation</p>
                 </div>
              </div>
              <div className="p-4 border border-slate-100 rounded-xl flex items-center gap-4 group hover:border-[#0649b5] transition-all">
                 <div className="w-10 h-10 rounded-lg bg-slate-50 flex items-center justify-center text-slate-400 group-hover:bg-[#0649b5] group-hover:text-white transition-all">
                    <Shield className="w-5 h-5" />
                 </div>
                 <div>
                    <p className="text-[11px] font-medium text-slate-900">Integrity Guard</p>
                    <p className="text-[9px] font-medium text-slate-400 tracking-tighter">Session Monitoring</p>
                 </div>
              </div>
           </div>
        </div>

        {/* Content Summary */}
        <div className="p-6 bg-slate-50 rounded-lg border border-dashed border-slate-200">
           <h4 className="text-[11px] font-semibold text-slate-400 tracking-wide mb-4">Instructions Summary</h4>
           <p className="text-[12px] font-medium text-slate-600 leading-relaxed italic">
              {assessment.instructions || 'No specific instructions provided for this assessment campaign.'}
           </p>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-4 pt-4">
           <button onClick={onClose} className="flex-1 py-4 bg-[#0649b5] text-white rounded-xl font-medium text-[12px] tracking-wide hover:shadow-sm hover:shadow-blue-900/20 transition-all active:scale-95">
              Close Overview
           </button>
        </div>
      </div>
    </Modal>
  );
}
