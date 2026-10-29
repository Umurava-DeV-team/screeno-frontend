'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { ArrowLeft, Clock, FileText, Award, Send } from 'lucide-react';
import toast from 'react-hot-toast';
import { apiFetch } from '@/lib/api';

interface AssessmentQuestion {
  id: number;
  type: 'multiple_choice' | 'open_ended' | 'coding_problem' | 'real_world_problem';
  category: string;
  question: string;
  options?: string[];
  marks: number;
}

interface DraftAssessment {
  id: string;
  title: string;
  instructions: string;
  durationMinutes: number;
  questions: AssessmentQuestion[];
  totalQuestions: number;
  totalMarks: number;
  jobType: string;
}

export default function PreviewAssessmentPage() {
  const params = useParams();
  const router = useRouter();
  const [assessment, setAssessment] = useState<DraftAssessment | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadAssessment();
  }, [params.id]);

  const loadAssessment = async () => {
    try {
      const data = await apiFetch<DraftAssessment>(`/assessments/${params.id}`);
      setAssessment(data);
    } catch (error: any) {
      toast.error(error.message || 'Failed to load assessment');
      router.push('/recruiter/assessments/drafts');
    } finally {
      setLoading(false);
    }
  };

  if (loading || !assessment) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-recruiter border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-slate-600">Loading preview...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button
            onClick={() => router.push('/recruiter/assessments/drafts')}
            className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
          >
            <ArrowLeft className="w-5 h-5 text-slate-600" />
          </button>
          <div>
            <h1 className="text-3xl font-medium text-slate-900">Assessment Preview</h1>
            <p className="text-slate-500 mt-1">How candidates will see this assessment</p>
          </div>
        </div>
        <button
          onClick={() => router.push(`/recruiter/assessments/launch/${params.id}`)}
          className="px-6 py-3 bg-recruiter hover:opacity-90 text-white rounded-xl font-semibold transition-all flex items-center gap-2 shadow-lg shadow-blue-900/10"
        >
          <Send className="w-4 h-4" />
          Launch Assessment
        </button>
      </div>

      {/* Assessment Header */}
      <div className="bg-linear-to-br from-recruiter to-[#172554] rounded-lg p-8 text-white shadow-sm shadow-blue-900/10">
        <h2 className="text-2xl font-medium mb-4">{assessment.title}</h2>
        <div className="flex items-center gap-6 text-blue-100">
          <div className="flex items-center gap-2">
            <FileText className="w-5 h-5" />
            <span>{assessment.totalQuestions} Questions</span>
          </div>
          <div className="flex items-center gap-2">
            <Award className="w-5 h-5" />
            <span>{assessment.totalMarks} Marks</span>
          </div>
          <div className="flex items-center gap-2">
            <Clock className="w-5 h-5" />
            <span>{assessment.durationMinutes} Minutes</span>
          </div>
        </div>
      </div>

      {/* Instructions */}
      <div className="bg-white rounded-lg border border-slate-200 p-6">
        <h3 className="text-lg font-medium text-slate-900 mb-3">Instructions</h3>
        <p className="text-slate-600 whitespace-pre-wrap">{assessment.instructions}</p>
      </div>

      {/* Questions */}
      <div className="space-y-6">
        <h3 className="text-lg font-medium text-slate-900">Questions</h3>
        {assessment.questions.map((question, index) => (
          <div key={question.id} className="bg-white rounded-lg border border-slate-200 p-6">
            <div className="flex items-start gap-4 mb-4">
              <div className="flex items-center justify-center w-10 h-10 bg-blue-50 text-recruiter rounded-full font-medium">
                {index + 1}
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <span className="px-3 py-1 bg-slate-100 text-slate-700 rounded-full text-xs font-medium">
                    {question.type.replace(/_/g, ' ')}
                  </span>
                  <span className="text-sm text-slate-500">{question.marks} marks</span>
                </div>
                <p className="text-slate-900 font-medium">{question.question}</p>
              </div>
            </div>

            {question.type === 'multiple_choice' && question.options && (
              <div className="ml-14 space-y-2">
                {question.options.map((option, optIndex) => (
                  <div
                    key={optIndex}
                    className="flex items-center gap-3 p-3 border border-slate-200 rounded-lg hover:border-recruiter transition-colors cursor-pointer"
                  >
                    <div className="w-5 h-5 rounded-full border-2 border-slate-300"></div>
                    <span className="text-slate-700">{option}</span>
                  </div>
                ))}
              </div>
            )}

            {(question.type === 'open_ended' ||
              question.type === 'coding_problem' ||
              question.type === 'real_world_problem') && (
              <div className="ml-14">
                <textarea
                  placeholder="Candidate will type their answer here..."
                  rows={4}
                  disabled
                  className="w-full px-4 py-3 border border-slate-200 rounded-lg bg-slate-50 text-slate-500"
                />
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Footer Actions */}
      <div className="flex items-center justify-between pt-6 border-t border-slate-200">
        <button
          onClick={() => router.push(`/recruiter/assessments/edit/${params.id}`)}
          className="px-6 py-3 bg-white border border-slate-300 text-slate-700 rounded-xl font-semibold hover:bg-slate-50 transition-colors"
        >
          Edit Assessment
        </button>
        <button
          onClick={() => router.push(`/recruiter/assessments/launch/${params.id}`)}
          className="px-6 py-3 bg-recruiter hover:opacity-90 text-white rounded-xl font-semibold transition-all flex items-center gap-2 shadow-lg shadow-blue-900/10"
        >
          <Send className="w-4 h-4" />
          Launch to Candidates
        </button>
      </div>
    </div>
  );
}
