export function statusBadgeClass(status: string): string {
  return status.includes('종료') ? 'bg-neutral-400' : 'bg-tag-blue';
}
