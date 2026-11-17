import type { DisplayDetailDto } from '@/api/dto';

/*
 * 아직 공개되지 않은 등록 중 전시(status DRAFT). 공개 상세 주소로 열면 미리보기 주소로 보낸다.
 * 심사를 통과해 공개(PUBLISHED)된 전시는 개막 전이어도 일반 상세로 보인다
 */
export const isPreviewDisplay = (display: Pick<DisplayDetailDto, 'status'>) =>
  display.status === 'DRAFT';
