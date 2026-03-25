'use client';

import { useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import Button from '../ui/Button';

interface AuthModalProps {
  onClose: () => void;
  onSuccess: () => void;
}

export default function AuthModal({ onClose, onSuccess }: AuthModalProps) {
  const supabase = createClient();
  const [mode, setMode] = useState<'signin' | 'signup'>('signup');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      if (mode === 'signup') {
        const { error } = await supabase.auth.signUp({ email, password });
        if (error) throw error;
      } else {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        if (error) throw error;
      }
      onSuccess();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    });
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
          {mode === 'signup' ? 'Create your account' : 'Welcome back'}
        </h2>
        <p className="text-warmgray-400 text-sm mb-6">
          {mode === 'signup'
            ? 'Save your plans and track your fridge.'
            : 'Sign in to continue.'}
        </p>

        <button
          onClick={handleGoogleSignIn}
          className="w-full flex items-center justify-center gap-2.5 p-3 rounded-full border border-warmgray-200 hover:border-warmgray-300 hover:bg-warmgray-50 text-warmgray-700 text-sm font-medium transition-all duration-200"
        >
          <svg className="w-4 h-4" viewBox="0 0 24 24">
            <path
              d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"
              fill="#4285F4"
            />
            <path
              d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              fill="#34A853"
            />
            <path
              d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
              fill="#FBBC05"
            />
            <path
              d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
              fill="#EA4335"
            />
          </svg>
          Continue with Google
        </button>

        <div className="flex items-center gap-3 my-5">
          <div className="flex-1 h-px bg-warmgray-100" />
          <span className="text-warmgray-300 text-xs">or</span>
          <div className="flex-1 h-px bg-warmgray-100" />
        </div>

        {error && (
          <div className="bg-red-50 text-red-600 text-sm p-3 rounded-xl mb-4">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-3">
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full p-3.5 rounded-2xl border border-warmgray-200 focus:border-coral-400 focus:ring-2 focus:ring-coral-400/20 focus:outline-none text-warmgray-800 text-sm placeholder-warmgray-400 transition-all"
            required
          />
          <div className="relative">
            <input
              type={showPassword ? 'text' : 'password'}
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full p-3.5 pr-10 rounded-2xl border border-warmgray-200 focus:border-coral-400 focus:ring-2 focus:ring-coral-400/20 focus:outline-none text-warmgray-800 text-sm placeholder-warmgray-400 transition-all"
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
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                className="w-4 h-4 rounded border-warmgray-300 text-coral-500 focus:ring-coral-400"
              />
              <span className="text-xs text-warmgray-500">Remember me</span>
            </label>
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
      </div>
    </div>
  );
}
