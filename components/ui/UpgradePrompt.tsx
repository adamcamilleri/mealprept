'use client';

import { useState } from 'react';
import Button from './Button';

interface UpgradePromptProps {
  feature?: string;
}

export default function UpgradePrompt({ feature }: UpgradePromptProps) {
  const [loading, setLoading] = useState<string | null>(null);

  const handleCheckout = async () => {
    setLoading('monthly');
    try {
      const res = await fetch('/api/create-checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          priceId: process.env.NEXT_PUBLIC_STRIPE_PRICE_ID,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        if (res.status === 401) {
          window.location.href = '/?signin=true';
          return;
        }
        throw new Error(data.error || 'Checkout failed');
      }

      const { url } = await res.json();
      if (url) window.location.href = url;
    } catch (err) {
      console.error(err);
      alert('Something went wrong. Please try again.');
    } finally {
      setLoading(null);
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-warmgray-200/80 p-8 text-center animate-fadeInScale">
      <div className="w-10 h-10 rounded-full bg-coral-100 flex items-center justify-center mx-auto mb-4">
        <svg className="w-5 h-5 text-coral-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
        </svg>
      </div>
      <h3 className="text-lg font-semibold text-warmgray-800 mb-1.5">
        Upgrade to Pro
      </h3>
      <p className="text-warmgray-400 text-sm mb-6 max-w-sm mx-auto">
        {feature
          ? `${feature} is a Pro feature.`
          : "You've hit the free tier limit."}{' '}
        Unlimited plans, recipe swaps, and more.
      </p>
      <div className="flex justify-center max-w-xs mx-auto">
        <Button
          size="md"
          onClick={handleCheckout}
          loading={loading === 'monthly'}
          className="flex-1"
        >
          $3.99/mo
        </Button>
      </div>
      <p className="text-xs text-warmgray-300 mt-3">
        Cancel anytime.
      </p>
    </div>
  );
}
