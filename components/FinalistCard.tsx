'use client';

import { TrendingUp, UserCheck, Trophy } from 'lucide-react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

interface FinalistCardProps {
  rank: 1 | 2 | 3;
  name: string;
  score: number;
  integrity: 'clean' | 'tab-switch';
}

export default function FinalistCard({ rank, name, score, integrity }: FinalistCardProps) {
  const rankColors = {
    1: 'bg-amber-100 text-amber-700 border-amber-200',
    2: 'bg-slate-100 text-slate-700 border-slate-200',
    3: 'bg-orange-100 text-orange-700 border-orange-200'
  } as const;

  return (
    <div className="bg-white rounded-lg border border-slate-100 p-6 flex flex-col items-center text-center shadow-sm hover:shadow-sm transition-all h-full">
      <div className={cn(
        "w-12 h-12 rounded-lg flex items-center justify-center font-medium text-lg mb-4 border-2 shadow-sm",
        rankColors[rank]
      )}>
        #{rank}
      </div>

      <div className="w-20 h-20 rounded-lg bg-slate-50 flex items-center justify-center text-slate-400 text-3xl font-medium mb-4">
        {name.charAt(0)}
      </div>

      <h4 className="text-xl font-medium text-slate-900 mb-1">{name}</h4>
      <p className="text-sm font-medium text-recruiter mb-4">Score: {score}%</p>

      <div className="flex flex-col gap-3 w-full mt-auto">
        <button className="w-full py-3 rounded-xl bg-indigo-50 text-recruiter font-medium text-xs hover:bg-indigo-100 transition-colors flex items-center justify-center gap-2">
           <Trophy className="w-4 h-4" />
           Mark as Finalist
        </button>
        <button className="w-full py-3 rounded-xl bg-slate-900 text-white font-medium text-xs hover:shadow-lg transition-all">
           Move to Interview
        </button>
      </div>
    </div>
  );
}
