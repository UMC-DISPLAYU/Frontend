import { describe, expect, it } from 'vitest';

import { createScrollLock } from './scrollLock';

const setup = (scrollbarWidth = 0) => {
  const target = { style: { overflow: 'auto', paddingRight: '' } };
  const lock = createScrollLock(
    () => target,
    () => scrollbarWidth,
  );

  return { target, lock };
};

describe('createScrollLock', () => {
  it('잠그면 overflow 를 숨기고, 풀면 원래 값으로 돌린다', () => {
    const { target, lock } = setup();
    const release = lock();

    expect(target.style.overflow).toBe('hidden');

    release();
    expect(target.style.overflow).toBe('auto');
  });

  it('겹쳐 잠그면 마지막 하나가 풀릴 때만 푼다', () => {
    const { target, lock } = setup();
    const releaseA = lock();
    const releaseB = lock();

    releaseA();
    expect(target.style.overflow).toBe('hidden');

    releaseB();
    expect(target.style.overflow).toBe('auto');
  });

  it('같은 release 를 여러 번 불러도 한 번만 센다', () => {
    const { target, lock } = setup();
    const releaseA = lock();
    const releaseB = lock();

    releaseA();
    releaseA();
    expect(target.style.overflow).toBe('hidden');

    releaseB();
    expect(target.style.overflow).toBe('auto');
  });

  it('스크롤바 폭만큼 padding-right 를 채우고, 풀면 되돌린다', () => {
    const { target, lock } = setup(15);
    const release = lock();

    expect(target.style.paddingRight).toBe('15px');

    release();
    expect(target.style.paddingRight).toBe('');
  });

  it('스크롤바가 없으면 padding-right 를 건드리지 않는다', () => {
    const { target, lock } = setup(0);
    lock();

    expect(target.style.paddingRight).toBe('');
  });

  it('다 풀린 뒤 다시 잠그면 그때의 값을 저장한다', () => {
    const { target, lock } = setup();
    lock()();
    target.style.overflow = 'scroll';

    const release = lock();
    release();
    expect(target.style.overflow).toBe('scroll');
  });
});
