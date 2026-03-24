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
  onRegenerate?: () => void;
  regenerating?: boolean;
}

export default function PlanView({
  plan,
  profile,
  isPro = false,
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
    <div className="max-w-3xl mx-auto space-y-8">
      {/* Header */}
      <div className="text-center">
        <h1 className="text-3xl font-bold text-warmgray-800">{plan.planName}</h1>
        <p className="text-warmgray-500 mt-2">
          {recipes.length} recipes · {recipes[0]?.servings} servings each · one
          grocery run
        </p>
        {onRegenerate && (
          <Button
            variant="secondary"
            className="mt-4"
            onClick={onRegenerate}
            loading={regenerating}
          >
            Regenerate entire plan
          </Button>
        )}
      </div>

      {/* Recipes */}
      <div className="space-y-4">
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
      <GroceryList groceryList={groceryList} />

      {/* Prep Order */}
      <div className="bg-white rounded-2xl border border-warmgray-200 p-6">
        <h2 className="text-xl font-semibold text-warmgray-800 mb-3">
          Prep Day Order
        </h2>
        <p className="text-warmgray-600 leading-relaxed">{plan.prepOrder}</p>
      </div>

      {/* Upgrade prompt */}
      {showUpgrade && (
        <UpgradePrompt feature="Recipe swapping" />
      )}
    </div>
  );
}
