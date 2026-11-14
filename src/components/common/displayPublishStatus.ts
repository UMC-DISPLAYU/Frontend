import type { DisplayPublishStatus } from '@/api/dto';

const DISPLAY_PUBLISH_STATUSES: readonly string[] = [
  'DRAFT',
  'PENDING_REVIEW',
  'REJECTED',
  'PUBLISHED',
] satisfies DisplayPublishStatus[];

export const isDisplayPublishStatus = (
  status: string | null | undefined,
): status is DisplayPublishStatus => status != null && DISPLAY_PUBLISH_STATUSES.includes(status);
