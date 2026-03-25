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
      <h2 className="text-3xl sm:text-4xl font-extrabold text-warmgray-800 tracking-tight leading-[1.1] mb-3">
        {title}
      </h2>
      {subtitle && (
        <p className="text-warmgray-400 text-sm mb-8">{subtitle}</p>
      )}
      {!subtitle && <div className="mb-8" />}
      {children}
    </div>
  );
}
