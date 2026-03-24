import { createServerSupabaseClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import PlansPageClient from './PlansPageClient';

export default async function PlansPage() {
  const supabase = createServerSupabaseClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect('/?signin=true');
  }

  const { data: plans } = await supabase
    .from('meal_plans')
    .select('id, plan_name, plan_data, created_at')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false });

  return <PlansPageClient plans={plans || []} />;
}
