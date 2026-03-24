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
      <div className="max-w-4xl mx-auto px-4 py-12 text-center">
        <h1 className="text-2xl font-bold text-warmgray-800 mb-4">
          No plans yet
        </h1>
        <p className="text-warmgray-500 mb-6">
          Take the quiz to generate your first meal prep plan!
        </p>
        <Link href="/">
          <Button>Take the quiz</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      <h1 className="text-2xl font-bold text-warmgray-800 mb-8">
        My Plans
      </h1>
      <div className="grid gap-4 sm:grid-cols-2">
        {plans.map((plan) => (
          <div
            key={plan.id}
            className="bg-white rounded-2xl border border-warmgray-200 p-6 hover:border-coral-300 transition-colors"
          >
            <Link href={`/plan/${plan.id}`} className="block">
              <h2 className="text-lg font-semibold text-warmgray-800">
                {plan.plan_name}
              </h2>
              <p className="text-sm text-warmgray-400 mt-1">
                {plan.plan_data.recipes?.length || 0} recipes ·{' '}
                {new Date(plan.created_at).toLocaleDateString()}
              </p>
            </Link>
            <button
              onClick={() => handleDelete(plan.id)}
              className="mt-3 text-sm text-warmgray-400 hover:text-red-500"
            >
              Delete
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
