import type { CreateDisplayRequestDto, DisplayMediaRequestDto } from '@/api/dto';
import {
  DISPLAY_TYPE_MAP,
  MAX_POSTER_UPLOAD_IMAGES,
  toDisplayFieldValue,
} from '@/constants/exhibition';
import type {
  ExhibitionPosterMedia,
  ExhibitionRegisterDraft,
} from '@/contexts/exhibitionRegisterDraftState';
import { toCropRequest } from '@/utils/cropBox';

import { OTHER_GROUP_DISPLAY_TYPE } from './displayRegister.constants';

/* 서버는 대표 포스터와 추가 포스터를 따로 받는다 */
const MAX_EXTRA_POSTERS = MAX_POSTER_UPLOAD_IMAGES - 1;

const toDisplayMedia = (poster: ExhibitionPosterMedia): DisplayMediaRequestDto =>
  poster.mediaType === 'VIDEO'
    ? { imageUrl: poster.url, mediaType: 'VIDEO', thumbnailUrl: poster.thumbnailUrl ?? undefined }
    : { imageUrl: poster.url, mediaType: 'IMAGE' };

/** 대표 포스터와 추가 포스터. 옛 posterImageUrl · displayImageUrl 대신 영상까지 담는 필드로 보낸다 */
export function toPosterMediaRequest(posters: ExhibitionPosterMedia[]) {
  const [main, ...extras] = posters;
  if (!main) return null;

  return {
    posterMedia: toDisplayMedia(main),
    displayMedia: extras.slice(0, MAX_EXTRA_POSTERS).map(toDisplayMedia),
  };
}

export function toDisplayRegion(address: string): CreateDisplayRequestDto['region'] {
  if (address.includes('서울')) return 'SEOUL';
  if (address.includes('경기') || address.includes('인천')) return 'GYEONGGI_INCHEON';
  return 'OTHERS';
}

export const toDisplayFields = (draft: ExhibitionRegisterDraft) => [
  ...new Set(draft.field.map(toDisplayFieldValue)),
];

/** 화면 칸과 1:1. 기타 단체 전시는 단체명만, 그 외는 학교 + 학과. 학교가 비어도 학과를 학교 자리로 옮기지 않는다 */
export function toDisplayAffiliation(draft: ExhibitionRegisterDraft) {
  if (draft.type === OTHER_GROUP_DISPLAY_TYPE) {
    return { schoolOrOrganization: draft.organizer.trim(), departmentOrClub: '' };
  }

  return { schoolOrOrganization: draft.school.trim(), departmentOrClub: draft.department.trim() };
}

/** 1/2 · 2/2 에서 모은 draft 로 전시 생성 요청을 만든다. 필수값이 빠졌으면 null */
export function buildCreateDisplayRequest(
  draft: ExhibitionRegisterDraft,
  displayNickname: string,
): CreateDisplayRequestDto | null {
  const posterMedia = toPosterMediaRequest(draft.posters);
  const type = DISPLAY_TYPE_MAP[draft.type];
  const fields = toDisplayFields(draft);
  const { schoolOrOrganization, departmentOrClub } = toDisplayAffiliation(draft);
  const nickname = displayNickname.trim();

  const hasRequired =
    posterMedia &&
    type &&
    fields.length > 0 &&
    draft.title.trim() &&
    draft.startDate &&
    draft.endDate &&
    draft.startTime &&
    draft.endTime &&
    draft.placeName.trim() &&
    draft.address &&
    draft.latitude !== null &&
    draft.longitude !== null &&
    nickname;

  if (!hasRequired) return null;

  const description = draft.intro.trim();
  const posterCrop = toCropRequest(draft.posterCrop);

  return {
    title: draft.title.trim(),
    ...posterMedia,
    type,
    fields,
    region: toDisplayRegion(draft.address),
    schoolOrOrganization,
    departmentOrClub,
    ...(description ? { description } : {}),
    startDate: draft.startDate,
    endDate: draft.endDate,
    openTime: draft.startTime,
    closeTime: draft.endTime,
    locationName: draft.placeName.trim(),
    roadAddress: draft.address,
    latitude: draft.latitude!,
    longitude: draft.longitude!,
    displayNickname: nickname,
    ...(draft.instagramId ? { instagramUrl: `https://instagram.com/${draft.instagramId}` } : {}),
    ...(draft.websiteUrl ? { websiteUrl: draft.websiteUrl } : {}),
    ...(posterCrop ? { posterCrop } : {}),
    ...(draft.posterFit ? { posterFit: draft.posterFit } : {}),
    ...(draft.posterEdgeColor ? { posterEdgeColor: draft.posterEdgeColor } : {}),
  };
}
