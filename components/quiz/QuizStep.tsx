'use client';

import { ReactNode } from 'react';

interface QuizStepProps {
  title: string;
  subtitle?: string;
  children: ReactNode;
}

export default function QuizStep({ title, subtitle, children }: QuizStepProps) {
  return (
    <div className="animate-fadeIn">
      <h2 className="text-xl sm:text-2xl font-semibold text-warmgray-800 tracking-tight mb-1.5">
        {title}
      </h2>
      {subtitle && (
        <p className="text-warmgray-400 text-sm mb-5">{subtitle}</p>
      )}
      {!subtitle && <div className="mb-5" />}
      {children}
    </div>
  );
}
