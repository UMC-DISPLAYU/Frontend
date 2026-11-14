/* 섹션 편집 · 섹션 추가가 같이 쓰는 값(프로토타입 section.html) */
export const SECTION_PHOTO_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
export const SECTION_PHOTO_MAX_BYTES = 20 * 1024 * 1024;
export const isSectionPhotoFile = (file: File) =>
  SECTION_PHOTO_TYPES.includes(file.type) && file.size <= SECTION_PHOTO_MAX_BYTES;

export const SECTION_FOCUS_RING =
  'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#18181b]';
/* 프로토타입 `.ptool .lnk` */
export const SECTION_TOOL_BUTTON = `inline-flex h-8 items-center pl-2 text-[12px] font-semibold disabled:cursor-default disabled:text-[#d4d4d8] ${SECTION_FOCUS_RING}`;
/* 프로토타입 `.page`: 폭 480 · 768px 이상 672, 위 여백 8(safe area) · 768px 이상 40, 모든 글자 자간 -0.03em */
export const SECTION_PAGE_CLASS =
  'max-w-120 pt-[max(8px,env(safe-area-inset-top))] text-[14px] leading-[1.4] font-medium text-[#18181b] tablet:max-w-168 tablet:pt-10 [&_*]:tracking-[-0.03em]';
/* 프로토타입 `.pgrid`: 3열 · 640px 이상 4열, 간격 10 */
export const SECTION_PHOTO_GRID = 'mt-1 grid grid-cols-3 gap-2.5 pb-8 min-[640px]:grid-cols-4';
