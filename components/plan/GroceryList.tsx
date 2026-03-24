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

interface GroceryItemForModal {
  name: string;
  amount: string;
  category: string;
  alreadyInFridge: boolean;
  storage: StorageLocation;
}

export default function GroceryList({ groceryList, isAuthenticated = false }: GroceryListProps) {
  const [checked, setChecked] = useState<Set<string>>(new Set());
  const [fridgeMatches, setFridgeMatches] = useState<Set<string>>(new Set());
  const [showModal, setShowModal] = useState(false);
  const [modalItems, setModalItems] = useState<GroceryItemForModal[]>([]);
  const [modalChecked, setModalChecked] = useState<Set<string>>(new Set());
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

  const openAddToFridgeModal = () => {
    const fridgeItems = loadFridgeItems();
    const items: GroceryItemForModal[] = [];
    const checkedKeys = new Set<string>();

    for (const category of groceryList) {
      for (const item of category.items) {
        const alreadyInFridge = !!fuzzyMatchFridge(item.item, fridgeItems);
        const shelfInfo = getShelfLife(item.item);
        const modalItem: GroceryItemForModal = {
          name: item.item,
          amount: item.amount,
          category: category.category,
          alreadyInFridge,
          storage: shelfInfo?.storage ?? 'fridge',
        };
        items.push(modalItem);
        // Pre-check items NOT already in the fridge
        if (!alreadyInFridge) {
          checkedKeys.add(item.item);
        }
      }
    }

    setModalItems(items);
    setModalChecked(checkedKeys);
    setShowModal(true);
    setShowSuccess(false);
  };

  const toggleModalItem = (name: string) => {
    setModalChecked((prev) => {
      const next = new Set(prev);
      if (next.has(name)) {
        next.delete(name);
      } else {
        next.add(name);
      }
      return next;
    });
  };

  const handleAddToFridge = () => {
    const fridgeItems = loadFridgeItems();
    const today = new Date().toISOString();
    const newItems: FridgeItem[] = [];

    for (const item of modalItems) {
      if (!modalChecked.has(item.name)) continue;
      if (item.alreadyInFridge) continue;

      const shelfInfo = getShelfLife(item.name);
      const newItem: FridgeItem = {
        id: Date.now().toString(36) + Math.random().toString(36).slice(2, 7),
        name: item.name,
        category: shelfInfo?.category ?? 'other',
        addedDate: today,
        shelfLifeDays: shelfInfo?.days ?? 7,
        quantity: item.amount,
        storage: item.storage,
      };
      newItems.push(newItem);
    }

    if (newItems.length > 0) {
      const updated = [...newItems, ...fridgeItems];
      localStorage.setItem(FRIDGE_STORAGE_KEY, JSON.stringify(updated));
    }

    setShowModal(false);
    setShowSuccess(true);

    // Refresh fridge matches
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

    // Hide success after 5 seconds
    setTimeout(() => setShowSuccess(false), 5000);
  };

  return (
    <>
      <div className="bg-white rounded-2xl border border-warmgray-200/80 p-5 sm:p-6">
        <div className="flex justify-between items-center mb-5">
          <h2 className="text-xs font-semibold text-warmgray-400 uppercase tracking-wider">
            Grocery List
          </h2>
          <Button variant="secondary" size="sm" onClick={copyList}>
            {copied ? 'Copied!' : 'Copy list'}
          </Button>
        </div>

        <div className="space-y-6">
          {groceryList.map((category) => (
            <div key={category.category}>
              <h3 className="text-xs font-semibold text-coral-500 uppercase tracking-wider mb-2.5">
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

        {/* Add to Fridge banner */}
        <div className="mt-6 pt-6 border-t border-warmgray-100">
          {!isAuthenticated ? (
            <Link
              href="/?signin=true"
              className="w-full bg-warmgray-50 hover:bg-warmgray-100 border border-warmgray-200 rounded-xl p-4 flex items-center justify-center gap-2 transition-colors block"
            >
              <span className="text-lg">🧊</span>
              <span className="text-sm font-semibold text-warmgray-600">
                Sign in to track your fridge & pantry
              </span>
            </Link>
          ) : showSuccess ? (
            <div className="bg-green-50 border border-green-200 rounded-xl p-4 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <svg className="w-5 h-5 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
                <span className="text-sm font-medium text-green-700">
                  Items added to your fridge & pantry!
                </span>
              </div>
              <Link
                href="/fridge"
                className="text-sm font-semibold text-green-700 hover:text-green-800 underline underline-offset-2"
              >
                View Fridge & Pantry
              </Link>
            </div>
          ) : (
            <button
              onClick={openAddToFridgeModal}
              className="w-full bg-coral-50 hover:bg-coral-100 border border-coral-200 rounded-xl p-4 flex items-center justify-center gap-2 transition-colors"
            >
              <span className="text-lg">🧊</span>
              <span className="text-sm font-semibold text-coral-700">
                Done shopping? Add these to My Fridge
              </span>
            </button>
          )}
        </div>
      </div>

      {/* Add to Fridge Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            onClick={() => setShowModal(false)}
          />
          <div className="relative bg-white rounded-2xl shadow-xl w-full max-w-lg max-h-[80vh] flex flex-col">
            {/* Modal header */}
            <div className="p-6 border-b border-warmgray-100">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-warmgray-800">
                  Add to Fridge & Pantry
                </h3>
                <button
                  onClick={() => setShowModal(false)}
                  className="p-1.5 rounded-lg text-warmgray-400 hover:text-warmgray-600 hover:bg-warmgray-100 transition-colors"
                >
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              <p className="text-sm text-warmgray-500 mt-1">
                Uncheck anything you didn&apos;t buy.
              </p>
            </div>

            {/* Modal body */}
            <div className="flex-1 overflow-y-auto p-6">
              <ul className="space-y-3">
                {modalItems.map((item) => {
                  const isChecked = modalChecked.has(item.name);
                  return (
                    <li key={`${item.category}-${item.name}`} className="flex items-center gap-3">
                      <button
                        onClick={() => {
                          if (!item.alreadyInFridge) toggleModalItem(item.name);
                        }}
                        disabled={item.alreadyInFridge}
                        className={`
                          w-5 h-5 rounded border-2 flex-shrink-0 flex items-center justify-center transition-colors
                          ${
                            item.alreadyInFridge
                              ? 'bg-warmgray-100 border-warmgray-200 cursor-not-allowed'
                              : isChecked
                                ? 'bg-coral-500 border-coral-500 text-white'
                                : 'border-warmgray-300 hover:border-coral-400'
                          }
                        `}
                      >
                        {(isChecked || item.alreadyInFridge) && (
                          <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                          </svg>
                        )}
                      </button>
                      <div className="flex-1 min-w-0">
                        <span className={`text-sm font-medium ${item.alreadyInFridge ? 'text-warmgray-400' : 'text-warmgray-700'}`}>
                          {item.amount} {item.name}
                        </span>
                        {item.alreadyInFridge ? (
                          <span className="ml-2 text-xs text-green-600 font-medium">
                            Already in fridge
                          </span>
                        ) : (
                          <span className="ml-2 text-xs text-warmgray-400" title={item.storage === 'pantry' ? 'Goes to pantry' : 'Goes to fridge'}>
                            {item.storage === 'pantry' ? '🫙' : '🧊'}
                          </span>
                        )}
                      </div>
                    </li>
                  );
                })}
              </ul>
            </div>

            {/* Modal footer */}
            <div className="p-6 border-t border-warmgray-100 flex items-center justify-between gap-3">
              <button
                onClick={() => setShowModal(false)}
                className="text-sm text-warmgray-500 hover:text-warmgray-700 font-medium"
              >
                Cancel
              </button>
              <Button onClick={handleAddToFridge} size="md">
                Add {modalChecked.size} item{modalChecked.size !== 1 ? 's' : ''}
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
