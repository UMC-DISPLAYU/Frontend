import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import {
  dismissToast,
  removeToast,
  toast,
  TOAST_DURATION_MS,
  TOAST_EXIT_FALLBACK_MS,
  useToastStore,
} from './toastStore';

const current = () => useToastStore.getState().toast;

describe('toastStore', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    const item = current();
    if (item) removeToast(item.id);
    vi.useRealTimers();
  });

  it('3초 뒤 닫힘을 시작하고, 닫힘 애니메이션이 끝나면 지운다', () => {
    const id = toast('저장했어요');
    expect(current()).toEqual({ id, message: '저장했어요', isClosing: false });

    vi.advanceTimersByTime(TOAST_DURATION_MS - 1);
    expect(current()?.isClosing).toBe(false);

    vi.advanceTimersByTime(1);
    expect(current()?.isClosing).toBe(true);

    removeToast(id);
    expect(current()).toBeNull();
  });

  it('animationend 가 오지 않아도 대체 시간이 지나면 지운다', () => {
    toast('저장했어요');
    vi.advanceTimersByTime(TOAST_DURATION_MS);
    vi.advanceTimersByTime(TOAST_EXIT_FALLBACK_MS - 1);
    expect(current()).not.toBeNull();

    vi.advanceTimersByTime(1);
    expect(current()).toBeNull();
  });

  it('떠 있는 중에 다시 부르면 새 문구로 바꾸고 시간을 처음부터 센다', () => {
    const first = toast('첫 번째');
    vi.advanceTimersByTime(2000);

    const second = toast('두 번째');
    expect(second).not.toBe(first);
    expect(current()?.message).toBe('두 번째');

    vi.advanceTimersByTime(2000);
    expect(current()?.isClosing).toBe(false);

    vi.advanceTimersByTime(TOAST_DURATION_MS - 2000);
    expect(current()?.isClosing).toBe(true);
  });

  it('닫히는 중에 새로 부르면 이전 토스트의 대체 타이머가 새 토스트를 지우지 않는다', () => {
    toast('첫 번째');
    vi.advanceTimersByTime(TOAST_DURATION_MS);

    const second = toast('두 번째');
    vi.advanceTimersByTime(TOAST_EXIT_FALLBACK_MS);
    expect(current()).toEqual({ id: second, message: '두 번째', isClosing: false });
  });

  it('이미 바뀐 토스트의 id 로는 닫거나 지우지 않는다', () => {
    const first = toast('첫 번째');
    toast('두 번째');

    dismissToast(first);
    removeToast(first);
    expect(current()?.message).toBe('두 번째');
    expect(current()?.isClosing).toBe(false);
  });

  it('dismissToast() 는 지금 토스트를 바로 닫기 시작한다', () => {
    toast('저장했어요', { duration: 10_000 });
    dismissToast();

    expect(current()?.isClosing).toBe(true);
  });
});
