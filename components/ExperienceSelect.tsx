'use client';

import CustomSelect from './CustomSelect';

interface ExperienceSelectProps {
  value: string;
  onChange: (value: string) => void;
  required?: boolean;
}

export default function ExperienceSelect({ value, onChange, required }: ExperienceSelectProps) {
  return (
    <CustomSelect
      name="experienceLevel"
      aria-label="Requirement level"
      value={value}
      onChange={(event) => onChange(event.target.value)}
      required={required}
      className="w-full"
    >
      <option value="" disabled>Select experience level</option>
      {['Junior', 'Mid-Level', 'Senior'].map((level) => <option key={level} value={level}>{level}</option>)}
    </CustomSelect>
  );
}
