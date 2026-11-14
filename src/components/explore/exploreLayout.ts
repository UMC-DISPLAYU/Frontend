// 프로토타입 탐색 화면 좌우 여백(20 → 768px 32 → 1100px 48)과 최대 폭(1320). 공용 gutter(40)와 달라 따로 둔다
export const EXPLORE_PAD_X_CLASS = 'px-5 tablet:px-8 min-[68.75rem]:px-12';

// 분야 탭처럼 좌우 여백까지 꽉 채우는 줄. EXPLORE_PAD_X_CLASS 와 같은 단계로 맞춘다
export const EXPLORE_BLEED_X_CLASS = '-mx-5 tablet:-mx-8 min-[68.75rem]:-mx-12';

export const EXPLORE_WRAP_CLASS = `mx-auto w-full max-w-[1320px] ${EXPLORE_PAD_X_CLASS}`;
