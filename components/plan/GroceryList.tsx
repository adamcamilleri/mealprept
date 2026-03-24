'use client';

import { useState } from 'react';
import { GroceryCategory } from '@/lib/types';
import Button from '../ui/Button';

interface GroceryListProps {
  groceryList: GroceryCategory[];
}

export default function GroceryList({ groceryList }: GroceryListProps) {
  const [checked, setChecked] = useState<Set<string>>(new Set());

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
                return (
                  <li key={itemKey} className="flex items-start gap-3">
                    <button
                      onClick={() => toggleItem(itemKey)}
                      className={`
                        mt-0.5 w-5 h-5 rounded border-2 flex-shrink-0 flex items-center justify-center
                        ${
                          isChecked
                            ? 'bg-coral-500 border-coral-500 text-white'
                            : 'border-warmgray-300'
                        }
                      `}
                    >
                      {isChecked && (
                        <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                        </svg>
                      )}
                    </button>
                    <div className={isChecked ? 'line-through text-warmgray-400' : ''}>
                      <span className="text-sm text-warmgray-700 font-medium">
                        {item.amount} {item.item}
                      </span>
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
