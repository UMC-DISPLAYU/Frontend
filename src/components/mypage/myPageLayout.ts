// 프로토타입 마이 화면 좌우 여백(20 → 768px 32 → 1100px 48)과 최대 폭(1320). 공용 gutter(40) · max-w-list(1160)와 달라 따로 둔다
export const MY_PAGE_WRAP_CLASS = 'tablet:max-w-[1320px] px-5 tablet:px-8 min-[68.75rem]:px-12';

// 추천 줄처럼 좌우 여백까지 넘겨 볼 수 있는 줄. MY_PAGE_WRAP_CLASS 와 같은 단계로 맞춘다
export const MY_PAGE_BLEED_X_CLASS =
  '-mx-5 px-5 scroll-px-5 tablet:-mx-8 tablet:px-8 tablet:scroll-px-8 min-[68.75rem]:-mx-12 min-[68.75rem]:px-12 min-[68.75rem]:scroll-px-12';
