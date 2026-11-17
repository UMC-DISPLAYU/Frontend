import { useState } from 'react';

type QueryTimestamp = { dataUpdatedAt: number };

export const isFetchedSince = (mountedAt: number, queries: QueryTimestamp[]) =>
  queries.every((query) => query.dataUpdatedAt >= mountedAt);

/*
 * 이 화면에 들어온 뒤 서버에서 새로 받은 데이터인지.
 * 수정 폼은 처음 그릴 때 값을 한 번만 읽으므로, 받아 둔 예전 값(다른 기기 · 다른 팀원이 바꾸기 전)으로 채우지 않게 이것으로 기다린다.
 * isFetchedAfterMount 는 다시 받기에 실패해도 true 가 되어 예전 값으로 폼을 그릴 수 있어 쓰지 않는다.
 */
export const useFetchedSinceMount = (...queries: QueryTimestamp[]) => {
  const [mountedAt] = useState(() => Date.now());
  return isFetchedSince(mountedAt, queries);
};
