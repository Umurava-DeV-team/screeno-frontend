'use client';
import CustomSelect from "@/components/CustomSelect";


import {
  Plus,
  Trash2,
  GripVertical,
  Brain,
  Type,
  Code as CodeIcon,
  Upload as UploadIcon,
  ChevronDown
} from 'lucide-react';
import { useState } from 'react';

interface Question {
  id: string;
  text: string;
  type: 'Multiple Choice' | 'Short Answer' | 'Code Editor' | 'File Upload';
  points: number;
  options?: string[];
  correctOption?: number;
}

export default function QuestionBuilder() {
  const [questions, setQuestions] = useState<Question[]>([
    { id: '1', text: 'Explain the difference between useMemo and useCallback.', type: 'Short Answer', points: 10 }
  ]);

  const addQuestion = () => {
    const newQ: Question = {
      id: Date.now().toString(),
      text: '',
      type: 'Multiple Choice',
      points: 10,
      options: ['', '', '', ''],
      correctOption: 0
    };
    setQuestions([...questions, newQ]);
  };

  const removeQuestion = (id: string) => {
    setQuestions(questions.filter(q => q.id !== id));
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-xl font-medium text-slate-900">Questions ({questions.length})</h3>
        <button
          onClick={addQuestion}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-indigo-50 text-recruiter font-medium text-sm hover:bg-indigo-100 transition-colors"
        >
          <Plus className="w-4 h-4" />
          Add Another Question
        </button>
      </div>

      <div className="space-y-6">
        {questions.map((q, i) => (
          <div key={q.id} className="bg-white rounded-lg border border-slate-100 shadow-sm p-6 group hover:border-indigo-100 transition-all">
            <div className="flex items-start gap-4">
              <div className="mt-2 text-slate-300 group-hover:text-slate-400 cursor-grab">
                <GripVertical className="w-5 h-5" />
              </div>

              <div className="grow space-y-6">
                {/* Q Header */}
                <div className="flex items-center justify-between gap-4">
                  <div className="flex items-center gap-2 px-3 py-1 bg-slate-50 border border-slate-200 rounded-lg">
                    <span className="text-xs font-medium text-slate-400">Q{i + 1}</span>
                    <div className="h-4 w-px bg-slate-200" />
                    <CustomSelect className="bg-transparent text-xs font-medium text-slate-600 focus:outline-none appearance-none pr-4">
                      <option>Multiple Choice</option>
                      <option>Short Answer</option>
                      <option>Code Editor</option>
                      <option>File Upload</option>
                    </CustomSelect>
                    <ChevronDown className="w-3 h-3 text-slate-400 -ml-3" />
                  </div>

                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2">
                       <span className="text-xs font-medium text-slate-400">POINTS</span>
                       <input type="number" defaultValue={q.points} className="w-12 px-2 py-1 bg-slate-50 border border-slate-200 rounded text-xs font-medium text-slate-600 focus:outline-none" />
                    </div>
                    <button onClick={() => removeQuestion(q.id)} className="p-2 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                <textarea
                  placeholder="Enter your question text here..."
                  className="w-full px-0 py-0 bg-transparent text-lg font-medium text-slate-900 focus:outline-none placeholder:text-slate-200 resize-none"
                  rows={2}
                  defaultValue={q.text}
                />

                {/* Multiple Choice Options */}
                {q.type === 'Multiple Choice' && (
                  <div className="grid md:grid-cols-2 gap-4 pt-4 border-t border-slate-50">
                    {['A', 'B', 'C', 'D'].map((letter, idx) => (
                      <div key={letter} className="flex items-center gap-3">
                        <input type="radio" name={`correct-${q.id}`} defaultChecked={idx === 0} className="w-4 h-4 text-recruiter focus:ring-recruiter" />
                        <div className="relative grow">
                          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[10px] font-medium text-slate-300">{letter}</span>
                          <input type="text" placeholder={`Option ${letter}`} className="w-full pl-8 pr-4 py-2 bg-slate-50 border border-slate-100 rounded-xl text-sm focus:outline-none focus:ring-1 focus:ring-recruiter/30" />
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="p-8 border-2 border-dashed border-indigo-100 rounded-lg flex flex-col items-center justify-center text-center bg-indigo-50/20">
         <div className="w-12 h-12 rounded-lg bg-indigo-100 flex items-center justify-center text-recruiter mb-4">
            <Brain className="w-6 h-6" />
         </div>
         <h4 className="text-lg font-medium text-slate-900 mb-2">Need help creating questions?</h4>
         <p className="text-sm text-slate-500 max-w-xs mb-6">Let our AI suggest relevant questions based on your job description and required skills.</p>
         <button className="px-6 py-2.5 rounded-xl bg-recruiter text-white font-medium text-sm hover:shadow-lg transition-all">
            Add from AI suggestion
         </button>
      </div>
    </div>
  );
}
