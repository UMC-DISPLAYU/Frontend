/* 되돌아가기 신호가 이 시간 안에 오지 않으면 브라우저가 기록 이동을 하지 않은 것으로 본다 */
export const HISTORY_ARRIVAL_TIMEOUT_MS = 2000;

type HistoryEventTarget = Pick<Window, 'addEventListener' | 'removeEventListener'> & {
  history: Pick<History, 'state'>;
};

// react-router 가 history.state 에 남기는 기록 번호(idx)
const readHistoryIndex = (history: Pick<History, 'state'>) => {
  const idx: unknown = (history.state as { idx?: unknown } | null)?.idx;
  return typeof idx === 'number' ? idx : undefined;
};

/**
 * 브라우저 기록이 targetIndex 에 실제로 도착하면(popstate) true, timeoutMs 안에 도착하지 않으면 false.
 * navigate(-n) 의 Promise 는 react-router 가 다른 이동에도 함께 풀어 버려 도착을 보장하지 않으므로, 대신 이것을 기다린다.
 * history.go 를 부르기 전에 불러야 popstate 를 놓치지 않는다.
 */
export function waitForHistoryIndex(
  targetIndex: number,
  {
    timeoutMs = HISTORY_ARRIVAL_TIMEOUT_MS,
    target = window,
  }: { timeoutMs?: number; target?: HistoryEventTarget } = {},
) {
  return new Promise<boolean>((resolve) => {
    const finish = (arrived: boolean) => {
      target.removeEventListener('popstate', handlePopState);
      clearTimeout(timer);
      resolve(arrived);
    };
    const handlePopState = () => {
      if (readHistoryIndex(target.history) === targetIndex) finish(true);
    };
    const timer = setTimeout(() => finish(false), timeoutMs);

    target.addEventListener('popstate', handlePopState);
  });
}
