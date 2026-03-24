'use client';

import { useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';
import Button from '@/components/ui/Button';

interface SettingsPageClientProps {
  user: { email: string };
  subscription: {
    plan_type: string;
    status: string;
    stripe_customer_id?: string;
  } | null;
}

export default function SettingsPageClient({
  user,
  subscription,
}: SettingsPageClientProps) {
  const supabase = createClient();
  const router = useRouter();
  const [deleting, setDeleting] = useState(false);
  const [upgrading, setUpgrading] = useState(false);
  const [managingPortal, setManagingPortal] = useState(false);

  const handleUpgrade = async () => {
    setUpgrading(true);
    try {
      const res = await fetch('/api/create-checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          priceId: process.env.NEXT_PUBLIC_STRIPE_PRICE_ID,
        }),
      });
      if (!res.ok) throw new Error('Failed to create checkout');
      const { url } = await res.json();
      if (url) window.location.href = url;
    } catch {
      alert('Something went wrong. Please try again.');
    } finally {
      setUpgrading(false);
    }
  };

  const handleManageSubscription = async () => {
    setManagingPortal(true);
    try {
      const res = await fetch('/api/create-portal', { method: 'POST' });
      if (!res.ok) throw new Error('Failed to create portal session');
      const { url } = await res.json();
      if (url) window.location.href = url;
    } catch {
      alert('Something went wrong. Please try again.');
    } finally {
      setManagingPortal(false);
    }
  };

  const handleDeleteAccount = async () => {
    if (
      !confirm(
        'Are you sure you want to delete your account? This cannot be undone.'
      )
    )
      return;

    setDeleting(true);
    try {
      await supabase.auth.signOut();
      router.push('/');
    } catch {
      alert('Failed to delete account. Please contact support.');
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="max-w-xl mx-auto px-4 py-12 sm:py-16">
      <h1 className="text-2xl font-bold text-warmgray-800 tracking-tight mb-8">
        Settings
      </h1>

      <div className="space-y-4">
        {/* Account */}
        <div className="bg-white rounded-2xl border border-warmgray-200/80 p-5 sm:p-6">
          <h2 className="text-xs font-semibold text-warmgray-400 uppercase tracking-wider mb-3">
            Account
          </h2>
          <p className="text-sm text-warmgray-600">{user.email}</p>
        </div>

        {/* Subscription */}
        <div className="bg-white rounded-2xl border border-warmgray-200/80 p-5 sm:p-6">
          <h2 className="text-xs font-semibold text-warmgray-400 uppercase tracking-wider mb-3">
            Plan
          </h2>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-warmgray-800 capitalize">
                {subscription?.plan_type || 'Free'}
              </p>
              <p className="text-xs text-warmgray-400 mt-0.5">
                {subscription?.plan_type === 'pro'
                  ? 'Unlimited plans, swaps, and fridge storage'
                  : '2 plans per month'}
              </p>
            </div>
            {subscription?.plan_type !== 'pro' && (
              <Button size="sm" onClick={handleUpgrade} loading={upgrading}>
                Upgrade
              </Button>
            )}
          </div>
          {subscription?.stripe_customer_id && (
            <button
              onClick={handleManageSubscription}
              disabled={managingPortal}
              className="text-xs text-coral-500 hover:text-coral-600 mt-3 inline-block disabled:opacity-50 transition-colors font-medium"
            >
              {managingPortal ? 'Opening...' : 'Manage subscription'}
            </button>
          )}
        </div>

        {/* Danger zone */}
        <div className="bg-white rounded-2xl border border-red-100 p-5 sm:p-6">
          <h2 className="text-xs font-semibold text-red-400 uppercase tracking-wider mb-3">
            Danger Zone
          </h2>
          <p className="text-warmgray-400 text-xs mb-3">
            Permanently delete your account and all saved data.
          </p>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleDeleteAccount}
            loading={deleting}
            className="text-red-400 hover:text-red-500 hover:bg-red-50"
          >
            Delete account
          </Button>
        </div>
      </div>
    </div>
  );
}
