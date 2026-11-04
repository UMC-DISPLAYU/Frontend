import { UnderlineTab } from '@/components/ui';

import type { ExploreOption } from './exploreOptions';

type ExploreFieldTabsProps = {
  options: readonly ExploreOption[];
  selectedLabel: string;
  onSelect: (option: ExploreOption) => void;
};

export function ExploreFieldTabs({ options, selectedLabel, onSelect }: ExploreFieldTabsProps) {
  return (
    <div className="scrollbar-none -mx-5 flex overflow-x-auto px-5" role="tablist">
      {options.map((option) => (
        <UnderlineTab
          key={option.label}
          label={option.label}
          onClick={() => onSelect(option)}
          selected={option.label === selectedLabel}
        />
      ))}
    </div>
  );
}
