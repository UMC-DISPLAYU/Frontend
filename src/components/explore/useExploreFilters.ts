import { useCallback } from 'react';

import { useReplaceSearchParams } from '@/hooks/useReplaceSearchParams';

import {
  type ExploreOption,
  type ExploreView,
  FIELD_OPTIONS,
  findOptionByLabel,
  SORT_OPTIONS,
  STATUS_OPTIONS,
  TYPE_OPTIONS,
} from './exploreOptions';

export type ExploreFilterKey = 'field' | 'type' | 'status' | 'sort';

const OPTIONS_BY_KEY: Record<ExploreFilterKey, readonly ExploreOption[]> = {
  field: FIELD_OPTIONS,
  type: TYPE_OPTIONS,
  status: STATUS_OPTIONS,
  sort: SORT_OPTIONS,
};

export function useExploreFilters() {
  const [searchParams, replaceSearchParams] = useReplaceSearchParams();

  const getOption = (key: ExploreFilterKey) =>
    findOptionByLabel(OPTIONS_BY_KEY[key], searchParams.get(key));

  const view: ExploreView = searchParams.get('view') === 'artwork' ? 'artwork' : 'exhibition';
  const searchWord = searchParams.get('q') ?? '';

  const updateParam = useCallback(
    (key: ExploreFilterKey | 'view' | 'q', value: string | null) => {
      replaceSearchParams((prev) => {
        const next = new URLSearchParams(prev);
        if (value) next.set(key, value);
        else next.delete(key);
        return next;
      });
    },
    [replaceSearchParams],
  );

  const selectOption = useCallback(
    (key: ExploreFilterKey, option: ExploreOption) => {
      const isDefault = option.label === OPTIONS_BY_KEY[key][0].label;
      updateParam(key, isDefault ? null : option.label);
    },
    [updateParam],
  );

  const submitSearch = useCallback(
    (word: string) => updateParam('q', word.trim() || null),
    [updateParam],
  );

  const setView = useCallback(
    (nextView: ExploreView) => updateParam('view', nextView === 'exhibition' ? null : nextView),
    [updateParam],
  );

  return {
    field: getOption('field'),
    type: getOption('type'),
    status: getOption('status'),
    sort: getOption('sort'),
    view,
    searchWord,
    selectOption,
    submitSearch,
    setView,
  };
}
