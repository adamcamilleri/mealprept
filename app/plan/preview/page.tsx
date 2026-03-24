'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import PlanView from '@/components/plan/PlanView';
import Button from '@/components/ui/Button';
import { MealPlan, TasteProfile } from '@/lib/types';

export default function PreviewPage() {
  const router = useRouter();
  const [plan, setPlan] = useState<MealPlan | null>(null);
  const [profile, setProfile] = useState<TasteProfile | undefined>();

  useEffect(() => {
    const planData = sessionStorage.getItem('generatedPlan');
    const profileData = sessionStorage.getItem('tasteProfile');

    if (!planData) {
      router.push('/');
      return;
    }

    const parsed = JSON.parse(planData);
    setPlan({
      planName: parsed.planName,
      recipes: parsed.recipes,
      groceryList: parsed.groceryList,
      prepOrder: parsed.prepOrder,
    });

    if (profileData) {
      setProfile(JSON.parse(profileData));
    }
  }, [router]);

  if (!plan) {
    return null;
  }

  return (
    <div className="min-h-screen bg-cream">
      <div className="max-w-3xl mx-auto px-4 py-8">
        {/* Navigation */}
        <div className="flex items-center gap-4 mb-6">
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 text-sm text-warmgray-500 hover:text-warmgray-800 transition-colors"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
            </svg>
            Back to quiz
          </Link>
        </div>

        <PlanView plan={plan} profile={profile} isPro={false} />

        {/* Post-plan actions */}
        <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link href="/preps">
            <Button variant="secondary">View My Preps</Button>
          </Link>
          <Link href="/">
            <Button variant="ghost">Generate another plan</Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
