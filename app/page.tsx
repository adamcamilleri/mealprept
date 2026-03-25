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
    <div className="max-w-3xl mx-auto px-6 py-16 sm:py-24">
      {/* Hero */}
      <div className="text-center mb-16 animate-fadeIn">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-coral-50 text-coral-600 text-xs font-semibold tracking-wide mb-8">
          <span className="w-1.5 h-1.5 rounded-full bg-coral-500 animate-pulse" />
          Free to use &middot; No account needed
        </div>
        <h1 className="text-4xl sm:text-6xl font-extrabold text-warmgray-800 tracking-tight leading-[1.05] mb-6">
          What&apos;s for dinner?
          <br />
          <span className="text-warmgray-300">We got you.</span>
        </h1>
        <p className="text-base sm:text-lg text-warmgray-400 max-w-md mx-auto leading-relaxed">
          Tell us what you love eating. Get a week of meals
          you&apos;ll actually look forward to, plus one grocery list.
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
