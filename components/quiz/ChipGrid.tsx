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
    if (value === 'none') {
      onToggle('none');
      return;
    }
    onToggle(value);
  };

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
      {options.map((option) => {
        const isSelected = selected.includes(option.value);
        return (
          <button
            key={option.value}
            onClick={() => handleClick(option.value)}
            className={`
              group relative p-3.5 rounded-xl border text-left
              transition-all duration-200 ease-out
              min-h-[60px] flex items-center gap-2.5
              ${
                isSelected
                  ? 'border-coral-400 bg-gradient-to-br from-coral-50 to-coral-100/60 shadow-[0_0_0_1px_theme(colors.coral.400)] scale-[1.02]'
                  : 'border-warmgray-200/80 bg-white hover:border-warmgray-300 hover:shadow-sm active:scale-[0.97]'
              }
            `}
          >
            {option.emoji && (
              <span className={`text-xl flex-shrink-0 transition-transform duration-200 ${isSelected ? 'scale-110' : 'group-hover:scale-105'}`}>
                {option.emoji}
              </span>
            )}
            <span
              className={`text-sm font-medium leading-snug ${
                isSelected ? 'text-coral-700' : 'text-warmgray-700'
              }`}
            >
              {option.label}
            </span>

            {/* Selection indicator */}
            <span
              className={`
                absolute top-2 right-2 w-4.5 h-4.5 rounded-full bg-coral-500 flex items-center justify-center
                transition-transform duration-200 ease-out
                ${isSelected ? 'scale-100' : 'scale-0'}
              `}
            >
              <svg className="w-2.5 h-2.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={4}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
              </svg>
            </span>
          </button>
        );
      })}
    </div>
  );
}
