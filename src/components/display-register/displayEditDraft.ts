import type { DisplayDetailDto, UpdateDisplayRequestDto } from '@/api/dto';
import {
  DISPLAY_TYPE_MAP,
  DISPLAY_TYPE_REVERSE_MAP,
  toDisplayFieldValue,
} from '@/constants/exhibition';
import {
  type ExhibitionRegisterDraft,
  INITIAL_EXHIBITION_REGISTER_DRAFT,
} from '@/contexts/exhibitionRegisterDraftState';
import { parseInstagramId } from '@/utils/linkInput';

import {
  toDisplayAffiliation,
  toDisplayFields,
  toDisplayRegion,
  toPosterMediaRequest,
} from './createDisplayRequest';
import {
  DISPLAY_FIELD_OPTIONS,
  OTHER_GROUP_DISPLAY_TYPE,
  toExhibitionFields,
} from './displayRegister.constants';

const toTime = (time: string | null | undefined) => (time ?? '').slice(0, 5);

/**
 * 서버 분야 값을 화면 분야 이름으로 바꾼다.
 * 예전 표기(CRAFT 등)는 같은 분야로 보고, 새 목록에서 빠진 예전 분야(DESIGN · FASHION 등)는 뺀다
 */
export function toFieldLabels(serverFields: string[]) {
  const labels = serverFields.flatMap((serverField) => {
    const field = toDisplayFieldValue(serverField);
    const option = DISPLAY_FIELD_OPTIONS.find(({ value }) => value === field);
    return option ? [option.label] : [];
  });

  return [...new Set(labels)];
}

/** 화면 분야로 나타낼 수 없는 서버 값. 수정 화면에서 보이지 않아도 지워지지 않게 따로 둔다 */
export function toHiddenServerFields(serverFields: string[]) {
  return serverFields.filter((serverField) => toFieldLabels([serverField]).length === 0);
}

/** 전시 상세를 수정 화면에서 쓰는 draft 로 바꾼다 */
export function toEditDraft(detail: DisplayDetailDto): ExhibitionRegisterDraft {
  const type = DISPLAY_TYPE_REVERSE_MAP[detail.displayType] ?? '';
  const isOtherGroup = type === OTHER_GROUP_DISPLAY_TYPE;
  const fieldLabels = toFieldLabels(detail.displayFields ?? []);
  const instagram = parseInstagramId(detail.instagramUrl ?? '');
  const images = [...(detail.images ?? [])].sort((a, b) => a.sortOrder - b.sortOrder);

  return {
    ...INITIAL_EXHIBITION_REGISTER_DRAFT,
    editDisplayId: detail.displayId,
    posters: images.map((image) => ({
      url: image.imageUrl,
      mediaType: image.mediaType ?? 'IMAGE',
      thumbnailUrl: image.thumbnailUrl ?? null,
    })),
    posterCrop: detail.posterCrop ?? null,
    posterFit: detail.posterFit ?? null,
    posterEdgeColor: detail.posterEdgeColor ?? null,
    title: detail.title ?? '',
    subtitle: detail.subtitle ?? '',
    intro: detail.content ?? '',
    type,
    field: toExhibitionFields(fieldLabels),
    fieldLabels,
    hiddenServerFields: toHiddenServerFields(detail.displayFields ?? []),
    school: isOtherGroup ? '' : (detail.organization ?? ''),
    department: isOtherGroup ? '' : (detail.department ?? ''),
    organizer: isOtherGroup ? (detail.organization ?? '') : '',
    startDate: detail.period?.startDate ?? '',
    endDate: detail.period?.endDate ?? '',
    startTime: toTime(detail.period?.startTime),
    endTime: toTime(detail.period?.endTime),
    placeName: detail.location?.placeName ?? '',
    address: detail.location?.roadAddress ?? '',
    latitude: detail.location?.latitude ?? null,
    longitude: detail.location?.longitude ?? null,
    instagramId: instagram.status === 'valid' ? instagram.value : '',
    websiteUrl: detail.websiteUrl ?? '',
  };
}

/** 수정 API 가 받는 항목만 담는다. 포스터는 목록 전체를 보내 지운 포스터도 반영한다. 필수값이 빠졌으면 null */
export function buildUpdateDisplayRequest(
  draft: ExhibitionRegisterDraft,
): UpdateDisplayRequestDto | null {
  const type = DISPLAY_TYPE_MAP[draft.type];
  const visibleFields = toDisplayFields(draft);
  const fields = [...new Set([...visibleFields, ...draft.hiddenServerFields])];
  const { schoolOrOrganization, departmentOrClub } = toDisplayAffiliation(draft);
  const title = draft.title.trim();
  const placeName = draft.placeName.trim();
  const posterMedia = toPosterMediaRequest(draft.posters);

  const hasRequired =
    posterMedia &&
    type &&
    visibleFields.length > 0 &&
    title &&
    schoolOrOrganization &&
    draft.startDate &&
    draft.endDate &&
    draft.startTime &&
    draft.endTime &&
    placeName &&
    draft.address &&
    draft.latitude !== null &&
    draft.longitude !== null;

  if (!hasRequired) return null;

  return {
    title,
    ...posterMedia,
    type,
    fields,
    schoolOrOrganization,
    departmentOrClub: departmentOrClub || null,
    description: draft.intro.trim() || null,
    startDate: draft.startDate,
    endDate: draft.endDate,
    openTime: draft.startTime,
    closeTime: draft.endTime,
    placeName,
    roadAddress: draft.address,
    latitude: draft.latitude!,
    longitude: draft.longitude!,
    region: toDisplayRegion(draft.address),
    // 링크는 빈 문자열을 보내야 지워진다(null · 생략은 기존 값 유지)
    instagramUrl: draft.instagramId ? `https://instagram.com/${draft.instagramId}` : '',
    websiteUrl: draft.websiteUrl,
    // null 은 기존 범위를 유지하므로 범위를 고른 경우에만 보낸다
    ...(draft.posterCrop ? { posterCrop: draft.posterCrop } : {}),
    ...(draft.posterFit ? { posterFit: draft.posterFit } : {}),
    ...(draft.posterEdgeColor ? { posterEdgeColor: draft.posterEdgeColor } : {}),
  };
}

const EDITABLE_KEYS = [
  'posters',
  'posterCrop',
  'posterFit',
  'title',
  'intro',
  'type',
  'fieldLabels',
  'department',
  'organizer',
  'startDate',
  'endDate',
  'startTime',
  'endTime',
  'placeName',
  'address',
  'instagramId',
  'websiteUrl',
] as const satisfies readonly (keyof ExhibitionRegisterDraft)[];

/** 수정 화면에서 서버 값과 달라진 항목이 있는지. 이탈 확인 모달을 띄울지 정할 때 쓴다 */
export function isEditDraftChanged(
  original: ExhibitionRegisterDraft,
  current: ExhibitionRegisterDraft,
) {
  return EDITABLE_KEYS.some(
    (key) => JSON.stringify(original[key]) !== JSON.stringify(current[key]),
  );
}
