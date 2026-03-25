import { createServerSupabaseClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import PlanPageClient from './PlanPageClient';
import { hasProAccess } from '@/lib/subscription';

interface PageProps {
  params: { id: string };
}

export default async function PlanPage({ params }: PageProps) {
  const supabase = createServerSupabaseClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect('/?signin=true');
  }

  const { data: plan } = await supabase
    .from('meal_plans')
    .select('*, taste_profiles(*)')
    .eq('id', params.id)
    .eq('user_id', user.id)
    .single();

  if (!plan) {
    redirect('/plans');
  }

  const { data: subscription } = await supabase
    .from('subscriptions')
    .select('plan_type, status, current_period_end')
    .eq('user_id', user.id)
    .single();

  const isPro = hasProAccess(subscription);

  const profile = plan.taste_profiles
    ? {
        cuisines: plan.taste_profiles.cuisines,
        proteins: plan.taste_profiles.proteins,
        effortLevel: plan.taste_profiles.effort_level,
        hardNos: plan.taste_profiles.hard_nos,
        prepDays: plan.taste_profiles.prep_days,
        servings: plan.taste_profiles.servings,
      }
    : undefined;

  return (
    <PlanPageClient
      plan={{
        id: plan.id,
        planName: plan.plan_data.planName,
        recipes: plan.plan_data.recipes,
        groceryList: plan.plan_data.groceryList,
        prepOrder: plan.plan_data.prepOrder,
      }}
      profile={profile}
      isPro={isPro}
    />
  );
}
