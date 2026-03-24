'use client';

import { useState } from 'react';
import { MealPlan, TasteProfile } from '@/lib/types';
import RecipeCard from './RecipeCard';
import GroceryList from './GroceryList';
import Button from '../ui/Button';
import UpgradePrompt from '../ui/UpgradePrompt';

interface PlanViewProps {
  plan: MealPlan;
  profile?: TasteProfile;
  isPro?: boolean;
  isAuthenticated?: boolean;
  onRegenerate?: () => void;
  regenerating?: boolean;
}

export default function PlanView({
  plan,
  profile,
  isPro = false,
  isAuthenticated = false,
  onRegenerate,
  regenerating = false,
}: PlanViewProps) {
  const [recipes, setRecipes] = useState(plan.recipes);
  const [groceryList, setGroceryList] = useState(plan.groceryList);
  const [swappingId, setSwappingId] = useState<string | null>(null);
  const [showUpgrade, setShowUpgrade] = useState(false);

  const handleSwap = async (recipeId: string) => {
    if (!isPro) {
      setShowUpgrade(true);
      return;
    }
    if (!profile) return;

    setSwappingId(recipeId);
    try {
      const recipeToReplace = recipes.find((r) => r.id === recipeId);
      if (!recipeToReplace) return;

      const res = await fetch('/api/swap-recipe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          existingRecipes: recipes.filter((r) => r.id !== recipeId),
          recipeToReplace: recipeToReplace.name,
          profile,
        }),
      });

      if (!res.ok) throw new Error('Failed to swap recipe');

      const data = await res.json();
      const newRecipe = data.recipes[0];
      newRecipe.id = recipeId;

      setRecipes((prev) =>
        prev.map((r) => (r.id === recipeId ? newRecipe : r))
      );
      setGroceryList(data.groceryList);
    } catch (err) {
      console.error(err);
      alert('Failed to swap recipe. Try again!');
    } finally {
      setSwappingId(null);
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Header */}
      <div className="text-center animate-fadeIn">
        <h1 className="text-2xl sm:text-3xl font-bold text-warmgray-800 tracking-tight">
          {plan.planName}
        </h1>
        <p className="text-warmgray-400 text-sm mt-2">
          {recipes.length} recipes
          <span className="mx-1.5 text-warmgray-200">·</span>
          {recipes[0]?.servings} servings each
          <span className="mx-1.5 text-warmgray-200">·</span>
          one grocery run
        </p>
        {onRegenerate && (
          <Button
            variant="secondary"
            size="sm"
            className="mt-4"
            onClick={onRegenerate}
            loading={regenerating}
          >
            Regenerate plan
          </Button>
        )}
      </div>

      {/* Recipes */}
      <div className="space-y-3">
        {recipes.map((recipe) => (
          <RecipeCard
            key={recipe.id}
            recipe={recipe}
            onSwap={handleSwap}
            swapping={swappingId === recipe.id}
            canSwap={isPro}
          />
        ))}
      </div>

      {/* Grocery List */}
      <GroceryList groceryList={groceryList} isAuthenticated={isAuthenticated} />

      {/* Prep Order */}
      <div className="bg-white rounded-2xl border border-warmgray-200/80 p-5 sm:p-6">
        <h2 className="text-xs font-semibold text-warmgray-400 uppercase tracking-wider mb-3">
          Prep Day Order
        </h2>
        <p className="text-warmgray-600 text-sm leading-relaxed">{plan.prepOrder}</p>
      </div>

      {/* Upgrade prompt */}
      {showUpgrade && (
        <UpgradePrompt feature="Recipe swapping" />
      )}
    </div>
  );
}
