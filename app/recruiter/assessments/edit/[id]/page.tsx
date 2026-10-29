'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Save, Send, Plus, Trash2, GripVertical, ArrowLeft } from 'lucide-react';
import toast from 'react-hot-toast';
import { apiFetch } from '@/lib/api';

interface AssessmentQuestion {
  id: number;
  type: 'multiple_choice' | 'open_ended' | 'coding_problem' | 'real_world_problem';
  category: string;
  question: string;
  options?: string[];
  correctAnswer?: string;
  marks: number;
}

interface DraftAssessment {
  id: string;
  jobId: string;
  title: string;
  instructions: string;
  durationMinutes: number;
  timeLimitPerQuestion: number;
  status: string;
  questions: AssessmentQuestion[];
  jobType: string;
  totalQuestions: number;
  totalMarks: number;
}

export default function EditAssessmentPage() {
  const params = useParams();
  const router = useRouter();
  const [assessment, setAssessment] = useState<DraftAssessment | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

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

  const handleSaveDraft = async () => {
    if (!assessment) return;

    setSaving(true);
    try {
      await apiFetch(`/assessments/${assessment.id}`, {
        method: 'PATCH',
        body: JSON.stringify({
          title: assessment.title,
          instructions: assessment.instructions,
          durationMinutes: assessment.durationMinutes,
          timeLimitPerQuestion: assessment.timeLimitPerQuestion,
          questions: assessment.questions,
        }),
      });

      toast.success('Draft saved successfully');
    } catch (error: any) {
      toast.error(error.message || 'Failed to save draft');
    } finally {
      setSaving(false);
    }
  };

  const handleLaunch = () => {
    router.push(`/recruiter/assessments/launch/${assessment?.id}`);
  };

  const handleUpdateQuestion = async (questionId: number, field: string, value: any) => {
    if (!assessment) return;

    const updatedQuestions = assessment.questions.map((q) =>
      q.id === questionId ? { ...q, [field]: value } : q
    );

    setAssessment({ ...assessment, questions: updatedQuestions });
  };

  const handleUpdateOption = (questionId: number, optionIndex: number, value: string) => {
    if (!assessment) return;

    const updatedQuestions = assessment.questions.map((q) => {
      if (q.id === questionId && q.options) {
        const newOptions = [...q.options];
        newOptions[optionIndex] = value;
        return { ...q, options: newOptions };
      }
      return q;
    });

    setAssessment({ ...assessment, questions: updatedQuestions });
  };

  const handleDeleteQuestion = async (questionId: number) => {
    if (!assessment) return;
    if (!confirm('Delete this question?')) return;

    try {
      const updated = await apiFetch<DraftAssessment>(
        `/assessments/${assessment.id}/questions/${questionId}`,
        {
          method: 'DELETE',
        }
      );

      setAssessment(updated);
      toast.success('Question deleted');
    } catch (error: any) {
      toast.error(error.message || 'Failed to delete question');
    }
  };

  if (loading || !assessment) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-recruiter border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-slate-600">Loading assessment...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto space-y-8">
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
            <h1 className="text-3xl font-medium text-slate-900">Edit Assessment</h1>
            <p className="text-slate-500 mt-1">Review and modify questions before launching</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={handleSaveDraft}
            disabled={saving}
            className="px-6 py-3 bg-white border border-slate-300 text-slate-700 rounded-xl font-semibold hover:bg-slate-50 transition-colors flex items-center gap-2 disabled:opacity-50"
          >
            <Save className="w-4 h-4" />
            {saving ? 'Saving...' : 'Save Draft'}
          </button>
          <button
            onClick={handleLaunch}
            className="px-6 py-3 bg-recruiter hover:opacity-90 text-white rounded-xl font-semibold transition-all flex items-center gap-2 shadow-lg shadow-blue-900/10"
          >
            <Send className="w-4 h-4" />
            Launch Assessment
          </button>
        </div>
      </div>

      {/* Assessment Details */}
      <div className="bg-white rounded-lg border border-slate-200 p-6">
        <h2 className="text-lg font-medium text-slate-900 mb-4">Assessment Details</h2>
        <div className="grid grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">
              Assessment Title
            </label>
            <input
              type="text"
              value={assessment.title}
              onChange={(e) => setAssessment({ ...assessment, title: e.target.value })}
              className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">
              Duration (minutes)
            </label>
            <input
              type="number"
              value={assessment.durationMinutes}
              onChange={(e) =>
                setAssessment({ ...assessment, durationMinutes: parseInt(e.target.value) })
              }
              className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>
        <div className="mt-4">
          <label className="block text-sm font-semibold text-slate-700 mb-2">
            Instructions
          </label>
          <textarea
            value={assessment.instructions}
            onChange={(e) => setAssessment({ ...assessment, instructions: e.target.value })}
            rows={3}
            className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
      </div>

      {/* Questions List */}
      <div className="space-y-4">
        <h2 className="text-lg font-medium text-slate-900">Questions ({assessment.questions.length})</h2>
        {assessment.questions.map((question, index) => (
          <div key={question.id} className="bg-white rounded-lg border border-slate-200 p-6">
            <div className="flex items-start gap-4">
              <div className="flex items-center gap-2 text-slate-400">
                <GripVertical className="w-5 h-5" />
                <span className="font-medium text-lg">Q{index + 1}</span>
              </div>

              <div className="flex-1">
                <div className="flex items-center gap-2 mb-3">
                  <span className="px-3 py-1 bg-blue-50 text-recruiter rounded-full text-xs font-medium">
                    {question.type.replace(/_/g, ' ')}
                  </span>
                  <span className="text-sm text-slate-500">{question.marks} marks</span>
                </div>

                <textarea
                  value={question.question}
                  onChange={(e) => handleUpdateQuestion(question.id, 'question', e.target.value)}
                  rows={2}
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-recruiter focus:border-transparent mb-3"
                />

                {question.type === 'multiple_choice' && question.options && (
                  <div className="space-y-2">
                    {question.options.map((option, optIndex) => (
                      <div key={optIndex} className="flex items-center gap-2">
                        <input
                          type="radio"
                          checked={question.correctAnswer === option.charAt(0)}
                          onChange={() =>
                            handleUpdateQuestion(question.id, 'correctAnswer', option.charAt(0))
                          }
                          className="w-4 h-4"
                        />
                        <input
                          type="text"
                          value={option}
                          onChange={(e) => handleUpdateOption(question.id, optIndex, e.target.value)}
                          className="flex-1 px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-recruiter focus:border-transparent"
                        />
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <button
                onClick={() => handleDeleteQuestion(question.id)}
                className="p-2 hover:bg-red-50 rounded-lg transition-colors group"
              >
                <Trash2 className="w-5 h-5 text-red-600 group-hover:text-red-700" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
