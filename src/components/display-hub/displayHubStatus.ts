import type { DisplayPublishStatus } from '@/api/dto';
import { isDisplayPublishStatus } from '@/components/common/displayPublishStatus';

export type DisplayHubStatus = DisplayPublishStatus;

export const getDisplayHubStatus = (status: string | undefined): DisplayHubStatus =>
  isDisplayPublishStatus(status) ? status : 'DRAFT';

interface DisplayHubStatusMeta {
  title: string;
  description: string;
  noticeClassName: string;
  noticeTitleClassName: string;
}

// 배너 색은 프로토타입(hub.html `.ban`) 값을 그대로 쓴다
export const DISPLAY_HUB_STATUS_META: Record<DisplayHubStatus, DisplayHubStatusMeta> = {
  DRAFT: {
    title: '전시 등록을 준비 중이에요',
    description: '준비를 마치면 등록을 요청해 보세요\n작품이나 팀원이 없어도 요청할 수 있어요',
    noticeClassName: 'bg-secondary',
    noticeTitleClassName: 'text-primary',
  },
  PENDING_REVIEW: {
    title: '등록을 심사하고 있어요',
    description: '심사 중에도 수정할 수 있어요 승인되면 저장된 내용이 공개돼요',
    noticeClassName: 'bg-[#dbeafe]',
    noticeTitleClassName: 'text-[#2563eb]',
  },
  REJECTED: {
    title: '등록이 반려됐어요',
    description: '수정한 뒤 다시 요청해 주세요',
    noticeClassName: 'bg-[#ffe0e0]',
    noticeTitleClassName: 'text-[#fb2c36]',
  },
  PUBLISHED: {
    title: '전시가 공개 중이에요',
    description: '공개된 뒤에도 내용을 수정할 수 있어요',
    noticeClassName: 'bg-[#dcfce7]',
    noticeTitleClassName: 'text-[#00a846]',
  },
};

const toDotted = (date: string) => date.replace(/-/g, '.');

/** "2026-05-28", "2026-06-05" → "2026.05.28 - 06.05". 연도가 다르면 끝 날짜에도 연도를 붙인다 */
export const formatDisplayHubPeriod = (startDate: string, endDate: string) => {
  const end = startDate.slice(0, 4) === endDate.slice(0, 4) ? endDate.slice(5) : endDate;
  return `${toDotted(startDate)} - ${toDotted(end)}`;
};

/** "2026-05-28" → "05.28" */
export const formatDisplayHubMonthDay = (date: string) => toDotted(date.slice(5));
