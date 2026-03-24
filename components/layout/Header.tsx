'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function Header() {
  const pathname = usePathname();

  const navLinks = [
    { href: '/preps', label: 'My Preps' },
    { href: '/fridge', label: 'Fridge' },
  ];

  return (
    <header className="sticky top-0 z-50 glass bg-cream/70 border-b border-warmgray-100/60">
      <div className="max-w-4xl mx-auto px-4 h-14 flex items-center justify-between">
        <Link
          href="/"
          className="text-lg font-bold text-warmgray-800 tracking-tight transition-opacity hover:opacity-70"
        >
          spoon<span className="text-coral-500">fed</span>
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
        </nav>
      </div>
    </header>
  );
}
