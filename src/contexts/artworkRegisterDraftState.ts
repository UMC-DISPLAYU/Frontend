import { createContext } from 'react';

export type ArtworkRegisterMode = 'self' | 'other';
export type ArtworkProxyAuthorSource = 'team' | 'direct';

export type ArtworkRegisterDraft = {
  step: 'choice' | 'proxyTeamAuthor' | 'proxyAuthor' | 'basic' | 'participants';
  registerMode: ArtworkRegisterMode;
  proxyAuthorSource: ArtworkProxyAuthorSource;
  selectedProxyAuthorId: string | null;
  proxyAuthorName: string;
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
  registerMode: 'self',
  proxyAuthorSource: 'direct',
  selectedProxyAuthorId: null,
  proxyAuthorName: '',
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
