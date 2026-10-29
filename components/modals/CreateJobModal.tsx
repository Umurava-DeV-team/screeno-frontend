'use client';

import React, { useEffect, useRef, useState } from 'react';
import Modal from './Modal';
import { Upload } from 'lucide-react';
import { useAppDispatch, useAppSelector } from '@/lib/store/hooks';
import { createJob } from '@/lib/store/features/jobsSlice';
import ExperienceSelect from '@/components/ExperienceSelect';
import toast from 'react-hot-toast';

interface CreateJobModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (job: any) => void;
}

const EMPTY = {
  title: '',
  company: '',
  department: '',
  applicantsTarget: '',
  location: '',
  salaryRange: '',
};

export default function CreateJobModal({isOpen, onClose, onSuccess }: CreateJobModalProps) {
  const dispatch = useAppDispatch();
  const { loading, error } = useAppSelector((s) => s.jobs);
  const fileRef = useRef<HTMLInputElement>(null);
  const [fileName, setFileName] = useState('');
  const [form, setForm] = useState(EMPTY);
  const [experienceLevel, setExperienceLevel] = useState('');

  const set = (field: string) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm((p) => ({ ...p, [field]: e.target.value }));

  useEffect(() => {
    if (error) {
      toast.error(error);
    }
  }, [error]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const fd = new FormData();
    fd.append('title', form.title);
    fd.append('company', form.company);
    fd.append('department', form.department);
    fd.append('experienceLevel', experienceLevel);
    fd.append('applicantsTarget', form.applicantsTarget);
    fd.append('location', form.location);
    fd.append('salaryRange', form.salaryRange);
    // pass filename as the URL string until backend supports file upload
    if (fileName) fd.append('descriptionFileUrl', fileName);

    const result = await dispatch(createJob(fd));
    if (createJob.fulfilled.match(result)) {
      onSuccess(result.payload);
      onClose();
      setForm(EMPTY);
      setExperienceLevel('');
      setFileName('');
    }
  };

  const inputCls =
    'w-full px-4 py-3 bg-white border border-slate-300 rounded-lg text-sm font-medium focus:outline-none focus:ring-1 focus:ring-blue-500/50 transition-all placeholder:text-slate-300';

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Configure New Job" width="max-w-3xl">
      <form className="p-10 space-y-10 font-sans" onSubmit={handleSubmit}>


        <div className="grid grid-cols-2 gap-x-10 gap-y-8">
          <div className="space-y-3">
            <label className="text-[14px] font-medium text-slate-900 tracking-tight">Job title *</label>
        <input type="text" placeholder="Enterthe job title" required value={form.title} onChange={set('title')} className={inputCls} />
          </div>

          <div className="space-y-3">
            <label className="text-[14px] font-medium text-slate-900 tracking-tight">Department *</label>
            <input type="text" placeholder="Enter the department" required value={form.department} onChange={set('department')} className={inputCls} />
          </div>

          <div className="space-y-3">
            <label className="text-[14px] font-medium text-slate-900 tracking-tight">Company *</label>
            <input type="text" placeholder="Enter the company name" required value={form.company} onChange={set('company')} className={inputCls} />
          </div>

          <div className="space-y-3">
            <label className="text-[14px] font-medium text-slate-900 tracking-tight">Requirement Level *</label>
          <ExperienceSelect value={experienceLevel} onChange={setExperienceLevel} required />
          </div>

          <div className="space-y-3">
            <label className="text-[14px] font-medium text-slate-900 tracking-tight">Applicants Target *</label>
            <input type="number" placeholder="Enter number of candidates" required value={form.applicantsTarget} onChange={set('applicantsTarget')} className={inputCls} />
          </div>

          <div className="space-y-3">
            <label className="text-[14px] font-medium text-slate-900 tracking-tight">Location *</label>
            <input type="text" placeholder="Enter job location" required value={form.location} onChange={set('location')} className={inputCls} />
          </div>

          <div className="space-y-3">
            <label className="text-[14px] font-medium text-slate-900 tracking-tight">Salary Range *</label>
            <input type="text" placeholder="Enter salary description" required value={form.salaryRange} onChange={set('salaryRange')} className={inputCls} />
          </div>
         <div className="col-span-2 space-y-4">
            <label className="text-[14px] font-medium text-slate-900 tracking-tight">Upload Job Description File *</label>
            <input
              ref={fileRef}
              type="file"
              accept=".pdf,.docx,.jpg,.png"
              className="hidden"
              onChange={(e) => setFileName(e.target.files?.[0]?.name || '')}
            />
            <div
              onClick={() => fileRef.current?.click()}
              className="border-2 border-dashed border-slate-300 rounded-xl p-12 text-center space-y-4 hover:border-blue-500 transition-colors cursor-pointer group"
            >
          <Upload className="w-10 h-10 text-slate-500 mx-auto group-hover:text-blue-500 transition-colors" />
              <div className="space-y-1">
                <p className="text-[15px] font-medium text-slate-900">{fileName || 'Upload a document'}</p>
                <p className="text-[13px] font-medium text-slate-400">Supported formats: Pdf, Docx, Jpg, PNG (Max 10MB)</p>
              </div>
              <button
                type="button"
                className="mt-4 px-10 py-2.5 bg-[#0649b5] text-white rounded-md text-[13px] font-medium"
              >
                Upload
</button>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-center gap-6 pt-6">
          <button
            type="submit"
            disabled={loading}
            className="min-w-[180px] py-4 bg-[#0649b5] text-white rounded-md font-medium text-[14px] transition-all hover:bg-slate-950 active:scale-95 disabled:opacity-60"
          >
            {loading ? 'Saving...' : 'Add Job'}
          </button>
          <button
            type="button"
            onClick={onClose}
            className="min-w-[180px] py-4 bg-white text-slate-900 border border-slate-400 rounded-md font-medium text-[14px] transition-all hover:bg-slate-50 tracking-tight"
          >
            Cancel
          </button>
        </div>
      </form>
    </Modal>
  );
}
