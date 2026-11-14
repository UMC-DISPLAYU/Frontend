const RELOADED_KEY = 'du.chunkReloaded';
// 같은 주소에서 이 시간 안에 또 실패하면 배포 문제가 아니라고 보고 반복하지 않는다
const RELOAD_GUARD_MS = 60_000;

// 브라우저마다 동적 import·CSS 미리 불러오기 실패 문구가 다르다 (Chrome · Firefox · Safari · Vite)
const CHUNK_LOAD_ERROR_PATTERNS = [
  /Failed to fetch dynamically imported module/i,
  /error loading dynamically imported module/i,
  /Importing a module script failed/i,
  /is not a valid JavaScript MIME type/i,
  /Unable to preload CSS/i,
];

interface ReloadRecord {
  target: string;
  at: number;
}

interface StaleChunkReloadEnv {
  target: string;
  now: number;
  isOnline: boolean;
  storage: Pick<Storage, 'getItem' | 'setItem'> | null;
  reload: () => void;
}

export const isChunkLoadError = (error: unknown) =>
  error instanceof Error &&
  CHUNK_LOAD_ERROR_PATTERNS.some((pattern) => pattern.test(error.message));

export const shouldReloadForStaleChunk = (last: ReloadRecord | null, target: string, now: number) =>
  !last || last.target !== target || now - last.at > RELOAD_GUARD_MS;

const readLastReload = (storage: StaleChunkReloadEnv['storage']): ReloadRecord | null => {
  try {
    const saved = JSON.parse(storage?.getItem(RELOADED_KEY) ?? 'null');
    if (typeof saved?.target === 'string' && Number.isFinite(saved?.at)) return saved;
  } catch {
    // 깨진 기록은 없는 것으로 본다
  }
  return null;
};

/**
 * 배포 뒤 이전 빌드의 페이지 파일이 사라져 동적 import가 실패하면 새로고침해서 새 파일을 받는다.
 * 새로고침했으면 true. 파일을 못 받은 오류가 아니거나, 오프라인이거나, 같은 주소에서 방금 새로고침했거나,
 * 기록을 남길 수 없으면(무한 새로고침 방지) false.
 */
export const reloadForStaleChunk = (
  error: unknown,
  { target, now, isOnline, storage, reload }: StaleChunkReloadEnv,
) => {
  if (!isChunkLoadError(error) || !isOnline || !storage) return false;
  if (!shouldReloadForStaleChunk(readLastReload(storage), target, now)) return false;
  try {
    storage.setItem(RELOADED_KEY, JSON.stringify({ target, at: now } satisfies ReloadRecord));
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

export const reloadForStaleChunkInBrowser = (error: unknown) =>
  reloadForStaleChunk(error, {
    target: `${window.location.pathname}${window.location.search}`,
    now: Date.now(),
    isOnline: navigator.onLine,
    storage: getSessionStorage(),
    reload: () => window.location.reload(),
  });

// 새로고침이 시작된 뒤 다른 파일 실패로 에러 화면이 잠깐 보이지 않게 한다
let isReloading = false;
// 이동 확인 창에서 '머무르기'를 누르는 등 새로고침되지 않으면 원래 오류를 보여준다
const RELOAD_FALLBACK_MS = 10_000;

/**
 * lazy import의 catch에 넣는다. 새로고침하면 그동안 로딩 화면이 유지되도록 바로 끝나지 않는 Promise를,
 * 아니면 원래 오류를 돌려준다.
 */
export const handleStaleChunkError = (error: unknown): Promise<never> => {
  if (!isReloading && !reloadForStaleChunkInBrowser(error)) return Promise.reject(error);
  isReloading = true;
  return new Promise<never>((_, reject) => {
    setTimeout(() => {
      isReloading = false;
      reject(error);
    }, RELOAD_FALLBACK_MS);
  });
};
