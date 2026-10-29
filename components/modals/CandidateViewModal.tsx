'use client';

import React from 'react';
import Modal from './Modal';
import { Mail, Phone, MapPin, Globe, Link as LinkIcon, FileText, Download } from 'lucide-react';
import type { ApiCandidate } from '@/lib/store/features/candidateSlice';

interface CandidateViewModalProps {
  isOpen: boolean;
  onClose: () => void;
  candidate: ApiCandidate | null;
}

export default function CandidateViewModal({ isOpen, onClose, candidate }: CandidateViewModalProps) {
  if (!candidate) return null;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Talent Profile" width="max-w-3xl">
      <div className="bg-white font-sans">
        {/* Profile Header */}
        <div className="p-10 border-b border-slate-50 flex flex-col md:flex-row items-center md:items-start gap-10">
          <div className="w-32 h-32 rounded-lg bg-[#0649b5] flex items-center justify-center text-white text-4xl font-medium italic shadow-sm shadow-blue-900/20 shrink-0">
            {candidate.name.charAt(0)}
          </div>

          <div className="space-y-4 text-center md:text-left grow">
            <div>
              <h2 className="text-3xl font-medium text-slate-900 tracking-tight leading-tight">{candidate.name}</h2>
              <p className="text-[13px] font-medium text-blue-950 tracking-wide mt-1 italic">{candidate.currentRole || 'Talent'}</p>
            </div>

            <div className="flex flex-wrap items-center justify-center md:justify-start gap-6 pt-2">
              <div className="flex items-center gap-1.5 text-[11px] font-medium text-slate-400 tracking-wide">
                 <MapPin className="w-3.5 h-3.5 text-brand" />
                 {candidate.location || 'Remote'}
              </div>
              <div className="flex items-center gap-1.5 text-[11px] font-medium text-slate-400 tracking-wide">
                 <FileText className="w-3.5 h-3.5 text-brand" />
                 {candidate.experience || 'Entry Level'}
              </div>
               <div className="flex items-center gap-1.5 text-[11px] font-medium text-slate-400 tracking-wide">
                 <Globe className="w-3.5 h-3.5 text-brand" />
                 Verified Identity
              </div>
            </div>
          </div>
        </div>

        {/* Detailed Stats & Links */}
        <div className="p-10 grid grid-cols-1 md:grid-cols-2 gap-12">
           <div className="space-y-6">
              <h4 className="text-[12px] font-medium text-slate-900 tracking-wide border-b border-slate-50 pb-2">Technical Arsenal</h4>
              <div className="flex flex-wrap gap-2">
                {candidate.skills && candidate.skills.length > 0 ? (
                  candidate.skills.map((skill: string) => (
                    <span key={skill} className="px-3 py-1.5 bg-slate-50 text-slate-600 rounded-lg text-[11px] font-medium border border-slate-100 hover:border-blue-900/30 transition-all cursor-default">
                      {skill}
                    </span>
                  ))
                ) : (
                  <span className="text-[11px] font-medium text-slate-300 tracking-wide italic">No skills listed</span>
                )}
              </div>

              {candidate.summary && (
                <div className="pt-4 space-y-2">
                  <h4 className="text-[12px] font-medium text-slate-900 tracking-wide border-b border-slate-50 pb-2">Professional Summary</h4>
                  <p className="text-[13px] font-medium text-slate-500 leading-relaxed italic">{candidate.summary}</p>
                </div>
              )}
           </div>

           <div className="space-y-6">
              <h4 className="text-[12px] font-medium text-slate-900 tracking-wide border-b border-slate-50 pb-2">Contact Channels</h4>
              <div className="space-y-4">
                 <div className="flex items-center gap-4 group">
                    <div className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center text-slate-400 group-hover:text-brand group-hover:bg-blue-50 transition-all">
                       <Mail className="w-4 h-4" />
                    </div>
                    <span className="text-[13px] font-medium text-slate-700">{candidate.email}</span>
                 </div>
                 {candidate.phone && (
                   <div className="flex items-center gap-4 group">
                      <div className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center text-slate-400 group-hover:text-brand group-hover:bg-blue-50 transition-all">
                         <Phone className="w-4 h-4" />
                      </div>
                      <span className="text-[13px] font-medium text-slate-700">{candidate.phone}</span>
                   </div>
                 )}
                 <div className="flex items-center gap-4 group">
                    <div className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center text-slate-400 group-hover:text-brand group-hover:bg-blue-50 transition-all">
                       <LinkIcon className="w-4 h-4" />
                    </div>
                    <span className="text-[13px] font-medium text-slate-700">linkedin.com/in/{candidate.name.toLowerCase().replace(' ', '')}</span>
                 </div>
              </div>
           </div>
        </div>

        {/* Bottom Actions */}
        <div className="p-10 pt-0 flex items-center gap-4">
           {candidate.resumeText ? (
             <button className="flex-1 py-4 bg-[#0649b5] text-white rounded-xl font-medium text-[12px] tracking-wide flex items-center justify-center gap-2 hover:shadow-sm hover:shadow-blue-900/20 active:scale-95 transition-all">
                <Download className="w-4 h-4" />
                Download Extracted Resume
             </button>
           ) : (
             <div className="flex-1 py-4 bg-slate-50 text-slate-300 rounded-xl font-medium text-[11px] tracking-wide text-center border border-slate-100 italic">
                No Resume Document Attached
             </div>
           )}
           <button
             onClick={onClose}
             className="px-10 py-4 bg-white text-slate-400 border border-slate-100 rounded-xl font-medium text-[12px] tracking-wide hover:bg-slate-50 transition-all"
           >
              Close Profile
           </button>
        </div>
      </div>
    </Modal>
  );
}
