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
      // Note: actual account deletion would need a server endpoint
      // with service role to delete from auth.users
      router.push('/');
    } catch {
      alert('Failed to delete account. Please contact support.');
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto px-4 py-12">
      <h1 className="text-2xl font-bold text-warmgray-800 mb-8">Settings</h1>

      <div className="space-y-6">
        {/* Account */}
        <div className="bg-white rounded-2xl border border-warmgray-200 p-6">
          <h2 className="text-lg font-semibold text-warmgray-800 mb-4">
            Account
          </h2>
          <div className="text-warmgray-600">
            <p>
              <span className="text-warmgray-400">Email: </span>
              {user.email}
            </p>
          </div>
        </div>

        {/* Subscription */}
        <div className="bg-white rounded-2xl border border-warmgray-200 p-6">
          <h2 className="text-lg font-semibold text-warmgray-800 mb-4">
            Plan
          </h2>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-warmgray-800 font-medium capitalize">
                {subscription?.plan_type || 'Free'} Plan
              </p>
              <p className="text-sm text-warmgray-400">
                {subscription?.plan_type === 'pro'
                  ? 'Unlimited plans and swaps'
                  : '3 plans per month'}
              </p>
            </div>
            {subscription?.plan_type !== 'pro' && (
              <Button size="sm">Upgrade to Pro</Button>
            )}
          </div>
          {subscription?.stripe_customer_id && (
            <a
              href="#"
              className="text-sm text-coral-600 hover:text-coral-700 mt-3 inline-block"
            >
              Manage subscription
            </a>
          )}
        </div>

        {/* Danger zone */}
        <div className="bg-white rounded-2xl border border-red-200 p-6">
          <h2 className="text-lg font-semibold text-red-600 mb-4">
            Danger Zone
          </h2>
          <p className="text-warmgray-500 text-sm mb-4">
            Permanently delete your account and all saved plans.
          </p>
          <Button
            variant="ghost"
            onClick={handleDeleteAccount}
            loading={deleting}
            className="text-red-500 hover:text-red-600 hover:bg-red-50"
          >
            Delete account
          </Button>
        </div>
      </div>
    </div>
  );
}
