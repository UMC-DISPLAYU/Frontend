import { createContext } from 'react';

export type ArtworkRegisterMode = 'own' | 'other';
export type ArtworkOtherAuthorSource = 'team' | 'direct';

export type ArtworkRegisterDraft = {
  step: 'choice' | 'otherTeamAuthor' | 'otherAuthor' | 'basic' | 'participants';
  registerMode: ArtworkRegisterMode;
  otherAuthorSource: ArtworkOtherAuthorSource;
  selectedOtherAuthorId: string | null;
  otherAuthorName: string;
  title: string;
  description: string;
  field: string;
  year: string;
  medium: string;
  size: string;
  point: string;
  artworkImageUrls: string[];
  processImageUrls: string[];
  collaborators: Array<{
    id: string;
    name: string;
    account: string;
    userId?: number;
  }>;
  qnaAssigneeIds: string[];
};

export const INITIAL_ARTWORK_REGISTER_DRAFT: ArtworkRegisterDraft = {
  step: 'choice',
  registerMode: 'own',
  otherAuthorSource: 'direct',
  selectedOtherAuthorId: null,
  otherAuthorName: '',
  title: '',
  description: '',
  field: '',
  year: '',
  medium: '',
  size: '',
  point: '',
  artworkImageUrls: [],
  processImageUrls: [],
  collaborators: [],
  qnaAssigneeIds: [],
};

export const ArtworkRegisterDraftContext = createContext<{
  draft: ArtworkRegisterDraft;
  updateDraft: (partial: Partial<ArtworkRegisterDraft>) => void;
  resetDraft: () => void;
} | null>(null);
