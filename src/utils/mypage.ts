export function statusBadgeClass(status: string): string {
  return status.includes('종료') ? 'bg-tag-bg' : 'bg-tag-bg';
}
