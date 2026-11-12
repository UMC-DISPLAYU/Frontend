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
      className="flex h-9 w-30 shrink-0 rounded-circle bg-secondary p-0.75"
      role="group"
    >
      {EXPLORE_VIEW_OPTIONS.map((option) => {
        const isSelected = option.value === value;
        return (
          <button
            aria-pressed={isSelected}
            className={cn(
              'typography-body-md-semibold relative flex-1 cursor-pointer rounded-circle transition duration-base ease-standard after:absolute after:inset-x-0 after:-inset-y-2 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus active:scale-96',
              isSelected ? 'bg-interactive-primary text-interactive-inverse' : 'text-secondary',
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
