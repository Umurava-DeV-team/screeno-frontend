'use client';

import { XCircle, LogOut } from 'lucide-react';
import Link from 'next/link';

export default function DisqualificationScreen() {
  return (
    <div className="fixed inset-0 z-110 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-6 text-center">
      <div className="max-w-md w-full bg-white border border-slate-200 rounded-md p-10 lg:p-14 shadow-sm space-y-8 animate-in zoom-in duration-300">
        <div className="w-16 h-16 rounded-md bg-red-50 flex items-center justify-center mx-auto">
           <XCircle className="w-8 h-8 text-red-600" />
        </div>

        <div className="space-y-3">
          <h2 className="text-2xl font-medium text-slate-900 tracking-tight leading-none">Session Terminated</h2>
          <p className="text-sm text-slate-500 font-medium leading-relaxed">
            Due to excessive integrity violations (unauthorized tab switching), your assessment session has been automatically terminated by our security system.
          </p>
        </div>

        <Link
          href="/candidate/dashboard"
          className="w-full py-4 rounded-md bg-[#0649b5] text-white font-medium text-[13px] hover:bg-slate-950 transition-all flex items-center justify-center gap-2 group tracking-wide shadow-lg shadow-blue-900/10"
        >
          <LogOut className="w-4 h-4" />
          Return to Dashboard
        </Link>
        <p className="text-[10px] text-slate-400 font-medium tracking-wide leading-none">Your activity has been flagged for recruiter review.</p>
      </div>
    </div>
  );
}
