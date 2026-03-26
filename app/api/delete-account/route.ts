import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { createServerSupabaseClient } from '@/lib/supabase/server';

export async function POST() {
  try {
    const supabase = createServerSupabaseClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const adminSupabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    // Delete all user data (order matters for foreign keys)
    await adminSupabase.from('fridge_items').delete().eq('user_id', user.id);
    await adminSupabase.from('usage').delete().eq('user_id', user.id);
    await adminSupabase.from('meal_plans').delete().eq('user_id', user.id);
    await adminSupabase.from('taste_profiles').delete().eq('user_id', user.id);
    await adminSupabase.from('subscriptions').delete().eq('user_id', user.id);

    // Delete the auth user
    await adminSupabase.auth.admin.deleteUser(user.id);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Delete account error:', error);
    return NextResponse.json({ error: 'Failed to delete account' }, { status: 500 });
  }
}
