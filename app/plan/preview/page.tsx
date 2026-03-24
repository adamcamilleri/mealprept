'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import PlanView from '@/components/plan/PlanView';
import Button from '@/components/ui/Button';
import AuthModal from '@/components/quiz/AuthModal';
import { MealPlan, TasteProfile } from '@/lib/types';
import { createClient } from '@/lib/supabase/client';

export default function PreviewPage() {
  const router = useRouter();
  const [plan, setPlan] = useState<MealPlan | null>(null);
  const [profile, setProfile] = useState<TasteProfile | undefined>();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [showAuth, setShowAuth] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    const planData = sessionStorage.getItem('generatedPlan');
    const profileData = sessionStorage.getItem('tasteProfile');

    if (!planData) {
      router.push('/');
      return;
    }

    const parsed = JSON.parse(planData);
    setPlan({
      planName: parsed.planName,
      recipes: parsed.recipes,
      groceryList: parsed.groceryList,
      prepOrder: parsed.prepOrder,
    });

    if (profileData) {
      setProfile(JSON.parse(profileData));
    }

    // Check auth status and listen for changes
    const supabase = createClient();
    supabase.auth.getUser().then(({ data: { user } }) => {
      setIsAuthenticated(!!user);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setIsAuthenticated(!!session?.user);
      }
    );

    return () => subscription.unsubscribe();
  }, [router]);

  const handleSavePlan = async () => {
    if (!isAuthenticated) {
      setShowAuth(true);
      return;
    }

    setSaving(true);
    try {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user || !plan) return;

      // Save taste profile
      const { data: profileData } = await supabase
        .from('taste_profiles')
        .insert({
          user_id: user.id,
          cuisines: profile?.cuisines || [],
          proteins: profile?.proteins || [],
          effort_level: profile?.effortLevel || 'medium',
          hard_nos: profile?.hardNos || [],
          prep_days: profile?.prepDays || 5,
          servings: profile?.servings || 2,
        })
        .select('id')
        .single();

      // Save meal plan
      await supabase.from('meal_plans').insert({
        user_id: user.id,
        profile_id: profileData?.id,
        plan_name: plan.planName,
        plan_data: {
          recipes: plan.recipes,
          groceryList: plan.groceryList,
          prepOrder: plan.prepOrder,
        },
      });

      setSaved(true);
    } catch (err) {
      console.error('Failed to save plan:', err);
      alert('Failed to save plan. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  if (!plan) {
    return null;
  }

  return (
    <div className="min-h-screen bg-cream">
      <div className="max-w-3xl mx-auto px-4 py-8">
        {/* Navigation */}
        <div className="flex items-center gap-4 mb-6">
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 text-sm text-warmgray-500 hover:text-warmgray-800 transition-colors"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
            </svg>
            Back to quiz
          </Link>
        </div>

        <PlanView plan={plan} profile={profile} isPro={false} isAuthenticated={isAuthenticated} />

        {/* Post-plan actions */}
        <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4">
          {saved ? (
            <Link href="/plans">
              <Button variant="primary">View Saved Plans</Button>
            </Link>
          ) : (
            <Button
              variant="primary"
              onClick={handleSavePlan}
              loading={saving}
            >
              {isAuthenticated ? 'Save this plan' : 'Sign in to save'}
            </Button>
          )}
          <Link href="/preps">
            <Button variant="secondary">View My Preps</Button>
          </Link>
        </div>
      </div>

      {/* Auth modal */}
      {showAuth && (
        <AuthModal
          onClose={() => setShowAuth(false)}
          onSuccess={() => {
            setShowAuth(false);
            setIsAuthenticated(true);
          }}
        />
      )}
    </div>
  );
}
