import { createContext } from 'react';

export type ExhibitionRegisterDraft = {
  imageUrls: string[];
  title: string;
  subtitle: string;
  intro: string;
  type: string;
  field: string[];
  school: string;
  department: string;
  organizer: string;
  startDate: string;
  endDate: string;
  startTime: string;
  endTime: string;
  placeName: string;
  address: string;
  latitude: number | null;
  longitude: number | null;
  instagramId: string;
  websiteUrl: string;
  contact: string;
  notice: string;
  artistName: string;
  fieldLabels: string[];
  posterCrop: PosterCropRect | null;
};

export type PosterCropRect = { x: number; y: number; w: number; h: number };

export const INITIAL_EXHIBITION_REGISTER_DRAFT: ExhibitionRegisterDraft = {
  imageUrls: [],
  title: '',
  subtitle: '',
  intro: '',
  type: '',
  field: [],
  school: '',
  department: '',
  organizer: '',
  startDate: '',
  endDate: '',
  startTime: '',
  endTime: '',
  placeName: '',
  address: '',
  latitude: null,
  longitude: null,
  instagramId: '',
  websiteUrl: '',
  contact: '',
  notice: '',
  artistName: '',
  fieldLabels: [],
  posterCrop: null,
};

export const ExhibitionRegisterDraftContext = createContext<{
  draft: ExhibitionRegisterDraft;
  hasDraft: boolean;
  updateDraft: (partial: Partial<ExhibitionRegisterDraft>) => void;
  resetDraft: () => void;
} | null>(null);
