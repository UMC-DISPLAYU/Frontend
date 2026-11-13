import { beforeEach, describe, expect, it, vi } from 'vitest';

import { useLeaveArtworkRegister } from './useLeaveArtworkRegister';

const h = vi.hoisted(() => ({
  navigate: vi.fn(),
  listeners: [] as (() => void)[],
  idx: undefined as number | undefined,
}));

vi.mock('react', async (original) => ({
  ...(await original<typeof import('react')>()),
  useCallback: <T>(callback: T) => callback,
}));
vi.mock('react-router-dom', () => ({ useNavigate: () => h.navigate }));

beforeEach(() => {
  vi.clearAllMocks();
  h.listeners = [];
  h.idx = undefined;
  vi.stubGlobal('window', {
    history: {
      get state() {
        return h.idx === undefined ? null : { idx: h.idx };
      },
    },
    addEventListener: (type: string, listener: () => void) => {
      if (type === 'popstate') h.listeners.push(listener);
    },
  });
});

describe('useLeaveArtworkRegister', () => {
  it('들어온 기록이 있으면 뒤로 간다. 확인 모달이 열려 있으면 모달 기록까지 두 단계', () => {
    const leave = useLeaveArtworkRegister();
    h.idx = 2;

    leave('/fallback');
    expect(h.navigate).toHaveBeenLastCalledWith(-1);

    leave('/fallback', { overlayOpen: true });
    expect(h.navigate).toHaveBeenLastCalledWith(-2);
  });

  it('들어온 기록이 없으면 fallback 으로 바꾼다', () => {
    const leave = useLeaveArtworkRegister();
    h.idx = 0;
    leave('/fallback');
    expect(h.navigate).toHaveBeenLastCalledWith('/fallback', { replace: true });

    h.idx = undefined;
    leave('/fallback', { overlayOpen: true });
    expect(h.navigate).toHaveBeenLastCalledWith('/fallback', { replace: true });
  });

  it('직접 들어와 모달만 열린 상태면 모달 기록을 되돌린 뒤 이 화면 기록을 fallback 으로 바꾼다', () => {
    const leave = useLeaveArtworkRegister();
    h.idx = 1;

    leave('/fallback', { overlayOpen: true });
    expect(h.navigate).toHaveBeenCalledTimes(1);
    expect(h.navigate).toHaveBeenLastCalledWith(-1);

    h.listeners.forEach((listener) => listener());
    expect(h.navigate).toHaveBeenLastCalledWith('/fallback', { replace: true });
  });
});
