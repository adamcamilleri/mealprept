import { NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase/server';

export async function GET() {
  try {
    const supabase = createServerSupabaseClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ authenticated: false, isPro: false });
    }

    const { data: subscription } = await supabase
      .from('subscriptions')
      .select('plan_type')
      .eq('user_id', user.id)
      .single();

    return NextResponse.json({
      authenticated: true,
      isPro: subscription?.plan_type === 'pro',
    });
  } catch {
    return NextResponse.json({ authenticated: false, isPro: false });
  }
}
