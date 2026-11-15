import { beforeEach, describe, expect, it, vi } from 'vitest';

import type { DisplayMapMarkerDto } from '@/api/dto';

import { fetchAllMapDisplays } from './useMapDisplays';

const mocks = vi.hoisted(() => ({
  getDisplayMap: vi.fn(),
}));

vi.mock('@/api/endpoints', () => ({
  getDisplayMap: mocks.getDisplayMap,
}));

const marker = (displayId: number): DisplayMapMarkerDto => ({
  displayId,
  title: `전시 ${displayId}`,
  startDate: '2026-11-01',
  endDate: '2026-11-30',
  locationName: '전시장',
  posterImageUrl: '',
  latitude: 37.5,
  longitude: 127,
});

describe('fetchAllMapDisplays', () => {
  beforeEach(() => {
    mocks.getDisplayMap.mockReset();
  });

  it('전체 범위의 전시를 all=true 한 번 요청으로 받는다', async () => {
    const controller = new AbortController();
    mocks.getDisplayMap.mockResolvedValueOnce({
      markers: [marker(1), marker(2)],
      pagination: { nextCursor: null, size: 2, hasNext: false },
    });

    const displays = await fetchAllMapDisplays(controller.signal);

    expect(displays.map((display) => display.displayId)).toEqual([1, 2]);
    expect(mocks.getDisplayMap).toHaveBeenCalledOnce();
    expect(mocks.getDisplayMap).toHaveBeenCalledWith(
      {
        southLatitude: -90,
        westLongitude: -180,
        northLatitude: 90,
        eastLongitude: 180,
        all: true,
      },
      controller.signal,
    );
  });

  it('isArchived 가 없으면 false 로 채운다', async () => {
    mocks.getDisplayMap.mockResolvedValueOnce({ markers: [marker(1)] });

    const [display] = await fetchAllMapDisplays();

    expect(display.isArchived).toBe(false);
  });
});
