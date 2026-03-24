'use client';

import Button from './Button';

interface UpgradePromptProps {
  feature?: string;
}

export default function UpgradePrompt({ feature }: UpgradePromptProps) {
  return (
    <div className="bg-gradient-to-br from-coral-50 to-cream rounded-2xl p-8 text-center border border-coral-100">
      <h3 className="text-xl font-semibold text-warmgray-800 mb-2">
        Upgrade to Pro
      </h3>
      <p className="text-warmgray-600 mb-6 max-w-md mx-auto">
        {feature
          ? `${feature} is a Pro feature.`
          : "You've hit the free tier limit."}{' '}
        Unlock unlimited plans, recipe swaps, and more for just $4.99/month.
      </p>
      <div className="flex flex-col sm:flex-row gap-3 justify-center">
        <Button size="lg">
          Go Pro — $4.99/mo
        </Button>
        <Button variant="ghost" size="lg">
          $39.99/year (save 33%)
        </Button>
      </div>
    </div>
  );
}
