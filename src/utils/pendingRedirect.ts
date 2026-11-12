/*
 * 로그인 후 돌아갈 경로를 잠시 보관합니다.
 * OAuth 로그인은 페이지를 통째로 새로고침하므로 sessionStorage에 남겨야 합니다.
 * 저장하는 쪽이 완성된 경로를 넘기므로 이 유틸은 어떤 화면인지 알 필요가 없습니다.
 */
const PENDING_REDIRECT_KEY = 'pending-redirect';

/* 외부 URL로 보내지 않도록 같은 사이트 경로(`/...`)만 허용합니다. `//host`, `/\host`는 브라우저가 외부 주소로 해석합니다. */
export function isInternalPath(path: string): boolean {
  return path.startsWith('/') && !path.startsWith('//') && !path.startsWith('/\\');
}

export function savePendingRedirect(path: string) {
  if (!isInternalPath(path)) return;

  sessionStorage.setItem(PENDING_REDIRECT_KEY, path);
}

export function clearPendingRedirect() {
  sessionStorage.removeItem(PENDING_REDIRECT_KEY);
}

/* 보관된 경로를 읽으면서 지웁니다. 한 번 쓰고 나면 남지 않습니다. */
export function consumePendingRedirect(): string | null {
  const path = sessionStorage.getItem(PENDING_REDIRECT_KEY);

  if (!path) return null;

  clearPendingRedirect();

  return isInternalPath(path) ? path : null;
}
