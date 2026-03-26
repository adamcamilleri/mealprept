'use client';

import { useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import Button from '../ui/Button';

interface AuthModalProps {
  onClose: () => void;
  onSuccess: () => void;
  defaultMode?: 'signin' | 'signup';
}

export default function AuthModal({ onClose, onSuccess, defaultMode = 'signup' }: AuthModalProps) {
  const supabase = createClient();
  const [mode, setMode] = useState<'signin' | 'signup' | 'reset'>(defaultMode);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [resetSent, setResetSent] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      if (mode === 'reset') {
        const { error } = await supabase.auth.resetPasswordForEmail(email, {
          redirectTo: window.location.origin + '/auth/callback?next=/reset-password',
        });
        if (error) throw error;
        setResetSent(true);
      } else if (mode === 'signup') {
        const { error } = await supabase.auth.signUp({ email, password });
        if (error) throw error;
        onSuccess();
      } else {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        if (error) throw error;
        onSuccess();
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" id="auth-modal">
      <div
        className="absolute inset-0 bg-warmgray-900/30 backdrop-blur-sm"
        onClick={onClose}
      />
      <div className="relative bg-white rounded-2xl p-8 sm:p-10 max-w-md w-full shadow-[0_8px_40px_rgba(50,48,47,0.12)] animate-fadeInScale">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 rounded-lg text-warmgray-300 hover:text-warmgray-500 hover:bg-warmgray-100 transition-colors"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        <h2 className="text-xl font-semibold text-warmgray-800 mb-1">
          {mode === 'reset' ? 'Reset your password' : mode === 'signup' ? 'Create your account' : 'Welcome back'}
        </h2>
        <p className="text-warmgray-400 text-sm mb-6">
          {mode === 'reset'
            ? 'Enter your email and we\'ll send you a reset link.'
            : mode === 'signup'
            ? 'Save your plans and track your fridge.'
            : 'Sign in to continue.'}
        </p>


        {error && (
          <div className="bg-red-50 text-red-600 text-sm p-3 rounded-xl mb-4">
            {error}
          </div>
        )}

        {resetSent ? (
          <div className="text-center py-4">
            <p className="text-sm text-warmgray-600 mb-4">Check your email for a reset link</p>
            <button
              onClick={() => { setMode('signin'); setResetSent(false); setError(''); }}
              className="text-coral-500 font-medium hover:text-coral-600 transition-colors text-sm"
            >
              Back to sign in
            </button>
          </div>
        ) : mode === 'reset' ? (
          <>
            <form onSubmit={handleSubmit} className="space-y-3">
              <input
                type="email"
                placeholder="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full p-3.5 rounded-2xl border border-warmgray-200 focus:border-navy-400 focus:ring-2 focus:ring-navy-400/20 focus:outline-none text-warmgray-800 text-sm placeholder-warmgray-400 transition-all"
                required
              />
              <Button type="submit" loading={loading} className="w-full" size="md">
                Send reset link
              </Button>
            </form>
            <p className="text-center text-xs text-warmgray-400 mt-5">
              <button
                onClick={() => { setMode('signin'); setError(''); }}
                className="text-coral-500 font-medium hover:text-coral-600 transition-colors"
              >
                Back to sign in
              </button>
            </p>
          </>
        ) : (
          <>
            <form onSubmit={handleSubmit} className="space-y-3">
              <input
                type="email"
                placeholder="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full p-3.5 rounded-2xl border border-warmgray-200 focus:border-navy-400 focus:ring-2 focus:ring-navy-400/20 focus:outline-none text-warmgray-800 text-sm placeholder-warmgray-400 transition-all"
                required
              />
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full p-3.5 pr-10 rounded-2xl border border-warmgray-200 focus:border-navy-400 focus:ring-2 focus:ring-navy-400/20 focus:outline-none text-warmgray-800 text-sm placeholder-warmgray-400 transition-all"
                  required
                  minLength={6}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-warmgray-400 hover:text-warmgray-600 transition-colors"
                >
                  {showPassword ? (
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                    </svg>
                  ) : (
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                  )}
                </button>
              </div>
              {mode === 'signin' && (
                <>
                  <div className="flex items-center justify-between">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={rememberMe}
                        onChange={(e) => setRememberMe(e.target.checked)}
                        className="w-4 h-4 rounded border-warmgray-300 text-navy-500 focus:ring-navy-400"
                      />
                      <span className="text-xs text-warmgray-500">Remember me</span>
                    </label>
                    <button
                      type="button"
                      onClick={() => { setMode('reset'); setError(''); }}
                      className="text-xs text-coral-500 font-medium hover:text-coral-600 transition-colors"
                    >
                      Forgot password?
                    </button>
                  </div>
                </>
              )}
              <Button type="submit" loading={loading} className="w-full" size="md">
                {mode === 'signup' ? 'Create account' : 'Sign in'}
              </Button>
            </form>

            <p className="text-center text-xs text-warmgray-400 mt-5">
              {mode === 'signup' ? (
                <>
                  Already have an account?{' '}
                  <button
                    onClick={() => setMode('signin')}
                    className="text-coral-500 font-medium hover:text-coral-600 transition-colors"
                  >
                    Sign in
                  </button>
                </>
              ) : (
                <>
                  Don&apos;t have an account?{' '}
                  <button
                    onClick={() => setMode('signup')}
                    className="text-coral-500 font-medium hover:text-coral-600 transition-colors"
                  >
                    Sign up
                  </button>
                </>
              )}
            </p>
          </>
        )}
      </div>
    </div>
  );
}
