import { cn } from '@/utils/cn';

type SegmentToggleProps<T extends string> = {
  options: ReadonlyArray<{ label: string; value: T }>;
  value: T;
  onChange: (value: T) => void;
};

export function SegmentToggle<T extends string>({
  options,
  value,
  onChange,
}: SegmentToggleProps<T>) {
  return (
    <div className="flex h-8.75 w-fit items-center rounded-circle bg-tertiary" role="radiogroup">
      {options.map((option) => {
        const isSelected = option.value === value;
        return (
          <button
            aria-checked={isSelected}
            className={cn(
              'typography-body-lg-medium flex h-8.75 w-15 cursor-pointer items-center justify-center rounded-circle',
              isSelected ? 'bg-primary-black text-quaternary' : 'text-tertiary',
            )}
            key={option.value}
            onClick={() => onChange(option.value)}
            role="radio"
            type="button"
          >
            {option.label}
          </button>
        );
      })}
    </div>
  );
}
