'use client';

import React, { useState, useRef } from 'react';
import Modal from './Modal';
import { Upload, X } from 'lucide-react';
import { useAppDispatch, useAppSelector } from '@/lib/store/hooks';
import { createCandidate } from '@/lib/store/features/candidateSlice';

interface CreateCandidateModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  jobId?: string;
}

export default function CreateCandidateModal({ isOpen, onClose, onSuccess, jobId }: CreateCandidateModalProps) {
  const dispatch = useAppDispatch();
  const { loading, error } = useAppSelector((s) => s.candidate);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [form, setForm] = useState({
    name: '',
    email: '',
    currentRole: '',
    location: '',
    phone: '',
    skills: '',
    experience: '',
    education: '',
    summary: '',
  });

  const [resume, setResume] = useState<File | null>(null);

  const set = (field: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    setForm((prev) => ({ ...prev, [field]: e.target.value }));

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setResume(e.target.files[0]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const formData = new FormData();
    Object.entries(form).forEach(([key, value]) => {
      formData.append(key, value);
    });
    if (resume) {
      formData.append('resume', resume);
    }
    if (jobId) {
      formData.append('jobId', jobId);
    }

    const result = await dispatch(createCandidate(formData));
    if (createCandidate.fulfilled.match(result)) {
      onSuccess();
      onClose();
      // Reset form
      setForm({
        name: '',
        email: '',
        currentRole: '',
        location: '',
        phone: '',
        skills: '',
        experience: '',
        education: '',
        summary: '',
      });
      setResume(null);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Manual Talent Intake" width="max-w-4xl">
      <form className="p-8 space-y-6 font-sans" onSubmit={handleSubmit}>
        {error && (
          <div className="px-4 py-3 rounded-xl bg-red-50 border border-red-200 text-sm font-medium text-red-600">
            {error}
          </div>
        )}

        <div className="grid grid-cols-2 gap-6">
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-slate-400 tracking-wide">Full Name *</label>
            <input
              type="text"
              required
              value={form.name}
              onChange={set('name')}
              placeholder="e.g. Jane Doe"
              className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl text-[13px] font-medium focus:ring-2 focus:ring-blue-600/5 focus:border-blue-600 outline-none transition-all"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-medium text-slate-400 tracking-wide">Email Address *</label>
            <input
              type="email"
              required
              value={form.email}
              onChange={set('email')}
              placeholder="jane@example.com"
              className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl text-[13px] font-medium focus:ring-2 focus:ring-blue-600/5 focus:border-blue-600 outline-none transition-all"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-medium text-slate-400 tracking-wide">Current Role *</label>
            <input
              type="text"
              required
              value={form.currentRole}
              onChange={set('currentRole')}
              placeholder="e.g. Senior Backend Engineer"
              className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl text-[13px] font-medium focus:ring-2 focus:ring-blue-600/5 focus:border-blue-600 outline-none transition-all"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-medium text-slate-400 tracking-wide">Location *</label>
            <input
              type="text"
              required
              value={form.location}
              onChange={set('location')}
              placeholder="e.g. Kigali, Rwanda"
              className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl text-[13px] font-medium focus:ring-2 focus:ring-blue-600/5 focus:border-blue-600 outline-none transition-all"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-medium text-slate-400 tracking-wide">Phone Number</label>
            <input
              type="tel"
              value={form.phone}
              onChange={set('phone')}
              placeholder="+250..."
              className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl text-[13px] font-medium focus:ring-2 focus:ring-blue-600/5 focus:border-blue-600 outline-none transition-all"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-medium text-slate-400 tracking-wide">Skills (comma separated)</label>
            <input
              type="text"
              value={form.skills}
              onChange={set('skills')}
              placeholder="React, Node.js, Python"
              className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl text-[13px] font-medium focus:ring-2 focus:ring-blue-600/5 focus:border-blue-600 outline-none transition-all"
            />
          </div>

          <div className="col-span-2 space-y-1.5">
            <label className="text-xs font-medium text-slate-400 tracking-wide">Summary / Professional Bio</label>
            <textarea
              value={form.summary}
              onChange={set('summary')}
              rows={3}
              placeholder="Briefly describe the candidate's background..."
              className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl text-[13px] font-medium focus:ring-2 focus:ring-blue-600/5 focus:border-blue-600 outline-none transition-all resize-none"
            />
          </div>

          <div className="col-span-2 space-y-3">
            <label className="text-xs font-medium text-slate-400 tracking-wide">Upload CV / Resume</label>
            <div
              onClick={() => fileInputRef.current?.click()}
              className="border-2 border-dashed border-slate-200 rounded-lg p-8 text-center space-y-3 hover:border-blue-600 hover:bg-blue-50/30 transition-all cursor-pointer group relative overflow-hidden"
            >
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileChange}
                accept=".pdf,.doc,.docx"
                className="hidden"
              />

              {resume ? (
                <div className="flex items-center justify-center gap-3">
                  <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center text-brand font-medium">
                    PDF
                  </div>
                  <div className="text-left">
                    <p className="text-[13px] font-medium text-slate-900 line-clamp-1">{resume.name}</p>
                    <p className="text-[11px] font-medium text-slate-400 tracking-wider">{(resume.size / 1024 / 1024).toFixed(2)} MB</p>
                  </div>
                  <button
                    type="button"
                    onClick={(e) => { e.stopPropagation(); setResume(null); }}
                    className="p-1 hover:bg-slate-100 rounded-full text-slate-400"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <>
                  <Upload className="w-8 h-8 text-slate-300 mx-auto group-hover:text-brand transition-colors" />
                  <div className="space-y-1">
                    <p className="text-[13px] font-medium text-slate-900">Drop resume here or click to browse</p>
                    <p className="text-[11px] font-medium text-slate-400 tracking-wide">Supported formats: PDF, DOCX (Max 10MB)</p>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>

        <div className="flex items-center justify-end gap-4 pt-4 border-t border-slate-100">
          <button
            type="button"
            onClick={onClose}
            className="px-8 py-3 rounded-xl text-[11px] font-medium tracking-wide text-slate-400 hover:bg-slate-50 transition-all"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading}
            className="px-10 py-3 bg-[#0649b5] text-white rounded-xl font-medium text-[11px] tracking-wide hover:shadow-lg hover:shadow-blue-900/30 transition-all disabled:opacity-60"
          >
            {loading ? 'Processing...' : 'Add Candidate'}
          </button>
        </div>
      </form>
    </Modal>
  );
}
