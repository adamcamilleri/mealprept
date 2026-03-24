'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import {
  FridgeItem,
  StorageLocation,
  SHELF_LIFE,
  getShelfLife,
  getDaysRemaining,
  getFreshnessStatus,
  searchShelfLife,
} from '@/lib/fridge-data';
import Button from '@/components/ui/Button';
import UpgradePrompt from '@/components/ui/UpgradePrompt';

const STORAGE_KEY = 'spoonfed-fridge';
const FREE_ITEM_LIMIT = 40;

function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
}

function loadItems(): FridgeItem[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as FridgeItem[];
    return parsed.map((item) => {
      if (!item.storage) {
        const shelfInfo = getShelfLife(item.name);
        return { ...item, storage: shelfInfo?.storage ?? 'fridge' };
      }
      return item;
    });
  } catch {
    return [];
  }
}

function saveItems(items: FridgeItem[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
}

const STATUS_CONFIG = {
  expired: {
    label: 'Expired',
    bg: 'bg-red-50',
    border: 'border-red-200',
    text: 'text-red-700',
    badge: 'bg-red-100 text-red-700',
    bar: 'bg-red-400',
  },
  expiring: {
    label: 'Expiring Soon',
    bg: 'bg-red-50',
    border: 'border-red-200',
    text: 'text-red-700',
    badge: 'bg-red-100 text-red-700',
    bar: 'bg-red-400',
  },
  'use-soon': {
    label: 'Use Soon',
    bg: 'bg-amber-50',
    border: 'border-amber-200',
    text: 'text-amber-700',
    badge: 'bg-amber-100 text-amber-700',
    bar: 'bg-amber-400',
  },
  fresh: {
    label: 'Fresh',
    bg: 'bg-green-50',
    border: 'border-green-200',
    text: 'text-green-700',
    badge: 'bg-green-100 text-green-700',
    bar: 'bg-green-400',
  },
};

const CATEGORY_EMOJI: Record<string, string> = {
  produce: '🥬',
  protein: '🥩',
  dairy: '🧀',
  pantry: '🫙',
  other: '📦',
};

const TAB_CONFIG: Record<StorageLocation, { label: string; emoji: string; emptyEmoji: string; emptyTitle: string; emptyDesc: string }> = {
  fridge: {
    label: 'Fridge',
    emoji: '🧊',
    emptyEmoji: '🧊',
    emptyTitle: 'Your fridge is empty',
    emptyDesc: 'Add ingredients above and we\'ll track how fresh they are so nothing goes to waste.',
  },
  pantry: {
    label: 'Pantry',
    emoji: '🫙',
    emptyEmoji: '🫙',
    emptyTitle: 'Your pantry is empty',
    emptyDesc: 'Add pantry staples like rice, pasta, oils, and spices to keep track of what you have.',
  },
};

interface FridgePageClientProps {
  isPro: boolean;
}

export default function FridgePageClient({ isPro }: FridgePageClientProps) {
  const [items, setItems] = useState<FridgeItem[]>([]);
  const [activeTab, setActiveTab] = useState<StorageLocation>('fridge');
  const [inputValue, setInputValue] = useState('');
  const [quantity, setQuantity] = useState('');
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [selectedSuggestion, setSelectedSuggestion] = useState(-1);
  const [mounted, setMounted] = useState(false);
  const [showCustomForm, setShowCustomForm] = useState(false);
  const [customShelfLife, setCustomShelfLife] = useState('7');
  const [customCategory, setCustomCategory] = useState<FridgeItem['category']>('other');
  const [customStorage, setCustomStorage] = useState<StorageLocation>('fridge');
  const [addItemStorage, setAddItemStorage] = useState<StorageLocation | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const suggestionsRef = useRef<HTMLDivElement>(null);

  const atLimit = !isPro && items.length >= FREE_ITEM_LIMIT;

  useEffect(() => {
    setItems(loadItems());
    setMounted(true);
  }, []);

  useEffect(() => {
    if (mounted && items.length >= 0) {
      saveItems(items);
    }
  }, [items, mounted]);

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (
        suggestionsRef.current &&
        !suggestionsRef.current.contains(e.target as Node) &&
        inputRef.current &&
        !inputRef.current.contains(e.target as Node)
      ) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  const handleInputChange = (value: string) => {
    setInputValue(value);
    setSelectedSuggestion(-1);
    if (value.trim().length > 0) {
      const results = searchShelfLife(value);
      setSuggestions(results);
      setShowSuggestions(results.length > 0);
      const shelfInfo = getShelfLife(value);
      setAddItemStorage(shelfInfo?.storage ?? null);
    } else {
      setSuggestions([]);
      setShowSuggestions(false);
      setAddItemStorage(null);
    }
  };

  const addItem = useCallback(
    (name: string) => {
      if (!name.trim()) return;
      if (atLimit) return;
      const shelfInfo = getShelfLife(name);
      const storage = addItemStorage ?? shelfInfo?.storage ?? activeTab;
      const newItem: FridgeItem = {
        id: generateId(),
        name: name.trim(),
        category: shelfInfo?.category ?? 'other',
        addedDate: new Date().toISOString(),
        shelfLifeDays: shelfInfo?.days ?? 7,
        quantity: quantity.trim() || undefined,
        storage,
      };
      setItems((prev) => [newItem, ...prev]);
      setInputValue('');
      setQuantity('');
      setSuggestions([]);
      setShowSuggestions(false);
      setAddItemStorage(null);
      inputRef.current?.focus();
    },
    [quantity, addItemStorage, activeTab, atLimit]
  );

  const addCustomItem = () => {
    if (!inputValue.trim()) return;
    if (atLimit) return;
    const newItem: FridgeItem = {
      id: generateId(),
      name: inputValue.trim(),
      category: customCategory,
      addedDate: new Date().toISOString(),
      shelfLifeDays: parseInt(customShelfLife) || 7,
      quantity: quantity.trim() || undefined,
      storage: customStorage,
    };
    setItems((prev) => [newItem, ...prev]);
    setInputValue('');
    setQuantity('');
    setCustomShelfLife('7');
    setCustomCategory('other');
    setCustomStorage(activeTab);
    setShowCustomForm(false);
    setAddItemStorage(null);
    inputRef.current?.focus();
  };

  const removeItem = (id: string) => {
    setItems((prev) => prev.filter((i) => i.id !== id));
  };

  const moveItem = (id: string) => {
    setItems((prev) =>
      prev.map((item) =>
        item.id === id
          ? { ...item, storage: item.storage === 'fridge' ? 'pantry' : 'fridge' }
          : item
      )
    );
  };

  const clearExpired = () => {
    setItems((prev) =>
      prev.filter((item) => {
        if (item.storage !== activeTab) return true;
        const remaining = getDaysRemaining(item.addedDate, item.shelfLifeDays);
        return getFreshnessStatus(remaining) !== 'expired';
      })
    );
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (showSuggestions && suggestions.length > 0) {
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setSelectedSuggestion((prev) =>
          prev < suggestions.length - 1 ? prev + 1 : 0
        );
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setSelectedSuggestion((prev) =>
          prev > 0 ? prev - 1 : suggestions.length - 1
        );
      } else if (e.key === 'Enter') {
        e.preventDefault();
        if (selectedSuggestion >= 0) {
          addItem(suggestions[selectedSuggestion]);
        } else {
          addItem(inputValue);
        }
      } else if (e.key === 'Escape') {
        setShowSuggestions(false);
      }
    } else if (e.key === 'Enter') {
      e.preventDefault();
      addItem(inputValue);
    }
  };

  const tabItems = items.filter((item) => item.storage === activeTab);

  const groupedItems = tabItems.reduce(
    (acc, item) => {
      const remaining = getDaysRemaining(item.addedDate, item.shelfLifeDays);
      const status = getFreshnessStatus(remaining);
      if (!acc[status]) acc[status] = [];
      acc[status].push({ ...item, daysRemaining: remaining });
      return acc;
    },
    {} as Record<string, (FridgeItem & { daysRemaining: number })[]>
  );

  const statusOrder: Array<'expired' | 'expiring' | 'use-soon' | 'fresh'> = [
    'expired',
    'expiring',
    'use-soon',
    'fresh',
  ];

  const hasExpired = (groupedItems['expired']?.length ?? 0) > 0;
  const fridgeCount = items.filter((i) => i.storage === 'fridge').length;
  const pantryCount = items.filter((i) => i.storage === 'pantry').length;
  const tabConfig = TAB_CONFIG[activeTab];

  if (!mounted) {
    return (
      <div className="min-h-screen bg-cream">
        <div className="max-w-2xl mx-auto px-4 py-12">
          <div className="animate-pulse space-y-4">
            <div className="h-8 bg-warmgray-200 rounded w-48" />
            <div className="h-12 bg-warmgray-100 rounded-xl" />
            <div className="h-32 bg-warmgray-100 rounded-xl" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-cream">
      <div className="max-w-2xl mx-auto px-4 py-8 sm:py-12">
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl sm:text-3xl font-bold text-warmgray-800">
              My Fridge & Pantry
            </h1>
            {!isPro && (
              <span className="text-xs text-warmgray-400 bg-warmgray-100 px-2.5 py-1 rounded-full">
                {items.length}/{FREE_ITEM_LIMIT} items
              </span>
            )}
          </div>
          <p className="text-warmgray-500 mt-1 text-sm sm:text-base">
            Track what you have and know when to use it up.
          </p>
        </div>

        {/* Item limit warning */}
        {atLimit && (
          <div className="mb-6">
            <UpgradePrompt feature="Unlimited fridge & pantry storage" />
          </div>
        )}

        {/* Tabs */}
        <div className="flex gap-2 mb-6">
          {(['fridge', 'pantry'] as StorageLocation[]).map((tab) => {
            const isActive = activeTab === tab;
            const count = tab === 'fridge' ? fridgeCount : pantryCount;
            const cfg = TAB_CONFIG[tab];
            return (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`
                  flex items-center gap-2 px-4 py-2.5 rounded-full text-sm font-semibold transition-all
                  ${
                    isActive
                      ? 'bg-coral-500 text-white shadow-sm'
                      : 'bg-warmgray-100 text-warmgray-500 hover:bg-warmgray-200 hover:text-warmgray-700'
                  }
                `}
              >
                <span>{cfg.emoji}</span>
                <span>{cfg.label}</span>
                {count > 0 && (
                  <span
                    className={`
                      ml-0.5 px-1.5 py-0.5 rounded-full text-xs font-bold
                      ${isActive ? 'bg-white/20 text-white' : 'bg-warmgray-200 text-warmgray-500'}
                    `}
                  >
                    {count}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Add item form */}
        <div className="bg-white rounded-2xl border border-warmgray-200 p-4 sm:p-6 mb-6">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <input
                ref={inputRef}
                type="text"
                value={inputValue}
                onChange={(e) => handleInputChange(e.target.value)}
                onKeyDown={handleKeyDown}
                onFocus={() => {
                  if (suggestions.length > 0) setShowSuggestions(true);
                }}
                placeholder={atLimit ? 'Upgrade to Pro to add more items' : 'Add an ingredient...'}
                disabled={atLimit}
                className="w-full px-4 py-3 rounded-xl border border-warmgray-200 text-warmgray-800 placeholder-warmgray-400 focus:outline-none focus:ring-2 focus:ring-coral-400 focus:border-transparent text-sm sm:text-base disabled:opacity-50 disabled:cursor-not-allowed"
              />
              {showSuggestions && suggestions.length > 0 && (
                <div
                  ref={suggestionsRef}
                  className="absolute z-20 left-0 right-0 top-full mt-1 bg-white rounded-xl shadow-lg border border-warmgray-200 py-1 max-h-56 overflow-y-auto"
                >
                  {suggestions.map((s, i) => {
                    const info = SHELF_LIFE[s];
                    return (
                      <button
                        key={s}
                        onClick={() => addItem(s)}
                        className={`w-full text-left px-4 py-2.5 text-sm flex items-center justify-between gap-2 ${
                          i === selectedSuggestion
                            ? 'bg-coral-50 text-coral-700'
                            : 'text-warmgray-700 hover:bg-warmgray-50'
                        }`}
                      >
                        <span className="flex items-center gap-2">
                          <span>{CATEGORY_EMOJI[info?.category ?? 'other']}</span>
                          <span className="capitalize">{s}</span>
                        </span>
                        <span className="text-xs text-warmgray-400 flex items-center gap-1.5">
                          <span>{info?.storage === 'pantry' ? '🫙' : '🧊'}</span>
                          <span>~{info?.days}d</span>
                        </span>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
            <input
              type="text"
              value={quantity}
              onChange={(e) => setQuantity(e.target.value)}
              placeholder="Qty (optional)"
              disabled={atLimit}
              className="w-full sm:w-28 px-4 py-3 rounded-xl border border-warmgray-200 text-warmgray-800 placeholder-warmgray-400 focus:outline-none focus:ring-2 focus:ring-coral-400 focus:border-transparent text-sm sm:text-base disabled:opacity-50 disabled:cursor-not-allowed"
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  addItem(inputValue);
                }
              }}
            />
            <Button
              variant="primary"
              size="md"
              onClick={() => addItem(inputValue)}
              disabled={!inputValue.trim() || atLimit}
              className="sm:w-auto"
            >
              Add
            </Button>
          </div>

          {/* Storage toggle when a known item is typed */}
          {inputValue.trim() && addItemStorage && !showCustomForm && !atLimit && (
            <div className="flex items-center gap-2 mt-2 px-1">
              <span className="text-xs text-warmgray-400">Store in:</span>
              <button
                onClick={() => setAddItemStorage(addItemStorage === 'fridge' ? 'pantry' : 'fridge')}
                className="inline-flex items-center gap-1 text-xs font-medium text-coral-600 hover:text-coral-700 bg-coral-50 hover:bg-coral-100 px-2 py-1 rounded-full transition-colors"
              >
                <span>{addItemStorage === 'fridge' ? '🧊' : '🫙'}</span>
                <span>{addItemStorage === 'fridge' ? 'Fridge' : 'Pantry'}</span>
                <svg className="w-3 h-3 ml-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4" />
                </svg>
              </button>
            </div>
          )}

          {inputValue.trim() && !getShelfLife(inputValue) && !showCustomForm && !atLimit && (
            <div className="flex items-center justify-between mt-2 px-1">
              <p className="text-xs text-warmgray-400">
                Not in our database - will default to 7 days shelf life
              </p>
              <button
                onClick={() => {
                  setShowCustomForm(true);
                  setCustomStorage(activeTab);
                }}
                className="text-xs text-coral-600 hover:text-coral-700 font-medium ml-2 flex-shrink-0"
              >
                Customize
              </button>
            </div>
          )}

          {showCustomForm && !atLimit && (
            <div className="mt-3 bg-warmgray-50 rounded-xl p-4 space-y-3">
              <p className="text-sm font-medium text-warmgray-700">
                Custom item: <span className="text-coral-600">{inputValue}</span>
              </p>
              <div className="flex flex-col sm:flex-row gap-3">
                <div className="flex-1">
                  <label className="text-xs text-warmgray-500 mb-1 block">Category</label>
                  <select
                    value={customCategory}
                    onChange={(e) => setCustomCategory(e.target.value as FridgeItem['category'])}
                    className="w-full px-3 py-2 rounded-lg border border-warmgray-200 text-sm text-warmgray-800 focus:outline-none focus:ring-2 focus:ring-coral-400"
                  >
                    <option value="produce">🥬 Produce</option>
                    <option value="protein">🥩 Protein</option>
                    <option value="dairy">🧀 Dairy</option>
                    <option value="pantry">🫙 Pantry</option>
                    <option value="other">📦 Other</option>
                  </select>
                </div>
                <div className="flex-1">
                  <label className="text-xs text-warmgray-500 mb-1 block">Shelf life (days)</label>
                  <input
                    type="number"
                    value={customShelfLife}
                    onChange={(e) => setCustomShelfLife(e.target.value)}
                    min="1"
                    max="365"
                    className="w-full px-3 py-2 rounded-lg border border-warmgray-200 text-sm text-warmgray-800 focus:outline-none focus:ring-2 focus:ring-coral-400"
                  />
                </div>
                <div className="flex-1">
                  <label className="text-xs text-warmgray-500 mb-1 block">Store in</label>
                  <select
                    value={customStorage}
                    onChange={(e) => setCustomStorage(e.target.value as StorageLocation)}
                    className="w-full px-3 py-2 rounded-lg border border-warmgray-200 text-sm text-warmgray-800 focus:outline-none focus:ring-2 focus:ring-coral-400"
                  >
                    <option value="fridge">🧊 Fridge</option>
                    <option value="pantry">🫙 Pantry</option>
                  </select>
                </div>
              </div>
              <div className="flex gap-2 justify-end">
                <button
                  onClick={() => setShowCustomForm(false)}
                  className="text-sm text-warmgray-500 hover:text-warmgray-700 px-3 py-1.5"
                >
                  Cancel
                </button>
                <Button size="sm" onClick={addCustomItem} disabled={!inputValue.trim()}>
                  Add custom item
                </Button>
              </div>
            </div>
          )}
        </div>

        {/* Clear expired */}
        {hasExpired && (
          <div className="flex justify-end mb-4">
            <Button variant="ghost" size="sm" onClick={clearExpired}>
              <span className="flex items-center gap-1.5">
                <svg
                  className="w-4 h-4"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                  />
                </svg>
                Clear expired
              </span>
            </Button>
          </div>
        )}

        {/* Empty state */}
        {tabItems.length === 0 && (
          <div className="bg-white rounded-2xl border border-warmgray-200 p-8 sm:p-12 text-center">
            <div className="text-4xl mb-4">{tabConfig.emptyEmoji}</div>
            <h3 className="text-lg font-semibold text-warmgray-700 mb-2">
              {tabConfig.emptyTitle}
            </h3>
            <p className="text-warmgray-400 text-sm max-w-xs mx-auto">
              {tabConfig.emptyDesc}
            </p>
          </div>
        )}

        {/* Items grouped by status */}
        <div className="space-y-6">
          {statusOrder.map((status) => {
            const group = groupedItems[status];
            if (!group || group.length === 0) return null;
            const config = STATUS_CONFIG[status];

            return (
              <div key={status}>
                <div className="flex items-center gap-2 mb-3">
                  <span
                    className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${config.badge}`}
                  >
                    {config.label}
                  </span>
                  <span className="text-xs text-warmgray-400">
                    {group.length} item{group.length !== 1 ? 's' : ''}
                  </span>
                </div>

                <div className="space-y-2">
                  {group.map((item) => {
                    const percent = Math.max(
                      0,
                      Math.min(
                        100,
                        (item.daysRemaining / item.shelfLifeDays) * 100
                      )
                    );
                    const isExpired = status === 'expired';
                    const moveTarget = item.storage === 'fridge' ? 'pantry' : 'fridge';

                    return (
                      <div
                        key={item.id}
                        className={`bg-white rounded-xl border ${config.border} p-4 flex items-center gap-3 sm:gap-4 transition-all`}
                      >
                        <span className="text-lg flex-shrink-0">
                          {CATEGORY_EMOJI[item.category]}
                        </span>

                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <span
                              className={`text-sm font-medium capitalize ${
                                isExpired
                                  ? 'line-through text-warmgray-400'
                                  : 'text-warmgray-800'
                              }`}
                            >
                              {item.name}
                            </span>
                            {item.quantity && (
                              <span className="text-xs text-warmgray-400">
                                ({item.quantity})
                              </span>
                            )}
                            {isExpired && (
                              <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-semibold bg-red-100 text-red-600">
                                Expired
                              </span>
                            )}
                          </div>

                          <div className="mt-1.5 flex items-center gap-2">
                            <div className="flex-1 h-1.5 bg-warmgray-100 rounded-full overflow-hidden">
                              <div
                                className={`h-full rounded-full transition-all duration-500 ${config.bar}`}
                                style={{ width: `${percent}%` }}
                              />
                            </div>
                            <span
                              className={`text-xs font-medium flex-shrink-0 ${config.text}`}
                            >
                              {isExpired
                                ? `${Math.abs(item.daysRemaining)}d ago`
                                : `${item.daysRemaining}d left`}
                            </span>
                          </div>
                        </div>

                        <button
                          onClick={() => moveItem(item.id)}
                          className="flex-shrink-0 p-1.5 rounded-lg text-warmgray-300 hover:text-coral-500 hover:bg-coral-50 transition-colors"
                          aria-label={`Move ${item.name} to ${moveTarget}`}
                          title={`Move to ${moveTarget}`}
                        >
                          <svg
                            className="w-4 h-4"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                            strokeWidth={2}
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4"
                            />
                          </svg>
                        </button>

                        <button
                          onClick={() => removeItem(item.id)}
                          className="flex-shrink-0 p-1.5 rounded-lg text-warmgray-300 hover:text-red-500 hover:bg-red-50 transition-colors"
                          aria-label={`Remove ${item.name}`}
                        >
                          <svg
                            className="w-4 h-4"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                            strokeWidth={2}
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              d="M6 18L18 6M6 6l12 12"
                            />
                          </svg>
                        </button>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>

        {/* Summary footer */}
        {tabItems.length > 0 && (
          <div className="mt-8 text-center text-xs text-warmgray-400">
            {tabItems.length} item{tabItems.length !== 1 ? 's' : ''} in your {activeTab}
          </div>
        )}
      </div>
    </div>
  );
}
