'use client';

import React from 'react';
import Modal from './Modal';
import {
  MapPin,
  Briefcase,
  Users,
  Calendar,
  DollarSign,
  Clock,
  ChevronRight
} from 'lucide-react';

interface JobViewModalProps {
  isOpen: boolean;
  onClose: () => void;
  job: any;
}

export default function JobViewModal({ isOpen, onClose, job }: JobViewModalProps) {
  if (!job) return null;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Job Details" width="max-w-2xl">
      <div className="p-8 space-y-8 font-sans">
        {/* Header Info */}
        <div className="flex items-start justify-between">
          <div className="space-y-2">
            <h2 className="text-3xl font-medium text-slate-900 tracking-tight">{job.title}</h2>
            <div className="flex items-center gap-4 text-slate-400">
               <div className="flex items-center gap-1.5 text-[11px] font-medium tracking-wide">
                  <Briefcase className="w-3.5 h-3.5" />
                  {job.department}
               </div>
               <div className="flex items-center gap-1.5 text-[11px] font-medium tracking-wide">
                  <MapPin className="w-3.5 h-3.5" />
                  {job.location}
               </div>
            </div>
          </div>
          <span className="px-4 py-1.5 bg-[#0649b5] text-white rounded-lg text-[10px] font-medium tracking-wide shadow-lg shadow-blue-900/10">
            {job.status}
          </span>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-3 gap-6 p-6 bg-slate-50 border border-slate-100 rounded-lg">
           <div className="space-y-1">
              <p className="text-[9px] font-medium text-slate-400 tracking-wide">Total Applicants</p>
              <div className="flex items-center gap-2">
                 <Users className="w-4 h-4 text-brand" />
                 <p className="text-lg font-medium text-slate-800">{job.applicantCount}</p>
              </div>
           </div>
            <div className="space-y-1">
              <p className="text-[9px] font-medium text-slate-400 tracking-wide">Posted On</p>
              <div className="flex items-center gap-2">
                 <Calendar className="w-4 h-4 text-brand" />
                 <p className="text-lg font-medium text-slate-800">
                   {(job.postedDate || job.createdAt || new Date().toISOString()).split('T')[0].split(' ')[0]}
                 </p>
              </div>
            </div>
           <div className="space-y-1">
              <p className="text-[9px] font-medium text-slate-400 tracking-wide">Est. Salary</p>
              <div className="flex items-center gap-2">
                 <DollarSign className="w-4 h-4 text-brand" />
                 <p className="text-lg font-medium text-slate-800">$120k - $150k</p>
              </div>
           </div>
        </div>

        {/* Description */}
        <div className="space-y-4">
           <h4 className="text-[12px] font-medium text-slate-900 tracking-wide">About the Role</h4>
           <div className="text-[13px] leading-relaxed text-slate-500 font-medium whitespace-pre-wrap">
             {job.description || "No description provided for this role."}
           </div>
        </div>

        {/* Action Bar */}
        <div className="pt-4 flex items-center gap-4">
           {typeof window !== 'undefined' && window.location.pathname.includes('/recruiter') ? (
             <button
               onClick={() => {
                 onClose();
                 window.location.href = `/recruiter/jobs/${job._id}`;
               }}
               className="flex-1 py-4 bg-[#0649b5] text-white rounded-xl font-medium text-[12px] tracking-wide hover:shadow-sm hover:shadow-blue-900/20 transition-all flex items-center justify-center gap-2 group"
             >
                View Management Portal
                <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
             </button>
           ) : (
             <div className="flex-1" />
           )}
           <button
             onClick={onClose}
             className="px-8 py-4 bg-slate-100 text-slate-500 rounded-xl font-medium text-[12px] tracking-wide hover:bg-slate-200 transition-all"
           >
              Close
           </button>
        </div>
      </div>
    </Modal>
  );
}
