import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { createChromeFade } from './useViewerChromeFade';

const setup = ({
  isDesktop,
  reduceMotion = false,
}: {
  isDesktop: boolean;
  reduceMotion?: boolean;
}) => {
  const state = { idle: false, chipIdle: false };
  const fade = createChromeFade({
    onIdleChange: (idle) => {
      state.idle = idle;
    },
    onChipIdleChange: (idle) => {
      state.chipIdle = idle;
    },
    isDesktop: () => isDesktop,
    prefersReducedMotion: () => reduceMotion,
  });
  fade.wake();
  return { fade, state };
};

beforeEach(() => {
  vi.useFakeTimers();
});

afterEach(() => {
  vi.useRealTimers();
});

describe('보기 방식 흐려짐 — 900px 이상', () => {
  it('보기 방식을 1.5초 동안 누르지 않으면 흐려진다', () => {
    const { state } = setup({ isDesktop: true });
    vi.advanceTimersByTime(1499);
    expect(state.idle).toBe(false);
    vi.advanceTimersByTime(1);
    expect(state.idle).toBe(true);
  });

  it('보기 방식 밖을 누르면 바로 흐려지고, 사진 위로 마우스를 움직여도 다시 또렷해지지 않는다', () => {
    const { fade, state } = setup({ isDesktop: true });
    fade.pointerDown({ inControls: false, inStage: true });
    expect(state.idle).toBe(true);
    fade.pointerMove(true);
    expect(state.idle).toBe(true);
  });

  it('보기 방식을 누르면 또렷해지고 1.5초 타이머를 다시 센다', () => {
    const { fade, state } = setup({ isDesktop: true });
    fade.pointerDown({ inControls: false, inStage: false });
    fade.pointerDown({ inControls: true, inStage: true });
    expect(state.idle).toBe(false);
    vi.advanceTimersByTime(1500);
    expect(state.idle).toBe(true);
  });

  it('마우스를 올려 두는 동안은 흐려지지 않고, 내리면 1.5초 뒤 흐려진다', () => {
    const { fade, state } = setup({ isDesktop: true });
    vi.advanceTimersByTime(1500);
    fade.enter();
    expect(state.idle).toBe(false);
    vi.advanceTimersByTime(5000);
    expect(state.idle).toBe(false);
    fade.leave();
    vi.advanceTimersByTime(1500);
    expect(state.idle).toBe(true);
  });

  it('마우스로 눌러 생긴 초점은 잡아 두지 않고, 밖을 눌러 초점이 빠져도 다시 또렷해지지 않는다', () => {
    const { fade, state } = setup({ isDesktop: true });
    fade.enter();
    fade.focus(false);
    fade.leave();
    vi.advanceTimersByTime(1500);
    expect(state.idle).toBe(true);

    fade.pointerDown({ inControls: true, inStage: true });
    fade.pointerDown({ inControls: false, inStage: false });
    fade.blur();
    expect(state.idle).toBe(true);
  });

  it('키보드 초점이 있는 동안은 또렷하고, 빠지면 1.5초 뒤 흐려진다', () => {
    const { fade, state } = setup({ isDesktop: true });
    fade.focus(true);
    vi.advanceTimersByTime(5000);
    expect(state.idle).toBe(false);
    fade.blur();
    expect(state.idle).toBe(false);
    vi.advanceTimersByTime(1500);
    expect(state.idle).toBe(true);
  });

  it('움직임 줄이기면 밖을 눌러도 흐려지지 않는다', () => {
    const { fade, state } = setup({ isDesktop: true, reduceMotion: true });
    fade.pointerDown({ inControls: false, inStage: true });
    vi.advanceTimersByTime(5000);
    expect(state.idle).toBe(false);
  });
});

describe('보기 방식 흐려짐 — 900px 미만(그대로)', () => {
  it('3초 동안 건드리지 않으면 흐려지고, 사진을 누르면 다시 또렷해진다', () => {
    const { fade, state } = setup({ isDesktop: false });
    vi.advanceTimersByTime(2999);
    expect(state.idle).toBe(false);
    vi.advanceTimersByTime(1);
    expect(state.idle).toBe(true);
    fade.pointerDown({ inControls: false, inStage: true });
    expect(state.idle).toBe(false);
  });

  it('사진 밖을 눌러도 바로 흐려지지 않는다', () => {
    const { fade, state } = setup({ isDesktop: false });
    fade.pointerDown({ inControls: false, inStage: false });
    expect(state.idle).toBe(false);
  });

  it('누른 버튼의 초점은 그대로 잡아 두고, 초점이 빠지면 또렷해진 뒤 3초를 다시 센다', () => {
    const { fade, state } = setup({ isDesktop: false });
    fade.focus(false);
    vi.advanceTimersByTime(5000);
    expect(state.idle).toBe(false);
    fade.blur();
    vi.advanceTimersByTime(2999);
    expect(state.idle).toBe(false);
    vi.advanceTimersByTime(1);
    expect(state.idle).toBe(true);
  });

  it('흐려진 뒤 마우스를 움직이면 또렷해진다', () => {
    const { fade, state } = setup({ isDesktop: false });
    vi.advanceTimersByTime(3000);
    fade.pointerMove(true);
    expect(state.idle).toBe(false);
  });
});

it('장수 칩은 넘긴 직후 1.6초만 보인다', () => {
  const { fade, state } = setup({ isDesktop: false });
  vi.advanceTimersByTime(1600);
  expect(state.chipIdle).toBe(true);
  fade.peekChip();
  expect(state.chipIdle).toBe(false);
  vi.advanceTimersByTime(1600);
  expect(state.chipIdle).toBe(true);
});
