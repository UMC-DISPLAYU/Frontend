/**
 * authStore(zustand persist)가 저장소에 남긴 값(`{"state":{"accessToken":...},"version":1}`)의 토큰이
 * 메모리 토큰과 다른지 본다. 저장된 값이 없으면 토큰 없음으로 보고, 읽을 수 없으면(파싱 실패) 판단하지 않는다.
 */
export function hasPersistedTokenChanged(raw: string | null, memoryToken: string | null): boolean {
  let persistedToken: string | null = null;

  if (raw !== null) {
    try {
      const parsed = JSON.parse(raw) as { state?: { accessToken?: unknown } } | null;
      const token = parsed?.state?.accessToken;
      persistedToken = typeof token === 'string' ? token : null;
    } catch {
      return false;
    }
  }

  return persistedToken !== memoryToken;
}
