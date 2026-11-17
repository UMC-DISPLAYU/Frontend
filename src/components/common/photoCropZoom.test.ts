import { describe, expect, it, vi } from 'vitest';

import { bindStageZoom, wheelZoomFactor } from './photoCropZoom';

const fire = (target: EventTarget, type: string, props: Record<string, unknown> = {}) => {
  const event = new Event(type, { cancelable: true });
  for (const [key, value] of Object.entries(props)) Object.defineProperty(event, key, { value });
  target.dispatchEvent(event);
  return event;
};

const setup = (isTouchPinching = () => false) => {
  const stage = new EventTarget();
  const onZoom = vi.fn();
  const unbind = bindStageZoom(stage, onZoom, isTouchPinching);
  return { stage, onZoom, unbind };
};

describe('wheelZoomFactor', () => {
  it('터치패드 핀치(ctrlKey)는 deltaY 에 비례해 부드럽게', () => {
    expect(wheelZoomFactor({ deltaY: 0, ctrlKey: true })).toBe(1);
    expect(wheelZoomFactor({ deltaY: -10, ctrlKey: true })).toBeCloseTo(Math.exp(-0.1));
  });

  it('일반 휠은 한 칸씩: 내리면 축소, 올리면 확대', () => {
    expect(wheelZoomFactor({ deltaY: 100, ctrlKey: false })).toBe(1.04);
    expect(wheelZoomFactor({ deltaY: -100, ctrlKey: false })).toBe(0.96);
  });
});

describe('bindStageZoom', () => {
  it('휠 · 터치패드 핀치는 페이지 기본 동작을 막고 사진을 확대한다', () => {
    const { stage, onZoom } = setup();
    const event = fire(stage, 'wheel', { deltaY: -10, ctrlKey: true });
    expect(event.defaultPrevented).toBe(true);
    expect(onZoom).toHaveBeenCalledWith(Math.exp(-0.1));
  });

  it('리스너는 passive: false 로 붙인다', () => {
    const stage = new EventTarget();
    const spy = vi.spyOn(stage, 'addEventListener');
    bindStageZoom(stage, vi.fn(), () => false);
    expect(spy).toHaveBeenCalledWith('wheel', expect.any(Function), { passive: false });
  });

  it('Safari 터치패드 핀치(gesture)는 막고 이전 scale 대비 배율로 확대한다', () => {
    const { stage, onZoom } = setup();
    expect(fire(stage, 'gesturestart', { scale: 1 }).defaultPrevented).toBe(true);
    expect(fire(stage, 'gesturechange', { scale: 2 }).defaultPrevented).toBe(true);
    expect(onZoom).toHaveBeenLastCalledWith(0.5);
    fire(stage, 'gesturechange', { scale: 1 });
    expect(onZoom).toHaveBeenLastCalledWith(2);
    expect(fire(stage, 'gestureend', { scale: 1 }).defaultPrevented).toBe(true);
  });

  it('gesture 중 · 직후에 같이 들어오는 휠은 두 번 확대되지 않게 막기만 한다', () => {
    const { stage, onZoom } = setup();
    fire(stage, 'gesturestart', { scale: 1, timeStamp: 1000 });
    const wheel = fire(stage, 'wheel', { deltaY: -10, ctrlKey: true, timeStamp: 1050 });
    expect(wheel.defaultPrevented).toBe(true);
    expect(onZoom).not.toHaveBeenCalled();
    fire(stage, 'gestureend', { scale: 1, timeStamp: 1100 });
    fire(stage, 'wheel', { deltaY: -10, ctrlKey: true, timeStamp: 1250 });
    expect(onZoom).not.toHaveBeenCalled();
    fire(stage, 'wheel', { deltaY: -10, ctrlKey: true, timeStamp: 1300 });
    expect(onZoom).toHaveBeenCalledTimes(1);
  });

  it('gestureend 가 오지 않아도 잠시 뒤 휠 확대가 다시 된다', () => {
    const { stage, onZoom } = setup();
    fire(stage, 'gesturestart', { scale: 1, timeStamp: 1000 });
    fire(stage, 'gesturechange', { scale: 1.2, timeStamp: 1020 });
    onZoom.mockClear();
    fire(stage, 'wheel', { deltaY: 100, timeStamp: 5000 });
    expect(onZoom).toHaveBeenCalledWith(1.04);
  });

  it('두 손가락 터치 핀치 중 gesture(iOS)는 pointer 핀치에 맡기고 막기만 한다', () => {
    const { stage, onZoom } = setup(() => true);
    fire(stage, 'gesturestart', { scale: 1 });
    expect(fire(stage, 'gesturechange', { scale: 2 }).defaultPrevented).toBe(true);
    expect(onZoom).not.toHaveBeenCalled();
  });

  it('터치 핀치로 시작한 gesture 는 손가락 하나를 떼도 끝날 때까지 확대하지 않는다', () => {
    let touching = true;
    const { stage, onZoom } = setup(() => touching);
    fire(stage, 'gesturestart', { scale: 1 });
    touching = false;
    fire(stage, 'gesturechange', { scale: 1.5 });
    expect(onZoom).not.toHaveBeenCalled();
  });

  it('해제하면 더 이상 반응하지 않는다', () => {
    const { stage, onZoom, unbind } = setup();
    unbind();
    const event = fire(stage, 'wheel', { deltaY: -10, ctrlKey: true });
    expect(event.defaultPrevented).toBe(false);
    expect(onZoom).not.toHaveBeenCalled();
  });
});
