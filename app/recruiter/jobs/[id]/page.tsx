'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import {
  ChevronLeft,
  MapPin,
  Briefcase,
  Users,
  Calendar,
  Brain,
  FileText,
  CheckCircle2,
  Clock,
  MoreVertical,
  Plus,
  Loader2
} from 'lucide-react';
import Link from 'next/link';
import toast from 'react-hot-toast';
import { useAppDispatch, useAppSelector } from '@/lib/store/hooks';
import { fetchJobs } from '@/lib/store/features/jobsSlice';
import { fetchMyApplications } from '@/lib/store/features/applicationSlice';
import { createAssessmentDraft } from '@/lib/store/features/screeningSlice';
import DataTable, { Column } from '@/components/DataTable';
import { apiFetch } from '@/lib/api';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export default function JobDetailsPage() {
  const { id } = useParams();
  const router = useRouter();
  const dispatch = useAppDispatch();
  const [activeTab, setActiveTab] = useState<'Overview' | 'Applicants'>('Overview');

  const { jobs, loading: jobsLoading } = useAppSelector(s => s.jobs);
  const job = jobs.find(j => j._id === id);

  const [applications, setApplications] = useState<any[]>([]);
  const [appsLoading, setAppsLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  const filteredApplicants = applications.filter(app => {
    if (!searchTerm) return true;
    const q = searchTerm.toLowerCase();
    return (
      app.candidate?.name?.toLowerCase().includes(q) ||
      app.candidate?.email?.toLowerCase().includes(q) ||
      app.status?.toLowerCase().includes(q)
    );
  });

  useEffect(() => {
    dispatch(fetchJobs());

    const loadData = async () => {
      setAppsLoading(true);
      try {
        const apps = await apiFetch<any[]>(`/applications/job/${id}`);
        setApplications(apps);
      } catch (err) {
        console.error(err);
      } finally {
        setAppsLoading(false);
      }
    };
    if (id) loadData();
  }, [dispatch, id]);

  const applicantColumns: Column<any>[] = [
    {
      header: 'Name',
      accessor: (app: any) => (
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-indigo-100 flex items-center justify-center text-ink font-medium">
            {app.candidate?.name?.charAt(0) || 'U'}
          </div>
          <div>
            <p className="font-medium text-slate-900 leading-none">{app.candidate?.name || 'Unknown User'}</p>
            <p className="text-[10px] font-medium text-slate-400 tracking-tight mt-1">{app.candidate?.email || ''}</p>
          </div>
        </div>
      )
    },
    {
      header: 'Applied Date',
      accessor: (app: any) => {
        const date = app.appliedAt || app.createdAt;
        return (
          <span className="text-[11px] font-medium text-slate-500 tracking-wide">
            {date ? new Date(date).toLocaleDateString() : 'N/A'}
          </span>
        );
      }
    },
    {
      header: 'Status',
      accessor: (app: any) => (
        <div className={cn(
          "px-3 py-1 rounded-md text-[9px] font-semibold tracking-wide border w-fit",
          app.status === 'Applied' || app.status === 'pending' ? "bg-blue-50 text-brand border-blue-100" : "bg-emerald-50 text-emerald-600 border-emerald-100"
        )}>
          {app.status}
        </div>
      )
    }
  ];

  if (jobsLoading || !job) {
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <Loader2 className="w-10 h-10 animate-spin text-ink" />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col gap-6">
        <div className="flex items-center gap-4">
          <Link href="/recruiter/jobs" className="p-2 hover:bg-slate-100 rounded-lg transition-colors">
            <ChevronLeft className="w-5 h-5 text-slate-500" />
          </Link>
          <div className="text-sm font-medium text-slate-500">
            Jobs / <span className="text-slate-900">{job.title}</span>
          </div>
        </div>

        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <h1 className="text-4xl font-medium text-slate-900 tracking-tight">{job.title}</h1>
              <span className="px-3 py-1 rounded-full bg-emerald-50 text-emerald-600 text-[10px] font-semibold tracking-wide border border-emerald-100">ACTIVE</span>
            </div>
            <div className="flex flex-wrap gap-6 text-slate-400 font-medium tracking-tight text-[11px]">
              <div className="flex items-center gap-2"><Briefcase className="w-4 h-4" /> {job.department}</div>
              <div className="flex items-center gap-2"><MapPin className="w-4 h-4" /> {job.location}</div>
              <div className="flex items-center gap-2"><Clock className="w-4 h-4" /> Posted {new Date(job.createdAt || '').toLocaleDateString()}</div>
              <div className="flex items-center gap-2"><Users className="w-4 h-4" /> {applications.length} Applicants</div>
            </div>
          </div>
          <div className="flex gap-3">
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-slate-200">
        {(['Overview', 'Applicants'] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={cn(
              "px-8 py-4 text-[11px] font-semibold tracking-wide border-b-2 transition-all",
              activeTab === tab
                ? "border-[#0649b5] text-ink"
                : "border-transparent text-slate-400 hover:text-slate-900"
            )}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Content */}
      <div className="min-h-[400px]">
        {activeTab === 'Overview' && (
          <div className="grid lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-8">
            <div className="bg-white p-8 rounded-none border border-slate-100 shadow-sm">
              <h3 className="text-xl font-medium text-slate-900 mb-6">Job Description</h3>
              <div className="prose prose-slate max-w-none text-slate-600 leading-relaxed">
                <p>{job.description || "A detailed job description for this position is currently being finalized. Please refer to the primary job post for immediate details."}</p>
                <h4 className="text-slate-900 font-medium mt-8 mb-4">Key Responsibilities & Requirements:</h4>
                <p className="text-[13px] text-slate-400 italic font-medium tracking-wide bg-slate-50 p-4 rounded-none border border-slate-100">
                  Detailed responsibilities haven't been provided for this specific role yet.
                </p>
              </div>
            </div>
            </div>
            <div className="space-y-8">
              <div className="bg-white p-8 rounded-none border border-slate-100 shadow-sm">
                <h3 className="text-[11px] font-semibold text-slate-900 mb-6 tracking-wide">Required Skills</h3>
                <div className="flex flex-wrap gap-2">
                  {(job.description || '').toLowerCase().includes('react') && (
                    <span className="px-3 py-1.5 bg-slate-50 text-slate-700 rounded-none text-[10px] font-medium border border-slate-100 tracking-wide">React.js</span>
                  )}
                  {(job.description || '').toLowerCase().includes('node') && (
                    <span className="px-3 py-1.5 bg-slate-50 text-slate-700 rounded-none text-[10px] font-medium border border-slate-100 tracking-wide">Node.js</span>
                  )}
                  <span className="px-3 py-1.5 bg-slate-50 text-slate-700 rounded-none text-[10px] font-medium border border-slate-100 tracking-wide">Technical Design</span>
                </div>
                <h3 className="text-[11px] font-semibold text-slate-900 mb-4 mt-8 tracking-wide">Compensation</h3>
                <div className="p-6 bg-slate-50 rounded-none border border-slate-100">
                  <p className="text-[9px] text-slate-400 font-medium tracking-wide mb-1">Budget Description</p>
                  <p className="text-2xl font-semibold text-slate-900 tracking-tight">
                    {job.salaryRange}
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'Applicants' && (
          <div className="bg-white border border-slate-100 rounded-none p-1 shadow-sm overflow-hidden">
             <DataTable
                columns={applicantColumns}
                data={applications}
                searchPlaceholder="Filter applicants by name or email..."
                emptyState={{
                  title: "No applicants yet",
                  description: "This job hasn't received any applications yet. Applications will appear here as soon as talents apply.",
                  icon: <Users className="w-8 h-8 text-slate-200" />
                }}
             />
          </div>
        )}
      </div>
    </div>
  );
}
