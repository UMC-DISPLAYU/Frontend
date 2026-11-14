import { beforeEach, describe, expect, it, vi } from 'vitest';

import type { DisplayMapMarkerDto, GetDisplayMapRequestDto } from '@/api/dto';

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

const page = (ids: number[], nextCursor: number | null) => ({
  markers: ids.map(marker),
  pagination: { nextCursor, size: 100, hasNext: nextCursor !== null },
});

describe('fetchAllMapDisplays', () => {
  beforeEach(() => {
    mocks.getDisplayMap.mockReset();
  });

  it('전체 범위를 페이지당 100개씩 다음 페이지가 없을 때까지 받는다', async () => {
    mocks.getDisplayMap
      .mockResolvedValueOnce(page([1, 2], 2))
      .mockResolvedValueOnce(page([3], null));

    const displays = await fetchAllMapDisplays();

    expect(displays.map((display) => display.displayId)).toEqual([1, 2, 3]);
    const requests = mocks.getDisplayMap.mock.calls.map(
      ([params]) => params as GetDisplayMapRequestDto,
    );
    expect(requests).toEqual([
      {
        southLatitude: -90,
        westLongitude: -180,
        northLatitude: 90,
        eastLongitude: 180,
        size: 100,
        cursor: undefined,
      },
      expect.objectContaining({ size: 100, cursor: 2 }),
    ]);
  });

  it('페이지가 겹쳐 같은 전시가 두 번 와도 한 번만 남긴다', async () => {
    mocks.getDisplayMap
      .mockResolvedValueOnce(page([1, 2], 2))
      .mockResolvedValueOnce(page([2, 3], null));

    const displays = await fetchAllMapDisplays();

    expect(displays.map((display) => display.displayId)).toEqual([1, 2, 3]);
  });

  it('다음 페이지가 있다고 해도 커서가 없으면 멈춘다', async () => {
    mocks.getDisplayMap.mockResolvedValueOnce({
      markers: [marker(1)],
      pagination: { nextCursor: null, size: 100, hasNext: true },
    });

    await fetchAllMapDisplays();

    expect(mocks.getDisplayMap).toHaveBeenCalledOnce();
  });

  it('응답에 pagination이 없으면 한 페이지로 보고 끝낸다', async () => {
    mocks.getDisplayMap.mockResolvedValueOnce({ markers: [marker(1), marker(2)] });

    const displays = await fetchAllMapDisplays();

    expect(mocks.getDisplayMap).toHaveBeenCalledOnce();
    expect(displays.map((display) => display.displayId)).toEqual([1, 2]);
  });

  it('서버가 같은 커서를 다시 주면 멈춘다', async () => {
    mocks.getDisplayMap.mockResolvedValueOnce(page([1], 7)).mockResolvedValueOnce(page([2], 7));

    await fetchAllMapDisplays();

    expect(mocks.getDisplayMap).toHaveBeenCalledTimes(2);
  });

  it('받은 취소 신호를 모든 요청에 넘긴다', async () => {
    const controller = new AbortController();
    mocks.getDisplayMap.mockResolvedValueOnce(page([1], 1)).mockResolvedValueOnce(page([2], null));

    await fetchAllMapDisplays(controller.signal);

    expect(mocks.getDisplayMap.mock.calls.map(([, signal]) => signal)).toEqual([
      controller.signal,
      controller.signal,
    ]);
  });

  it('서버가 다음 페이지를 끝없이 돌려줘도 50페이지에서 멈춘다', async () => {
    let cursor = 0;
    mocks.getDisplayMap.mockImplementation(async () => {
      cursor += 1;
      return page([cursor], cursor);
    });

    const displays = await fetchAllMapDisplays();

    expect(mocks.getDisplayMap).toHaveBeenCalledTimes(50);
    expect(displays).toHaveLength(50);
  });
});
