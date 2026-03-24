import { NextRequest, NextResponse } from 'next/server';
import { generateSwapRecipe } from '@/lib/groq';
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

    // Check Pro status
    const { data: subscription } = await supabase
      .from('subscriptions')
      .select('plan_type')
      .eq('user_id', user.id)
      .single();

    if (subscription?.plan_type !== 'pro') {
      return NextResponse.json(
        { error: 'Recipe swapping is a Pro feature' },
        { status: 403 }
      );
    }

    const { existingRecipes, recipeToReplace, profile } = await req.json();

    if (!existingRecipes || !recipeToReplace || !profile) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const result = await generateSwapRecipe(
      existingRecipes,
      recipeToReplace,
      profile
    );

    return NextResponse.json(result);
  } catch (error) {
    console.error('Recipe swap error:', error);
    return NextResponse.json(
      { error: 'Failed to swap recipe. Please try again.' },
      { status: 500 }
    );
  }
}
