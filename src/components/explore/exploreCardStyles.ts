// 프로토타입 탐색 카드(.card · .tx) 값. 전시 · 작품 카드가 같이 쓴다
export const CARD_CLASS =
  'group block text-[#18181b] transition-transform duration-base ease-standard focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#18181b] active:scale-98';

export const CARD_IMAGE_CLASS =
  'transition-transform duration-700 ease-standard [@media(hover:hover)]:group-hover:scale-103';

export const CARD_TITLE_CLASS =
  'block truncate text-[14px] leading-[1.4] font-semibold tracking-[-0.03em]';

// 촘촘히 보기(ExploreResultGrid 의 group/grid, data-dense)에서 카드 글은 화면에서만 숨긴다(읽기 도구에는 남는다)
export const CARD_TEXT_CLASS = 'block pt-2 group-data-[dense=true]/grid:sr-only';

// 촘촘히 보기의 스켈레톤은 사진 칸만 남긴다
export const CARD_SKELETON_TEXT_CLASS = 'pt-2 group-data-[dense=true]/grid:hidden';

// 사진 칸 폭의 24% 만큼 위에서부터 옅어지는 그라데이션을 재려고 container 로 둔다
export const CARD_PHOTO_WRAP_CLASS = '@container relative block';

/*
 * 프로토타입 .hv: 촘촘히 보기에서 마우스를 올리면(마우스 기기만, 폰은 누르면 상세) 사진 아래에서 그라데이션이 차오르고
 * 글이 4 올라오며 나타난다(.2s). 옅어지는 길이 --f 는 칸 폭의 24%, 칸 단위를 모르는 옛 브라우저는 28 고정.
 * 그라데이션 색은 미리 계산한 숫자(색 안의 calc 는 옛 Safari 에서 그라데이션이 통째로 빠진다)
 */
export const CARD_HOVER_CLASS =
  'pointer-events-none absolute inset-x-0 bottom-0 z-1 hidden flex-col px-2 pt-(--f) pb-2 text-[#fff] tracking-[-0.03em] [overflow-wrap:break-word] break-keep opacity-0 transition-opacity duration-fast ease-standard [--f:28px] supports-[width:1cqw]:[--f:24cqw] *:translate-y-1 *:transition-transform *:duration-fast *:ease-standard group-hover:opacity-100 group-hover:*:translate-y-0 group-focus-visible:opacity-100 group-focus-visible:*:translate-y-0 [@media(hover:hover)_and_(pointer:fine)]:group-data-[dense=true]/grid:flex';

export const CARD_HOVER_TITLE_CLASS =
  'line-clamp-2 text-[14px] leading-[1.4] font-semibold text-pretty';

const hoverGradient = (stops: readonly number[]) =>
  `linear-gradient(to bottom, rgba(0, 0, 0, 0) 0, ${[0.2, 0.35, 0.5, 0.65, 0.8]
    .map((at, index) => `rgba(0, 0, 0, ${stops[index]}) calc(var(--f) * ${at})`)
    .join(', ')}, rgba(0, 0, 0, ${stops[5]}) var(--f), rgba(0, 0, 0, ${stops[6]}) 100%)`;

// 작품: 흰 벽 사진에서도 흰 글이 읽히게 .62~.72
export const ARTWORK_HOVER_GRADIENT = hoverGradient([0.03, 0.1, 0.22, 0.37, 0.52, 0.62, 0.72]);

// 전시: 포스터 안 흰 글씨가 학교 학과 뒤로 비치지 않게 .76~.86
export const EXHIBITION_HOVER_GRADIENT = hoverGradient([0.04, 0.12, 0.27, 0.46, 0.64, 0.76, 0.86]);
