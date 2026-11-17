import type { QueryClient, QueryKey } from '@tanstack/react-query';

/*
 * 저장 뒤 다른 화면으로 넘어갈 때, 다음 화면이 그릴 데이터를 새로 받은 다음 넘어가게 한다.
 * 무효화만 하면 지금 화면에 없는 쿼리는 "오래됨" 표시만 되어, 다음 화면이 예전 데이터(예전 사진 · 이름)를 먼저 그렸다가 바뀐다.
 * mutation 의 onSuccess 가 이 Promise 를 돌려주면 다시 받을 때까지 요청 중(isPending)으로 남아 버튼이 "저장 중"을 유지한다.
 * 다시 받기가 실패해도 저장은 이미 성공했으므로 reject 하지 않는다(invalidateQueries 기본 동작).
 */
export const refetchForNextScreen = (queryClient: QueryClient, queryKeys: QueryKey[]) =>
  Promise.all(
    queryKeys.map((queryKey) => queryClient.invalidateQueries({ queryKey, refetchType: 'all' })),
  ).then(() => undefined);
