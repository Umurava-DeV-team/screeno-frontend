'use client';

import React from 'react';
import Modal from './Modal';
import { useAppDispatch, useAppSelector } from '@/lib/store/hooks';
import { deleteJob } from '@/lib/store/features/jobsSlice';

interface DeleteJobModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  jobTitle: string;
  jobId: string;
}

export default function DeleteJobModal({ isOpen, onClose, onConfirm, jobTitle, jobId}: DeleteJobModalProps) {
  const dispatch = useAppDispatch();
  const { loading } = useAppSelector((s) => s.jobs);

  const handleConfirm = async () => {
    const result = await dispatch(deleteJob(jobId));
    if (deleteJob.fulfilled.match(result)) {
      onConfirm();
      onClose();
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Delete Posting" width="max-w-md">
      <div className="p-12 text-center font-sans space-y-10 bg-white">
        <p className="text-[18px] font-medium text-slate-900 leading-relaxed px-2">
          Are you sure you want to delete <span className="font-medium underline decoration-blue-500/30">&quot;{jobTitle}&quot;</span>? This action will remove all applicant associations permanently.
        </p>
        <div className="flex items-center justify-center gap-4 pt-4">
          <button onClick={handleConfirm} disabled={loading}
            className="min-w-[160px] py-4 bg-[#0649b5] text-white rounded-md font-medium text-[14px] transition-all hover:bg-slate-900 active:scale-95 disabled:opacity-60">
            {loading ? 'Deleting...' : 'Delete'}
          </button>
          <button onClick={onClose}
            className="min-w-[160px] py-4 bg-white text-slate-900 border border-slate-400 rounded-md font-medium text-[14px] transition-all hover:bg-slate-50 tracking-tight">
            Cancel
          </button>
        </div>
      </div>
    </Modal>
  );
}
