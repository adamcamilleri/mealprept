import { NextRequest, NextResponse } from 'next/server';
import { generatePlan } from '@/lib/groq';
import { TasteProfile } from '@/lib/types';

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

    const plan = await generatePlan(body);
    return NextResponse.json(plan);
  } catch (error) {
    console.error('Plan generation error:', error);

    if (error instanceof Error && error.message.includes('rate_limit')) {
      return NextResponse.json(
        { error: "We're cooking up a lot of plans right now! Try again in a minute." },
        { status: 429 }
      );
    }

    return NextResponse.json(
      { error: 'Failed to generate plan. Please try again.' },
      { status: 500 }
    );
  }
}
