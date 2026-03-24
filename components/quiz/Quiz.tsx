'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { TasteProfile } from '@/lib/types';
import ChipGrid from './ChipGrid';
import QuizStep from './QuizStep';
import TextInputStep from './TextInputStep';
import Button from '../ui/Button';
import Loading from '../ui/Loading';
import UpgradePrompt from '../ui/UpgradePrompt';

const HAS_GENERATED_KEY = 'spoonfed-has-generated';

const CUISINES = [
  { label: 'Mexican', emoji: '🌮', value: 'Mexican' },
  { label: 'Korean', emoji: '🍜', value: 'Korean' },
  { label: 'Italian', emoji: '🍝', value: 'Italian' },
  { label: 'Indian', emoji: '🍛', value: 'Indian' },
  { label: 'Thai', emoji: '🥘', value: 'Thai' },
  { label: 'Japanese', emoji: '🍣', value: 'Japanese' },
  { label: 'Comfort/American', emoji: '🍔', value: 'Comfort/American' },
  { label: 'Mediterranean', emoji: '🥗', value: 'Mediterranean' },
  { label: 'Chinese', emoji: '🥡', value: 'Chinese' },
  { label: 'Middle Eastern', emoji: '🧆', value: 'Middle Eastern' },
];

const PROTEINS = [
  { label: 'Chicken thighs', emoji: '🍗', value: 'Chicken thighs' },
  { label: 'Chicken breast', emoji: '🐔', value: 'Chicken breast' },
  { label: 'Ground beef', emoji: '🥩', value: 'Ground beef' },
  { label: 'Steak', emoji: '🥩', value: 'Steak' },
  { label: 'Salmon', emoji: '🐟', value: 'Salmon' },
  { label: 'Shrimp', emoji: '🦐', value: 'Shrimp' },
  { label: 'Tofu', emoji: '🫘', value: 'Tofu' },
  { label: 'Eggs', emoji: '🥚', value: 'Eggs' },
  { label: 'Pork', emoji: '🐖', value: 'Pork' },
  { label: 'Turkey', emoji: '🦃', value: 'Turkey' },
];

const EFFORT_LEVELS = [
  { label: '15 min max — keep it stupid simple', emoji: '⚡', value: 'quick' },
  { label: '30 min is fine', emoji: '🍳', value: 'medium' },
  { label: "I'll spend an hour if it's worth it", emoji: '👨‍🍳', value: 'involved' },
  { label: 'Slow cooker / set and forget', emoji: '🫕', value: 'slowcooker' },
];

const HARD_NOS = [
  { label: 'Mushrooms', value: 'Mushrooms' },
  { label: 'Olives', value: 'Olives' },
  { label: 'Cilantro', value: 'Cilantro' },
  { label: 'Spicy food', value: 'Spicy food' },
  { label: 'Seafood', value: 'Seafood' },
  { label: 'Dairy', value: 'Dairy' },
  { label: 'Gluten', value: 'Gluten' },
  { label: 'Nuts', value: 'Nuts' },
  { label: 'Bell peppers', value: 'Bell peppers' },
  { label: 'Onions', value: 'Onions' },
  { label: 'None — I eat everything', emoji: '✅', value: 'none' },
];

const MEAL_STYLES = [
  { label: 'Rice bowls', emoji: '🍚', value: 'Rice bowls' },
  { label: 'Burrito / wraps', emoji: '🌯', value: 'Burritos/wraps' },
  { label: 'Noodle bowls', emoji: '🍜', value: 'Noodle bowls' },
  { label: 'Pasta dishes', emoji: '🍝', value: 'Pasta dishes' },
  { label: 'Stir fry', emoji: '🥘', value: 'Stir fry' },
  { label: 'Sheet pan meals', emoji: '🍳', value: 'Sheet pan meals' },
  { label: 'Salad bowls', emoji: '🥗', value: 'Salad bowls' },
  { label: 'Sandwiches', emoji: '🥪', value: 'Sandwiches' },
  { label: 'Soups / stews', emoji: '🍲', value: 'Soups/stews' },
  { label: 'Tacos', emoji: '🌮', value: 'Tacos' },
  { label: 'Curry + rice', emoji: '🍛', value: 'Curry with rice' },
  { label: 'One-pot meals', emoji: '🫕', value: 'One-pot meals' },
  { label: 'No preference', emoji: '✨', value: 'none' },
];

const PREP_DAYS = [
  { label: '3 days', value: '3' },
  { label: '4 days', value: '4' },
  { label: '5 days', value: '5' },
];

const SERVINGS = [
  { label: '1', value: '1' },
  { label: '2', value: '2' },
  { label: '3', value: '3' },
  { label: '4', value: '4' },
];

const TOTAL_STEPS = 9;

export default function Quiz() {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showUpgradeGate, setShowUpgradeGate] = useState(false);
  const [profile, setProfile] = useState<TasteProfile>({
    cuisines: [],
    proteins: [],
    favoriteDishes: '',
    effortLevel: 'medium',
    leastFavorites: '',
    mealStyles: [],
    hardNos: [],
    prepDays: 5,
    servings: 2,
  });

  const updateProfile = (key: keyof TasteProfile, value: unknown) => {
    setProfile((prev) => ({ ...prev, [key]: value }));
  };

  const toggleArrayItem = (key: 'cuisines' | 'proteins' | 'hardNos' | 'mealStyles', value: string) => {
    if ((key === 'hardNos' || key === 'mealStyles') && value === 'none') {
      updateProfile(key, ['none']);
      return;
    }
    setProfile((prev) => {
      const arr = prev[key] as string[];
      const filtered = arr.filter((v) => v !== 'none');
      if (filtered.includes(value)) {
        return { ...prev, [key]: filtered.filter((v) => v !== value) };
      }
      return { ...prev, [key]: [...filtered, value] };
    });
  };

  const canProceed = () => {
    switch (step) {
      case 0:
        return profile.cuisines.length > 0;
      case 1:
        return profile.proteins.length > 0;
      case 2:
        return true;
      case 3:
        return true;
      case 4:
        return !!profile.effortLevel;
      case 5:
        return true;
      case 6:
        return true;
      case 7:
        return profile.prepDays > 0;
      case 8:
        return profile.servings > 0;
      default:
        return false;
    }
  };

  const handleGenerate = async () => {
    // Check if this is a second+ generation — gate behind Pro
    const hasGenerated = localStorage.getItem(HAS_GENERATED_KEY);
    if (hasGenerated) {
      try {
        const res = await fetch('/api/check-subscription');
        const data = await res.json();
        if (!data.isPro) {
          // Not Pro — show upgrade prompt
          setShowUpgradeGate(true);
          return;
        }
      } catch {
        // If check fails, let them through
      }
    }

    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/generate-plan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(profile),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({ error: `Server error (${res.status})` }));
        throw new Error(err.error || err.message || `Failed to generate plan (${res.status})`);
      }

      const plan = await res.json();

      // Mark that user has generated a plan (only after success)
      localStorage.setItem(HAS_GENERATED_KEY, 'true');

      // Store plan in sessionStorage for viewing
      sessionStorage.setItem('generatedPlan', JSON.stringify(plan));
      sessionStorage.setItem('tasteProfile', JSON.stringify(profile));

      // Also save to localStorage for My Preps
      try {
        const savedPlans = JSON.parse(localStorage.getItem('spoonfed-plans') || '[]');
        savedPlans.unshift({
          id: Date.now(),
          plan,
          tasteProfile: profile,
          createdAt: new Date().toISOString(),
        });
        localStorage.setItem('spoonfed-plans', JSON.stringify(savedPlans));
      } catch (e) {
        console.error('Failed to save plan to localStorage', e);
      }

      router.push('/plan/preview');
    } catch (err) {
      console.error(err);
      setError(err instanceof Error ? err.message : 'Something went wrong. Try again!');
    } finally {
      setLoading(false);
    }
  };

  const handleNext = () => {
    if (step === TOTAL_STEPS - 1) {
      handleGenerate();
    } else {
      setStep((prev) => prev + 1);
    }
  };

  // Upgrade gate — shown at the generate step, not on page load
  if (showUpgradeGate) {
    return (
      <div className="max-w-2xl mx-auto space-y-6">
        <div className="text-center mb-4">
          <div className="text-4xl mb-4">🍽️</div>
          <h3 className="text-xl font-semibold text-warmgray-800 mb-2">
            Loved your first plan?
          </h3>
          <p className="text-warmgray-500">
            Upgrade to Pro to generate unlimited meal plans, swap recipes, and more.
          </p>
        </div>
        <UpgradePrompt feature="Generating additional plans" />
        <div className="text-center">
          <button
            onClick={() => setShowUpgradeGate(false)}
            className="text-sm text-warmgray-400 hover:text-warmgray-600 transition-colors"
          >
            Back to quiz
          </button>
        </div>
      </div>
    );
  }

  if (loading) {
    return <Loading />;
  }

  const steps = [
    <QuizStep key={0} title="What cuisines do you love?" subtitle="Pick at least 1">
      <ChipGrid
        options={CUISINES}
        selected={profile.cuisines}
        onToggle={(v) => toggleArrayItem('cuisines', v)}
      />
    </QuizStep>,
    <QuizStep key={1} title="Pick your go-to proteins" subtitle="Pick at least 1">
      <ChipGrid
        options={PROTEINS}
        selected={profile.proteins}
        onToggle={(v) => toggleArrayItem('proteins', v)}
      />
    </QuizStep>,
    <QuizStep key={2} title="What meal styles do you prefer?" subtitle="Pick your favorites - we'll build about half your plan around these">
      <ChipGrid
        options={MEAL_STYLES}
        selected={profile.mealStyles || []}
        onToggle={(v) => toggleArrayItem('mealStyles', v)}
      />
    </QuizStep>,
    <QuizStep key={3} title="Any favorite dishes or foods you love?" subtitle="We'll include similar flavors in your plan">
      <TextInputStep
        value={profile.favoriteDishes || ''}
        onChange={(v) => updateProfile('favoriteDishes', v)}
        placeholder="e.g. butter chicken, pad thai, burrito bowls, carbonara..."
        skipLabel="Skip — surprise me!"
        onSkip={() => setStep((prev) => prev + 1)}
      />
    </QuizStep>,
    <QuizStep key={4} title="How much cooking effort this week?">
      <ChipGrid
        options={EFFORT_LEVELS}
        selected={[profile.effortLevel]}
        onToggle={(v) => updateProfile('effortLevel', v)}
        multiSelect={false}
      />
    </QuizStep>,
    <QuizStep key={5} title="Any foods you're just not a fan of?" subtitle="We'll steer clear of these">
      <TextInputStep
        value={profile.leastFavorites || ''}
        onChange={(v) => updateProfile('leastFavorites', v)}
        placeholder="e.g. eggplant, liver, tofu, cold soups..."
        skipLabel="Nope, I like everything"
        onSkip={() => setStep((prev) => prev + 1)}
      />
    </QuizStep>,
    <QuizStep key={6} title="Any ingredients you hate?" subtitle="Optional — skip if you eat everything">
      <ChipGrid
        options={HARD_NOS}
        selected={profile.hardNos.length === 0 ? [] : profile.hardNos}
        onToggle={(v) => toggleArrayItem('hardNos', v)}
      />
    </QuizStep>,
    <QuizStep key={7} title="How many days of meal prep?">
      <ChipGrid
        options={PREP_DAYS}
        selected={[String(profile.prepDays)]}
        onToggle={(v) => updateProfile('prepDays', parseInt(v))}
        multiSelect={false}
      />
    </QuizStep>,
    <QuizStep key={8} title="Servings per meal?">
      <ChipGrid
        options={SERVINGS}
        selected={[String(profile.servings)]}
        onToggle={(v) => updateProfile('servings', parseInt(v))}
        multiSelect={false}
      />
    </QuizStep>,
  ];

  return (
    <>
      <div className="max-w-2xl mx-auto">
        {/* Progress bar */}
        <div className="mb-8">
          <div className="flex justify-between text-sm text-warmgray-400 mb-2">
            <span>Step {step + 1} of {TOTAL_STEPS}</span>
          </div>
          <div className="w-full h-2 bg-warmgray-100 rounded-full overflow-hidden">
            <div
              className="h-full bg-coral-500 rounded-full transition-all duration-500"
              style={{ width: `${((step + 1) / TOTAL_STEPS) * 100}%` }}
            />
          </div>
        </div>

        {/* Current step */}
        {steps[step]}

        {/* Error display */}
        {error && (
          <div className="mt-4 bg-red-50 border border-red-200 rounded-xl p-4 text-sm text-red-600 animate-fadeIn">
            {error}
          </div>
        )}

        {/* Navigation */}
        <div className="flex justify-between mt-8">
          {step > 0 ? (
            <Button variant="ghost" onClick={() => setStep((prev) => prev - 1)}>
              Back
            </Button>
          ) : (
            <div />
          )}
          <Button
            onClick={handleNext}
            disabled={!canProceed()}
            size="lg"
          >
            {step === TOTAL_STEPS - 1 ? 'Generate my plan ✨' : 'Next'}
          </Button>
        </div>
      </div>
    </>
  );
}
