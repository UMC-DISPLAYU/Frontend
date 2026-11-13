import type {
  ArtworkImageRequestDto,
  CreateExhibitionArtworkRequestDto,
  DisplayArtworkEditResponseDataDto,
  ImageResponseDto,
  PersonalArtworkRequestDto,
  PersonalArtworkResponseDataDto,
  UpdateExhibitionArtworkRequestDto,
} from '@/api/dto';
import { DEFAULT_ARTWORK_IMAGE_HEIGHT, DEFAULT_ARTWORK_IMAGE_WIDTH } from '@/constants';

import { toArtworkFieldLabels, toArtworkTypes } from './artworkRegister.constants';
import type { ArtworkRegisterValues } from './artworkRegister.schema';
import type { ArtworkPerson } from './artworkRegister.types';

export interface ArtworkImageUrls {
  artworkUrls: string[];
  processUrls: string[];
}

type ImageLike = Pick<ImageResponseDto, 'imageUrl' | 'sortOrder'> & {
  imageType?: string | null;
  isThumbnail?: boolean | null;
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
 * 화면은 첫 장을 대표 사진으로 보여주므로 대표 사진(isThumbnail)을 맨 앞에 둔다
 */
export function splitArtworkImages(images: readonly ImageLike[] | undefined): ArtworkImageUrls {
  const sorted = [...(images ?? [])].sort((a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0));
  const artworkImages = sorted.filter((image) => image.imageType !== 'WORK_PROCESS');
  const thumbnail = artworkImages.find((image) => image.isThumbnail);

  return {
    artworkUrls: (thumbnail
      ? [thumbnail, ...artworkImages.filter((image) => image !== thumbnail)]
      : artworkImages
    ).map((image) => image.imageUrl),
    processUrls: sorted
      .filter((image) => image.imageType === 'WORK_PROCESS')
      .map((image) => image.imageUrl),
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
  { artworkUrls, processUrls }: ArtworkImageUrls,
  savedImages: readonly SavedArtworkImage[] = [],
): ArtworkImageRequestDto[] {
  const toImage = (
    imageUrl: string,
    index: number,
    imageType: ArtworkImageRequestDto['imageType'],
  ): ArtworkImageRequestDto => {
    const saved = savedImages.find((image) => image.imageUrl === imageUrl);
    const caption = saved?.caption?.trim();

    return {
      imageUrl,
      isThumbnail: imageType === 'ARTWORK' && index === 0,
      imageType,
      ...(caption && { caption }),
      width: positive(saved?.width) ?? DEFAULT_ARTWORK_IMAGE_WIDTH,
      height: positive(saved?.height) ?? DEFAULT_ARTWORK_IMAGE_HEIGHT,
      sortOrder: index + 1,
    };
  };

  return [
    ...artworkUrls.map((url, index) => toImage(url, index, 'ARTWORK')),
    ...processUrls.map((url, index) => toImage(url, index, 'WORK_PROCESS')),
  ];
}

/** 서버 분야 목록. types 가 없으면 type(쉼표로 이어진 값일 수 있다)을 쓴다 */
export function readArtworkTypes(source: Pick<PreviousArtworkInfo, 'type' | 'types'>): string[] {
  if (source.types && source.types.length > 0) return [...source.types];
  return (source.type ?? '')
    .split(',')
    .map((type) => type.trim())
    .filter(Boolean);
}

/** 작품 정보 입력값을 등록 · 수정 요청 공통 필드로 바꾼다 */
export function toArtworkInfoRequest(
  values: ArtworkRegisterValues,
  images: ArtworkImageUrls,
  previous?: PreviousArtworkInfo,
): PersonalArtworkRequestDto {
  const types = toArtworkTypes(values.fieldLabels, previous ? readArtworkTypes(previous) : []);

  // 수정에서 비운 설명 · 규격이 지워지도록 빈 문자열도 그대로 보낸다
  return {
    artworkName: values.title.trim(),
    content: values.intro.trim(),
    type: types[0],
    types,
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
  previous?: Pick<DisplayArtworkEditResponseDataDto, 'point' | 'qaHandlerUserIds'> &
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

  return {
    ...toArtworkInfoRequest(values, images, previous),
    ...(point && { point }),
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

/** 개인 작품 수정에서는 화면에 없는 감상 포인트 · 분야 · 사진 설명을 그대로 보낸다 */
export function buildPersonalArtworkRequest(
  values: ArtworkRegisterValues,
  images: ArtworkImageUrls,
  previous?: PreviousArtworkInfo & { point?: string | null },
): PersonalArtworkRequestDto {
  const point = previous?.point?.trim();

  return { ...toArtworkInfoRequest(values, images, previous), ...(point && { point }) };
}

type ArtworkInfoSource = Pick<
  DisplayArtworkEditResponseDataDto,
  'artworkName' | 'content' | 'type' | 'types' | 'productionYear' | 'materialMedia' | 'size'
>;

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
  };
}
