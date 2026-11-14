import { CONTENT_DESCRIPTION_MAX_LENGTH } from '@/constants/artworkManage';

export const ROW_HEIGHT = 128; // 카드 높이
export const ROW_GAP = 12;
export const STEP = ROW_HEIGHT + ROW_GAP;
export { CONTENT_DESCRIPTION_MAX_LENGTH };

// 프로토타입: 전시작이 50개가 되면 전시작 추가 버튼을 숨긴다
export const MAX_DISPLAY_ARTWORKS = 50;

// 프로토타입 `.wgrid`: 2열 · 640px 이상 3열 · 900px 이상(2단의 오른쪽 열)도 3열, 세로 24 · 가로 12, 아래 32
export const WORK_GRID = 'grid grid-cols-2 gap-x-3 gap-y-6 pb-8 min-[640px]:grid-cols-3';
