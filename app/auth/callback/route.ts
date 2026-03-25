import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { createServerSupabaseClient } from '@/lib/supabase/server';

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get('code');
  const next = searchParams.get('next') ?? '/';

  if (code) {
    const supabase = createServerSupabaseClient();
    const { data: { session }, error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error && session) {
      // Ensure subscription record exists for new users
      try {
        const adminSupabase = createClient(
          process.env.NEXT_PUBLIC_SUPABASE_URL!,
          process.env.SUPABASE_SERVICE_ROLE_KEY!
        );

        const { data: existing } = await adminSupabase
          .from('subscriptions')
          .select('id')
          .eq('user_id', session.user.id)
          .single();

        if (!existing) {
          await adminSupabase.from('subscriptions').insert({
            user_id: session.user.id,
            plan_type: 'free',
            status: 'active',
          });
        }
      } catch (subError) {
        console.error('Failed to create default subscription:', subError);
      }

      // Successful auth - redirect to intended destination
      return NextResponse.redirect(`${origin}${next}`);
    }
    console.error('Auth callback error:', error?.message);
  }

  // Auth failed - redirect home with error
  return NextResponse.redirect(`${origin}/?error=auth`);
}
