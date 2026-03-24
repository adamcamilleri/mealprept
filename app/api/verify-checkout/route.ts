import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { createClient } from '@supabase/supabase-js';
import { createServerSupabaseClient } from '@/lib/supabase/server';

export async function POST(req: NextRequest) {
  try {
    const supabase = createServerSupabaseClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { sessionId } = await req.json();
    if (!sessionId) {
      return NextResponse.json({ error: 'Missing session ID' }, { status: 400 });
    }

    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '');
    const session = await stripe.checkout.sessions.retrieve(sessionId);

    if (session.payment_status !== 'paid') {
      return NextResponse.json({ error: 'Payment not completed' }, { status: 400 });
    }

    const userId = session.metadata?.userId;
    if (userId !== user.id) {
      return NextResponse.json({ error: 'User mismatch' }, { status: 403 });
    }

    // Use service role to bypass RLS
    const adminSupabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    await adminSupabase.from('subscriptions').upsert({
      user_id: userId,
      stripe_customer_id: session.customer as string,
      stripe_subscription_id: session.subscription as string,
      plan_type: 'pro',
      status: 'active',
      current_period_end: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
    }, { onConflict: 'user_id' });

    return NextResponse.json({ success: true, plan: 'pro' });
  } catch (error) {
    console.error('Verify checkout error:', error);
    return NextResponse.json(
      { error: 'Failed to verify checkout' },
      { status: 500 }
    );
  }
}
