import { createServerSupabaseClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import FridgePageClient from './FridgePageClient';
import { hasProAccess } from '@/lib/subscription';

export default async function FridgePage() {
  const supabase = createServerSupabaseClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect('/?signin=true');
  }

  const { data: subscription } = await supabase
    .from('subscriptions')
    .select('plan_type, status, current_period_end')
    .eq('user_id', user.id)
    .single();

  const isPro = hasProAccess(subscription);

  return <FridgePageClient isPro={isPro} />;
}
