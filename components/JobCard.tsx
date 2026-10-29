'use client';

import {
  Briefcase,
  MapPin,
  Users,
  Calendar,
  MoreHorizontal,
  ChevronRight
} from 'lucide-react';
import Link from 'next/link';

interface JobCardProps {
  id: string;
  title: string;
  department: string;
  location: string;
  applicantCount: number;
  postedDate: string;
  status: 'Active' | 'Closed' | 'Draft';
}

export default function JobCard({
  id,
  title,
  department,
  location,
  applicantCount,
  postedDate,
  status
}: JobCardProps) {
  return (
    <div className="bg-white rounded-lg border border-slate-100 p-6 hover:shadow-sm hover:shadow-slate-200/50 transition-all group">
      <div className="flex justify-between items-start mb-6">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-lg bg-indigo-50 flex items-center justify-center text-recruiter">
            <Briefcase className="w-6 h-6" />
          </div>
          <div>
            <span className={`px-2 py-0.5 rounded-full text-[10px] font-medium tracking-wider ${
              status === 'Active' ? 'bg-emerald-50 text-emerald-600' :
              status === 'Draft' ? 'bg-slate-100 text-slate-600' :
              'bg-red-50 text-red-600'
            }`}>
              {status}
            </span>
            <h3 className="text-xl font-medium text-slate-900 group-hover:text-recruiter transition-colors">{title}</h3>
          </div>
        </div>
        <button className="p-2 hover:bg-slate-50 rounded-lg text-slate-400">
          <MoreHorizontal className="w-5 h-5" />
        </button>
      </div>

      <div className="grid grid-cols-2 gap-4 mb-8">
        <div className="flex items-center gap-2 text-slate-500">
          <MapPin className="w-4 h-4" />
          <span className="text-sm font-medium">{location}</span>
        </div>
        <div className="flex items-center gap-2 text-slate-500">
          <Users className="w-4 h-4" />
          <span className="text-sm font-medium">{applicantCount} Applicants</span>
        </div>
        <div className="flex items-center gap-2 text-slate-500">
          <Calendar className="w-4 h-4" />
          <span className="text-sm font-medium">{postedDate}</span>
        </div>
      </div>

      <div className="flex items-center justify-between pt-6 border-t border-slate-50">
        <div className="flex -space-x-2">
          {[1, 2, 3].map((i) => (
            <div key={i} className="w-8 h-8 rounded-full bg-slate-200 border-2 border-white flex items-center justify-center text-[10px] font-medium text-slate-600">
              {String.fromCharCode(64 + i)}
            </div>
          ))}
          <div className="w-8 h-8 rounded-full bg-slate-100 border-2 border-white flex items-center justify-center text-[10px] font-medium text-slate-400">
            +{applicantCount - 3}
          </div>
        </div>

        <Link
          href={`/recruiter/jobs/${id}`}
          className="flex items-center gap-1 text-recruiter font-medium text-sm"
        >
          View Details
          <ChevronRight className="w-4 h-4" />
        </Link>
      </div>
    </div>
  );
}
