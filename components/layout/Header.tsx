'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import type { User } from '@supabase/supabase-js';

export default function Header() {
  const pathname = usePathname();
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [showMenu, setShowMenu] = useState(false);

  useEffect(() => {
    const supabase = createClient();

    // Get initial session
    supabase.auth.getUser().then(({ data: { user } }) => {
      setUser(user);
      setLoading(false);
    });

    // Listen for auth changes (sign in, sign out, token refresh)
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setUser(session?.user ?? null);
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  const handleSignOut = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    setUser(null);
    setShowMenu(false);
    router.push('/');
    router.refresh();
  };

  const navLinks = [
    { href: '/plans', label: 'My Plans' },
    ...(user ? [{ href: '/fridge', label: 'Fridge' }] : []),
  ];

  return (
    <header className="sticky top-0 z-50 glass bg-cream/70 border-b border-warmgray-100/60">
      <div className="max-w-4xl mx-auto px-4 h-14 flex items-center justify-between">
        <Link
          href="/"
          className="text-lg font-bold text-warmgray-800 tracking-tight transition-opacity hover:opacity-70"
        >
          no<span className="text-coral-500">chef</span>
        </Link>

        <nav className="flex items-center gap-1">
          {navLinks.map((link) => {
            const isActive = pathname === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`
                  px-3 py-1.5 rounded-lg text-sm font-medium transition-all duration-200
                  ${
                    isActive
                      ? 'text-coral-600 bg-coral-50'
                      : 'text-warmgray-500 hover:text-warmgray-800 hover:bg-warmgray-100/60'
                  }
                `}
              >
                {link.label}
              </Link>
            );
          })}

          {/* Auth */}
          {!loading && (
            <>
              {user ? (
                <div className="relative ml-1">
                  <button
                    onClick={() => setShowMenu(!showMenu)}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium text-warmgray-500 hover:text-warmgray-800 hover:bg-warmgray-100/60 transition-all duration-200"
                  >
                    <div className="w-6 h-6 rounded-full bg-coral-100 flex items-center justify-center text-coral-600 text-xs font-semibold">
                      {(user.email?.[0] ?? '?').toUpperCase()}
                    </div>
                  </button>

                  {showMenu && (
                    <>
                      <div
                        className="fixed inset-0 z-40"
                        onClick={() => setShowMenu(false)}
                      />
                      <div className="absolute right-0 top-full mt-1 z-50 bg-white rounded-xl shadow-lg border border-warmgray-200/80 py-1 w-48 animate-fadeInScale">
                        <div className="px-3 py-2 border-b border-warmgray-100">
                          <p className="text-xs text-warmgray-400 truncate">
                            {user.email}
                          </p>
                        </div>
                        <Link
                          href="/plans"
                          onClick={() => setShowMenu(false)}
                          className="block px-3 py-2 text-sm text-warmgray-600 hover:bg-warmgray-50 transition-colors"
                        >
                          Saved Plans
                        </Link>
                        <Link
                          href="/settings"
                          onClick={() => setShowMenu(false)}
                          className="block px-3 py-2 text-sm text-warmgray-600 hover:bg-warmgray-50 transition-colors"
                        >
                          Settings
                        </Link>
                        <button
                          onClick={handleSignOut}
                          className="w-full text-left px-3 py-2 text-sm text-warmgray-600 hover:bg-warmgray-50 transition-colors"
                        >
                          Sign out
                        </button>
                      </div>
                    </>
                  )}
                </div>
              ) : (
                <Link
                  href="/?signin=true"
                  className="ml-1 px-3 py-1.5 rounded-lg text-sm font-medium text-coral-600 hover:bg-coral-50 transition-all duration-200"
                >
                  Sign in
                </Link>
              )}
            </>
          )}
        </nav>
      </div>
    </header>
  );
}
