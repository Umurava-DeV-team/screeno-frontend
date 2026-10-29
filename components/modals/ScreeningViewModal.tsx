'use client';

import React, { useState } from 'react';
import Modal from './Modal';
import { Brain, Cpu, ChevronRight, Users, CheckCircle } from 'lucide-react';

interface ScreeningViewModalProps {
  isOpen: boolean;
  onClose: () => void;
  screening: any;
}

export default function ScreeningViewModal({ isOpen, onClose, screening }: ScreeningViewModalProps) {
  const [activeTab, setActiveTab] = useState<'summary' | 'scanned' | 'shortlist'>('summary');

  if (!screening) return null;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={activeTab === 'summary' ? "AI Analysis Report" : activeTab === 'scanned' ? "Scanned Applicants" : "AI Shortlist"} width="max-w-3xl">
      <div className="bg-white font-sans min-h-[500px]">
        {activeTab === 'summary' && (
          <div className="p-10 space-y-10">
            <div className="flex items-start gap-6">
               <div className="w-16 h-16 rounded-lg bg-blue-50 border border-blue-100 flex items-center justify-center text-ink shadow-lg shadow-blue-900/5">
                  <Brain className="w-8 h-8" strokeWidth={2.5} />
               </div>
               <div className="space-y-1">
                  <h3 className="text-[11px] font-medium text-brand tracking-wide">Artificial Intelligence Scan</h3>
                  <p className="text-2xl font-medium text-slate-900 tracking-tight">Technical Shortlist Report</p>
                  <p className="text-[12px] font-medium text-slate-400">Processed on {screening.dateRun}</p>
               </div>
            </div>

            {/* Scan Summary - CLICKABLE CARDS */}
            <div className="grid grid-cols-3 gap-6">
               <button
                 onClick={() => setActiveTab('scanned')}
                 className="p-6 bg-slate-50 border border-slate-100 rounded-lg transition-all hover:bg-blue-50 hover:border-blue-900/20 group"
               >
                  <p className="text-[9px] font-medium text-slate-400 group-hover:text-brand tracking-wide mb-1 text-center">Applicants Scanned</p>
                  <p className="text-3xl font-medium text-slate-900 text-center">{screening.totalScreened}</p>
               </button>
               <button
                 onClick={() => setActiveTab('shortlist')}
                 className="p-6 bg-white border-2 border-blue-900 rounded-lg transition-all hover:shadow-sm hover:shadow-blue-900/10 group"
               >
                  <p className="text-[9px] font-medium text-brand tracking-wide mb-1 text-center">AI Shortlist</p>
                  <p className="text-3xl font-medium text-brand text-center">{screening.shortlistSize}</p>
               </button>
               <div className="p-6 bg-slate-50 border border-slate-100 rounded-lg">
                  <p className="text-[9px] font-medium text-slate-400 tracking-wide mb-1 text-center">Confidence</p>
                  <p className="text-3xl font-medium text-slate-900 text-center">98.2%</p>
               </div>
            </div>

            {/* AI Insight */}
            <div className="space-y-6">
               <div className="flex items-center justify-between border-b border-slate-50 pb-2">
                  <h4 className="text-[12px] font-medium text-slate-900 tracking-wide">Model Synthesis</h4>
                  <Cpu className="w-4 h-4 text-brand" />
               </div>

               <div className="p-6 bg-slate-50/50 rounded-lg border border-slate-100 space-y-4 italic leading-relaxed text-[13px] font-medium text-slate-500">
                  "The AI model has identified a high correlation between candidate skill matrices and the job requirements. Shortlisted candidates exhibit superior technical consistency."
               </div>
            </div>

            <div className="flex items-center gap-4 pt-4">
               <button onClick={() => setActiveTab('shortlist')} className="flex-1 py-4 bg-[#0649b5] text-white rounded-xl font-medium text-[12px] tracking-wide flex items-center justify-center gap-2 hover:shadow-sm hover:shadow-blue-900/20 transition-all active:scale-95 group">
                  View Detailed Full Results
                  <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
               </button>
            </div>
          </div>
        )}

        {(activeTab === 'scanned' || activeTab === 'shortlist') && (
           <div className="p-10 space-y-8 animate-in slide-in-from-right-4 duration-300">
              <button
                onClick={() => setActiveTab('summary')}
                className="text-[10px] font-medium text-brand tracking-wide flex items-center gap-2 hover:translate-x-[-4px] transition-transform"
              >
                 <ChevronRight className="w-3 h-3 rotate-180" />
                 Back to summary
              </button>

              <div className="space-y-4">
                 <h4 className="text-xl font-medium text-slate-900">
                   {activeTab === 'scanned' ? 'All Processed Applicants' : 'AI-Verified Shortlist'}
                 </h4>
                 <div className="space-y-3 max-h-[400px] pr-2 overflow-y-auto [&::-webkit-scrollbar]:hidden">
                    {[1, 2, 3, 4, 5].map((i) => (
                      <div key={i} className="p-5 border border-slate-100 rounded-lg flex items-center justify-between hover:border-blue-900/20 transition-all bg-slate-50/30">
                         <div className="flex items-center gap-4">
                            <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center text-brand font-medium italic">A</div>
                            <div>
                               <p className="font-medium text-slate-800">Candidate Name {i}</p>
                               <p className="text-[10px] font-medium text-slate-400">Score: {activeTab === 'shortlist' ? '9'+i+'%' : '6'+i+'%'}</p>
                            </div>
                         </div>
                         {activeTab === 'shortlist' ? (
                           <CheckCircle className="w-5 h-5 text-emerald-500" />
                         ) : (
                           <button className="text-[10px] font-medium text-brand tracking-wide underline underline-offset-4">View report</button>
                         )}
                      </div>
                    ))}
                 </div>
              </div>
           </div>
        )}
      </div>
    </Modal>
  );
}
