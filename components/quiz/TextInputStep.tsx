'use client';

import { useState } from 'react';

interface TextInputStepProps {
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
  skipLabel: string;
  onSkip: () => void;
}

export default function TextInputStep({
  value,
  onChange,
  placeholder,
  skipLabel,
  onSkip,
}: TextInputStepProps) {
  const [skipped, setSkipped] = useState(false);

  const handleSkip = () => {
    setSkipped(true);
    onChange('');
    onSkip();
  };

  return (
    <div className="space-y-4">
      <textarea
        value={value}
        onChange={(e) => {
          setSkipped(false);
          onChange(e.target.value);
        }}
        placeholder={placeholder}
        className="w-full p-4 rounded-xl border-2 border-warmgray-200 focus:border-coral-400 focus:outline-none text-warmgray-800 min-h-[120px] resize-none bg-white"
        rows={4}
      />
      <button
        onClick={handleSkip}
        className={`w-full p-4 rounded-xl border-2 text-left transition-all duration-200 flex items-center gap-3
          ${skipped ? 'border-coral-400 bg-coral-50' : 'border-warmgray-200 bg-white hover:border-warmgray-300'}`}
      >
        <span className="text-2xl">✨</span>
        <span className={`text-sm font-medium ${skipped ? 'text-coral-700' : 'text-warmgray-700'}`}>
          {skipLabel}
        </span>
      </button>
    </div>
  );
}
