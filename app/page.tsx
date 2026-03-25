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
    <div className="max-w-3xl mx-auto px-4 py-24 sm:py-32">
      {/* Hero */}
      <div className="text-center mb-20 animate-fadeIn">
        <h1 className="text-5xl sm:text-7xl font-extrabold text-warmgray-800 tracking-tight leading-[1.05] mb-6">
          What&apos;s for dinner?
          <br />
          <span className="text-warmgray-300">We got you.</span>
        </h1>
        <p className="text-base sm:text-lg text-warmgray-500 max-w-lg mx-auto leading-relaxed mb-6">
          Tell us what your family loves eating. We&apos;ll build a week of
          recipes you&apos;ll actually look forward to, plus one grocery list.
        </p>
        <p className="text-xs text-warmgray-400 tracking-wide">
          500+ home cooks who stopped stressing about dinner
        </p>
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
