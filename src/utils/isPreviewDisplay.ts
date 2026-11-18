import type { DisplayDetailDto } from '@/api/dto';

/*
 * 대중에게 공개되지 않은 전시 상태. 정책: 준비 중(DRAFT, 비공개 전환 포함) · 심사 중(PENDING_REVIEW) · 반려(REJECTED).
 * 심사가 승인되면 공개 중(PUBLISHED)이 되고, 그때부터 개막 전이어도 대중에게 공개된다
 */
const NOT_PUBLIC_STATUSES = new Set(['DRAFT', 'PENDING_REVIEW', 'REJECTED']);

/*
 * 미리보기로만 보이는 전시(사용자 결정). true 면 상세 주소(/display/:id · /display/:id/contents · /artwork/:id)는
 * 팀원이어도 404 다. 미리보기 주소(/exhibition/:id/preview …)는 공개 여부와 상관없이 팀원에게만 미리보기로 보이고, 서로 보내지 않는다
 */
export const isPreviewDisplay = (display: Pick<DisplayDetailDto, 'status'>) =>
  NOT_PUBLIC_STATUSES.has(display.status);
