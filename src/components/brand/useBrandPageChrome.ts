import { useEffect } from 'react';

const BRAND_BACKGROUND = '#000000';

// 프로토타입은 body 가 검은 바탕이고 theme-color 도 검정이다. 이 페이지에 있는 동안만 바꿔 위 · 아래로 당겨도 회색이 보이지 않게 한다
export const useBrandPageChrome = () => {
  useEffect(() => {
    const { body } = document;
    const meta = document.querySelector<HTMLMetaElement>('meta[name="theme-color"]');
    const prevBackground = body.style.backgroundColor;
    const prevThemeColor = meta?.getAttribute('content');

    body.style.backgroundColor = BRAND_BACKGROUND;
    meta?.setAttribute('content', BRAND_BACKGROUND);

    return () => {
      body.style.backgroundColor = prevBackground;
      if (meta && prevThemeColor != null) meta.setAttribute('content', prevThemeColor);
    };
  }, []);
};
