import { useCallback, useState } from 'react';

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

// 촘촘히 보기는 이 기기에 기억한다(프로토타입 du-explore-view). 주소 z 가 있으면 그쪽이 먼저
const DENSE_STORAGE_KEY = 'du-explore-view';

const readStoredDense = () => {
  try {
    return localStorage.getItem(DENSE_STORAGE_KEY) === 'dense';
  } catch {
    return false;
  }
};

export function useExploreFilters() {
  const [searchParams, replaceSearchParams] = useReplaceSearchParams();

  const getOption = (key: ExploreFilterKey) =>
    findOptionByLabel(OPTIONS_BY_KEY[key], searchParams.get(key));

  const view: ExploreView = searchParams.get('view') === 'artwork' ? 'artwork' : 'exhibition';
  const searchWord = searchParams.get('q') ?? '';
  const [storedDense, setStoredDense] = useState(readStoredDense);
  const denseParam = searchParams.get('z');
  const dense = denseParam === '1' ? true : denseParam === '2' ? false : storedDense;

  const updateParam = useCallback(
    (key: ExploreFilterKey | 'view' | 'q' | 'z', value: string | null) => {
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

  const setDense = useCallback(
    (nextDense: boolean) => {
      try {
        if (nextDense) localStorage.setItem(DENSE_STORAGE_KEY, 'dense');
        else localStorage.removeItem(DENSE_STORAGE_KEY);
      } catch {
        // 저장소를 쓸 수 없는 환경에서는 주소(z)로만 유지된다
      }
      setStoredDense(nextDense);
      updateParam('z', nextDense ? '1' : null);
    },
    [updateParam],
  );

  return {
    field: getOption('field'),
    type: getOption('type'),
    status: getOption('status'),
    sort: getOption('sort'),
    view,
    dense,
    searchWord,
    selectOption,
    submitSearch,
    setView,
    setDense,
  };
}
