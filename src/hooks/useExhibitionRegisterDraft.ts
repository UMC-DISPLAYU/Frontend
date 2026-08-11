import { useContext } from 'react';

import { ExhibitionRegisterDraftContext } from '@/contexts/exhibitionRegisterDraftState';

export function useExhibitionRegisterDraft() {
  const context = useContext(ExhibitionRegisterDraftContext);

  if (!context) {
    throw new Error(
      'useExhibitionRegisterDraft must be used within ExhibitionRegisterDraftProvider',
    );
  }

  return context;
}
