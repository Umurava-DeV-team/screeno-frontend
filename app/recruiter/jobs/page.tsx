'use client';

import { Plus, Brain } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useAppDispatch, useAppSelector } from '@/lib/store/hooks';
import { fetchJobs } from '@/lib/store/features/jobsSlice';
import type { ApiJob } from '@/lib/store/features/jobsSlice';
import DataTable, { Column } from '@/components/DataTable';
import JobViewModal from '@/components/modals/JobViewModal';
import DeleteJobModal from '@/components/modals/DeleteJobModal';
import CreateJobModal from '@/components/modals/CreateJobModal';
import EditJobModal from '@/components/modals/EditJobModal';
import AIScreeningModal from '@/components/modals/AIScreeningModal';
import CreateCandidateModal from '@/components/modals/CreateCandidateModal';
import toast from 'react-hot-toast';

function cn(...inputs: (string | boolean | undefined | null)[]) {
  return inputs.filter(Boolean).join(' ');
}

export default function RecruiterJobsPage() {
  const dispatch = useAppDispatch();
  const { jobs, loading, error } = useAppSelector((s) => s.jobs);

  const [selectedJob, setSelectedJob] = useState<ApiJob | null>(null);
  const [isViewOpen, setIsViewOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isScreeningOpen, setIsScreeningOpen] = useState(false);
  const [isCandidateCreateOpen, setIsCandidateCreateOpen] = useState(false);

  useEffect(() => {
    dispatch(fetchJobs());
  }, [dispatch]);

  useEffect(() => {
    if (error) {
      toast.error(error);
    }
  }, [error]);

  const handleView = (job: ApiJob) => { setSelectedJob(job); setIsViewOpen(true); };
  const handleEdit = (job: ApiJob) => { setSelectedJob(job); setIsEditOpen(true); };
  const handleDelete = (job: ApiJob) => { setSelectedJob(job); setIsDeleteOpen(true); };
  const handleTriggerScreening = (job: ApiJob) => { setSelectedJob(job); setIsScreeningOpen(true); };
  const handleAddCandidate = (job: ApiJob) => { setSelectedJob(job); setIsCandidateCreateOpen(true); };

  const tableColumns: Column<ApiJob>[] = [
    {
      header: 'Job Title',
      accessor: (job) => (
        <div>
          <p className="font-medium text-slate-800 mb-0.5">{job.title}</p>
          <p className="text-[10px] font-medium text-slate-400 tracking-tight">{job.department} · {job.location}</p>
        </div>
      ),
    },
    {
      header: 'Target',
      accessor: (job) => (
        <div className="flex items-center gap-2">
          <span className="font-semibold text-slate-800">{job.applicantsTarget}</span>
          <span className="text-[10px] font-medium text-slate-300">target</span>
        </div>
      ),
    },
    {
      header: 'Intelligence',
      accessor: (job) => (
        <div className="flex items-center gap-3">
          <button
            onClick={(e) => { e.stopPropagation(); handleTriggerScreening(job); }}
            className="inline-flex items-center gap-2 px-4 py-2 bg-blue-50 text-brand rounded-lg text-[10px] font-medium tracking-wide hover:bg-[#0649b5] hover:text-white transition-all shadow-sm group"
          >
            <Brain className="w-3.5 h-3.5 group-hover:animate-pulse" />
            AI Screen
          </button>
        </div>
      ),
    },
    {
      header: 'Level',
      accessor: (job) => (
        <span className="px-5 py-2 rounded-lg text-[10px] font-medium tracking-wide bg-slate-100 text-slate-600">
          {job.experienceLevel}
        </span>
      ),
    },
  ];

  return (
    <div className="space-y-8 font-sans bg-white min-h-screen pb-20 px-1">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1">
          <h2 className="text-2xl font-medium text-slate-900 tracking-tight">Job Listings</h2>
          <p className="text-[12px] font-medium text-slate-400 tracking-wide px-0.5">Management of active recruitment campaigns</p>
        </div>
        <button
          onClick={() => setIsCreateOpen(true)}
          className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-[#0649b5] text-white font-medium hover:shadow-lg hover:shadow-blue-900/30 transition-all text-[11px] tracking-wide active:scale-95"
        >
          <Plus className="w-3.5 h-3.5" />
          Create New Job
        </button>
      </div>



      {loading && jobs.length === 0 ? (
        <div className="text-center py-20 text-slate-400 font-medium text-sm tracking-wide">Loading jobs...</div>
      ) : (
        <div className="pt-6">
          <DataTable<ApiJob>
            columns={tableColumns}
            data={jobs}
            searchPlaceholder="Filter by job title or location..."
            onView={handleView}
            onEdit={handleEdit}
            onDelete={handleDelete}
            emptyState={{
              title: "No jobs posted yet",
              description: "Create your first job recruitment cycle to start receiving applications",
              actionLabel: "Create New Job",
              onAction: () => setIsCreateOpen(true)
            }}
          />
        </div>
      )}

      <JobViewModal
        isOpen={isViewOpen}
        onClose={() => setIsViewOpen(false)}
        job={jobs.find((j: any) => j._id === selectedJob?._id) || selectedJob}
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
        onSuccess={() => setIsCandidateCreateOpen(false)}
        jobId={selectedJob?._id}
      />
    </div>
  );
}
