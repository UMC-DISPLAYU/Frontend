import type { DisplayDetailDto, UpdateDisplayRequestDto } from '@/api/dto';
import {
  DISPLAY_FIELD_REVERSE_MAP,
  DISPLAY_TYPE_MAP,
  DISPLAY_TYPE_REVERSE_MAP,
} from '@/constants/exhibition';
import {
  type ExhibitionRegisterDraft,
  INITIAL_EXHIBITION_REGISTER_DRAFT,
} from '@/contexts/exhibitionRegisterDraftState';

import { toDisplayAffiliation, toDisplayFields } from './createDisplayRequest';
import { parseInstagramId } from './displayLinks';
import {
  DISPLAY_FIELD_OPTIONS,
  OTHER_GROUP_DISPLAY_TYPE,
  toExhibitionFields,
} from './displayRegister.constants';

const toTime = (time: string | null | undefined) => (time ?? '').slice(0, 5);

/**
 * 서버 분야 값을 화면 분야 이름으로 바꾼다.
 * DESIGN 처럼 여러 이름이 같은 값을 쓰면 첫 이름(그래픽)으로, 화면에 없는 값(패션 등)은 뺀다
 */
export function toFieldLabels(serverFields: string[]) {
  const labels = serverFields.flatMap((serverField) => {
    const field = DISPLAY_FIELD_REVERSE_MAP[serverField];
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
    imageUrls: images.map((image) => image.imageUrl),
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

/** 수정 API 가 받는 항목만 담는다. 필수값이 빠졌으면 null */
export function buildUpdateDisplayRequest(
  draft: ExhibitionRegisterDraft,
): UpdateDisplayRequestDto | null {
  const type = DISPLAY_TYPE_MAP[draft.type];
  const visibleFields = toDisplayFields(draft);
  const fields = [...new Set([...visibleFields, ...draft.hiddenServerFields])];
  const { schoolOrOrganization, departmentOrClub } = toDisplayAffiliation(draft);
  const title = draft.title.trim();
  const placeName = draft.placeName.trim();

  const hasRequired =
    draft.imageUrls[0] &&
    type &&
    visibleFields.length > 0 &&
    title &&
    schoolOrOrganization &&
    draft.startDate &&
    draft.endDate &&
    draft.startTime &&
    draft.endTime &&
    placeName;

  if (!hasRequired) return null;

  return {
    title,
    posterImageUrl: draft.imageUrls[0],
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
  };
}

const EDITABLE_KEYS = [
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
