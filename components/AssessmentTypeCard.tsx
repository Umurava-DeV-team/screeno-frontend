'use client';

import {
  Brain,
  MessageCircle,
  Code,
  Clipboard,
  CheckCircle2
} from 'lucide-react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

interface AssessmentTypeCardProps {
  type: 'Quiz' | 'Interview' | 'Coding' | 'Task';
  isSelected: boolean;
  onClick: () => void;
}

const config = {
  Quiz: {
    icon: Brain,
    title: 'Knowledge Quiz',
    desc: 'Multiple choice theory questions.',
    color: 'text-brand',
    bg: 'bg-blue-50',
    border: 'border-blue-100',
    selected: 'border-blue-900 ring-2 ring-blue-900/10'
  },
  Interview: {
    icon: MessageCircle,
    title: 'Interview',
    desc: 'Soft skills & video responses.',
    color: 'text-blue-800',
    bg: 'bg-slate-100',
    border: 'border-slate-200',
    selected: 'border-blue-900 ring-2 ring-blue-900/10'
  },
  Coding: {
    icon: Code,
    title: 'Coding Task',
    desc: 'Live editor & test case execution.',
    color: 'text-brand',
    bg: 'bg-blue-50',
    border: 'border-blue-100',
    selected: 'border-blue-900 ring-2 ring-blue-900/10'
  },
  Task: {
    icon: Clipboard,
    title: 'Project Task',
    desc: 'File uploads & documentation.',
    color: 'text-blue-800',
    bg: 'bg-slate-100',
    border: 'border-slate-200',
    selected: 'border-blue-900 ring-2 ring-blue-900/10'
  }
};

export default function AssessmentTypeCard({ type, isSelected, onClick }: AssessmentTypeCardProps) {
  const meta = config[type];
  const Icon = meta.icon;

  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "relative flex flex-col text-left p-6 rounded-lg border transition-all duration-300 group",
        isSelected
          ? cn("bg-white shadow-sm shadow-blue-900/5", meta.selected)
          : cn("bg-slate-50/50 border-slate-100 hover:border-blue-900/30 hover:bg-white")
      )}
    >
      <div className={cn(
        "w-12 h-12 rounded-xl flex items-center justify-center mb-6 shadow-sm border border-transparent transition-colors",
        isSelected ? "bg-brand text-white" : cn(meta.bg, meta.color)
      )}>
        <Icon className="w-5 h-5" strokeWidth={isSelected ? 2.5 : 2} />
      </div>

      <h4 className={cn(
        "text-lg font-medium mb-1.5 tracking-tight transition-colors",
        isSelected ? "text-brand" : "text-slate-800"
      )}>{meta.title}</h4>
      <p className="text-xs font-medium text-slate-400 tracking-wide leading-relaxed mb-4">{meta.desc}</p>

      {isSelected && (
        <div className="absolute top-6 right-6 text-brand">
          <CheckCircle2 className="w-6 h-6 fill-white" />
        </div>
      )}
    </button>
  );
}
