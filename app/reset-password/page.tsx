'use client';

import { useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import Button from '@/components/ui/Button';
import { useRouter } from 'next/navigation';

export default function ResetPasswordPage() {
  const supabase = createClient();
  const router = useRouter();
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }
    if (password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }
    setLoading(true);
    setError('');
    try {
      const { error } = await supabase.auth.updateUser({ password });
      if (error) throw error;
      setSuccess(true);
      setTimeout(() => router.push('/settings'), 2000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="max-w-md mx-auto px-6 py-20 text-center">
        <div className="text-4xl mb-4">&#10003;</div>
        <h1 className="text-xl font-bold text-warmgray-800 mb-2">Password updated</h1>
        <p className="text-sm text-warmgray-400">Redirecting to settings...</p>
      </div>
    );
  }

  return (
    <div className="max-w-md mx-auto px-6 py-20">
      <h1 className="text-2xl font-bold text-warmgray-800 mb-2">Set new password</h1>
      <p className="text-sm text-warmgray-400 mb-8">Enter your new password below.</p>
      {error && (
        <div className="bg-red-50 text-red-600 text-sm p-3 rounded-xl mb-4">{error}</div>
      )}
      <form onSubmit={handleSubmit} className="space-y-3">
        <input
          type="password"
          placeholder="New password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full p-3.5 rounded-2xl border border-warmgray-200 focus:border-navy-400 focus:ring-2 focus:ring-navy-400/20 focus:outline-none text-warmgray-800 text-sm"
          required
          minLength={6}
        />
        <input
          type="password"
          placeholder="Confirm password"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          className="w-full p-3.5 rounded-2xl border border-warmgray-200 focus:border-navy-400 focus:ring-2 focus:ring-navy-400/20 focus:outline-none text-warmgray-800 text-sm"
          required
          minLength={6}
        />
        <Button type="submit" loading={loading} className="w-full" size="md">
          Update password
        </Button>
      </form>
    </div>
  );
}
