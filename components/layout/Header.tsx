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
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(({ data: { user } }) => {
      setUser(user);
      setLoading(false);
    });
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setUser(session?.user ?? null);
      }
    );
    return () => subscription.unsubscribe();
  }, []);

  // Close menu on route change
  useEffect(() => {
    setMenuOpen(false);
  }, [pathname]);

  const handleSignOut = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    setUser(null);
    setMenuOpen(false);
    router.push('/');
    router.refresh();
  };

  return (
    <>
      <header className="sticky top-0 z-50 bg-cream/95 backdrop-blur-sm">
        <div className="max-w-5xl mx-auto px-6 h-16 flex items-center justify-between">
          {/* Hamburger */}
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="w-10 h-10 flex items-center justify-center rounded-xl hover:bg-warmgray-100 transition-colors"
          >
            <div className="w-5 flex flex-col gap-[5px]">
              <span className={`block h-[2px] bg-warmgray-700 rounded-full transition-all duration-300 ${menuOpen ? 'rotate-45 translate-y-[7px]' : ''}`} />
              <span className={`block h-[2px] bg-warmgray-700 rounded-full transition-all duration-300 ${menuOpen ? 'opacity-0' : ''}`} />
              <span className={`block h-[2px] bg-warmgray-700 rounded-full transition-all duration-300 ${menuOpen ? '-rotate-45 -translate-y-[7px]' : ''}`} />
            </div>
          </button>

          {/* Logo */}
          <Link
            href="/"
            className="absolute left-1/2 -translate-x-1/2 text-xl font-bold text-warmgray-800 tracking-tight transition-opacity hover:opacity-70"
          >
            no<span className="text-coral-500">chef</span>
          </Link>

          {/* Right side */}
          <div className="flex items-center">
            {!loading && (
              user ? (
                <Link
                  href="/settings"
                  className="w-9 h-9 rounded-full bg-gradient-to-br from-navy-100 to-navy-200 flex items-center justify-center text-navy-700 text-sm font-bold ring-2 ring-navy-100 hover:ring-navy-300 transition-all"
                >
                  {(user.email?.[0] ?? '?').toUpperCase()}
                </Link>
              ) : (
                <div className="flex items-center gap-2">
                  <Link
                    href="/?signin=true"
                    className="px-5 py-2 rounded-full text-sm font-semibold border border-warmgray-300 text-warmgray-700 hover:border-warmgray-400 transition-all"
                  >
                    Sign in
                  </Link>
                  <Link
                    href="/?signup=true"
                    className="px-5 py-2 rounded-full text-sm font-semibold bg-navy-500 text-white hover:bg-navy-600 transition-all"
                  >
                    Register
                  </Link>
                </div>
              )
            )}
          </div>
        </div>
      </header>

      {/* Slide-out menu */}
      {menuOpen && (
        <div
          className="fixed inset-0 z-40 bg-warmgray-900/20 backdrop-blur-sm"
          onClick={() => setMenuOpen(false)}
        />
      )}
      <div
        className={`fixed top-0 left-0 z-50 h-full w-72 bg-white shadow-[4px_0_24px_rgba(50,48,47,0.1)] transition-transform duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] ${
          menuOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="p-6">
          {/* Close button */}
          <button
            onClick={() => setMenuOpen(false)}
            className="w-10 h-10 flex items-center justify-center rounded-xl hover:bg-warmgray-100 transition-colors mb-8"
          >
            <svg className="w-5 h-5 text-warmgray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>

          {/* User info */}
          {user && (
            <div className="mb-8 pb-6 border-b border-warmgray-100">
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-navy-100 to-navy-200 flex items-center justify-center text-navy-700 text-lg font-bold mb-3">
                {(user.email?.[0] ?? '?').toUpperCase()}
              </div>
              <p className="text-sm font-medium text-warmgray-800 truncate">
                {user.email}
              </p>
            </div>
          )}

          {/* Navigation */}
          <nav className="space-y-1">
            <MenuLink href="/" label="Home" active={pathname === '/'} icon="🏠" />
            <MenuLink href="/plans" label="My Plans" active={pathname === '/plans'} icon="📋" />
            {user && (
              <>
                <MenuLink href="/fridge" label="My Fridge" active={pathname === '/fridge'} icon="🧊" />
                <MenuLink href="/settings" label="Settings" active={pathname === '/settings'} icon="⚙️" />
              </>
            )}
          </nav>

          {/* Bottom actions */}
          <div className="mt-8 pt-6 border-t border-warmgray-100 space-y-1">
            {user ? (
              <button
                onClick={handleSignOut}
                className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-warmgray-500 hover:bg-warmgray-50 hover:text-warmgray-800 transition-all"
              >
                <span className="text-lg">👋</span>
                Sign out
              </button>
            ) : (
              <Link
                href="/?signin=true"
                onClick={() => setMenuOpen(false)}
                className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-coral-600 hover:bg-coral-50 transition-all"
              >
                <span className="text-lg">🔑</span>
                Sign in or create account
              </Link>
            )}
          </div>
        </div>
      </div>
    </>
  );
}

function MenuLink({ href, label, active, icon }: { href: string; label: string; active: boolean; icon: string }) {
  return (
    <Link
      href={href}
      className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${
        active
          ? 'bg-coral-50 text-coral-700'
          : 'text-warmgray-600 hover:bg-warmgray-50 hover:text-warmgray-800'
      }`}
    >
      <span className="text-lg">{icon}</span>
      {label}
    </Link>
  );
}
