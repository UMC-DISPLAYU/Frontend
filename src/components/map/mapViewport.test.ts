import { describe, expect, it } from 'vitest';

import {
  filterInView,
  getNearestSnap,
  getNextSnapOnTap,
  getReachableSnaps,
  getSnapAfterMapTap,
  getSnapOptions,
  getSnapPx,
  getViewInsets,
} from './mapViewport';

const FULL_PX = 760;

describe('시트 높이', () => {
  it('full은 잰 시트 높이 전체, 나머지는 고정 높이다', () => {
    expect(getSnapPx('full', FULL_PX)).toBe(760);
    expect(getSnapPx('mid', FULL_PX)).toBe(300);
  });

  it('핀을 고른 상태에서는 peek·one 사이에서만 멈춘다', () => {
    expect(getSnapOptions(true)).toEqual(['peek', 'one']);
    expect(getNearestSnap(getSnapOptions(true), 600, FULL_PX)).toBe('one');
  });

  it('목록 상태에서는 가장 가까운 높이로 멈춘다', () => {
    const options = getSnapOptions(false);
    expect(getNearestSnap(options, 120, FULL_PX)).toBe('peek');
    expect(getNearestSnap(options, 350, FULL_PX)).toBe('mid');
    expect(getNearestSnap(options, 600, FULL_PX)).toBe('full');
  });

  it('손잡이를 누르면 아래·위 끝에서는 가운데로 오고, 가운데에서는 그대로다', () => {
    expect(getNextSnapOnTap('peek', false)).toBe('mid');
    expect(getNextSnapOnTap('full', false)).toBe('mid');
    expect(getNextSnapOnTap('mid', false)).toBe('mid');
    expect(getNextSnapOnTap('peek', true)).toBe('one');
    expect(getNextSnapOnTap('one', true)).toBe('one');
  });

  it('한 번 끌면 바로 옆 단계까지만 갈 수 있다', () => {
    const options = getSnapOptions(false);
    expect(getReachableSnaps(options, 'peek')).toEqual(['peek', 'mid']);
    expect(getReachableSnaps(options, 'mid')).toEqual(['peek', 'mid', 'full']);
    expect(getReachableSnaps(options, 'full')).toEqual(['mid', 'full']);
  });

  it('peek에서 아무리 크게 튕겨도 full이 아니라 mid에서 멈춘다', () => {
    const reachable = getReachableSnaps(getSnapOptions(false), 'peek');
    expect(getNearestSnap(reachable, 5000, FULL_PX)).toBe('mid');
    expect(getNearestSnap(getReachableSnaps(getSnapOptions(false), 'full'), -5000, FULL_PX)).toBe(
      'mid',
    );
  });

  it('지도를 누르면 중간 높이일 때만 peek로 내려간다', () => {
    expect(getSnapAfterMapTap('mid')).toBe('peek');
    expect(getSnapAfterMapTap('peek')).toBe('peek');
    expect(getSnapAfterMapTap('full')).toBe('full');
  });
});

describe('getViewInsets', () => {
  it('데스크톱은 패널을 접으면 왼쪽 여백이 없다', () => {
    expect(getViewInsets({ isDesktop: true, isPanelFolded: false, sheetVisiblePx: 300 }).left).toBe(
      400,
    );
    expect(getViewInsets({ isDesktop: true, isPanelFolded: true, sheetVisiblePx: 300 }).left).toBe(
      0,
    );
  });

  it('모바일은 시트가 보이는 만큼 아래 여백을 둔다', () => {
    expect(
      getViewInsets({ isDesktop: false, isPanelFolded: false, sheetVisiblePx: 262 }).bottom,
    ).toBe(262);
  });
});

describe('filterInView', () => {
  const snapshot = { south: 37, west: 127, north: 38, east: 128, width: 1000, height: 1000 };
  const insets = { top: 100, right: 100, bottom: 300, left: 0 };

  it('시트·컨트롤에 가려진 곳의 전시는 뺀다', () => {
    const items = [
      { id: 'center', latitude: 37.5, longitude: 127.5 },
      { id: 'under-sheet', latitude: 37.1, longitude: 127.5 },
      { id: 'under-controls', latitude: 37.5, longitude: 127.95 },
    ];

    expect(filterInView(items, snapshot, insets).map((item) => item.id)).toEqual(['center']);
  });

  it('상단 바에 걸친 핀은 포스터가 보이므로 포함한다', () => {
    const items = [{ id: 'near-top', latitude: 37.92, longitude: 127.5 }];
    expect(filterInView(items, snapshot, insets)).toHaveLength(1);
  });
});
