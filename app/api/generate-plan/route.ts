import { NextRequest, NextResponse } from 'next/server';
import { generatePlan } from '@/lib/groq';
import { TasteProfile } from '@/lib/types';
import { createServerSupabaseClient } from '@/lib/supabase/server';
import { createClient } from '@supabase/supabase-js';

const FREE_MONTHLY_LIMIT = 2;

export async function POST(req: NextRequest) {
  try {
    const body: TasteProfile = await req.json();

    if (!body.cuisines?.length || !body.proteins?.length) {
      return NextResponse.json(
        { error: 'Cuisines and proteins are required' },
        { status: 400 }
      );
    }

    if (body.hardNos) {
      body.hardNos = body.hardNos.filter((v) => v !== 'none');
    }

    // Check usage limits for authenticated users
    let userId: string | null = null;
    let isPro = false;

    try {
      const supabase = createServerSupabaseClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        userId = user.id;

        const serviceClient = createClient(
          process.env.NEXT_PUBLIC_SUPABASE_URL!,
          process.env.SUPABASE_SERVICE_ROLE_KEY!
        );

        const { data: subscription } = await serviceClient
          .from('subscriptions')
          .select('plan_type')
          .eq('user_id', user.id)
          .single();

        isPro = subscription?.plan_type === 'pro';

        if (!isPro) {
          const { data: usageCount } = await serviceClient.rpc(
            'get_monthly_usage',
            { uid: user.id }
          );

          if (usageCount !== null && usageCount >= FREE_MONTHLY_LIMIT) {
            return NextResponse.json(
              {
                error: 'free_limit_reached',
                message: `You've used your ${FREE_MONTHLY_LIMIT} free plans this month. Upgrade to Pro for unlimited plans.`,
              },
              { status: 403 }
            );
          }
        }
      }
    } catch {
      // Don't block generation if auth check fails
    }

    const plan = await generatePlan(body);

    // Track usage for authenticated users
    if (userId) {
      try {
        const serviceClient = createClient(
          process.env.NEXT_PUBLIC_SUPABASE_URL!,
          process.env.SUPABASE_SERVICE_ROLE_KEY!
        );
        await serviceClient.from('usage').insert({
          user_id: userId,
          action: 'generate_plan',
        });
      } catch {
        // Don't fail if tracking fails
      }
    }

    return NextResponse.json(plan);
  } catch (error) {
    console.error('Plan generation error:', error);

    if (error instanceof Error && error.message.includes('rate_limit')) {
      return NextResponse.json(
        { error: "We're cooking up a lot of plans right now! Try again in a minute." },
        { status: 429 }
      );
    }

    const message = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json(
      { error: `Failed to generate plan: ${message}` },
      { status: 500 }
    );
  }
}
