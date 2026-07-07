import type { ReactNode } from 'react';

import { FilterChip } from './FilterChip';
import {
  FIELD_FILTER_OPTIONS,
  REGION_FILTER_OPTIONS,
  type RegionFilterValue,
  STATUS_FILTER_OPTIONS,
  type StatusFilterValue,
  TYPE_FILTER_OPTIONS,
} from './filterOptions';

type FilterPanelProps = {
  fields: Set<string>;
  onFieldToggle: (value: string) => void;
  onRegionChange: (value: RegionFilterValue) => void;
  onStatusChange: (value: StatusFilterValue) => void;
  onTypeToggle: (value: string) => void;
  region: RegionFilterValue;
  status: StatusFilterValue;
  types: Set<string>;
};

export function FilterPanel({
  fields,
  onFieldToggle,
  onRegionChange,
  onStatusChange,
  onTypeToggle,
  region,
  status,
  types,
}: FilterPanelProps) {
  return (
    <div className="flex flex-col gap-3 border-b border-gray-200 bg-white px-4 py-3">
      <FilterGroup label="전시 상태">
        {STATUS_FILTER_OPTIONS.map((option) => (
          <FilterChip
            key={option.value}
            label={option.label}
            onClick={() => onStatusChange(option.value)}
            selected={status === option.value}
          />
        ))}
      </FilterGroup>

      <FilterGroup label="지역">
        {REGION_FILTER_OPTIONS.map((option) => (
          <FilterChip
            key={option.value}
            label={option.label}
            onClick={() => onRegionChange(option.value)}
            selected={region === option.value}
          />
        ))}
      </FilterGroup>

      <FilterGroup label="전시 분야">
        {FIELD_FILTER_OPTIONS.map((field) => (
          <FilterChip
            key={field}
            label={field}
            onClick={() => onFieldToggle(field)}
            selected={fields.has(field)}
          />
        ))}
      </FilterGroup>

      <FilterGroup label="전시 유형">
        {TYPE_FILTER_OPTIONS.map((type) => (
          <FilterChip
            key={type}
            label={type}
            onClick={() => onTypeToggle(type)}
            selected={types.has(type)}
          />
        ))}
      </FilterGroup>
    </div>
  );
}

type FilterGroupProps = {
  children: ReactNode;
  label: string;
};

function FilterGroup({ children, label }: FilterGroupProps) {
  return (
    <div className="flex flex-col items-start">
      <span className="text-[10px] font-bold tracking-tight text-gray-400">{label}</span>
      <div className="flex w-full gap-1.5 overflow-x-auto pt-1.5">{children}</div>
    </div>
  );
}
