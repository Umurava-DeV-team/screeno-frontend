'use client';

import {
  Briefcase,
  Users,
  ShieldCheck,
  Target,
  Plus,
  Brain
} from 'lucide-react';
import { useEffect, useState } from 'react';
import { useAppDispatch, useAppSelector } from '@/lib/store/hooks';
import { fetchJobs } from '@/lib/store/features/jobsSlice';
import { fetchCandidates } from '@/lib/store/features/candidateSlice';
import { fetchScreeningHistory } from '@/lib/store/features/screeningSlice';

import type { ApiJob } from '@/lib/store/features/jobsSlice';
import MetricCard from '@/components/MetricCard';
import RecruitmentInsights from '@/components/RecruitmentInsights';
import DataTable, { Column } from '@/components/DataTable';
import JobViewModal from '@/components/modals/JobViewModal';
import DeleteJobModal from '@/components/modals/DeleteJobModal';
import CreateJobModal from '@/components/modals/CreateJobModal';
import EditJobModal from '@/components/modals/EditJobModal';
import AIScreeningModal from '@/components/modals/AIScreeningModal';
import CreateCandidateModal from '@/components/modals/CreateCandidateModal';


export default function RecruiterDashboard() {
  const dispatch = useAppDispatch();
  const { jobs, loading: jobsLoading } = useAppSelector((s) => s.jobs);
  const { candidates, loading: candidatesLoading } = useAppSelector((s) => s.candidate);

  const [selectedJob, setSelectedJob] = useState<ApiJob | null>(null);
  const [isViewOpen, setIsViewOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isScreeningOpen, setIsScreeningOpen] = useState(false);
  const [isCandidateCreateOpen, setIsCandidateCreateOpen] = useState(false);

  const { history, loading: screeningsLoading } = useAppSelector((s) => s.screening);


  useEffect(() => {
    dispatch(fetchJobs());
    dispatch(fetchCandidates());
    dispatch(fetchScreeningHistory('all'));
  }, [dispatch]);


  const candidateIds = new Set(candidates.map(person => person._id));
  const totalFinalistsCount = new Set(history.flatMap(session => session.shortlist.map(person => person.candidateId)).filter(id => candidateIds.has(id))).size;

  const metrics = [
    { label: 'Active Jobs', value: jobsLoading ? '…' : jobs.filter(job => job.status === 'active').length.toString(), icon: Briefcase, href: '/recruiter/jobs' },
    { label: 'Total Candidates', value: candidatesLoading ? '…' : candidates.length.toString(), icon: Users, href: '/recruiter/candidates' },
    { label: 'Screening Sessions', value: screeningsLoading ? '…' : history.length.toString(), icon: ShieldCheck, href: '/recruiter/screenings' },
    { label: 'Shortlisted Applicants', value: (candidatesLoading || screeningsLoading) ? '…' : totalFinalistsCount.toString(), icon: Target, href: '/recruiter/screenings' },
  ];

  const handleView = (job: ApiJob) => {
    setSelectedJob(job);
    setIsViewOpen(true);
  };

  const handleEdit = (job: ApiJob) => {
    setSelectedJob(job);
    setIsEditOpen(true);
  };

  const handleDelete = (job: ApiJob) => {
    setSelectedJob(job);
    setIsDeleteOpen(true);
  };

  const handleTriggerScreening = (job: ApiJob) => {
    setSelectedJob(job);
    setIsScreeningOpen(true);
  };

  const handleAddCandidate = (job: ApiJob) => {
    setSelectedJob(job);
    setIsCandidateCreateOpen(true);
  };

  const tableColumns: Column<ApiJob>[] = [
    {
      header: 'Job Title',
      accessor: (job: ApiJob) => (
        <div>
          <p className="font-medium text-slate-800 mb-0.5">{job.title}</p>
          <p className="text-[10px] font-medium text-slate-400 tracking-tight">{job.department} · {job.location}</p>
        </div>
      )
    },
    {
      header: 'Target',
      accessor: (job: ApiJob) => (
        <div className="flex items-center gap-2">
          <span className="font-semibold text-slate-800">{job.applicantsTarget}</span>
          <span className="text-[10px] font-medium text-slate-300">target</span>
        </div>
      )
    },
    {
      header: 'Applicant tools',
      accessor: (job: ApiJob) => (
        <div className="flex items-center gap-3">
          <button
            onClick={(e) => { e.stopPropagation(); handleTriggerScreening(job); }}
            className="inline-flex items-center gap-2 px-4 py-2 bg-blue-50 text-brand rounded-lg text-[10px] font-medium tracking-wide hover:bg-[#0649b5] hover:text-white transition-all shadow-sm group"
          >
            <Brain className="w-3.5 h-3.5 group-hover:animate-pulse" />
            AI Screen
          </button>
          <button
            type="button"
            aria-label={"Add applicant to " + job.title}
            onClick={(event) => { event.stopPropagation(); handleAddCandidate(job); }}
            className="inline-flex items-center gap-2 rounded border border-slate-200 px-3 py-2 text-[10px] font-medium text-slate-600 hover:border-brand hover:text-brand transition-colors"
          >
            <Users size={13} /> Add applicant
          </button>
        </div>
      )
    },
    {
      header: 'Level',
      accessor: (job: ApiJob) => (
        <span className="px-5 py-2 rounded-lg text-[10px] font-medium tracking-wide bg-slate-100 text-slate-600">
          {job.experienceLevel}
        </span>
      )
    }
  ];

  return (
    <div className="space-y-8 font-sans min-h-screen pb-20">
      {/* Welcome Header */}
      <section className="py-6 border-b border-slate-100 flex flex-col md:flex-row md:items-end justify-between gap-6">
        <h1 className="text-2xl lg:text-3xl font-semibold text-ink tracking-tight leading-none">
          Recruitment overview
        </h1>
        <button
          onClick={() => setIsCreateOpen(true)}
          className="h-fit px-8 py-4 rounded-xl bg-[#0649b5] text-white font-medium hover:shadow-sm hover:shadow-blue-900/20 transition-all text-[11px] tracking-wide active:scale-95 flex items-center gap-3"
        >
          <Plus className="w-5 h-5" />
          Create a job
        </button>
      </section>

      {/* Metrics Row */}
      <div className="relative">
        <div className="screeno-metric-rail">
          {metrics.map((metric, i) => (
            <MetricCard
              key={i}
              label={metric.label}
              value={metric.value}
              icon={metric.icon}
              href={metric.href}
            />
          ))}
        </div>
      </div>

      <RecruitmentInsights standalone={false} /><div className="pt-2">
        {jobsLoading && jobs.length === 0 ? (
          <div className="text-center py-20 text-slate-400 font-medium text-sm tracking-wide">Loading dashboard...</div>
        ) : (
          <DataTable<ApiJob>
            columns={tableColumns}
            data={jobs}
            searchPlaceholder="Search jobs by title or department..."
            onView={handleView}
            onEdit={handleEdit}
            onDelete={handleDelete}
          />
        )}
      </div>

      <JobViewModal
        isOpen={isViewOpen}
        onClose={() => setIsViewOpen(false)}
        job={jobs.find((j) => j._id === selectedJob?._id) || selectedJob}
      />

      <DeleteJobModal
        isOpen={isDeleteOpen}
        onClose={() => setIsDeleteOpen(false)}
        onConfirm={() => setIsDeleteOpen(false)}
        jobTitle={selectedJob?.title || ''}
        jobId={selectedJob?._id || ''}
      />
      <CreateJobModal isOpen={isCreateOpen} onClose={() => setIsCreateOpen(false)} onSuccess={() => setIsCreateOpen(false)} />
      <EditJobModal isOpen={isEditOpen} onClose={() => setIsEditOpen(false)} onSuccess={() => setIsEditOpen(false)} job={selectedJob} />
      <AIScreeningModal isOpen={isScreeningOpen} onClose={() => setIsScreeningOpen(false)} job={selectedJob} />
      <CreateCandidateModal
        isOpen={isCandidateCreateOpen}
        onClose={() => setIsCandidateCreateOpen(false)}
        onSuccess={() => {
          setIsCandidateCreateOpen(false);
          dispatch(fetchCandidates());
          dispatch(fetchJobs());
        }}
        jobId={selectedJob?._id}
      />
    </div>
  );
}

