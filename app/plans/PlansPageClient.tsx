'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import Button from '@/components/ui/Button';

interface Plan {
  id: string;
  plan_name: string;
  plan_data: { recipes: { id: string }[] };
  created_at: string;
}

export default function PlansPageClient({ plans }: { plans: Plan[] }) {
  const router = useRouter();
  const supabase = createClient();

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this plan?')) return;

    await supabase.from('meal_plans').delete().eq('id', id);
    router.refresh();
  };

  if (plans.length === 0) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-16 text-center">
        <div className="text-4xl mb-4">🍽️</div>
        <h1 className="text-xl font-semibold text-warmgray-800 mb-2">
          No saved plans yet
        </h1>
        <p className="text-warmgray-400 text-sm mb-6">
          Take the quiz to generate your first meal prep plan.
        </p>
        <Link href="/">
          <Button size="md">Take the quiz</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-12 sm:py-16">
      <h1 className="text-2xl font-bold text-warmgray-800 tracking-tight mb-6">
        Saved Plans
      </h1>
      <div className="space-y-3">
        {plans.map((plan) => (
          <Link
            key={plan.id}
            href={`/plan/${plan.id}`}
            className="group block bg-white rounded-2xl border border-warmgray-200/80 p-5 hover:border-warmgray-300 hover:shadow-sm transition-all duration-200"
          >
            <div className="flex items-center justify-between">
              <div className="min-w-0 flex-1">
                <h2 className="text-base font-semibold text-warmgray-800 group-hover:text-coral-600 transition-colors truncate">
                  {plan.plan_name}
                </h2>
                <p className="text-xs text-warmgray-400 mt-1">
                  {plan.plan_data.recipes?.length || 0} recipes
                  <span className="mx-1.5 text-warmgray-200">·</span>
                  {new Date(plan.created_at).toLocaleDateString('en-US', {
                    month: 'short',
                    day: 'numeric',
                    year: 'numeric',
                  })}
                </p>
              </div>
              <div className="flex items-center gap-2 ml-4">
                <button
                  onClick={(e) => {
                    e.preventDefault();
                    handleDelete(plan.id);
                  }}
                  className="p-1.5 rounded-lg text-warmgray-300 hover:text-red-400 hover:bg-red-50 transition-colors opacity-0 group-hover:opacity-100"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </button>
                <svg className="w-4 h-4 text-warmgray-300 group-hover:text-warmgray-400 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                </svg>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
