/*
 * 홈은 공용 컨테이너(max-w-list · px-gutter) 대신 프로토타입 폭을 따른다.
 * 콘텐츠 최대 1320px, 좌우 여백 20 → 32(tablet) → 48px(1100px~).
 * 1100px 은 min-[68.75rem] 으로 쓴다(테마 브레이크포인트가 rem 이라 px 로 쓰면 tablet: 보다 앞에 정렬돼 덮인다).
 * 프로토타입이 포스터 크기 · 화살표 · 작품 카드도 1100px 에서 바꿔 같은 기준을 쓴다.
 * --home-pad 는 HomePage 루트에서 HOME_PAD_VARS 로 정한다.
 */
export const HOME_PAD_VARS =
  '[--home-pad:20px] tablet:[--home-pad:32px] min-[68.75rem]:[--home-pad:48px]';

export const HOME_INNER = 'mx-auto w-full max-w-[calc(1320px+var(--home-pad)*2)] px-(--home-pad)';
