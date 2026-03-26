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
    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
      {options.map((option) => {
        const isSelected = selected.includes(option.value);
        return (
          <button
            key={option.value}
            onClick={() => handleClick(option.value)}
            className={`
              group relative p-4 rounded-2xl text-left
              transition-all duration-200 ease-out
              min-h-[64px] flex items-center gap-3
              ${
                isSelected
                  ? 'bg-navy-500 shadow-[0_2px_12px_rgba(27,54,93,0.25)] scale-[1.02]'
                  : 'bg-white border border-warmgray-200 hover:border-warmgray-300 hover:shadow-[0_2px_8px_rgba(50,48,47,0.08)] active:scale-[0.97]'
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
                isSelected ? 'text-white' : 'text-warmgray-700'
              }`}
            >
              {option.label}
            </span>

            {/* Selection indicator */}
            <span
              className={`
                absolute top-2.5 right-2.5 w-4.5 h-4.5 rounded-full flex items-center justify-center
                transition-transform duration-200 ease-out
                ${isSelected ? 'scale-100 bg-white/25' : 'scale-0 bg-navy-500'}
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
