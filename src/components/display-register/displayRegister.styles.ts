/* 프로토타입(exhibition-new.html · flow.css)의 값을 그대로 옮긴 클래스. 등록 1/2 · 2/2 · 작가명 · 완료 화면이 함께 쓴다 */

export const FOCUS_CLASS =
  'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus';

/** .field — 입력 칸 사이 24 */
export const FIELD_CLASS = 'mt-6';

/** .field > label · .lb — 14 / 600, 오른쪽에 글자 수 */
export const LABEL_CLASS =
  'typography-body-lg-semibold flex items-center justify-between text-primary';

/** .req — 라벨 글자 바로 뒤 3px */
export const REQUIRED_CLASS = 'ml-[3px] text-error';

/** .cnt — 12 / 500 */
export const COUNT_CLASS = 'typography-body-md-medium text-secondary tabular-nums';

/** .ul — 라벨 아래 4, 높이 47, 밑줄 */
export const UNDERLINE_CLASS =
  'relative mt-1 flex h-[47px] items-center border-b border-primary transition-colors duration-fast ease-standard focus-within:border-[#18181b]';

/** .ul input — 16 / 400 */
export const INPUT_CLASS =
  'typography-body-xl-regular h-full w-full min-w-0 bg-transparent p-0 text-primary outline-none placeholder:text-tertiary';

/** .help — 12 / 500, 위 4 */
export const HELP_CLASS = 'typography-body-md-medium mt-1 text-secondary';

const BIG_BASE_CLASS = `typography-body-xl-semibold flex h-12 w-full items-center justify-center rounded-12 bg-[#18181b] text-base-white transition-[background-color,color,transform] duration-fast ease-standard ${FOCUS_CLASS}`;

/** .big — 하단 큰 버튼 48, 16 / 600 */
export const BIG_BUTTON_CLASS = `${BIG_BASE_CLASS} enabled:hover:bg-[#2f2f35] enabled:active:scale-99 disabled:cursor-default disabled:bg-[#f4f4f5] disabled:text-[#d4d4d8]`;

/** 링크로 쓰는 .big */
export const BIG_LINK_CLASS = `${BIG_BASE_CLASS} hover:bg-[#2f2f35] active:scale-99`;
