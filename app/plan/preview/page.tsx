'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import PlanView from '@/components/plan/PlanView';
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
    <div className="px-4 py-8">
      <PlanView plan={plan} profile={profile} isPro={false} />
    </div>
  );
}
