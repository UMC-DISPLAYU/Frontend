import type { CreateDisplayRequestDto } from '@/api/dto';
import { DISPLAY_FIELD_MAP, DISPLAY_TYPE_MAP } from '@/constants/exhibition';
import type { ExhibitionRegisterDraft } from '@/contexts/exhibitionRegisterDraftState';

import { OTHER_GROUP_DISPLAY_TYPE } from './displayRegister.constants';

/* 서버는 대표 포스터 외에 최대 4장을 받는다 */
const MAX_EXTRA_POSTERS = 4;

export function toDisplayRegion(address: string): CreateDisplayRequestDto['region'] {
  if (address.includes('서울')) return 'SEOUL';
  if (address.includes('경기') || address.includes('인천')) return 'GYEONGGI_INCHEON';
  return 'OTHERS';
}

/** 1/2 · 2/2 에서 모은 draft 로 전시 생성 요청을 만든다. 필수값이 빠졌으면 null */
export function buildCreateDisplayRequest(
  draft: ExhibitionRegisterDraft,
  displayNickname: string,
): CreateDisplayRequestDto | null {
  const [posterImageUrl, ...extraPosters] = draft.imageUrls;
  const type = DISPLAY_TYPE_MAP[draft.type];
  const fields = [...new Set(draft.field.map((field) => DISPLAY_FIELD_MAP[field] ?? field))];
  const isOtherGroup = draft.type === OTHER_GROUP_DISPLAY_TYPE;
  const department = draft.department.trim();
  const schoolOrOrganization = isOtherGroup
    ? draft.organizer.trim()
    : draft.school.trim() || department;
  const nickname = displayNickname.trim();

  const hasRequired =
    posterImageUrl &&
    type &&
    fields.length > 0 &&
    draft.title.trim() &&
    schoolOrOrganization &&
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
  const departmentOrClub = isOtherGroup || !draft.school.trim() ? '' : department;

  return {
    title: draft.title.trim(),
    posterImageUrl,
    displayImageUrl: extraPosters.slice(0, MAX_EXTRA_POSTERS),
    type,
    fields,
    region: toDisplayRegion(draft.address),
    schoolOrOrganization,
    ...(departmentOrClub ? { departmentOrClub } : {}),
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
  };
}
