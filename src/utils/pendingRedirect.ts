/*
 * 로그인 후 돌아갈 경로를 잠시 보관합니다.
 * OAuth 로그인은 페이지를 통째로 새로고침하므로 sessionStorage에 남겨야 합니다.
 * 저장하는 쪽이 완성된 경로를 넘기므로 이 유틸은 어떤 화면인지 알 필요가 없습니다.
 */
const PENDING_REDIRECT_KEY = 'pending-redirect';

export function savePendingRedirect(path: string) {
  if (!path) return;

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

  return path;
}
