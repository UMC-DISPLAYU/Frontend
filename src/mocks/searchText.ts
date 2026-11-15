/* 탐색 정책: 대소문자 무시, 앞뒤 공백 제거, 빈 검색어는 전체 */
const normalize = (text: string) => text.toLowerCase().replace(/\s+/g, ' ').trim();

export const matchesSearchWord = (
  searchWord: string | null,
  targets: (string | null | undefined)[],
) => {
  const word = normalize(searchWord ?? '');
  if (!word) return true;
  return targets.some((target) => target && normalize(target).includes(word));
};

/* 서버 정렬: LATEST 는 ID 내림차순, LIKES 는 좋아요 많은 순 → ID 내림차순 */
export const compareBySort =
  <T>(sort: string | null, getLikes: (item: T) => number, getIds: (item: T) => number[]) =>
  (a: T, b: T) => {
    if (sort === 'LIKES') {
      const byLikes = getLikes(b) - getLikes(a);
      if (byLikes !== 0) return byLikes;
    }
    const aIds = getIds(a);
    const bIds = getIds(b);
    for (let index = 0; index < aIds.length; index += 1) {
      const diff = (bIds[index] ?? 0) - (aIds[index] ?? 0);
      if (diff !== 0) return diff;
    }
    return 0;
  };
