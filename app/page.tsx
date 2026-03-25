'use client';

import { useSearchParams } from 'next/navigation';
import { useState, useEffect, Suspense } from 'react';
import Quiz from '@/components/quiz/Quiz';
import AuthModal from '@/components/quiz/AuthModal';

function HomeContent() {
  const searchParams = useSearchParams();
  const [showAuth, setShowAuth] = useState(false);

  useEffect(() => {
    if (searchParams.get('signin') === 'true') {
      setShowAuth(true);
    }
  }, [searchParams]);

  return (
    <div className="max-w-3xl mx-auto px-4 py-16 sm:py-20">
      {/* Hero */}
      <div className="text-center mb-14 animate-fadeIn">
        <span className="inline-block px-3.5 py-1.5 rounded-full bg-coral-50 border border-coral-200/60 text-coral-600 text-xs font-semibold tracking-wide mb-5">
          Free to try &mdash; no signup needed
        </span>
        <h1 className="text-5xl sm:text-6xl font-extrabold text-warmgray-800 tracking-tight leading-[1.05] mb-5">
          What&apos;s for dinner?
          <br />
          <span className="text-gradient">We got you.</span>
        </h1>
        <p className="text-base sm:text-lg text-warmgray-500 max-w-lg mx-auto leading-relaxed mb-4">
          Tell us what your family loves eating. We&apos;ll build a week of
          recipes you&apos;ll actually look forward to, plus one grocery list.
        </p>
        <p className="text-sm text-warmgray-400 font-medium">
          Join 500+ home cooks who stopped stressing about dinner
        </p>

        {/* Down arrow */}
        <div className="mt-8 animate-bounce-subtle">
          <svg className="w-5 h-5 mx-auto text-warmgray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M19 14l-7 7m0 0l-7-7m7 7V3" />
          </svg>
        </div>
      </div>

      {/* Quiz */}
      <Quiz />

      {/* Auth modal - triggered by ?signin=true redirect */}
      {showAuth && (
        <AuthModal
          onClose={() => {
            setShowAuth(false);
            // Clean URL
            window.history.replaceState({}, '', '/');
          }}
          onSuccess={() => {
            setShowAuth(false);
            window.history.replaceState({}, '', '/');
            // Reload to pick up auth state everywhere
            window.location.reload();
          }}
        />
      )}
    </div>
  );
}

export default function Home() {
  return (
    <Suspense>
      <HomeContent />
    </Suspense>
  );
}
