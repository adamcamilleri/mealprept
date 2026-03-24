'use client';

import { useState } from 'react';
import { Recipe } from '@/lib/types';
import Button from '../ui/Button';

interface RecipeCardProps {
  recipe: Recipe;
  onSwap?: (recipeId: string) => void;
  swapping?: boolean;
  canSwap?: boolean;
}

export default function RecipeCard({
  recipe,
  onSwap,
  swapping = false,
  canSwap = true,
}: RecipeCardProps) {
  const [expanded, setExpanded] = useState(false);

  return (
    <div className="bg-white rounded-2xl border border-warmgray-200 overflow-hidden">
      <div className="p-6">
        <div className="flex justify-between items-start gap-4">
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-warmgray-800">
              {recipe.name}
            </h3>
            <p className="text-warmgray-500 mt-1">{recipe.description}</p>
            <div className="flex gap-4 mt-3 text-sm text-warmgray-400">
              <span>{recipe.cuisine}</span>
              <span>Active: {recipe.activeTime}</span>
              <span>Total: {recipe.totalTime}</span>
            </div>
          </div>
          {canSwap && onSwap && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onSwap(recipe.id)}
              loading={swapping}
              disabled={swapping}
            >
              Swap ↻
            </Button>
          )}
        </div>

        <button
          onClick={() => setExpanded(!expanded)}
          className="mt-4 text-coral-600 text-sm font-medium hover:text-coral-700"
        >
          {expanded ? 'Hide details ▲' : 'Show details ▼'}
        </button>

        {expanded && (
          <div className="mt-4 space-y-4 animate-fadeIn">
            <div>
              <h4 className="font-semibold text-warmgray-700 text-sm mb-2">
                Ingredients
              </h4>
              <ul className="space-y-1">
                {recipe.ingredients.map((ing, i) => (
                  <li key={i} className="text-sm text-warmgray-600">
                    {ing.amount} {ing.unit} {ing.item}
                    {ing.notes && (
                      <span className="text-warmgray-400"> ({ing.notes})</span>
                    )}
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <h4 className="font-semibold text-warmgray-700 text-sm mb-2">
                Steps
              </h4>
              <ol className="space-y-2">
                {recipe.steps.map((s, i) => (
                  <li key={i} className="text-sm text-warmgray-600 flex gap-2">
                    <span className="text-coral-500 font-semibold flex-shrink-0">
                      {i + 1}.
                    </span>
                    {s}
                  </li>
                ))}
              </ol>
            </div>

            <div className="bg-warmgray-50 rounded-xl p-3">
              <h4 className="font-semibold text-warmgray-700 text-sm mb-1">
                Storage & Reheating
              </h4>
              <p className="text-sm text-warmgray-600">{recipe.storage}</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
