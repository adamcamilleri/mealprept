import { createServerSupabaseClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import FridgePageClient from './FridgePageClient';

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
    .select('plan_type')
    .eq('user_id', user.id)
    .single();

  const isPro = subscription?.plan_type === 'pro';

  return <FridgePageClient isPro={isPro} />;
}
