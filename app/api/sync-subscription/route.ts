import { NextResponse } from 'next/server';
import Stripe from 'stripe';
import { createClient } from '@supabase/supabase-js';
import { createServerSupabaseClient } from '@/lib/supabase/server';

export async function POST() {
  try {
    const supabase = createServerSupabaseClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { data: sub } = await supabase
      .from('subscriptions')
      .select('stripe_customer_id, stripe_subscription_id')
      .eq('user_id', user.id)
      .single();

    if (!sub?.stripe_subscription_id) {
      return NextResponse.json({ plan: 'free' });
    }

    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', {
      apiVersion: '2026-02-25.clover' as Stripe.LatestApiVersion,
    });
    const stripeSub = await stripe.subscriptions.retrieve(sub.stripe_subscription_id);

    // Access fields safely
    const subData = stripeSub as unknown as Record<string, unknown>;
    const cancelAtPeriodEnd = !!subData.cancel_at_period_end;
    const periodEndRaw = subData.current_period_end;
    const periodEnd = typeof periodEndRaw === 'number'
      ? new Date(periodEndRaw * 1000).toISOString()
      : null;

    const adminSupabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    if (stripeSub.status === 'active') {
      await adminSupabase
        .from('subscriptions')
        .update({
          plan_type: 'pro',
          status: cancelAtPeriodEnd ? 'canceled' : 'active',
          ...(periodEnd ? { current_period_end: periodEnd } : {}),
        })
        .eq('user_id', user.id);

      return NextResponse.json({
        plan: 'pro',
        cancelAtPeriodEnd,
        currentPeriodEnd: periodEnd,
      });
    } else {
      await adminSupabase
        .from('subscriptions')
        .update({
          plan_type: 'free',
          status: stripeSub.status === 'canceled' ? 'canceled' : 'past_due',
        })
        .eq('user_id', user.id);

      return NextResponse.json({ plan: 'free' });
    }
  } catch (error) {
    console.error('Sync subscription error:', error);
    const message = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json({ error: 'Sync failed', detail: message }, { status: 500 });
  }
}
