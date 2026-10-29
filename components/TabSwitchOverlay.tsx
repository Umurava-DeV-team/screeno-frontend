'use client';

import { AlertTriangle, ChevronRight } from 'lucide-react';

interface TabSwitchOverlayProps {
  onDismiss: () => void;
}

export default function TabSwitchOverlay({ onDismiss }: TabSwitchOverlayProps) {
  return (
    <div className="fixed inset-0 z-100 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-6 text-center">
      <div className="max-w-md w-full bg-white border border-slate-200 rounded-md p-10 shadow-sm space-y-8 animate-in zoom-in duration-300">
        <div className="w-16 h-16 rounded-md bg-amber-50 flex items-center justify-center mx-auto">
           <AlertTriangle className="w-8 h-8 text-amber-600" />
        </div>

        <div className="space-y-3">
          <h2 className="text-xl font-medium text-slate-900">Security Alert</h2>
          <p className="text-sm text-slate-500 font-medium leading-relaxed">
            A tab or window switch was detected. This event has been recorded as a potential integrity violation. Multiple flags will result in session termination.
          </p>
        </div>

        <button
          onClick={onDismiss}
          className="w-full py-4 rounded-md bg-[#0649b5] text-white font-medium text-[13px] hover:bg-slate-950 transition-all flex items-center justify-center gap-2 group tracking-wide shadow-lg shadow-blue-900/10"
        >
          Resume Session
          <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
        </button>
      </div>
    </div>
  );
}
