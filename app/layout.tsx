import type { Metadata } from 'next';
import { DM_Sans } from 'next/font/google';
import './globals.css';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';

const dmSans = DM_Sans({
  subsets: ['latin'],
  variable: '--font-dm-sans',
});

export const metadata: Metadata = {
  title: "Spoonfed — Dinner, figured out.",
  description:
    "Tell us what your family loves eating and we'll plan the week so you don't have to think about it. Recipes you'll actually look forward to, plus a combined grocery list.",
  openGraph: {
    title: "Spoonfed — Dinner, figured out.",
    description:
      "Weekly meal plans built around what your family actually enjoys eating. No stress, no guesswork, just good food on the table.",
    type: 'website',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${dmSans.variable} font-sans antialiased`}>
        <Header />
        <main className="min-h-screen">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
