import type { DisplayDetailDto } from '@/api/dto';

/*
 * 공개 전 안내 띠를 두고 저장 · 좋아요 · 후기를 막는 전시.
 * 심사를 통과하지 않은 등록 중 전시(status DRAFT, 팀원 미리보기)만 해당한다.
 * 심사를 통과해 공개(PUBLISHED)된 전시는 개막 전이어도 일반 상세로 보인다
 */
export const isPreviewDisplay = (display: Pick<DisplayDetailDto, 'status'>) =>
  display.status === 'DRAFT';
