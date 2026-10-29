'use client';

import React from 'react';
import Modal from './Modal';
import { useAppDispatch, useAppSelector } from '@/lib/store/hooks';
import { deleteCandidate } from '@/lib/store/features/candidateSlice';

interface DeleteCandidateModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  candidateName: string;
  candidateId: string;
}

export default function DeleteCandidateModal({ isOpen, onClose, onConfirm, candidateName, candidateId }: DeleteCandidateModalProps) {
  const dispatch = useAppDispatch();
  const { loading } = useAppSelector((s) => s.candidate);

  const handleConfirm = async () => {
    const result = await dispatch(deleteCandidate(candidateId));
    if (deleteCandidate.fulfilled.match(result)) {
      onConfirm();
      onClose();
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Remove Candidate" width="max-w-md">
      <div className="p-12 text-center font-sans space-y-10 bg-white">
        <div className="space-y-4">
          <p className="text-[18px] font-medium text-slate-900 leading-relaxed px-2">
            Are you sure you want to remove <span className="font-medium underline decoration-blue-500/30">&quot;{candidateName}&quot;</span> from the talent pool? All history will be lost.
          </p>
        </div>

        <div className="flex items-center justify-center gap-4 pt-4">
           <button
             onClick={handleConfirm}
             disabled={loading}
             className="min-w-[160px] py-4 bg-[#0649b5] text-white rounded-md font-medium text-[14px] transition-all hover:bg-slate-900 active:scale-95 disabled:opacity-60"
           >
              {loading ? 'Removing...' : 'Remove'}
           </button>
           <button
             onClick={onClose}
             className="min-w-[160px] py-4 bg-white text-slate-900 border border-slate-400 rounded-md font-medium text-[14px] transition-all hover:bg-slate-50 tracking-tight"
           >
              Cancel
           </button>
        </div>
      </div>
    </Modal>
  );
}
