'use client';

import { useState, useEffect } from 'react';
import { GroceryCategory } from '@/lib/types';
import { FridgeItem } from '@/lib/fridge-data';
import Button from '../ui/Button';

const FRIDGE_STORAGE_KEY = 'mealprept-fridge';

interface GroceryListProps {
  groceryList: GroceryCategory[];
}

function loadFridgeItems(): FridgeItem[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(FRIDGE_STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function fuzzyMatchFridge(groceryItemName: string, fridgeItems: FridgeItem[]): FridgeItem | null {
  const normalized = groceryItemName.toLowerCase().trim();
  for (const fi of fridgeItems) {
    const fridgeName = fi.name.toLowerCase().trim();
    if (fridgeName === normalized) return fi;
    if (normalized.includes(fridgeName) || fridgeName.includes(normalized)) return fi;
    // Check individual words for partial matches (e.g. "chicken" matches "chicken breast")
    const groceryWords = normalized.split(/\s+/);
    const fridgeWords = fridgeName.split(/\s+/);
    const hasOverlap = groceryWords.some(
      (gw) => gw.length > 2 && fridgeWords.some((fw) => fw.length > 2 && (gw.includes(fw) || fw.includes(gw)))
    );
    if (hasOverlap) return fi;
  }
  return null;
}

export default function GroceryList({ groceryList }: GroceryListProps) {
  const [checked, setChecked] = useState<Set<string>>(new Set());
  const [fridgeMatches, setFridgeMatches] = useState<Set<string>>(new Set());

  useEffect(() => {
    const items = loadFridgeItems();

    // Pre-check items that are already in the fridge
    const matches = new Set<string>();
    const preChecked = new Set<string>();
    for (const category of groceryList) {
      for (const item of category.items) {
        const itemKey = `${category.category}-${item.item}`;
        const match = fuzzyMatchFridge(item.item, items);
        if (match) {
          matches.add(itemKey);
          preChecked.add(itemKey);
        }
      }
    }
    setFridgeMatches(matches);
    setChecked((prev) => {
      const next = new Set(prev);
      preChecked.forEach((k) => next.add(k));
      return next;
    });
  }, [groceryList]);

  const toggleItem = (item: string) => {
    setChecked((prev) => {
      const next = new Set(prev);
      if (next.has(item)) {
        next.delete(item);
      } else {
        next.add(item);
      }
      return next;
    });
  };

  const copyList = () => {
    const text = groceryList
      .map(
        (cat) =>
          `${cat.category}\n${cat.items.map((i) => `  - ${i.amount} ${i.item}`).join('\n')}`
      )
      .join('\n\n');

    navigator.clipboard.writeText(text);
    alert('Grocery list copied!');
  };

  return (
    <div className="bg-white rounded-2xl border border-warmgray-200 p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-semibold text-warmgray-800">
          Grocery List
        </h2>
        <Button variant="secondary" size="sm" onClick={copyList}>
          Copy list
        </Button>
      </div>

      <div className="space-y-6">
        {groceryList.map((category) => (
          <div key={category.category}>
            <h3 className="text-sm font-semibold text-coral-600 uppercase tracking-wide mb-3">
              {category.category}
            </h3>
            <ul className="space-y-2">
              {category.items.map((item) => {
                const itemKey = `${category.category}-${item.item}`;
                const isChecked = checked.has(itemKey);
                const inFridge = fridgeMatches.has(itemKey);
                return (
                  <li key={itemKey} className="flex items-start gap-3">
                    <button
                      onClick={() => toggleItem(itemKey)}
                      className={`
                        mt-0.5 w-5 h-5 rounded border-2 flex-shrink-0 flex items-center justify-center
                        ${
                          inFridge
                            ? 'bg-green-500 border-green-500 text-white'
                            : isChecked
                              ? 'bg-coral-500 border-coral-500 text-white'
                              : 'border-warmgray-300'
                        }
                      `}
                    >
                      {(isChecked || inFridge) && (
                        <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                        </svg>
                      )}
                    </button>
                    <div className={isChecked ? 'line-through text-warmgray-400' : ''}>
                      <span className="text-sm text-warmgray-700 font-medium">
                        {item.amount} {item.item}
                      </span>
                      {inFridge && (
                        <span className="ml-2 inline-flex items-center gap-1 text-xs text-green-600 font-medium">
                          <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                          </svg>
                          in your fridge
                        </span>
                      )}
                      <span className="text-xs text-warmgray-400 block">
                        Used in: {item.usedIn.join(', ')}
                      </span>
                    </div>
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </div>
    </div>
  );
}
