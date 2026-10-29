'use client';

import { useState, useEffect } from 'react';
import { Clock } from 'lucide-react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

interface CountdownTimerProps {
  initialMinutes: number;
  onTimeUp: () => void;
}

export default function CountdownTimer({ initialMinutes, onTimeUp }: CountdownTimerProps) {
  const [secondsLeft, setSecondsLeft] = useState(initialMinutes * 60);

  useEffect(() => {
    if (secondsLeft <= 0) {
      onTimeUp();
      return;
    }

    const timer = setInterval(() => {
      setSecondsLeft((prev) => prev - 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [secondsLeft, onTimeUp]);

  const minutes = Math.floor(secondsLeft / 60);
  const seconds = secondsLeft % 60;
  const isCritical = secondsLeft <= 300; // 5 min
  const isWarning = secondsLeft <= 600 && !isCritical; // 10 min

  return (
    <div className={cn(
      "flex items-center gap-3 px-5 py-2 rounded-lg border transition-all duration-500",
      isCritical ? "bg-red-500 border-red-600 shadow-lg shadow-red-500/20" :
      isWarning ? "bg-amber-500 border-amber-600 shadow-lg shadow-amber-500/20" :
      "bg-slate-800 border-slate-700"
    )}>
      <Clock className={cn("w-5 h-5", isCritical || isWarning ? "text-white" : "text-teal-400")} />
      <span className={cn(
        "text-xl font-medium font-mono tracking-wider text-white",
      )}>
        {String(minutes).padStart(2, '0')}:{String(seconds).padStart(2, '0')}
      </span>
    </div>
  );
}
