type LoadQuery = { isError: boolean; isPending: boolean; data: unknown; error: unknown };

/*
 * 작품 등록 · 수정 화면을 그릴지 정한다.
 * - 다시 받기만 실패하고 받아 둔 값이 있으면 입력 중인 화면을 유지한다(staleTime 0 이라 다시 받기가 잦다).
 * - 수정 폼은 처음 그릴 때 값을 한 번만 읽으므로, 수정할 작품 정보는 이 화면에서 새로 받을 때까지 기다리고 새로 받지 못하면 실패로 본다.
 */
export const getArtworkRegisterLoadState = ({
  queries,
  editQueries,
  isEditDataStale,
}: {
  queries: LoadQuery[];
  editQueries: LoadQuery[];
  isEditDataStale: boolean;
}) => ({
  failed:
    queries.find((query) => query.isError && !query.data) ??
    (isEditDataStale ? editQueries.find((query) => query.isError) : undefined),
  isPending: queries.some((query) => query.isPending) || isEditDataStale,
});
