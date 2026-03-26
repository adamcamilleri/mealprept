'use client';

import { useState, useEffect } from 'react';
import { GroceryCategory } from '@/lib/types';
import { FridgeItem, getShelfLife, StorageLocation } from '@/lib/fridge-data';
import Link from 'next/link';
import Button from '../ui/Button';

const FRIDGE_STORAGE_KEY = 'nochef-fridge';

interface GroceryListProps {
  groceryList: GroceryCategory[];
  isAuthenticated?: boolean;
}

function loadFridgeItems(): FridgeItem[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(FRIDGE_STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as FridgeItem[];
    return parsed.map((item) => {
      if (!item.storage) {
        const shelfInfo = getShelfLife(item.name);
        return { ...item, storage: (shelfInfo?.storage ?? 'fridge') as StorageLocation };
      }
      return item;
    });
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
    const groceryWords = normalized.split(/\s+/);
    const fridgeWords = fridgeName.split(/\s+/);
    const hasOverlap = groceryWords.some(
      (gw) => gw.length > 2 && fridgeWords.some((fw) => fw.length > 2 && (gw.includes(fw) || fw.includes(gw)))
    );
    if (hasOverlap) return fi;
  }
  return null;
}

export default function GroceryList({ groceryList, isAuthenticated = false }: GroceryListProps) {
  const [checked, setChecked] = useState<Set<string>>(new Set());
  const [fridgeMatches, setFridgeMatches] = useState<Set<string>>(new Set());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const items = loadFridgeItems();

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

  const copyList = async () => {
    const text = groceryList
      .map(
        (cat) =>
          `${cat.category}\n${cat.items.map((i) => `  - ${i.amount} ${i.item}`).join('\n')}`
      )
      .join('\n\n');

    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback for older browsers
      const textarea = document.createElement('textarea');
      textarea.value = text;
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand('copy');
      document.body.removeChild(textarea);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const getDateLabel = (daysFromNow: number): string => {
    const date = new Date();
    date.setDate(date.getDate() + daysFromNow);
    if (daysFromNow === 0) return 'Today';
    if (daysFromNow === 1) return 'Tomorrow';
    return date.toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' });
  };

  const getNextWeekendDay = (): number => {
    const today = new Date().getDay(); // 0=Sun, 6=Sat
    if (today === 6) return 0; // Saturday -> today
    if (today === 0) return 0; // Sunday -> today
    return 6 - today; // days until Saturday
  };

  const handleScheduleShopping = (daysFromNow: number) => {
    const fridgeItems = loadFridgeItems();
    const shoppingDate = new Date();
    shoppingDate.setDate(shoppingDate.getDate() + daysFromNow);
    const dateStr = shoppingDate.toISOString();
    const newItems: FridgeItem[] = [];

    for (const category of groceryList) {
      for (const item of category.items) {
        if (fuzzyMatchFridge(item.item, fridgeItems)) continue;

        const shelfInfo = getShelfLife(item.item);
        newItems.push({
          id: Date.now().toString(36) + Math.random().toString(36).slice(2, 7),
          name: item.item,
          category: shelfInfo?.category ?? 'other',
          addedDate: dateStr,
          shelfLifeDays: shelfInfo?.days ?? 7,
          quantity: item.amount,
          storage: shelfInfo?.storage ?? 'fridge',
        });
      }
    }

    if (newItems.length > 0) {
      const updated = [...newItems, ...fridgeItems];
      localStorage.setItem(FRIDGE_STORAGE_KEY, JSON.stringify(updated));
    }

    setShowDatePicker(false);
    setShowSuccess(true);

    const updatedFridge = loadFridgeItems();
    const matches = new Set<string>();
    for (const category of groceryList) {
      for (const gi of category.items) {
        const itemKey = `${category.category}-${gi.item}`;
        if (fuzzyMatchFridge(gi.item, updatedFridge)) {
          matches.add(itemKey);
        }
      }
    }
    setFridgeMatches(matches);

    setTimeout(() => setShowSuccess(false), 5000);
  };

  return (
    <>
      <div className="bg-white rounded-2xl shadow-[0_2px_12px_rgba(50,48,47,0.06)] p-6 sm:p-8">
        <div className="flex justify-between items-center mb-5">
          <h2 className="text-sm font-bold text-warmgray-700 uppercase tracking-wider">
            Grocery List
          </h2>
          <Button variant="secondary" size="sm" onClick={copyList} className="inline-flex items-center gap-1.5">
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
            </svg>
            {copied ? 'Copied!' : 'Copy list'}
          </Button>
        </div>

        <div className="space-y-8">
          {groceryList.map((category) => (
            <div key={category.category}>
              <h3 className="text-xs font-semibold text-warmgray-400 uppercase tracking-[0.15em] mb-3 pb-2">
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
                          mt-0.5 w-6 h-6 rounded-md border-2 flex-shrink-0 flex items-center justify-center transition-colors
                          ${
                            inFridge
                              ? 'bg-green-500 border-green-500 text-white'
                              : isChecked
                                ? 'bg-navy-500 border-navy-500 text-white'
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

        {/* Add to Fridge banner */}
        <div className="mt-6 pt-6 border-t border-warmgray-100">
          {!isAuthenticated ? (
            <Link
              href="/?signin=true"
              className="w-full bg-warmgray-50 hover:bg-warmgray-100 rounded-2xl p-4 flex items-center justify-center gap-2 transition-colors block"
            >
              <span className="text-lg">🧊</span>
              <span className="text-sm font-semibold text-warmgray-600">
                Sign in to track your fridge & pantry
              </span>
            </Link>
          ) : showSuccess ? (
            <div className="bg-navy-50 border border-navy-100 rounded-xl p-4 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <svg className="w-5 h-5 text-navy-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
                <span className="text-sm font-medium text-navy-700">
                  Items scheduled for your fridge!
                </span>
              </div>
              <Link
                href="/fridge"
                className="text-sm font-semibold text-navy-600 hover:text-navy-700 underline underline-offset-2"
              >
                View Fridge
              </Link>
            </div>
          ) : showDatePicker ? (
            <div className="bg-warmgray-50 rounded-2xl p-5">
              <p className="text-sm font-semibold text-warmgray-700 mb-1">
                When are you shopping?
              </p>
              {fridgeMatches.size > 0 && (
                <p className="text-xs text-warmgray-400 mb-3">
                  Items already in your fridge will be skipped automatically.
                </p>
              )}
              <div className="flex flex-wrap gap-2">
                {[
                  { label: 'Today', days: 0 },
                  { label: 'Tomorrow', days: 1 },
                  { label: getDateLabel(getNextWeekendDay()), days: getNextWeekendDay() },
                  { label: getDateLabel(getNextWeekendDay() + 1), days: getNextWeekendDay() + 1 },
                ].filter((opt, i, arr) => {
                  // Remove duplicates (e.g. if today IS Saturday)
                  return arr.findIndex(o => o.days === opt.days) === i;
                }).map((option) => (
                  <button
                    key={option.days}
                    onClick={() => handleScheduleShopping(option.days)}
                    className="px-4 py-2 rounded-full text-sm font-medium bg-white border border-warmgray-200 text-warmgray-700 hover:border-navy-500 hover:text-navy-500 transition-all"
                  >
                    {option.label}
                  </button>
                ))}
              </div>
              <button
                onClick={() => setShowDatePicker(false)}
                className="text-xs text-warmgray-400 hover:text-warmgray-600 mt-3 transition-colors"
              >
                Cancel
              </button>
            </div>
          ) : (
            <button
              onClick={() => setShowDatePicker(true)}
              className="w-full bg-navy-50 hover:bg-navy-100 rounded-2xl p-4 flex items-center justify-center gap-2 transition-colors"
            >
              <span className="text-lg">🛒</span>
              <span className="text-sm font-semibold text-navy-700">
                I plan to buy these items on...
              </span>
            </button>
          )}
        </div>
      </div>
    </>
  );
}
