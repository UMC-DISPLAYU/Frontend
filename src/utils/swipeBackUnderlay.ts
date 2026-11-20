// 복제한 DOM 을 메모리에 들고 있으므로 돌아갈 가능성이 큰 가까운 순번만 남긴다
const MAX_SNAPSHOTS = 5;

/**
 * history 순번(history.state.idx)별 저장소. 앞으로 이동하면 그 뒤 순번(앞으로 가기 기록)은 버려지므로
 * 저장할 때 같은 순번 이상과 limit 보다 오래된 순번을 지운다.
 */
export function createHistorySnapshots<T>(limit: number) {
  const snapshots = new Map<number, T>();

  return {
    save(idx: number, snapshot: T) {
      for (const key of snapshots.keys()) {
        if (key >= idx || key <= idx - limit) snapshots.delete(key);
      }
      snapshots.set(idx, snapshot);
    },
    get: (idx: number) => snapshots.get(idx),
  };
}

// cloneNode 는 가로 목록 같은 안쪽 스크롤 위치를 복사하지 않는다. 돌아간 실제 화면도 안쪽 스크롤을 복원하지 않아
// (다시 마운트되어 처음으로 감) 그대로 두는 편이 바뀌는 순간 튀지 않는다
type PageSnapshot = { page: HTMLElement; scrollY: number };

const snapshots = createHistorySnapshots<PageSnapshot>(MAX_SNAPSHOTS);
let underlay: HTMLElement | null = null;

/** 떠나는 화면의 모습과 스크롤 위치를 그 화면의 history 순번으로 저장한다 */
export function savePageSnapshot(idx: number) {
  const root = document.getElementById('root');
  if (!root) return;

  const page = root.cloneNode(true) as HTMLElement;
  page.removeAttribute('id');
  snapshots.save(idx, { page, scrollY: window.scrollY });
}

/** 저장한 화면을 #root 뒤에 깐다. 저장한 화면이 없으면(주소로 바로 들어온 경우 등) 아무것도 하지 않는다 */
export function showUnderlay(idx: number) {
  const snapshot = snapshots.get(idx);
  if (!snapshot || underlay) return;

  underlay = document.createElement('div');
  // 복제본의 등장 애니메이션(animate-rise 등) · 트랜지션이 처음부터 다시 재생되지 않게 끈다
  underlay.className =
    'pointer-events-none fixed inset-0 z-0 overflow-hidden bg-primary-white **:animate-none! **:transition-none!';
  underlay.inert = true;
  underlay.setAttribute('aria-hidden', 'true');
  underlay.append(snapshot.page);
  document.body.prepend(underlay);
  // top 으로 내리지 않고 스크롤한다. 그래야 복제본 안의 sticky 헤더가 실제 화면처럼 붙어 있다
  underlay.scrollTop = snapshot.scrollY;
}

export function hideUnderlay() {
  underlay?.remove();
  underlay = null;
}

/**
 * 쓸어서 돌아간 화면의 목록 등장 애니메이션을 끝난 상태로 둔다. 다시 재생되면 뒤에 깔았던 화면에서
 * 카드가 사라졌다 올라오는 것처럼 튄다. 이동을 그린 뒤 · 첫 페인트 전(rAF)에 처리한다
 */
export function skipReturnAnimations() {
  requestAnimationFrame(() => {
    document.querySelectorAll('#root .animate-rise').forEach((el) => {
      el.getAnimations().forEach((animation) => animation.finish());
    });
  });
}
