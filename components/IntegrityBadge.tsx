'use client';

import { ShieldCheck, AlertCircle, XCircle } from 'lucide-react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

interface IntegrityBadgeProps {
  type: 'clean' | 'tab-switch' | 'disqualified';
  count?: number;
}

export default function IntegrityBadge({ type, count }: IntegrityBadgeProps) {
  if (type === 'clean') {
    return (
      <div className="flex items-center gap-1.5 px-2.5 py-1 bg-emerald-50 text-emerald-600 rounded-lg text-[10px] font-medium border border-emerald-100">
        <ShieldCheck className="w-3.5 h-3.5" />
        SECURE SESSION
      </div>
    );
  }

  if (type === 'tab-switch') {
    return (
      <div className="flex items-center gap-1.5 px-2.5 py-1 bg-amber-50 text-amber-600 rounded-lg text-[10px] font-medium border border-amber-100">
        <AlertCircle className="w-3.5 h-3.5" />
        {count} TAB SWITCHES
      </div>
    );
  }

  return (
    <div className="flex items-center gap-1.5 px-2.5 py-1 bg-red-50 text-red-600 rounded-lg text-[10px] font-medium border border-red-100">
      <XCircle className="w-3.5 h-3.5" />
      DISQUALIFIED
    </div>
  );
}
