import { createContext } from 'react';

export type ExhibitionRegisterDraft = {
  /** 수정 중인 전시 id. 등록 중이면 null */
  editDisplayId: number | null;
  /** 수정 화면에 새로 들어올 때마다 바뀌는 값. 이전에 고치다 만 draft 와 구분한다 */
  editSessionId: string | null;
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
  editDisplayId: null,
  editSessionId: null,
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
