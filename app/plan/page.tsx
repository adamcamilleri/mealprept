import { createServerSupabaseClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';

export default async function PlanRedirect() {
  const supabase = createServerSupabaseClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect('/?signin=true');
  }

  // Get the latest plan
  const { data: latestPlan } = await supabase
    .from('meal_plans')
    .select('id')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })
    .limit(1)
    .single();

  if (latestPlan) {
    redirect(`/plan/${latestPlan.id}`);
  }

  redirect('/');
}
