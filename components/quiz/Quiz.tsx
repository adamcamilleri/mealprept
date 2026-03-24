'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { TasteProfile } from '@/lib/types';
import ChipGrid from './ChipGrid';
import QuizStep from './QuizStep';
import Button from '../ui/Button';
import Loading from '../ui/Loading';

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

export default function Quiz() {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [profile, setProfile] = useState<TasteProfile>({
    cuisines: [],
    proteins: [],
    effortLevel: 'medium',
    hardNos: [],
    prepDays: 5,
    servings: 2,
  });

  const updateProfile = (key: keyof TasteProfile, value: unknown) => {
    setProfile((prev) => ({ ...prev, [key]: value }));
  };

  const toggleArrayItem = (key: 'cuisines' | 'proteins' | 'hardNos', value: string) => {
    if (key === 'hardNos' && value === 'none') {
      updateProfile('hardNos', ['none']);
      return;
    }
    setProfile((prev) => {
      const arr = prev[key] as string[];
      // If selecting a real item, remove "none"
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
        return !!profile.effortLevel;
      case 3:
        return true; // optional
      case 4:
        return profile.prepDays > 0;
      case 5:
        return profile.servings > 0;
      default:
        return false;
    }
  };

  const handleGenerate = async () => {
    setLoading(true);
    try {
      // Generate plan
      const res = await fetch('/api/generate-plan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(profile),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || 'Failed to generate plan');
      }

      const plan = await res.json();

      // Store plan in sessionStorage for viewing without auth
      sessionStorage.setItem('generatedPlan', JSON.stringify(plan));
      sessionStorage.setItem('tasteProfile', JSON.stringify(profile));
      router.push('/plan/preview');
    } catch (err) {
      console.error(err);
      alert(err instanceof Error ? err.message : 'Something went wrong. Try again!');
    } finally {
      setLoading(false);
    }
  };

  const handleNext = () => {
    if (step === 5) {
      handleGenerate();
    } else {
      setStep((prev) => prev + 1);
    }
  };

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
    <QuizStep key={2} title="How much cooking effort this week?">
      <ChipGrid
        options={EFFORT_LEVELS}
        selected={[profile.effortLevel]}
        onToggle={(v) => updateProfile('effortLevel', v)}
        multiSelect={false}
      />
    </QuizStep>,
    <QuizStep key={3} title="Any ingredients you hate?" subtitle="Optional — skip if you eat everything">
      <ChipGrid
        options={HARD_NOS}
        selected={profile.hardNos.length === 0 ? [] : profile.hardNos}
        onToggle={(v) => toggleArrayItem('hardNos', v)}
      />
    </QuizStep>,
    <QuizStep key={4} title="How many days of meal prep?">
      <ChipGrid
        options={PREP_DAYS}
        selected={[String(profile.prepDays)]}
        onToggle={(v) => updateProfile('prepDays', parseInt(v))}
        multiSelect={false}
      />
    </QuizStep>,
    <QuizStep key={5} title="Servings per meal?">
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
            <span>Step {step + 1} of 6</span>
          </div>
          <div className="w-full h-2 bg-warmgray-100 rounded-full overflow-hidden">
            <div
              className="h-full bg-coral-500 rounded-full transition-all duration-500"
              style={{ width: `${((step + 1) / 6) * 100}%` }}
            />
          </div>
        </div>

        {/* Current step */}
        {steps[step]}

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
            {step === 5 ? 'Generate my plan ✨' : 'Next'}
          </Button>
        </div>
      </div>

    </>
  );
}
