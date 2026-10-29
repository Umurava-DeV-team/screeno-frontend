'use client';

import { useState, useRef, useEffect } from 'react';
import { ChevronDown } from 'lucide-react';
import { createPortal } from 'react-dom';

const OPTIONS = ['Junior', 'Mid-Level', 'Senior'];

interface ExperienceSelectProps {
  value: string;
  onChange: (val: string) => void;
  required?: boolean;
}

export default function ExperienceSelect({ value, onChange, required }: ExperienceSelectProps) {
  const [open, setOpen] = useState(false);
  const [dropdownStyle, setDropdownStyle] = useState<React.CSSProperties>({});
  const buttonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (buttonRef.current && !buttonRef.current.closest('[data-experience-select]')?.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const handleOpen = () => {
    if (buttonRef.current) {
      const rect = buttonRef.current.getBoundingClientRect();
      setDropdownStyle({
        position: 'fixed',
        top: rect.bottom + 4,
        left: rect.left,
        width: rect.width,
        zIndex: 9999,
      });
    }
    setOpen((o) => !o);
  };

  return (
    <div data-experience-select="true" className="relative">
      <button
        ref={buttonRef}
        type="button"
        onClick={handleOpen}
        className="w-full px-4 py-3 bg-white border border-slate-300 rounded-lg text-sm font-medium focus:outline-none focus:ring-1 focus:ring-blue-500/50 flex items-center justify-between text-left"
      >
        <span className={value ? 'text-slate-800' : 'text-slate-400'}>
          {value || 'Select experience level'}
        </span>
        <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform duration-200 ${open ? 'rotate-180' : ''}`} />
      </button>

      {/* hidden input so form validation works */}
      <input
        type="text"
        name="experienceLevel"
        value={value}
    readOnly
        required={required}
        className="sr-only"
        tabIndex={-1}
      />

      {open && typeof window !== 'undefined' && createPortal(
        <ul
          style={dropdownStyle}
          className="bg-white border border-slate-200 rounded-lg shadow-sm overflow-hidden"
        >
          {OPTIONS.map((opt) => (
            <li
              key={opt}
              onMouseDown={(e) => {
                e.preventDefault();
                onChange(opt);
                setOpen(false);
              }}
              className={`px-4 py-3 text-sm font-medium cursor-pointer transition-colors
                ${value === opt
                  ? 'bg-[#0649b5] text-white'
                  : 'text-slate-700 hover:bg-slate-50'
                }`}
            >
              {opt}
            </li>
          ))}
        </ul>,
        document.body
      )}
    </div>
  );
}
