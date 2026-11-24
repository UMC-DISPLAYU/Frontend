import { createContext } from 'react';

import type { ImageFitDto, MediaTypeDto } from '@/api/dto';

/** 올라간 포스터 한 장. VIDEO 면 url 은 영상 원본, thumbnailUrl 은 썸네일 이미지다 */
export type ExhibitionPosterMedia = {
  url: string;
  mediaType: MediaTypeDto;
  thumbnailUrl: string | null;
};

/**
 * 올릴 때 로컬 파일로 잰 포스터 사진 정보. 대표가 아닌 포스터도 남겨 두어, 나중에 대표가 돼도
 * 올린 주소(다른 출처)를 다시 재지 않는다
 */
export type PosterImageInfo = {
  width?: number;
  height?: number;
  fit?: ImageFitDto | null;
  edgeColor?: string | null;
};

export type ExhibitionRegisterDraft = {
  /** 수정 중인 전시 id. 등록 중이면 null */
  editDisplayId: number | null;
  /** 수정 화면에 새로 들어올 때마다 바뀌는 값. 이전에 고치다 만 draft 와 구분한다 */
  editSessionId: string | null;
  /** 수정 중인 전시의 분야 중 화면에 없는 서버 값(패션 등). 저장할 때 그대로 다시 보낸다 */
  hiddenServerFields: string[];
  /** 첫 번째가 대표 포스터다 */
  posters: ExhibitionPosterMedia[];
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
  /* 대표 포스터 보이는 방식 · 가장자리 색. 대표가 사진이면 보이는 방식은 항상 값이 있다(사진 비율 자동 결과 또는 고른 값) */
  posterFit: ImageFitDto | null;
  posterEdgeColor: string | null;
  /** 올라간 포스터 주소 → 잰 사진 정보. 서버에 보내지 않는다 */
  posterImageInfo: Record<string, PosterImageInfo>;
};

export type PosterCropRect = { x: number; y: number; w: number; h: number };

export const INITIAL_EXHIBITION_REGISTER_DRAFT: ExhibitionRegisterDraft = {
  editDisplayId: null,
  editSessionId: null,
  hiddenServerFields: [],
  posters: [],
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
  posterFit: null,
  posterEdgeColor: null,
  posterImageInfo: {},
};

export const ExhibitionRegisterDraftContext = createContext<{
  draft: ExhibitionRegisterDraft;
  hasDraft: boolean;
  updateDraft: (partial: Partial<ExhibitionRegisterDraft>) => void;
  resetDraft: () => void;
} | null>(null);
