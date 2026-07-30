/**
 * URL 파라미터에서 전시 ID를 안전하게 파싱합니다.
 * 양의 정수가 아니면 null을 반환하여 호출부에서 유효하지 않은 ID를 즉시 처리할 수 있습니다.
 */
export function parseDisplayId(id: string | undefined): number | null {
  if (!id) return null;
  const parsed = Number(id);
  if (!Number.isInteger(parsed) || parsed <= 0) return null;
  return parsed;
}
