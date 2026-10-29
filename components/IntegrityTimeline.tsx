'use client';

import { Circle, AlertTriangle, Play, CheckCircle2 } from 'lucide-react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

interface Event {
  event: string;
  timestamp: string;
}

interface IntegrityTimelineProps {
  events: Event[];
}

export default function IntegrityTimeline({ events }: IntegrityTimelineProps) {
  return (
    <div className="space-y-4">
      <h3 className="text-lg font-medium text-slate-900 mb-6">Security Timeline</h3>
      <div className="relative pl-8 space-y-8 before:absolute before:left-3.5 before:top-2 before:bottom-2 before:w-px before:bg-slate-100">
        {events.map((e, i) => {
          const isSecurity = e.event.toLowerCase().includes('switch') || e.event.toLowerCase().includes('lost');
          const isStart = e.event.toLowerCase() === 'started';
          const isEnd = e.event.toLowerCase() === 'submitted';

          return (
            <div key={i} className="relative">
              <div className={cn(
                "absolute -left-8 top-1.5 w-7 h-7 rounded-full border-4 border-white flex items-center justify-center z-10",
                isSecurity ? "bg-red-500 text-white" :
                isStart ? "bg-blue-500 text-white" :
                isEnd ? "bg-emerald-500 text-white" : "bg-slate-200 text-white"
              )}>
                {isSecurity && <AlertTriangle className="w-3 h-3" />}
                {isStart && <Play className="w-3 h-3 fill-white ml-0.5" />}
                {isEnd && <CheckCircle2 className="w-3 h-3" />}
                {!isSecurity && !isStart && !isEnd && <Circle className="w-2 h-2 fill-white" />}
              </div>

              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div>
                  <h4 className={cn("text-sm font-medium", isSecurity ? "text-red-600" : "text-slate-900")}>
                    {e.event}
                  </h4>
                  {isSecurity && <p className="text-[10px] font-medium text-red-400">POSSIBLE INTEGRITY VIOLATION</p>}
                </div>
                <span className="text-xs font-medium text-slate-400 font-mono italic">
                  {e.timestamp.split('T')[1].substring(0, 5)}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
