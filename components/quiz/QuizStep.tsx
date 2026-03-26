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
      <h2 className="text-3xl sm:text-5xl font-extrabold text-warmgray-800 tracking-tight leading-[1.08] mb-2">
        {title}
      </h2>
      {subtitle && (
        <p className="text-warmgray-400 text-sm mb-10">{subtitle}</p>
      )}
      {!subtitle && <div className="mb-10" />}
      {children}
    </div>
  );
}
