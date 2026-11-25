import type {
  ArtworkImageRequestDto,
  ArtworkPartDto,
  ArtworkPartRequestDto,
  CreateExhibitionArtworkRequestDto,
  DisplayArtworkEditResponseDataDto,
  ImageFitDto,
  ImageResponseDto,
  PersonalArtworkRequestDto,
  PersonalArtworkResponseDataDto,
  UpdateExhibitionArtworkRequestDto,
} from '@/api/dto';
import { DEFAULT_ARTWORK_IMAGE_HEIGHT, DEFAULT_ARTWORK_IMAGE_WIDTH } from '@/constants';
import { type CropRect, toCropRequest } from '@/utils/cropBox';

import { toArtworkFieldLabels, toArtworkTypes } from './artworkRegister.constants';
import type { ArtworkPartValues, ArtworkRegisterValues } from './artworkRegister.schema';
import type { ArtworkPerson } from './artworkRegister.types';

/** 작품 이미지 중 영상의 썸네일 · 크기(카드에 보일 썸네일 크기) */
export interface ArtworkVideoMeta {
  thumbnailUrl: string;
  width?: number;
  height?: number;
}

export interface ArtworkImageUrls {
  artworkUrls: string[];
  processUrls: string[];
  /** 대표 사진(작품 이미지 첫 장)이 카드 썸네일에 보이는 영역. 없으면 사진 가운데 */
  artworkCrop?: CropRect | null;
  /** 대표 사진이 목록 칸에 보이는 방식(사진 비율 자동 결과 또는 고른 값). 대표가 영상이면 FILL */
  artworkFit?: ImageFitDto | null;
  /** 작품 이미지(작품 1 · 작품 2부터) 중 영상인 주소. 전시 작품만 영상을 받는다 */
  videos?: Record<string, ArtworkVideoMeta>;
  /** 연작의 작품 2부터 사진 · 영상. partUrls[0] 이 작품 2(서버 partIndex 1)다. 전시 작품만 받는다 */
  partUrls?: string[][];
}

type ImageLike = Pick<ImageResponseDto, 'imageUrl' | 'sortOrder'> &
  Partial<Pick<ImageResponseDto, 'mediaType' | 'thumbnailUrl' | 'width' | 'height'>> & {
    imageType?: string | null;
    isThumbnail?: boolean | null;
    partIndex?: number | null;
  };

/** 저장된 사진의 설명 · 크기. 수정 화면에는 입력 칸이 없어 같은 사진이면 그대로 다시 보낸다 */
export type SavedArtworkImage = Pick<ImageResponseDto, 'imageUrl'> &
  Partial<Pick<ImageResponseDto, 'caption' | 'width' | 'height'>>;

/** 수정할 때 화면에 없는 값을 지키기 위한 기존 작품 정보 */
export interface PreviousArtworkInfo {
  type?: string | null;
  types?: readonly string[] | null;
  images?: readonly SavedArtworkImage[];
}

/**
 * 작품 이미지(ARTWORK)와 작업 과정(WORK_PROCESS)을 순서대로 나눈다. 구분이 없으면 작품 이미지로 본다.
 * 화면은 첫 장을 대표 사진으로 보여주므로 대표 사진(isThumbnail)을 맨 앞에 둔다.
 * 연작(partCount 개)이면 partIndex 1~partCount 인 작품 이미지를 작품 2부터 칸으로 나누고, 범위 밖이면 작품 1로 본다
 */
export function splitArtworkImages(
  images: readonly ImageLike[] | undefined,
  partCount = 0,
): ArtworkImageUrls {
  const sorted = [...(images ?? [])].sort((a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0));
  const allArtworkImages = sorted.filter((image) => image.imageType !== 'WORK_PROCESS');
  const partOf = (image: ImageLike) => {
    const partIndex = image.partIndex ?? 0;
    return Number.isInteger(partIndex) && partIndex >= 1 && partIndex <= partCount ? partIndex : 0;
  };
  const artworkImages = allArtworkImages.filter((image) => partOf(image) === 0);
  const thumbnail = artworkImages.find((image) => image.isThumbnail);
  const videos = Object.fromEntries(
    allArtworkImages
      .filter((image) => image.mediaType === 'VIDEO' && image.thumbnailUrl)
      .map((image) => [
        image.imageUrl,
        { thumbnailUrl: image.thumbnailUrl!, width: image.width, height: image.height },
      ]),
  );

  return {
    artworkUrls: (thumbnail
      ? [thumbnail, ...artworkImages.filter((image) => image !== thumbnail)]
      : artworkImages
    ).map((image) => image.imageUrl),
    processUrls: sorted
      .filter((image) => image.imageType === 'WORK_PROCESS')
      .map((image) => image.imageUrl),
    ...(Object.keys(videos).length > 0 && { videos }),
    ...(partCount > 0 && {
      partUrls: Array.from({ length: partCount }, (_, index) =>
        allArtworkImages
          .filter((image) => partOf(image) === index + 1)
          .map((image) => image.imageUrl),
      ),
    }),
  };
}

const positive = (value: number | null | undefined) =>
  typeof value === 'number' && value > 0 ? value : undefined;

/*
 * 서버가 width/height 를 양수로 받는데 새로 올린 사진은 실제 크기를 재지 않아 고정값을 보낸다.
 * 이미 저장된 사진은 설명 · 크기를 그대로 보낸다(이미지 목록을 통째로 바꾸는 API 라 빠뜨리면 지워진다).
 * 대표 이미지는 작품 이미지 첫 장이다.
 */
export function toArtworkImageRequests(
  { artworkUrls, processUrls, videos = {}, partUrls = [] }: ArtworkImageUrls,
  savedImages: readonly SavedArtworkImage[] = [],
): ArtworkImageRequestDto[] {
  const toImage = (
    imageUrl: string,
    index: number,
    imageType: ArtworkImageRequestDto['imageType'],
    partIndex = 0,
  ): ArtworkImageRequestDto => {
    const saved = savedImages.find((image) => image.imageUrl === imageUrl);
    const video = imageType === 'ARTWORK' ? videos[imageUrl] : undefined;

    return {
      imageUrl,
      isThumbnail: imageType === 'ARTWORK' && index === 0,
      imageType,
      // 저장된 설명은 공백 · 빈 문자열까지 원래 값 그대로 보낸다
      ...(typeof saved?.caption === 'string' && { caption: saved.caption }),
      // 영상은 썸네일 크기를 보낸다(서버가 카드 크기로 쓴다)
      width: positive(video?.width) ?? positive(saved?.width) ?? DEFAULT_ARTWORK_IMAGE_WIDTH,
      height: positive(video?.height) ?? positive(saved?.height) ?? DEFAULT_ARTWORK_IMAGE_HEIGHT,
      sortOrder: index + 1,
      // 사진은 mediaType 을 생략한다(개인 작품 API 는 이 필드가 없다)
      ...(video && { mediaType: 'VIDEO' as const, thumbnailUrl: video.thumbnailUrl }),
      // 작품 1은 생략한다(개인 작품 API 는 이 필드가 없다)
      ...(partIndex > 0 && { partIndex }),
    };
  };

  // 작품 1 → 작품 2 … 순서로 이어서 센다. partIndex 는 보내는 parts 순서를 따르므로 지우거나 옮긴 작품도 맞춰진다
  const artworkImages = [
    ...artworkUrls.map((url) => ({ url, partIndex: 0 })),
    ...partUrls.flatMap((urls, index) => urls.map((url) => ({ url, partIndex: index + 1 }))),
  ];

  return [
    ...artworkImages.map(({ url, partIndex }, index) => toImage(url, index, 'ARTWORK', partIndex)),
    ...processUrls.map((url, index) => toImage(url, index, 'WORK_PROCESS')),
  ];
}

/** 작품 2부터 요청. 제작 연도를 비웠으면 작품 1 연도를 보낸다(프로토타입) */
export function toArtworkPartRequests(
  parts: readonly Pick<ArtworkPartValues, 'title' | 'year' | 'material' | 'size'>[],
  fallbackYear: string,
): ArtworkPartRequestDto[] {
  return parts.map((part) => ({
    artworkName: part.title.trim(),
    productionYear: Number(part.year || fallbackYear),
    materialMedia: part.material.trim(),
    size: part.size.trim(),
  }));
}

/** 서버 분야 목록. types 가 없으면 type(쉼표로 이어진 값일 수 있다)을 쓴다 */
export function readArtworkTypes(source: Pick<PreviousArtworkInfo, 'type' | 'types'>): string[] {
  if (source.types && source.types.length > 0) return [...source.types];
  return (source.type ?? '')
    .split(',')
    .map((type) => type.trim())
    .filter(Boolean);
}

/** 작품 정보 입력값을 등록 · 수정 요청 공통 필드로 바꾼다(분야 제외) */
function toArtworkInfoRequest(
  values: ArtworkRegisterValues,
  images: ArtworkImageUrls,
  previous?: PreviousArtworkInfo,
) {
  // 수정에서 비운 설명 · 재료 · 규격이 지워지도록 빈 문자열도 그대로 보낸다
  return {
    artworkName: values.title.trim(),
    content: values.intro.trim(),
    productionYear: Number(values.year),
    materialMedia: values.material.trim(),
    size: values.size.trim(),
    images: toArtworkImageRequests(images, previous?.images),
  };
}

/**
 * 서버는 Q&A 담당자를 한 명 이상 요구하고, 작가 · 계정이 연결된 공동 작가 · 전시 대표자 중에서만 받는다.
 * 화면에서 담당자를 고르지 않으므로 수정이면 남아 있는 기존 담당자를, 없으면 작가(계정 없으면 대표자)를 보낸다.
 */
export function resolveQaHandlerUserIds({
  artistUserId,
  coAuthors,
  ownerUserId,
  previous = [],
}: {
  artistUserId?: number;
  coAuthors: readonly ArtworkPerson[];
  ownerUserId?: number;
  previous?: readonly number[];
}): number[] {
  const allowed = new Set(
    [artistUserId, ownerUserId, ...coAuthors.map((person) => person.userId)].filter(
      (userId): userId is number => typeof userId === 'number',
    ),
  );
  const kept = [...new Set(previous)].filter((userId) => allowed.has(userId));
  if (kept.length > 0) return kept;

  const fallback = artistUserId ?? ownerUserId;
  return typeof fallback === 'number' ? [fallback] : [];
}

export function toCoAuthorsRequest(coAuthors: readonly ArtworkPerson[]) {
  return {
    userIds: coAuthors.flatMap((person) =>
      typeof person.userId === 'number' ? [person.userId] : [],
    ),
    rawNames: coAuthors
      .filter((person) => person.userId === undefined)
      .map((person) => person.name),
  };
}

interface ExhibitionArtworkRequestInput {
  values: ArtworkRegisterValues;
  images: ArtworkImageUrls;
  author: ArtworkPerson;
  coAuthors: readonly ArtworkPerson[];
  ownerUserId?: number;
  /** 수정할 때만: 화면에 없는 감상 포인트 · 기존 Q&A 담당자 · 분야 · 사진 설명을 그대로 보낸다 */
  previous?: Pick<DisplayArtworkEditResponseDataDto, 'point' | 'qaHandlerUserIds' | 'parts'> &
    PreviousArtworkInfo;
}

export function buildUpdateArtworkRequest({
  values,
  images,
  author,
  coAuthors,
  ownerUserId,
  previous,
}: ExhibitionArtworkRequestInput): UpdateExhibitionArtworkRequestDto {
  const point = previous?.point?.trim();
  const types = toArtworkTypes(values.fieldLabels);
  const artworkCrop = toCropRequest(images.artworkCrop);
  /*
   * 수정은 parts 를 생략하면 기존 작품을 남기고 빈 배열이면 모두 지운다. 화면에 남은 목록을 늘 보내되,
   * 수정 화면 조회에 parts 가 없었으면(불러오지 못한 연작을 지우지 않게) 작품을 더했을 때만 보낸다
   */
  const shouldSendParts = values.parts.length > 0 || previous?.parts != null;

  return {
    ...toArtworkInfoRequest(values, images, previous),
    ...(shouldSendParts && { parts: toArtworkPartRequests(values.parts, values.year) }),
    type: types[0],
    types,
    ...(point && { point }),
    ...(artworkCrop && { artworkCrop }),
    // 서버는 생략하면 생성은 FILL, 수정은 기존 값(대표 사진이 바뀌어도)을 쓰므로 항상 보낸다(영상 대표는 FILL)
    ...(images.artworkFit && { artworkFit: images.artworkFit }),
    artistName: author.name.trim(),
    ...(typeof author.userId === 'number' && { artistUserId: author.userId }),
    coAuthors: toCoAuthorsRequest(coAuthors),
    qaHandlerUserIds: resolveQaHandlerUserIds({
      artistUserId: author.userId,
      coAuthors,
      ownerUserId,
      previous: previous?.qaHandlerUserIds ?? [],
    }),
  };
}

export function buildCreateArtworkRequest(
  displayId: number,
  input: Omit<ExhibitionArtworkRequestInput, 'previous'>,
): CreateExhibitionArtworkRequestDto {
  return { displayId, ...buildUpdateArtworkRequest(input) };
}

/** 개인 작품 수정에서는 화면에 없는 감상 포인트 · 사진 설명을 그대로 보낸다 */
export function buildPersonalArtworkRequest(
  values: ArtworkRegisterValues,
  images: ArtworkImageUrls,
  previous?: PreviousArtworkInfo & { point?: string | null },
): PersonalArtworkRequestDto {
  const point = previous?.point?.trim();
  const types = toArtworkTypes(values.fieldLabels, 'personal');

  return {
    ...toArtworkInfoRequest(values, images, previous),
    type: types[0],
    types,
    ...(point && { point }),
  };
}

type ArtworkInfoSource = Pick<
  DisplayArtworkEditResponseDataDto,
  'artworkName' | 'content' | 'type' | 'types' | 'productionYear' | 'materialMedia' | 'size'
> &
  Partial<Pick<DisplayArtworkEditResponseDataDto, 'parts'>>;

/** 저장된 작품 2부터 칸의 구분 값. 수정 화면이 같은 순서의 사진(partUrls)을 찾는다 */
export const toSavedArtworkPartKey = (index: number) => `saved-${index}`;

/** 저장된 작품 2부터를 입력값으로 바꾼다. 사진 · 영상은 각 칸이 불러온 뒤 채운다 */
export function toArtworkPartValues(parts: readonly ArtworkPartDto[] | null | undefined) {
  return (parts ?? []).map(
    (part, index): ArtworkPartValues => ({
      key: toSavedArtworkPartKey(index),
      title: part.artworkName ?? '',
      year: part.productionYear ? String(part.productionYear) : '',
      material: part.materialMedia ?? '',
      size: part.size ?? '',
      media: [],
    }),
  );
}

/** 수정 화면에 채울 입력값. types 가 없으면 type(쉼표로 이어진 값일 수 있다)을 쓴다 */
export function toArtworkRegisterValues(
  source: ArtworkInfoSource | PersonalArtworkResponseDataDto,
): ArtworkRegisterValues {
  return {
    title: source.artworkName ?? '',
    intro: source.content ?? '',
    fieldLabels: toArtworkFieldLabels(readArtworkTypes(source)),
    year: source.productionYear ? String(source.productionYear) : '',
    material: source.materialMedia ?? '',
    size: source.size ?? '',
    parts: 'parts' in source ? toArtworkPartValues(source.parts) : [],
  };
}
