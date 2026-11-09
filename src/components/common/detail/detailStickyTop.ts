/* sticky 요소(탭 줄 · 뒤로가기 · 사진)가 붙는 위치. 미리보기 띠(40)와 768px 이상 헤더(64)를 더한 값 */
export const detailStickyTopClass = (isPreview: boolean) =>
  isPreview
    ? '[--detail-top:2.5rem] tablet:[--detail-top:6.5rem]'
    : '[--detail-top:0rem] tablet:[--detail-top:4rem]';
