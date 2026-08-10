import { type ReactNode, useCallback, useState } from 'react';

import {
  type ExhibitionRegisterDraft,
  ExhibitionRegisterDraftContext,
  INITIAL_EXHIBITION_REGISTER_DRAFT,
} from './exhibitionRegisterDraftState';

export function ExhibitionRegisterDraftProvider({ children }: { children: ReactNode }) {
  const [draft, setDraft] = useState<ExhibitionRegisterDraft>(INITIAL_EXHIBITION_REGISTER_DRAFT);
  const [hasDraft, setHasDraft] = useState(false);

  const updateDraft = useCallback((partial: Partial<ExhibitionRegisterDraft>) => {
    setDraft((prev) => ({ ...prev, ...partial }));
    setHasDraft(true);
  }, []);

  const resetDraft = useCallback(() => {
    setDraft(INITIAL_EXHIBITION_REGISTER_DRAFT);
    setHasDraft(false);
  }, []);

  return (
    <ExhibitionRegisterDraftContext.Provider value={{ draft, hasDraft, updateDraft, resetDraft }}>
      {children}
    </ExhibitionRegisterDraftContext.Provider>
  );
}
