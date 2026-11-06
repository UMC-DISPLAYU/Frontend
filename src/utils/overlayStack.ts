/**
 * 열려 있는 오버레이 목록과, 뒤로가기로 닫기 위해 history state 에 남기는 오버레이 id 목록을 다룬다.
 *
 * - 메모리 스택(overlayStack): 지금 열려 있는 오버레이. 맨 위만 ESC · Tab 가두기에 반응한다.
 * - history state(OVERLAY_STATE_KEY): 오버레이를 열 때 같은 URL 로 push 한 기록에 id 를 남긴다.
 *   뒤로가기로 이 id 가 사라지면 그 오버레이를 닫는다.
 */
export const OVERLAY_STATE_KEY = '__overlays';

type LocationState = Record<string, unknown>;

let sequence = 0;

// 새로고침 뒤 history state 에 남은 이전 id 와 겹치지 않도록 시간 값을 섞는다
export function createOverlayId() {
  sequence += 1;
  return `${Date.now().toString(36)}-${sequence}`;
}

export function createOverlayStack() {
  const ids: string[] = [];

  return {
    push(id: string) {
      if (!ids.includes(id)) ids.push(id);
    },
    remove(id: string) {
      const index = ids.indexOf(id);
      if (index >= 0) ids.splice(index, 1);
    },
    has(id: string) {
      return ids.includes(id);
    },
    isTop(id: string) {
      return ids.length > 0 && ids[ids.length - 1] === id;
    },
  };
}

export const overlayStack = createOverlayStack();

const isLocationState = (state: unknown): state is LocationState =>
  typeof state === 'object' && state !== null && !Array.isArray(state);

export function readOverlayIds(state: unknown): string[] {
  if (!isLocationState(state)) return [];

  const value = state[OVERLAY_STATE_KEY];

  return Array.isArray(value) ? value.filter((id): id is string => typeof id === 'string') : [];
}

/** 기존 state 는 그대로 두고 오버레이 id 를 맨 뒤에 붙인다. 이미 닫힌 오버레이 id 는 걸러낸다 */
export function withOverlayId(
  state: unknown,
  id: string,
  isAlive: (id: string) => boolean,
): LocationState {
  const base = isLocationState(state) ? state : {};
  const aliveIds = readOverlayIds(state).filter(isAlive);

  return { ...base, [OVERLAY_STATE_KEY]: [...aliveIds, id] };
}

export function withoutOverlayIds(state: unknown): LocationState | null {
  if (!isLocationState(state)) return null;

  const rest = { ...state };
  delete rest[OVERLAY_STATE_KEY];

  return Object.keys(rest).length > 0 ? rest : null;
}

/** 맨 위 오버레이 id 가 더 이상 열려 있지 않으면 쓸모없어진 기록이다 */
export function hasStaleOverlayEntry(state: unknown, isAlive: (id: string) => boolean) {
  const ids = readOverlayIds(state);
  const topId = ids[ids.length - 1];

  return topId !== undefined && !isAlive(topId);
}
