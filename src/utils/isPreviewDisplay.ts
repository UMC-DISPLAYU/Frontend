import type { DisplayDetailDto } from '@/api/dto';

/*
 * 대중에게 공개되지 않은 전시 상태. 정책: 준비 중(DRAFT, 비공개 전환 포함) · 심사 중(PENDING_REVIEW) · 반려(REJECTED).
 * 심사가 승인되면 공개 중(PUBLISHED)이 되고, 그때부터 개막 전이어도 대중에게 공개된다
 */
const NOT_PUBLIC_STATUSES = new Set(['DRAFT', 'PENDING_REVIEW', 'REJECTED']);

/* 공개 상세 주소로 열면 미리보기 주소로 보내는 전시 */
export const isPreviewDisplay = (display: Pick<DisplayDetailDto, 'status'>) =>
  NOT_PUBLIC_STATUSES.has(display.status);
