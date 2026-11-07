import { useSearchParams } from 'react-router-dom';

import {
  type ExploreOption,
  type ExploreView,
  FIELD_OPTIONS,
  findOptionByLabel,
  SORT_OPTIONS,
  STATUS_OPTIONS,
  TYPE_OPTIONS,
} from './exploreOptions';

type FilterKey = 'field' | 'type' | 'status' | 'sort';

const OPTIONS_BY_KEY: Record<FilterKey, readonly ExploreOption[]> = {
  field: FIELD_OPTIONS,
  type: TYPE_OPTIONS,
  status: STATUS_OPTIONS,
  sort: SORT_OPTIONS,
};

export function useExploreFilters() {
  const [searchParams, setSearchParams] = useSearchParams();

  const getOption = (key: FilterKey) =>
    findOptionByLabel(OPTIONS_BY_KEY[key], searchParams.get(key));

  const view: ExploreView = searchParams.get('view') === 'artwork' ? 'artwork' : 'exhibition';
  const searchWord = searchParams.get('q') ?? '';

  const updateParam = (key: FilterKey | 'view' | 'q', value: string | null) => {
    setSearchParams(
      (prev) => {
        const next = new URLSearchParams(prev);
        if (value) next.set(key, value);
        else next.delete(key);
        return next;
      },
      { replace: true },
    );
  };

  const selectOption = (key: FilterKey, option: ExploreOption) => {
    const isDefault = option.label === OPTIONS_BY_KEY[key][0].label;
    updateParam(key, isDefault ? null : option.label);
  };

  return {
    field: getOption('field'),
    type: getOption('type'),
    status: getOption('status'),
    sort: getOption('sort'),
    view,
    searchWord,
    selectOption,
    submitSearch: (word: string) => updateParam('q', word.trim() || null),
    setView: (nextView: ExploreView) =>
      updateParam('view', nextView === 'exhibition' ? null : nextView),
  };
}
