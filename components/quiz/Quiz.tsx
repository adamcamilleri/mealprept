'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { TasteProfile } from '@/lib/types';
import ChipGrid from './ChipGrid';
import QuizStep from './QuizStep';
import Button from '../ui/Button';
import Loading from '../ui/Loading';
import UpgradePrompt from '../ui/UpgradePrompt';

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

const MEAL_TYPES = [
  { label: 'Breakfast', emoji: '🌅', value: 'breakfast' },
  { label: 'Lunch', emoji: '🥪', value: 'lunch' },
  { label: 'Dinner', emoji: '🌙', value: 'dinner' },
  { label: 'Mix it up', emoji: '🎲', value: 'mix' },
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
  { label: '15 min max, keep it stupid simple', emoji: '⚡', value: 'quick' },
  { label: '30 min is fine', emoji: '🍳', value: 'medium' },
  { label: "I'll spend an hour if it's worth it", emoji: '👨‍🍳', value: 'involved' },
  { label: 'Slow cooker / set and forget', emoji: '🫕', value: 'slowcooker' },
];

const ALLERGIES = [
  { label: 'Dairy-free', emoji: '🥛', value: 'Dairy' },
  { label: 'Gluten-free', emoji: '🌾', value: 'Gluten' },
  { label: 'Nut-free', emoji: '🥜', value: 'Nuts' },
  { label: 'Shellfish-free', emoji: '🦐', value: 'Shellfish' },
  { label: 'Soy-free', emoji: '🫘', value: 'Soy' },
  { label: 'Egg-free', emoji: '🥚', value: 'Eggs' },
  { label: 'None', emoji: '✅', value: 'none' },
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

const TOTAL_STEPS = 7;

const EFFORT_LABELS: Record<string, string> = {
  quick: '15 min max',
  medium: '30 min',
  involved: 'Up to an hour',
  slowcooker: 'Slow cooker',
};

const MEAL_TYPE_LABELS: Record<string, string> = {
  breakfast: 'Breakfast',
  lunch: 'Lunch',
  dinner: 'Dinner',
  mix: 'Mix it up',
};

interface QuizProps {
  darkMode?: boolean;
}

export default function Quiz({ darkMode = false }: QuizProps) {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showUpgradeGate, setShowUpgradeGate] = useState(false);
  const [upgradeMessage, setUpgradeMessage] = useState('');
  const [hardNosText, setHardNosText] = useState('');
  const [fridgeOnly, setFridgeOnly] = useState(false);
  const [fridgeItems, setFridgeItems] = useState<string[]>([]);
  const [hasFridgeItems, setHasFridgeItems] = useState(false);

  // Check if user has fridge items on mount
  useEffect(() => {
    fetch('/api/fridge')
      .then(r => r.ok ? r.json() : [])
      .then((items: { name: string }[]) => {
        if (items.length > 0) {
          setHasFridgeItems(true);
          setFridgeItems(items.map(i => i.name));
        }
      })
      .catch(() => {});
  }, []);
  const [profile, setProfile] = useState<TasteProfile>({
    cuisines: [],
    mealType: undefined,
    proteins: [],
    effortLevel: '',
    hardNos: [],
    prepDays: 0,
    servings: 0,
  });

  const updateProfile = (key: keyof TasteProfile, value: unknown) => {
    setProfile((prev) => ({ ...prev, [key]: value }));
  };

  const toggleArrayItem = (key: 'cuisines' | 'proteins' | 'hardNos', value: string) => {
    if (key === 'hardNos' && value === 'none') {
      updateProfile(key, ['none']);
      setHardNosText('');
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
      case 0: return !!profile.mealType;
      case 1: return profile.cuisines.length > 0;
      case 2: return profile.proteins.length > 0;
      case 3: return !!profile.effortLevel;
      case 4: return true; // allergies + hard nos are optional
      case 5: return profile.prepDays > 0;
      case 6: return profile.servings > 0;
      default: return false;
    }
  };

  const getFullHardNos = (): string[] => {
    const allergies = profile.hardNos.filter((v) => v !== 'none');
    const typed = hardNosText
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean);
    return [...allergies, ...typed];
  };

  const handleGenerate = async () => {
    setLoading(true);
    setError(null);
    try {
      const submitProfile = {
        ...profile,
        hardNos: getFullHardNos(),
        ...(fridgeOnly ? { fridgeOnly: true, availableIngredients: fridgeItems } : {}),
      };

      const res = await fetch('/api/generate-plan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(submitProfile),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({ error: `Server error (${res.status})` }));
        if (res.status === 403 && err.error === 'free_limit_reached') {
          setUpgradeMessage(err.message);
          setShowUpgradeGate(true);
          setLoading(false);
          return;
        }
        throw new Error(err.error || err.message || `Failed to generate plan (${res.status})`);
      }

      const plan = await res.json();
      sessionStorage.setItem('generatedPlan', JSON.stringify(plan));
      sessionStorage.setItem('tasteProfile', JSON.stringify(submitProfile));
      // Don't setLoading(false) here - keep showing loading until navigation completes
      router.push('/plan/preview');
    } catch (err) {
      console.error(err);
      setError(err instanceof Error ? err.message : 'Something went wrong. Try again!');
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

  if (showUpgradeGate) {
    return (
      <div className="max-w-2xl mx-auto space-y-6">
        <div className="text-center mb-4">
          <div className="text-4xl mb-4">🍽️</div>
          <h3 className="text-xl font-semibold text-warmgray-800 mb-2">
            You&apos;re out of free plans
          </h3>
          <p className="text-warmgray-500 text-sm">
            {upgradeMessage || 'Upgrade to Pro for unlimited meal plans, recipe swaps, and more.'}
          </p>
        </div>
        <UpgradePrompt feature="Unlimited plan generation" />
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

  const mutedColor = darkMode ? 'text-navy-200' : 'text-warmgray-400';

  const steps = [
    // Step 0: Meal type
    <QuizStep key={0} title="What meal are you planning?" subtitle="Pick one">
      <ChipGrid
        options={MEAL_TYPES}
        selected={profile.mealType ? [profile.mealType] : []}
        onToggle={(v) => updateProfile('mealType', v)}
        multiSelect={false}
      />
      {hasFridgeItems && (
        <div className="mt-6 pt-6 border-t border-warmgray-200">
          <button
            onClick={() => setFridgeOnly(!fridgeOnly)}
            className={`w-full flex items-center justify-between p-4 rounded-2xl border-2 transition-all duration-200 ${
              fridgeOnly
                ? 'border-navy-500 bg-navy-50'
                : 'border-warmgray-200 bg-white hover:border-warmgray-300'
            }`}
          >
            <div className="flex items-center gap-3">
              <span className="text-2xl">🧊</span>
              <div className="text-left">
                <p className={`text-sm font-semibold ${fridgeOnly ? 'text-navy-700' : 'text-warmgray-700'}`}>
                  Only use what I have
                </p>
                <p className="text-xs text-warmgray-400">
                  Build recipes from your {fridgeItems.length} fridge & pantry items
                </p>
              </div>
            </div>
            <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all ${
              fridgeOnly ? 'border-navy-500 bg-navy-500' : 'border-warmgray-300'
            }`}>
              {fridgeOnly && (
                <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
              )}
            </div>
          </button>
        </div>
      )}
    </QuizStep>,

    // Step 1: Cuisines
    <QuizStep key={1} title="What cuisines do you love?" subtitle="Pick at least 1">
      <ChipGrid
        options={CUISINES}
        selected={profile.cuisines}
        onToggle={(v) => toggleArrayItem('cuisines', v)}
      />
    </QuizStep>,

    // Step 2: Proteins
    <QuizStep key={2} title="Pick your go-to proteins" subtitle="Pick at least 1">
      <ChipGrid
        options={PROTEINS}
        selected={profile.proteins}
        onToggle={(v) => toggleArrayItem('proteins', v)}
      />
    </QuizStep>,

    // Step 3: Effort
    <QuizStep key={3} title="How much cooking effort this week?">
      <ChipGrid
        options={EFFORT_LEVELS}
        selected={[profile.effortLevel]}
        onToggle={(v) => updateProfile('effortLevel', v)}
        multiSelect={false}
      />
    </QuizStep>,

    // Step 4: Allergies + Hard nos (combined)
    <QuizStep key={4} title="Allergies or ingredients to avoid?" subtitle="Optional - skip if you eat everything">
      <div className="space-y-6">
        <div>
          <p className={`text-sm font-medium ${mutedColor} mb-3`}>Common allergies</p>
          <ChipGrid
            options={ALLERGIES}
            selected={profile.hardNos.length === 0 ? [] : profile.hardNos}
            onToggle={(v) => toggleArrayItem('hardNos', v)}
          />
        </div>
        <div>
          <p className={`text-sm font-medium ${mutedColor} mb-3`}>Anything else you hate?</p>
          <textarea
            value={hardNosText}
            onChange={(e) => {
              setHardNosText(e.target.value);
              // Clear 'none' if they start typing
              if (e.target.value && profile.hardNos.includes('none')) {
                updateProfile('hardNos', []);
              }
            }}
            placeholder="e.g. mushrooms, olives, cilantro, eggplant, liver..."
            className={`w-full p-4 rounded-2xl border-2 focus:outline-none min-h-[80px] resize-none text-sm ${
              darkMode
                ? 'border-navy-400/30 focus:border-coral-400 text-white bg-navy-400/20 placeholder-navy-300'
                : 'border-warmgray-200 focus:border-navy-400 text-warmgray-800 bg-white'
            }`}
            rows={3}
          />
        </div>
      </div>
    </QuizStep>,

    // Step 5: Prep days
    <QuizStep key={5} title="How many days of meal prep?">
      <ChipGrid
        options={PREP_DAYS}
        selected={[String(profile.prepDays)]}
        onToggle={(v) => updateProfile('prepDays', parseInt(v))}
        multiSelect={false}
      />
    </QuizStep>,

    // Step 6: Servings
    <QuizStep key={6} title="Servings per meal?">
      <ChipGrid
        options={SERVINGS}
        selected={[String(profile.servings)]}
        onToggle={(v) => updateProfile('servings', parseInt(v))}
        multiSelect={false}
      />
    </QuizStep>,
  ];

  const sidebarItems = [
    { label: 'Meal', value: profile.mealType ? MEAL_TYPE_LABELS[profile.mealType] || profile.mealType : null },
    { label: 'Cuisines', value: profile.cuisines.length > 0 ? profile.cuisines.join(', ') : null },
    { label: 'Proteins', value: profile.proteins.length > 0 ? profile.proteins.join(', ') : null },
    { label: 'Effort', value: profile.effortLevel ? EFFORT_LABELS[profile.effortLevel] || profile.effortLevel : null },
    { label: 'Avoid', value: (() => {
      const items = [...profile.hardNos.filter(v => v !== 'none'), ...hardNosText.split(',').map(s => s.trim()).filter(Boolean)];
      return items.length > 0 ? items.join(', ') : null;
    })() },
    { label: 'Days', value: profile.prepDays > 0 ? `${profile.prepDays} days` : null },
    { label: 'Servings', value: profile.servings > 0 ? `${profile.servings} per meal` : null },
  ];

  // Only show picks for steps already passed
  const picksByStep = [
    sidebarItems[0], // step 0: meal type
    sidebarItems[1], // step 1: cuisines
    sidebarItems[2], // step 2: proteins
    sidebarItems[3], // step 3: effort
    sidebarItems[4], // step 4: avoid
    sidebarItems[5], // step 5: days
    sidebarItems[6], // step 6: servings
  ];
  const filledPicks = picksByStep.slice(0, step).filter(item => item.value);

  return (
    <div className="max-w-2xl mx-auto">
      {/* Progress bar */}
      <div className="mb-10">
        <div className="flex justify-between text-sm text-warmgray-400 mb-3">
          <span className="font-medium">Step {step + 1} of {TOTAL_STEPS}</span>
        </div>
        <div className="w-full h-1.5 bg-warmgray-800/10 rounded-full overflow-hidden">
          <div
            className="h-full bg-navy-500 rounded-full transition-all duration-500 ease-out"
            style={{ width: `${((step + 1) / TOTAL_STEPS) * 100}%` }}
          />
        </div>
      </div>

      {/* Your picks - compact horizontal bar */}
      {filledPicks.length > 0 && (
        <div className="mb-8 flex flex-wrap gap-2">
          {filledPicks.map((item) => (
            <span
              key={item.label}
              className="inline-flex items-center gap-1.5 text-xs bg-navy-50 text-navy-500 px-3 py-1.5 rounded-full font-medium"
            >
              <span className="text-navy-300">{item.label}:</span> {item.value}
            </span>
          ))}
        </div>
      )}

      {/* Current step */}
      <div key={step} className="animate-stepFade">
        {steps[step]}
      </div>

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
  );
}
