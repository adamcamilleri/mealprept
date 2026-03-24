'use client';

interface ChipGridProps {
  options: { label: string; emoji?: string; value: string }[];
  selected: string[];
  onToggle: (value: string) => void;
  multiSelect?: boolean;
}

export default function ChipGrid({
  options,
  selected,
  onToggle,
  multiSelect = true,
}: ChipGridProps) {
  const handleClick = (value: string) => {
    if (!multiSelect) {
      onToggle(value);
      return;
    }
    // For multi-select with "none" option
    if (value === 'none') {
      onToggle('none');
      return;
    }
    onToggle(value);
  };

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
      {options.map((option) => {
        const isSelected = selected.includes(option.value);
        return (
          <button
            key={option.value}
            onClick={() => handleClick(option.value)}
            className={`
              relative p-4 rounded-xl border-2 text-left transition-all duration-200
              min-h-[60px] flex items-center gap-3
              ${
                isSelected
                  ? 'border-coral-400 bg-coral-50 shadow-sm'
                  : 'border-warmgray-200 bg-white hover:border-warmgray-300'
              }
            `}
          >
            {option.emoji && (
              <span className="text-2xl flex-shrink-0">{option.emoji}</span>
            )}
            <span
              className={`text-sm font-medium ${
                isSelected ? 'text-coral-700' : 'text-warmgray-700'
              }`}
            >
              {option.label}
            </span>
          </button>
        );
      })}
    </div>
  );
}
