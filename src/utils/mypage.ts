export function statusBadgeClass(status: string): string {
  return status.includes('종료') ? 'bg-tag-bg' : 'bg-tag-bg';
}

const DISPLAY_STATUS_LABEL: Record<string, string> = {
  UPCOMING: '전시 예정',
  DISPLAYING: '전시 중',
  ENDED: '전시 종료',
};

/* GET /v1/display/me, GET /v1/display/artists/:userId 의 displayStatus(UPCOMING/DISPLAYING/ENDED)를 한글 라벨로 변환 */
export function getDisplayStatusLabel(displayStatus: string): string {
  return DISPLAY_STATUS_LABEL[displayStatus] ?? displayStatus;
}
