import { useLayoutEffect, useRef } from 'react';

import { PREVIEW_BANNER_HEIGHT_VAR } from './detailStickyTop';

/* 공개 전 미리보기 띠. 좁은 화면에서는 문구가 여러 줄로 늘어나므로 실제 높이를 부모에 넘겨 아래 sticky 요소가 띠 밑에 붙게 한다 */
export function DetailPreviewBanner({ message }: { message: string }) {
  const ref = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    const banner = ref.current;
    const parent = banner?.parentElement;
    if (!banner || !parent) return;

    const setHeight = (height: number) =>
      parent.style.setProperty(PREVIEW_BANNER_HEIGHT_VAR, `${height}px`);
    setHeight(banner.getBoundingClientRect().height);

    const observer = new ResizeObserver(([entry]) => {
      setHeight(entry.borderBoxSize?.[0]?.blockSize ?? banner.getBoundingClientRect().height);
    });
    observer.observe(banner);
    return () => {
      observer.disconnect();
      parent.style.removeProperty(PREVIEW_BANNER_HEIGHT_VAR);
    };
  }, []);

  return (
    <div
      ref={ref}
      role="status"
      className="sticky top-0 z-40 flex min-h-10 items-center justify-center bg-primary-black px-gutter py-2 text-interactive-inverse"
    >
      <p className="typography-body-md-medium text-center break-keep">
        <b className="typography-body-md-semibold mr-2 inline-block rounded-circle bg-primary-white px-2 py-0.5 align-middle text-primary">
          미리보기
        </b>
        <span className="align-middle">{message}</span>
      </p>
    </div>
  );
}
