import { NextRequest, NextResponse } from 'next/server';
import { generatePlan } from '@/lib/groq';
import { TasteProfile } from '@/lib/types';
import { createServerSupabaseClient } from '@/lib/supabase/server';
import { createClient } from '@supabase/supabase-js';

export async function POST(req: NextRequest) {
  try {
    const body: TasteProfile = await req.json();

    // Validate
    if (!body.cuisines?.length || !body.proteins?.length) {
      return NextResponse.json(
        { error: 'Cuisines and proteins are required' },
        { status: 400 }
      );
    }

    // Filter out "none" from hardNos
    if (body.hardNos) {
      body.hardNos = body.hardNos.filter((v) => v !== 'none');
    }

    // Generate the plan
    const plan = await generatePlan(body);

    // Track usage if user is authenticated (for analytics)
    try {
      const supabase = createServerSupabaseClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (user) {
        const serviceClient = createClient(
          process.env.NEXT_PUBLIC_SUPABASE_URL!,
          process.env.SUPABASE_SERVICE_ROLE_KEY!
        );
        await serviceClient.from('usage').insert({
          user_id: user.id,
          action: 'generate_plan',
        });
      }
    } catch {
      // Don't fail plan generation if usage tracking fails
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
