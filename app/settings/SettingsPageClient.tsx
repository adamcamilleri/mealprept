'use client';

import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';
import Button from '@/components/ui/Button';
import { Subscription, hasProAccess } from '@/lib/subscription';

interface SettingsPageClientProps {
  user: { email: string };
  subscription: Subscription | null;
}

export default function SettingsPageClient({
  user,
  subscription: initialSubscription,
}: SettingsPageClientProps) {
  const supabase = createClient();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [deleting, setDeleting] = useState(false);
  const [upgrading, setUpgrading] = useState(false);
  const [managingPortal, setManagingPortal] = useState(false);
  const [verifying, setVerifying] = useState(false);
  const [sub, setSub] = useState<Subscription | null>(initialSubscription);

  const isPro = hasProAccess(sub);
  const isCanceledWithAccess =
    sub?.status === 'canceled' &&
    sub?.plan_type === 'pro' &&
    sub?.current_period_end &&
    new Date(sub.current_period_end) > new Date();

  const syncSubscription = () => {
    fetch('/api/sync-subscription', { method: 'POST' })
      .then((res) => res.json())
      .then((data) => {
        if (data.plan) {
          setSub((prev) => ({
            plan_type: data.plan,
            status: data.cancelAtPeriodEnd ? 'canceled' : (prev?.status ?? 'active'),
            current_period_end: data.currentPeriodEnd ?? prev?.current_period_end ?? null,
            stripe_customer_id: prev?.stripe_customer_id ?? null,
            stripe_subscription_id: prev?.stripe_subscription_id ?? null,
          }));
        }
      })
      .catch(console.error);
  };

  useEffect(() => {
    const sessionId = searchParams.get('session_id');
    if (sessionId && !isPro) {
      setVerifying(true);
      fetch('/api/verify-checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sessionId }),
      })
        .then((res) => res.json())
        .then((data) => {
          if (data.success) {
            setSub((prev) => ({
              plan_type: 'pro',
              status: 'active',
              current_period_end: prev?.current_period_end ?? null,
              stripe_customer_id: prev?.stripe_customer_id ?? null,
              stripe_subscription_id: prev?.stripe_subscription_id ?? null,
            }));
            window.history.replaceState({}, '', '/settings');
          }
        })
        .catch(console.error)
        .finally(() => setVerifying(false));
    } else {
      // Always sync with Stripe on page load
      syncSubscription();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

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
      if (url) {
        // Open portal in same tab - when user returns, page reloads and sync runs
        window.location.href = url;
      }
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
      const res = await fetch('/api/delete-account', { method: 'POST' });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Failed to delete account');
      }
      await supabase.auth.signOut();
      router.push('/');
    } catch {
      alert('Failed to delete account. Please contact support.');
    } finally {
      setDeleting(false);
    }
  };

  const displayPlan = isPro ? 'Pro' : 'Free';

  return (
    <div className="max-w-xl mx-auto px-4 py-12 sm:py-16">
      <h1 className="text-2xl font-bold text-warmgray-800 tracking-tight mb-8">
        Settings
      </h1>

      <div className="space-y-4">
        {/* Account */}
        <div className="bg-white rounded-2xl shadow-[0_2px_12px_rgba(50,48,47,0.06)] p-6 sm:p-8">
          <h2 className="text-xs font-semibold text-warmgray-400 uppercase tracking-wider mb-3">
            Account
          </h2>
          <p className="text-sm text-warmgray-600">{user.email}</p>
        </div>

        {/* Subscription */}
        <div className="bg-white rounded-2xl shadow-[0_2px_12px_rgba(50,48,47,0.06)] p-6 sm:p-8">
          <h2 className="text-xs font-semibold text-warmgray-400 uppercase tracking-wider mb-3">
            Plan
          </h2>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-warmgray-800">
                {verifying ? 'Verifying...' : displayPlan}
              </p>
              <p className="text-xs text-warmgray-400 mt-0.5">
                {isPro
                  ? 'Unlimited plans, swaps, and fridge storage'
                  : '2 plans per month'}
              </p>
              {isCanceledWithAccess && sub?.current_period_end && (
                <p className="text-xs text-amber-600 mt-2 bg-amber-50 rounded-lg px-3 py-2">
                  Your Pro plan is canceled. You have access until{' '}
                  <span className="font-semibold">
                    {new Date(sub.current_period_end).toLocaleDateString('en-US', {
                      month: 'long',
                      day: 'numeric',
                      year: 'numeric',
                    })}
                  </span>
                  .
                </p>
              )}
            </div>
            {!isPro && (
              <Button size="sm" onClick={handleUpgrade} loading={upgrading}>
                Upgrade
              </Button>
            )}
          </div>
          {sub?.stripe_customer_id && (
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
        <div className="bg-white rounded-2xl shadow-[0_2px_12px_rgba(50,48,47,0.06)] p-6 sm:p-8">
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
