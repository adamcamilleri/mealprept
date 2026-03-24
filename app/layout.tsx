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
  title: "mealprept — Meal prep that doesn't suck",
  description:
    "Tell us what you actually love eating and we'll build you a weekly meal prep plan you'll look forward to. With a combined grocery list.",
  openGraph: {
    title: "mealprept — Meal prep that doesn't suck",
    description:
      "Personalized meal prep plans based on what you actually enjoy eating. Not macros. Not diets. Just food you'll love.",
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
