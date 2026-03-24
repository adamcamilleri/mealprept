'use client';

import PlanView from '@/components/plan/PlanView';
import { MealPlan, TasteProfile } from '@/lib/types';

interface PlanPageClientProps {
  plan: MealPlan;
  profile?: TasteProfile;
  isPro: boolean;
}

export default function PlanPageClient({
  plan,
  profile,
  isPro,
}: PlanPageClientProps) {
  return (
    <div className="px-4 py-8">
      <PlanView plan={plan} profile={profile} isPro={isPro} />
    </div>
  );
}
