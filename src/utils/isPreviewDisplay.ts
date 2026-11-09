import type { DisplayDetailDto } from '@/api/dto';

import { getExhibitionState } from './exhibitionState';

/*
 * 공개 전 안내 띠를 두고 저장 · 좋아요 · 후기를 막는 전시.
 * 등록 중(status DRAFT, 팀원 미리보기)이거나 아직 개막 전인 전시다.
 * 상세 응답의 status 는 공개 여부(PUBLISHED · DRAFT)라 전시 예정은 기간으로 계산한다
 */
export const isPreviewDisplay = (
  display: Pick<DisplayDetailDto, 'status' | 'period'>,
  now = Date.now(),
) => display.status === 'DRAFT' || getExhibitionState(display.period, now) === 'upcoming';
