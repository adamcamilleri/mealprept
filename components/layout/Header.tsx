'use client';

import Link from 'next/link';

export default function Header() {
  return (
    <header className="sticky top-0 z-50 bg-cream/80 backdrop-blur-md border-b border-warmgray-100">
      <div className="max-w-4xl mx-auto px-4 h-16 flex items-center justify-between">
        <Link href="/" className="text-xl font-bold text-warmgray-800">
          meal<span className="text-coral-500">prept</span>
        </Link>

        <nav className="flex items-center gap-4">
          <Link
            href="/preps"
            className="text-warmgray-600 hover:text-warmgray-800 text-sm font-medium"
          >
            My Preps
          </Link>
          <Link
            href="/fridge"
            className="text-warmgray-600 hover:text-warmgray-800 text-sm font-medium"
          >
            My Fridge
          </Link>
        </nav>
      </div>
    </header>
  );
}
