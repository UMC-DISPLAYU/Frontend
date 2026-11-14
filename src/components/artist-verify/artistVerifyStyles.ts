/* 프로토타입(verify.html)의 눌림 · 포커스 규칙. 여러 버튼이 같은 값을 쓴다. */

export const FOCUS_RING =
  'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#18181b]';

export const TAP_BASE =
  'cursor-pointer touch-manipulation [-webkit-tap-highlight-color:transparent] disabled:cursor-default';

/* 색은 기본 ease, 눌림 크기는 cubic-bezier(.16, 1, .3, 1)로 0.2초 */
export const PRESS_TRANSITION =
  '[transition:background-color_.2s,color_.2s,border-color_.2s,scale_.2s_cubic-bezier(.16,1,.3,1)]';
