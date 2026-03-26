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
    <div className="bg-warmgray-50 rounded-2xl border border-warmgray-100 overflow-hidden transition-all duration-200 hover:border-warmgray-200">
      <div className="p-6 sm:p-8">
        <div className="flex justify-between items-start gap-3">
          <div className="flex-1 min-w-0">
            <h3 className="text-xl sm:text-2xl font-bold text-warmgray-800 leading-snug">
              {recipe.name}
            </h3>
            <p className="text-warmgray-500 text-sm mt-1.5 leading-relaxed">
              {recipe.description}
            </p>
            <div className="flex flex-wrap gap-x-3 gap-y-1.5 mt-3">
              <span className="text-xs text-warmgray-500 bg-warmgray-100/60 px-2.5 py-1 rounded-lg font-medium">
                {recipe.cuisine}
              </span>
              <span className="text-xs text-warmgray-500 bg-warmgray-100/60 px-2.5 py-1 rounded-lg font-medium inline-flex items-center gap-1">
                <svg className="w-3 h-3 text-warmgray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                {recipe.activeTime} active
              </span>
              <span className="text-xs text-warmgray-500 bg-warmgray-100/60 px-2.5 py-1 rounded-lg font-medium inline-flex items-center gap-1">
                <svg className="w-3 h-3 text-warmgray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                {recipe.totalTime} total
              </span>
            </div>
          </div>
          {onSwap && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                if (canSwap) {
                  onSwap(recipe.id);
                } else {
                  alert('Upgrade to Pro to swap recipes for new meals.');
                }
              }}
              loading={swapping}
              disabled={swapping}
              className="flex-shrink-0"
            >
              New meal ↻
            </Button>
          )}
        </div>

        <button
          onClick={() => setExpanded(!expanded)}
          className="mt-4 text-coral-500 text-sm font-semibold hover:text-coral-600 transition-colors flex items-center gap-1.5"
        >
          {expanded ? 'Hide details' : 'View recipe'}
          <svg
            className={`w-3.5 h-3.5 transition-transform duration-300 ease-out ${expanded ? 'rotate-180' : ''}`}
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2.5}
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
          </svg>
        </button>

        {expanded && (
          <div className="mt-5 space-y-5 animate-slideUp">
            {/* Ingredients */}
            <div>
              <h4 className="text-xs font-semibold text-warmgray-400 uppercase tracking-wider mb-2.5">
                Ingredients
              </h4>
              <ul className="space-y-1.5">
                {recipe.ingredients.map((ing, i) => (
                  <li key={i} className="text-sm text-warmgray-600 flex items-baseline gap-2">
                    <span className="w-1 h-1 rounded-full bg-coral-300 flex-shrink-0 mt-1.5" />
                    <span>
                      <span className="font-medium text-warmgray-700">
                        {ing.amount} {ing.unit}
                      </span>{' '}
                      {ing.item}
                      {ing.notes && (
                        <span className="text-warmgray-400"> · {ing.notes}</span>
                      )}
                    </span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Steps */}
            <div>
              <h4 className="text-xs font-semibold text-warmgray-400 uppercase tracking-wider mb-2.5">
                Steps
              </h4>
              <ol className="space-y-2.5">
                {recipe.steps.map((s, i) => (
                  <li key={i} className="text-sm text-warmgray-600 flex gap-3">
                    <span className="text-coral-400 font-semibold flex-shrink-0 w-5 text-right tabular-nums">
                      {i + 1}
                    </span>
                    <span className="leading-relaxed">{s}</span>
                  </li>
                ))}
              </ol>
            </div>

            {/* Storage */}
            <div className="bg-warmgray-50/80 rounded-xl p-4">
              <h4 className="text-xs font-semibold text-warmgray-400 uppercase tracking-wider mb-1.5">
                Storage & Reheating
              </h4>
              <p className="text-sm text-warmgray-600 leading-relaxed">{recipe.storage}</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
