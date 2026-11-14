import type { DisplayPublishStatus } from '@/api/dto';

// Record 로 두어 DTO 에 공개 상태가 늘면 여기서 컴파일 오류가 나게 한다
const DISPLAY_PUBLISH_STATUS: Record<DisplayPublishStatus, true> = {
  DRAFT: true,
  PENDING_REVIEW: true,
  REJECTED: true,
  PUBLISHED: true,
};

export const isDisplayPublishStatus = (
  status: string | null | undefined,
): status is DisplayPublishStatus =>
  status != null && Object.prototype.hasOwnProperty.call(DISPLAY_PUBLISH_STATUS, status);
