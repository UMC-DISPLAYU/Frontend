/* 미리보기 띠가 잰 자기 높이. 재기 전에는 한 줄 높이(40)로 둔다 */
export const PREVIEW_BANNER_HEIGHT_VAR = '--preview-banner-height';

/* sticky 요소(탭 줄 · 뒤로가기 · 사진)가 붙는 위치. 미리보기 띠 높이와 768px 이상 헤더(64)를 더한 값 */
export const detailStickyTopClass = (isPreview: boolean) =>
  isPreview
    ? '[--detail-top:var(--preview-banner-height,2.5rem)] tablet:[--detail-top:calc(var(--preview-banner-height,2.5rem)+4rem)]'
    : '[--detail-top:0rem] tablet:[--detail-top:4rem]';
