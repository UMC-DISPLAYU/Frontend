import type {
  ArtworkImageRequestDto,
  CreateExhibitionArtworkRequestDto,
  DisplayArtworkEditResponseDataDto,
  ImageResponseDto,
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

type ImageLike = Pick<ImageResponseDto, 'imageUrl' | 'sortOrder'> & { imageType?: string | null };

/** 작품 이미지(ARTWORK)와 작업 과정(WORK_PROCESS)을 순서대로 나눈다. 구분이 없으면 작품 이미지로 본다 */
export function splitArtworkImages(images: readonly ImageLike[] | undefined): ArtworkImageUrls {
  const sorted = [...(images ?? [])].sort((a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0));

  return {
    artworkUrls: sorted
      .filter((image) => image.imageType !== 'WORK_PROCESS')
      .map((image) => image.imageUrl),
    processUrls: sorted
      .filter((image) => image.imageType === 'WORK_PROCESS')
      .map((image) => image.imageUrl),
  };
}

/*
 * 서버가 width/height 를 양수로 받는데 화면에서는 실제 크기를 쓰지 않아 고정값을 보낸다.
 * 대표 이미지는 작품 이미지 첫 장이다.
 */
export function toArtworkImageRequests({
  artworkUrls,
  processUrls,
}: ArtworkImageUrls): ArtworkImageRequestDto[] {
  const toImage = (
    imageUrl: string,
    index: number,
    imageType: ArtworkImageRequestDto['imageType'],
  ) => ({
    imageUrl,
    isThumbnail: imageType === 'ARTWORK' && index === 0,
    imageType,
    width: DEFAULT_ARTWORK_IMAGE_WIDTH,
    height: DEFAULT_ARTWORK_IMAGE_HEIGHT,
    sortOrder: index + 1,
  });

  return [
    ...artworkUrls.map((url, index) => toImage(url, index, 'ARTWORK')),
    ...processUrls.map((url, index) => toImage(url, index, 'WORK_PROCESS')),
  ];
}

type ArtworkInfoRequest = Pick<
  UpdateExhibitionArtworkRequestDto,
  | 'artworkName'
  | 'content'
  | 'type'
  | 'types'
  | 'productionYear'
  | 'materialMedia'
  | 'size'
  | 'images'
>;

/** 작품 정보 입력값을 등록 · 수정 요청 공통 필드로 바꾼다 */
export function toArtworkInfoRequest(
  values: ArtworkRegisterValues,
  images: ArtworkImageUrls,
): ArtworkInfoRequest {
  const types = toArtworkTypes(values.fieldLabels);

  // 수정에서 비운 설명 · 규격이 지워지도록 빈 문자열도 그대로 보낸다
  return {
    artworkName: values.title.trim(),
    content: values.intro.trim(),
    type: types[0],
    types,
    productionYear: Number(values.year),
    materialMedia: values.material.trim(),
    size: values.size.trim(),
    images: toArtworkImageRequests(images),
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
  /** 수정할 때만: 화면에 없는 감상 포인트 · 기존 Q&A 담당자를 그대로 보낸다 */
  previous?: Pick<DisplayArtworkEditResponseDataDto, 'point' | 'qaHandlerUserIds'>;
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
    ...toArtworkInfoRequest(values, images),
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

type ArtworkInfoSource = Pick<
  DisplayArtworkEditResponseDataDto,
  'artworkName' | 'content' | 'type' | 'types' | 'productionYear' | 'materialMedia' | 'size'
>;

/** 수정 화면에 채울 입력값. types 가 없으면 type(쉼표로 이어진 값일 수 있다)을 쓴다 */
export function toArtworkRegisterValues(source: ArtworkInfoSource): ArtworkRegisterValues {
  const types =
    source.types && source.types.length > 0
      ? source.types
      : (source.type ?? '').split(',').filter((type) => type.trim());

  return {
    title: source.artworkName ?? '',
    intro: source.content ?? '',
    fieldLabels: toArtworkFieldLabels(types),
    year: source.productionYear ? String(source.productionYear) : '',
    material: source.materialMedia ?? '',
    size: source.size ?? '',
  };
}
