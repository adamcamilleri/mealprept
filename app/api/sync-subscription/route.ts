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

    // Get the stored subscription record
    const { data: sub } = await supabase
      .from('subscriptions')
      .select('stripe_customer_id, stripe_subscription_id')
      .eq('user_id', user.id)
      .single();

    if (!sub?.stripe_subscription_id) {
      return NextResponse.json({ plan: 'free' });
    }

    // Check Stripe for the real status
    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '');
    const stripeSub = await stripe.subscriptions.retrieve(sub.stripe_subscription_id);

    const adminSupabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    const cancelAtPeriodEnd = (stripeSub as unknown as { cancel_at_period_end: boolean }).cancel_at_period_end;
    const periodEnd = new Date((stripeSub as unknown as { current_period_end: number }).current_period_end * 1000).toISOString();

    if (stripeSub.status === 'active') {
      await adminSupabase
        .from('subscriptions')
        .update({
          plan_type: 'pro',
          status: cancelAtPeriodEnd ? 'canceled' : 'active',
          current_period_end: periodEnd,
        })
        .eq('user_id', user.id);

      return NextResponse.json({
        plan: 'pro',
        cancelAtPeriodEnd,
        currentPeriodEnd: periodEnd,
      });
    } else {
      // fully canceled, past_due, unpaid, etc.
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
    return NextResponse.json({ error: 'Sync failed' }, { status: 500 });
  }
}
