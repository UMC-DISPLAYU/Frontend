import { cn } from '@/utils/cn';

import { EXPLORE_VIEW_OPTIONS, type ExploreView } from './exploreOptions';

type ExploreViewToggleProps = {
  value: ExploreView;
  onChange: (view: ExploreView) => void;
};

export function ExploreViewToggle({ value, onChange }: ExploreViewToggleProps) {
  return (
    <div
      aria-label="보기"
      className="inline-flex shrink-0 rounded-full bg-[#f4f4f5] p-0.5"
      role="group"
    >
      {EXPLORE_VIEW_OPTIONS.map((option) => {
        const isSelected = option.value === value;
        return (
          <button
            aria-pressed={isSelected}
            className={cn(
              'typography-body-md-semibold relative h-8 min-w-[54px] cursor-pointer rounded-full px-3.5 transition-[background-color,color,scale] duration-250 ease-standard after:absolute after:inset-x-0 after:-inset-y-1.5 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#18181b] active:scale-96',
              isSelected ? 'bg-[#18181b] text-[#fff]' : 'text-[#3f3f47]',
            )}
            key={option.value}
            onClick={() => onChange(option.value)}
            type="button"
          >
            {option.label}
          </button>
        );
      })}
    </div>
  );
}
