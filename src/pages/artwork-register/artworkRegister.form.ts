import type { FetchStatus } from '@tanstack/react-query';

import type { ArtworkRegisterDraft } from '@/contexts/artworkRegisterDraftState';

import type { ArtworkRegisterFormValues } from './artworkRegister.schema';

export const toArtworkRegisterFormValues = (
  draft: ArtworkRegisterDraft,
): ArtworkRegisterFormValues => ({
  artworkImageCount: draft.artworkImageUrls.length,
  title: draft.title,
  intro: draft.description,
  field: draft.field,
  year: draft.year,
  material: draft.medium,
  size: draft.size,
  thoughts: draft.point,
});

export const toArtworkRegisterDraft = (values: ArtworkRegisterFormValues) => ({
  title: values.title,
  description: values.intro ?? '',
  field: values.field,
  year: values.year,
  medium: values.material,
  size: values.size ?? '',
  point: values.thoughts ?? '',
});

// 첫 서버 조회가 끝난 뒤 한 번만 초기화해 사용자 입력과 이미지 변경을 보호합니다.
export const shouldInitializeArtworkRegister = (
  artworkId: number,
  initializedArtworkId: number | null,
  detailArtworkId: number | undefined,
  fetchStatus: FetchStatus,
  isError: boolean,
) =>
  artworkId > 0 &&
  detailArtworkId === artworkId &&
  initializedArtworkId !== artworkId &&
  fetchStatus === 'idle' &&
  !isError;
