export function statusBadgeClass(status: string): string {
  return status.includes('종료') ? 'bg-tag-gray' : 'bg-tag-gray';
}
