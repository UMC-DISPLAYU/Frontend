import { useContext } from 'react';

import { ArtworkRegisterDraftContext } from '@/contexts/artworkRegisterDraftState';

export function useArtworkRegisterDraft() {
  const context = useContext(ArtworkRegisterDraftContext);

  if (!context) {
    throw new Error('useArtworkRegisterDraft must be used within ArtworkRegisterDraftProvider');
  }

  return context;
}
