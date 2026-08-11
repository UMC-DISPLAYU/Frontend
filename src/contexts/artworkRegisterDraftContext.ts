import { createElement, type ReactNode, useCallback, useState } from 'react';

import {
  type ArtworkRegisterDraft,
  ArtworkRegisterDraftContext,
  INITIAL_ARTWORK_REGISTER_DRAFT,
} from './artworkRegisterDraftState';

export function ArtworkRegisterDraftProvider({ children }: { children: ReactNode }) {
  const [draft, setDraft] = useState<ArtworkRegisterDraft>(INITIAL_ARTWORK_REGISTER_DRAFT);

  const updateDraft = useCallback((partial: Partial<ArtworkRegisterDraft>) => {
    setDraft((prev) => ({ ...prev, ...partial }));
  }, []);

  const resetDraft = useCallback(() => {
    setDraft(INITIAL_ARTWORK_REGISTER_DRAFT);
  }, []);

  return createElement(
    ArtworkRegisterDraftContext.Provider,
    { value: { draft, updateDraft, resetDraft } },
    children,
  );
}
