import { fileURLToPath } from 'node:url';

import { expect, type Locator, type Page } from '@playwright/test';

const fixture = (name: string) => fileURLToPath(new URL(`../fixtures/${name}`, import.meta.url));

/** 1200×800 작품 사진. 3:4 카드에 50% 잘려 처음엔 전체 보이기 */
export const ARTWORK_WIDE = fixture('artwork-wide.png');
/** 800×800 작품 사진. 3:4 카드에 25% 잘려 처음엔 꽉 채우기 */
export const ARTWORK_SQUARE = fixture('artwork-square.png');

/** 목 업로드(file.ts)가 올린 파일을 돌려주는 주소 */
export const uploadedImages = (page: Page) =>
  page.locator('img[src^="https://mock.displayu.local/images/"]');

type FitLook = { objectFit: string; backgroundColor: string };

const lookOf = (image: Locator) =>
  image.evaluate((element): FitLook | null => {
    const img = element as HTMLImageElement;
    if (!img.complete || img.naturalWidth === 0) return null;
    const style = getComputedStyle(img);
    return { objectFit: style.objectFit, backgroundColor: style.backgroundColor };
  });

/** 이미지가 다 받아지고 보이는 방식이 정해질 때까지 기다린 뒤 모습을 확인한다 */
export async function expectFitLook(image: Locator, expected: Partial<FitLook>) {
  await expect.poll(() => lookOf(image), { timeout: 10_000 }).toMatchObject(expected);
}

/** 사진이 잘리지 않고 전체가 보이는지(그린 비율 = 사진 비율, 또는 object-fit: contain)와 남는 곳(이미지 또는 감싼 칸) 색을 확인한다 */
export async function expectWholeImage(image: Locator, backgroundColor: string) {
  await expect
    .poll(
      () =>
        image.evaluate((element) => {
          const img = element as HTMLImageElement;
          if (!img.complete || img.naturalWidth === 0) return null;
          const style = getComputedStyle(img);
          const drawn = img.clientWidth / img.clientHeight;
          const natural = img.naturalWidth / img.naturalHeight;
          // 남는 곳 색은 이미지 배경이거나, 이미지를 감싼 칸의 배경이다
          let node: HTMLElement | null = img;
          let fill = 'rgba(0, 0, 0, 0)';
          while (node && fill === 'rgba(0, 0, 0, 0)') {
            fill = getComputedStyle(node).backgroundColor;
            node = node.parentElement;
          }
          return {
            whole: style.objectFit === 'contain' || Math.abs(drawn / natural - 1) < 0.02,
            backgroundColor: fill,
          };
        }),
      { timeout: 10_000 },
    )
    .toEqual({ whole: true, backgroundColor });
}

export const hexToRgb = (hex: string) => {
  const [r, g, b] = [1, 3, 5].map((index) => parseInt(hex.slice(index, index + 2), 16));
  return `rgb(${r}, ${g}, ${b})`;
};

/** 목 데이터는 페이지 안에 있어 새로고침하면 사라지므로, 주소만 바꿔 라우터가 화면을 바꾸게 한다 */
export const navigateInApp = (page: Page, path: string) =>
  page.evaluate((to) => {
    window.history.pushState(window.history.state, '', to);
    window.dispatchEvent(new PopStateEvent('popstate', { state: window.history.state }));
  }, path);
