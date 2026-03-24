'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Button from '@/components/ui/Button';
import { MealPlan, TasteProfile } from '@/lib/types';

interface SavedPlan {
  id: number;
  plan: MealPlan;
  tasteProfile: TasteProfile;
  createdAt: string;
}

const STORAGE_KEY = 'spoonfed-plans';

function loadPlans(): SavedPlan[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export default function PrepsPage() {
  const [plans, setPlans] = useState<SavedPlan[]>([]);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setPlans(loadPlans());
    setMounted(true);
  }, []);

  const handleDelete = (id: number) => {
    if (!confirm('Delete this prep?')) return;
    const updated = plans.filter((p) => p.id !== id);
    setPlans(updated);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  };

  if (!mounted) {
    return (
      <div className="min-h-screen bg-cream">
        <div className="max-w-4xl mx-auto px-4 py-12">
          <div className="animate-pulse space-y-4">
            <div className="h-8 bg-warmgray-200 rounded w-48" />
            <div className="h-32 bg-warmgray-100 rounded-xl" />
          </div>
        </div>
      </div>
    );
  }

  if (plans.length === 0) {
    return (
      <div className="min-h-screen bg-cream">
        <div className="max-w-4xl mx-auto px-4 py-12 text-center">
          <div className="text-4xl mb-4">📋</div>
          <h1 className="text-2xl font-bold text-warmgray-800 mb-4">
            No preps yet
          </h1>
          <p className="text-warmgray-500 mb-6">
            Take the quiz to generate your first plan!
          </p>
          <Link href="/">
            <Button>Take the quiz</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-cream">
      <div className="max-w-4xl mx-auto px-4 py-8 sm:py-12">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-warmgray-800">
              My Preps
            </h1>
            <p className="text-warmgray-500 mt-1 text-sm sm:text-base">
              Your saved meal prep plans.
            </p>
          </div>
          <Link href="/">
            <Button variant="secondary" size="sm">
              New plan
            </Button>
          </Link>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          {plans.map((saved) => (
            <div
              key={saved.id}
              className="bg-white rounded-2xl border border-warmgray-200 p-6 hover:border-coral-300 transition-colors"
            >
              <Link href={`/preps/${saved.id}`} className="block">
                <h2 className="text-lg font-semibold text-warmgray-800">
                  {saved.plan.planName}
                </h2>
                <p className="text-sm text-warmgray-400 mt-1">
                  {saved.plan.recipes?.length || 0} recipes ·{' '}
                  {new Date(saved.createdAt).toLocaleDateString()}
                </p>
              </Link>
              <button
                onClick={() => handleDelete(saved.id)}
                className="mt-3 text-sm text-warmgray-400 hover:text-red-500 transition-colors"
              >
                Delete
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
