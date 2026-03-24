import { NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase/server';

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get('code');
  const next = searchParams.get('next') ?? '/';

  if (code) {
    const supabase = createServerSupabaseClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) {
      // Successful auth — redirect to intended destination
      return NextResponse.redirect(`${origin}${next}`);
    }
    console.error('Auth callback error:', error.message);
  }

  // Auth failed — redirect home with error
  return NextResponse.redirect(`${origin}/?error=auth`);
}
