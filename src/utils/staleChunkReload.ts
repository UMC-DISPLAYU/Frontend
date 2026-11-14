const RELOADED_AT_KEY = 'du.chunkReloadedAt';
// 새로고침한 뒤에도 이 시간 안에 또 실패하면 배포 문제가 아니라고 보고 반복하지 않는다
const RELOAD_GUARD_MS = 10_000;

interface StaleChunkReloadEnv {
  now: number;
  isOnline: boolean;
  storage: Pick<Storage, 'getItem' | 'setItem'> | null;
  reload: () => void;
}

export const shouldReloadForStaleChunk = (lastReloadedAt: number | null, now: number) =>
  lastReloadedAt === null || now - lastReloadedAt > RELOAD_GUARD_MS;

const readLastReloadedAt = (storage: StaleChunkReloadEnv['storage']) => {
  const value = Number(storage?.getItem(RELOADED_AT_KEY));
  return Number.isFinite(value) && value > 0 ? value : null;
};

/**
 * 배포 뒤 이전 빌드의 페이지 파일이 사라져 동적 import가 실패하면 새로고침해서 새 파일을 받는다.
 * 새로고침했으면 true. 오프라인이거나, 방금 새로고침했거나, 기록을 남길 수 없으면(무한 새로고침 방지) false.
 */
export const reloadForStaleChunk = ({ now, isOnline, storage, reload }: StaleChunkReloadEnv) => {
  if (!isOnline || !storage) return false;
  try {
    if (!shouldReloadForStaleChunk(readLastReloadedAt(storage), now)) return false;
    storage.setItem(RELOADED_AT_KEY, String(now));
  } catch {
    return false;
  }
  reload();
  return true;
};

const getSessionStorage = () => {
  try {
    return window.sessionStorage;
  } catch {
    return null;
  }
};

export const reloadForStaleChunkInBrowser = () =>
  reloadForStaleChunk({
    now: Date.now(),
    isOnline: navigator.onLine,
    storage: getSessionStorage(),
    reload: () => window.location.reload(),
  });
