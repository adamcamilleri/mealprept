'use client';

import { ReactNode } from 'react';

interface QuizStepProps {
  title: string;
  subtitle?: string;
  children: ReactNode;
}

export default function QuizStep({ title, subtitle, children }: QuizStepProps) {
  return (
    <div className="animate-stepFade">
      <h2 className="text-2xl sm:text-3xl font-bold text-warmgray-800 tracking-tight mb-2">
        {title}
      </h2>
      {subtitle && (
        <p className="text-warmgray-400 text-sm mb-6">{subtitle}</p>
      )}
      {!subtitle && <div className="mb-6" />}
      {children}
    </div>
  );
}
