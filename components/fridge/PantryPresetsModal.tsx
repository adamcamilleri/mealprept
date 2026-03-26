'use client';

import { useState, useEffect } from 'react';
import { FridgeItem } from '@/lib/fridge-data';
import { PANTRY_PRESETS, getPresetStorage, getPresetShelfLife, getPresetCategory } from '@/lib/pantry-presets';
import Button from '@/components/ui/Button';

interface PantryPresetsModalProps {
  open: boolean;
  onClose: () => void;
  existingItems: FridgeItem[];
  onItemsAdded: (items: FridgeItem[]) => void;
  isPro: boolean;
  currentItemCount: number;
}

export default function PantryPresetsModal({
  open,
  onClose,
  existingItems,
  onItemsAdded,
  isPro,
  currentItemCount,
}: PantryPresetsModalProps) {
  const FREE_ITEM_LIMIT = 40;
  const [selectedCategories, setSelectedCategories] = useState<Set<string>>(new Set());
  const [uncheckedItems, setUncheckedItems] = useState<Set<string>>(new Set());
  const [adding, setAdding] = useState(false);
  const [addedCount, setAddedCount] = useState<number | null>(null);

  // Reset state when modal opens
  useEffect(() => {
    if (open) {
      setSelectedCategories(new Set());
      setUncheckedItems(new Set());
      setAdding(false);
      setAddedCount(null);
    }
  }, [open]);

  if (!open) return null;

  const existingNames = new Set(existingItems.map((i) => i.name.toLowerCase()));

  const toggleCategory = (category: string) => {
    setSelectedCategories((prev) => {
      const next = new Set(prev);
      if (next.has(category)) {
        next.delete(category);
        // Also remove unchecked items from this category
        const preset = PANTRY_PRESETS.find((p) => p.category === category);
        if (preset) {
          setUncheckedItems((prevUnchecked) => {
            const nextUnchecked = new Set(prevUnchecked);
            preset.items.forEach((item) => nextUnchecked.delete(item));
            return nextUnchecked;
          });
        }
      } else {
        next.add(category);
      }
      return next;
    });
    // Reset success state when changing selections
    setAddedCount(null);
  };

  const toggleItem = (item: string) => {
    setUncheckedItems((prev) => {
      const next = new Set(prev);
      if (next.has(item)) {
        next.delete(item);
      } else {
        next.add(item);
      }
      return next;
    });
    setAddedCount(null);
  };

  // Calculate items that would be added
  const itemsToAdd = PANTRY_PRESETS
    .filter((p) => selectedCategories.has(p.category))
    .flatMap((p) => p.items)
    .filter((item) => !uncheckedItems.has(item) && !existingNames.has(item.toLowerCase()));

  // Deduplicate (e.g. "butter" appears in both Cooking Basics and Fridge Staples)
  const uniqueItemsToAdd = Array.from(new Set(itemsToAdd));

  const remainingSlots = isPro ? Infinity : FREE_ITEM_LIMIT - currentItemCount;
  const wouldExceedLimit = !isPro && uniqueItemsToAdd.length > remainingSlots;
  const finalItems = wouldExceedLimit ? uniqueItemsToAdd.slice(0, remainingSlots) : uniqueItemsToAdd;

  const handleAdd = async () => {
    if (finalItems.length === 0) return;
    setAdding(true);

    const payload = finalItems.map((item) => ({
      name: item,
      category: getPresetCategory(item),
      addedDate: new Date().toISOString(),
      shelfLifeDays: getPresetShelfLife(item),
      storage: getPresetStorage(item),
    }));

    try {
      const res = await fetch('/api/fridge', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        const saved = await res.json();
        const savedItems: FridgeItem[] = Array.isArray(saved) ? saved : [saved];
        onItemsAdded(savedItems);
        setAddedCount(savedItems.length);
      }
    } catch {
      // Silently fail
    } finally {
      setAdding(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative bg-white w-full sm:max-w-lg sm:rounded-2xl rounded-t-2xl shadow-xl max-h-[85vh] flex flex-col animate-slideUp">
        {/* Header */}
        <div className="flex items-center justify-between p-5 pb-3 border-b border-warmgray-100">
          <div>
            <h2 className="text-lg font-bold text-warmgray-800">
              Quick stock your kitchen
            </h2>
            <p className="text-sm text-warmgray-400 mt-0.5">
              Tap categories to add common items you always have at home
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-warmgray-400 hover:text-warmgray-600 hover:bg-warmgray-100 transition-colors flex-shrink-0"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Scrollable content */}
        <div className="flex-1 overflow-y-auto p-5 space-y-4">
          {/* Success state */}
          {addedCount !== null && (
            <div className="bg-coral-50 border border-coral-200 rounded-xl p-4 text-center animate-fadeIn">
              <div className="text-2xl mb-1">&#10024;</div>
              <p className="text-sm font-semibold text-coral-700">
                Added {addedCount} item{addedCount !== 1 ? 's' : ''} to your kitchen!
              </p>
              <button
                onClick={onClose}
                className="text-xs text-coral-500 hover:text-coral-700 mt-2 font-medium"
              >
                Done
              </button>
            </div>
          )}

          {/* Category cards */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {PANTRY_PRESETS.map((preset) => {
              const isSelected = selectedCategories.has(preset.category);
              const availableCount = preset.items.filter(
                (item) => !existingNames.has(item.toLowerCase())
              ).length;

              return (
                <button
                  key={preset.category}
                  onClick={() => toggleCategory(preset.category)}
                  className={`
                    group relative p-4 rounded-2xl text-left
                    transition-all duration-200 ease-out
                    min-h-[72px] flex flex-col gap-1
                    ${
                      isSelected
                        ? 'bg-navy-500 shadow-[0_2px_12px_rgba(27,54,93,0.25)] scale-[1.02]'
                        : 'bg-white border border-warmgray-200 hover:border-warmgray-300 hover:shadow-[0_2px_8px_rgba(50,48,47,0.08)] active:scale-[0.97]'
                    }
                  `}
                >
                  <span className={`text-xl transition-transform duration-200 ${isSelected ? 'scale-110' : 'group-hover:scale-105'}`}>
                    {preset.emoji}
                  </span>
                  <span className={`text-sm font-medium leading-snug ${isSelected ? 'text-white' : 'text-warmgray-700'}`}>
                    {preset.category}
                  </span>
                  <span className={`text-xs ${isSelected ? 'text-white/70' : 'text-warmgray-400'}`}>
                    {availableCount === preset.items.length
                      ? `${preset.items.length} items`
                      : `${availableCount} new of ${preset.items.length}`}
                  </span>

                  {/* Selection indicator */}
                  <span
                    className={`
                      absolute top-2.5 right-2.5 w-5 h-5 rounded-full flex items-center justify-center
                      transition-transform duration-200 ease-out
                      ${isSelected ? 'scale-100 bg-white/25' : 'scale-0 bg-navy-500'}
                    `}
                  >
                    <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={4}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                  </span>
                </button>
              );
            })}
          </div>

          {/* Item details for selected categories */}
          {selectedCategories.size > 0 && (
            <div className="space-y-4">
              {PANTRY_PRESETS.filter((p) => selectedCategories.has(p.category)).map((preset) => (
                <div key={preset.category} className="bg-warmgray-50 rounded-xl p-4">
                  <div className="flex items-center gap-2 mb-3">
                    <span className="text-base">{preset.emoji}</span>
                    <span className="text-sm font-semibold text-warmgray-700">{preset.category}</span>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {preset.items.map((item) => {
                      const alreadyHave = existingNames.has(item.toLowerCase());
                      const isChecked = !uncheckedItems.has(item) && !alreadyHave;

                      return (
                        <button
                          key={item}
                          onClick={() => {
                            if (!alreadyHave) toggleItem(item);
                          }}
                          disabled={alreadyHave}
                          className={`
                            inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium
                            transition-all duration-150
                            ${
                              alreadyHave
                                ? 'bg-warmgray-200 text-warmgray-400 cursor-not-allowed line-through'
                                : isChecked
                                  ? 'bg-navy-500 text-white'
                                  : 'bg-white border border-warmgray-200 text-warmgray-500 hover:border-warmgray-300'
                            }
                          `}
                        >
                          {alreadyHave ? (
                            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                            </svg>
                          ) : isChecked ? (
                            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                            </svg>
                          ) : null}
                          <span className="capitalize">{item}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        {addedCount === null && (
          <div className="p-5 pt-3 border-t border-warmgray-100">
            {wouldExceedLimit && (
              <p className="text-xs text-amber-600 mb-2 text-center">
                Only {remainingSlots} slot{remainingSlots !== 1 ? 's' : ''} remaining on free plan. Upgrade to Pro for unlimited storage.
              </p>
            )}
            <Button
              variant="primary"
              size="lg"
              onClick={handleAdd}
              disabled={finalItems.length === 0 || adding}
              loading={adding}
              className="w-full"
            >
              {finalItems.length === 0
                ? 'Select categories above'
                : `Add ${finalItems.length} item${finalItems.length !== 1 ? 's' : ''} to my kitchen`}
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
