'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { User } from '@supabase/supabase-js';

export default function Header() {
  const [user, setUser] = useState<User | null>(null);
  const [showMenu, setShowMenu] = useState(false);
  const supabase = createClient();

  useEffect(() => {
    const getUser = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      setUser(user);
    };
    getUser();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, [supabase.auth]);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    setShowMenu(false);
    window.location.href = '/';
  };

  return (
    <header className="sticky top-0 z-50 bg-cream/80 backdrop-blur-md border-b border-warmgray-100">
      <div className="max-w-4xl mx-auto px-4 h-16 flex items-center justify-between">
        <Link href="/" className="text-xl font-bold text-warmgray-800">
          meal<span className="text-coral-500">prept</span>
        </Link>

        <nav className="flex items-center gap-4">
          <Link
            href="/fridge"
            className="text-warmgray-600 hover:text-warmgray-800 text-sm font-medium"
          >
            My Fridge
          </Link>
          {user ? (
            <>
              <Link
                href="/plans"
                className="text-warmgray-600 hover:text-warmgray-800 text-sm font-medium"
              >
                My Plans
              </Link>
              <div className="relative">
                <button
                  onClick={() => setShowMenu(!showMenu)}
                  className="w-8 h-8 rounded-full bg-coral-100 text-coral-600 flex items-center justify-center text-sm font-semibold"
                >
                  {user.email?.[0]?.toUpperCase() || '?'}
                </button>
                {showMenu && (
                  <div className="absolute right-0 top-full mt-2 w-48 bg-white rounded-xl shadow-lg border border-warmgray-100 py-2">
                    <Link
                      href="/settings"
                      className="block px-4 py-2 text-sm text-warmgray-700 hover:bg-warmgray-50"
                      onClick={() => setShowMenu(false)}
                    >
                      Settings
                    </Link>
                    <button
                      onClick={handleSignOut}
                      className="block w-full text-left px-4 py-2 text-sm text-warmgray-700 hover:bg-warmgray-50"
                    >
                      Sign out
                    </button>
                  </div>
                )}
              </div>
            </>
          ) : (
            <button
              onClick={() => {
                const el = document.getElementById('auth-modal');
                if (el) el.classList.remove('hidden');
              }}
              className="text-coral-600 hover:text-coral-700 text-sm font-semibold"
            >
              Sign in
            </button>
          )}
        </nav>
      </div>
    </header>
  );
}
