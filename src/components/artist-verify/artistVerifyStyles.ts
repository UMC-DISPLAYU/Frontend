/* 프로토타입(verify.html)의 글꼴 · 눌림 · 포커스 규칙. 여러 요소가 같은 값을 쓴다. */

/* 프로토타입 글꼴 스택과 글씨 다듬기(antialiased). 전역 body 글꼴과 달라 화면 틀 · 확인창에 직접 건다 */
export const PROTOTYPE_FONT =
  "font-['Pretendard_Variable',Pretendard,-apple-system,BlinkMacSystemFont,'Apple_SD_Gothic_Neo','Noto_Sans_KR',sans-serif] antialiased";

export const FOCUS_RING =
  'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#18181b]';

export const TAP_BASE =
  'cursor-pointer touch-manipulation [-webkit-tap-highlight-color:transparent] disabled:cursor-default';

/* 색은 기본 ease, 눌림 크기는 cubic-bezier(.16, 1, .3, 1)로 0.2초 */
export const PRESS_TRANSITION =
  '[transition:background-color_.2s,color_.2s,border-color_.2s,scale_.2s_cubic-bezier(.16,1,.3,1)]';
