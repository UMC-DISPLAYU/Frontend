import type { CreateDisplayRequestDto, DisplayMediaRequestDto } from '@/api/dto';
import { DISPLAY_TYPE_MAP, toDisplayFieldValue } from '@/constants/exhibition';
import type {
  ExhibitionPosterMedia,
  ExhibitionRegisterDraft,
} from '@/contexts/exhibitionRegisterDraftState';

import { OTHER_GROUP_DISPLAY_TYPE } from './displayRegister.constants';

/* 서버는 대표 포스터 외에 최대 4장을 받는다 */
const MAX_EXTRA_POSTERS = 4;

const toDisplayMedia = (poster: ExhibitionPosterMedia): DisplayMediaRequestDto =>
  poster.mediaType === 'VIDEO'
    ? { imageUrl: poster.url, mediaType: 'VIDEO', thumbnailUrl: poster.thumbnailUrl ?? undefined }
    : { imageUrl: poster.url, mediaType: 'IMAGE' };

/** 대표 포스터 표시 범위. 영상 대표는 서버가 받지 않고, 범위가 없으면 보내지 않는다 */
export function toPosterCropRequest(draft: ExhibitionRegisterDraft) {
  const main = draft.posters[0];
  return main?.mediaType === 'IMAGE' && draft.posterCrop ? { posterCrop: draft.posterCrop } : {};
}

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

/** 기타 단체 전시는 단체명만, 그 외는 학교 + 학과. 학교가 없으면 학과를 소속으로 쓴다 */
export function toDisplayAffiliation(draft: ExhibitionRegisterDraft) {
  const department = draft.department.trim();

  if (draft.type === OTHER_GROUP_DISPLAY_TYPE) {
    return { schoolOrOrganization: draft.organizer.trim(), departmentOrClub: '' };
  }

  const school = draft.school.trim();
  return { schoolOrOrganization: school || department, departmentOrClub: school ? department : '' };
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

  return {
    title: draft.title.trim(),
    ...posterMedia,
    ...toPosterCropRequest(draft),
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
