'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import PlanView from '@/components/plan/PlanView';
import { MealPlan, TasteProfile } from '@/lib/types';

interface SavedPlan {
  id: number;
  plan: MealPlan;
  tasteProfile: TasteProfile;
  createdAt: string;
}

export default function PrepDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [savedPlan, setSavedPlan] = useState<SavedPlan | null>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    try {
      const raw = localStorage.getItem('mealprept-plans');
      if (!raw) {
        router.push('/preps');
        return;
      }
      const plans: SavedPlan[] = JSON.parse(raw);
      const found = plans.find((p) => String(p.id) === String(params.id));
      if (!found) {
        router.push('/preps');
        return;
      }
      setSavedPlan(found);
    } catch {
      router.push('/preps');
    }
  }, [params.id, router]);

  if (!mounted || !savedPlan) {
    return (
      <div className="min-h-screen bg-cream">
        <div className="max-w-3xl mx-auto px-4 py-12">
          <div className="animate-pulse space-y-4">
            <div className="h-8 bg-warmgray-200 rounded w-48" />
            <div className="h-64 bg-warmgray-100 rounded-xl" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-cream">
      <div className="max-w-3xl mx-auto px-4 py-8">
        {/* Navigation */}
        <div className="flex items-center gap-4 mb-6">
          <Link
            href="/preps"
            className="inline-flex items-center gap-1.5 text-sm text-warmgray-500 hover:text-warmgray-800 transition-colors"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
            </svg>
            Back to My Preps
          </Link>
        </div>

        <PlanView
          plan={{
            planName: savedPlan.plan.planName,
            recipes: savedPlan.plan.recipes,
            groceryList: savedPlan.plan.groceryList,
            prepOrder: savedPlan.plan.prepOrder,
          }}
          profile={savedPlan.tasteProfile}
          isPro={false}
        />
      </div>
    </div>
  );
}
