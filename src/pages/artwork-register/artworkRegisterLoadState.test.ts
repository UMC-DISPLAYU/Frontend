import { describe, expect, it } from 'vitest';

import { getArtworkRegisterLoadState } from './artworkRegisterLoadState';

const ok = { isError: false, isPending: false, data: {}, error: null };
const pending = { isError: false, isPending: true, data: undefined, error: null };
const failedWithoutData = { isError: true, isPending: false, data: undefined, error: 'empty' };
const failedWithData = { isError: true, isPending: false, data: {}, error: 'refetch' };

describe('getArtworkRegisterLoadState', () => {
  it('모두 받았고 수정 데이터도 새로 받았으면 화면을 그린다', () => {
    expect(
      getArtworkRegisterLoadState({ queries: [ok, ok], editQueries: [ok], isEditDataStale: false }),
    ).toEqual({ failed: undefined, isPending: false });
  });

  it('하나라도 처음 받는 중이면 기다린다', () => {
    expect(
      getArtworkRegisterLoadState({
        queries: [ok, pending],
        editQueries: [],
        isEditDataStale: false,
      }).isPending,
    ).toBe(true);
  });

  it('받아 둔 값이 없는데 실패하면 오류를 보인다', () => {
    expect(
      getArtworkRegisterLoadState({
        queries: [ok, failedWithoutData],
        editQueries: [],
        isEditDataStale: false,
      }).failed,
    ).toBe(failedWithoutData);
  });

  it('다시 받기만 실패하고 받아 둔 값이 있으면 입력 중인 화면을 유지한다', () => {
    expect(
      getArtworkRegisterLoadState({
        queries: [ok, failedWithData],
        editQueries: [],
        isEditDataStale: false,
      }),
    ).toEqual({ failed: undefined, isPending: false });
  });

  it('수정할 작품 정보를 이 화면에서 아직 새로 받지 못했으면, 받아 둔 값이 있어도 기다린다', () => {
    expect(
      getArtworkRegisterLoadState({ queries: [ok, ok], editQueries: [ok], isEditDataStale: true }),
    ).toEqual({ failed: undefined, isPending: true });
  });

  it('수정할 작품 정보를 새로 받지 못하고 실패하면, 받아 둔 예전 값으로 폼을 그리지 않고 오류를 보인다', () => {
    expect(
      getArtworkRegisterLoadState({
        queries: [ok, failedWithData],
        editQueries: [failedWithData],
        isEditDataStale: true,
      }).failed,
    ).toBe(failedWithData);
  });

  it('수정 화면에서 폼을 그린 뒤(새로 받은 뒤) 다시 받기만 실패하면 화면을 유지한다', () => {
    expect(
      getArtworkRegisterLoadState({
        queries: [ok, failedWithData],
        editQueries: [failedWithData],
        isEditDataStale: false,
      }).failed,
    ).toBeUndefined();
  });
});
