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
      <h2 className="text-2xl font-semibold text-warmgray-800 mb-2">
        {title}
      </h2>
      {subtitle && (
        <p className="text-warmgray-500 mb-6">{subtitle}</p>
      )}
      {children}
    </div>
  );
}
