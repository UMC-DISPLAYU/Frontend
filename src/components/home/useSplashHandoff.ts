import { type RefObject, useEffect } from 'react';

// 스플래시 마크업 · 스타일 · 노출 판별 · 로고 움직임은 index.html 에 있다. 값은 디자인 전달 문서(스플래시 SPEC 1-2 · 1-4)와 같다
const MOVE_MS = 720;
const LOGO_DONE_EVENT = 'du-splash-logo-done';

// StrictMode 의 이펙트 두 번 실행 · 홈 재진입에도 한 번만 잇는다
let handedOff = false;

const wait = (ms: number) => new Promise<void>((resolve) => window.setTimeout(resolve, ms));

// index.html 스크립트가 로고 완성 + 머묾(150ms)이 지나면 data-logo-done 을 붙이고 이벤트를 보낸다
const waitForLogo = (splash: HTMLElement) =>
  new Promise<void>((resolve) => {
    if (splash.hasAttribute('data-logo-done')) {
      resolve();
      return;
    }
    splash.addEventListener(LOGO_DONE_EVENT, () => resolve(), { once: true });
  });

const restoreThemeColor = () => {
  const themeColor = document.querySelector<HTMLMetaElement>('meta[name="theme-color"]');
  const prevThemeColor = themeColor?.dataset.splashPrev;
  if (themeColor && prevThemeColor) themeColor.content = prevThemeColor;
};

const removeSplash = (splash: HTMLElement) => {
  const root = document.documentElement;
  splash.remove();
  root.classList.remove('sp-pre', 'sp-go');
  root.style.removeProperty('--sp-h');
};

async function handOff(splash: HTMLElement, logo: HTMLImageElement) {
  const root = document.documentElement;
  const splashLogo = splash.querySelector('.sp-logo');

  // 데이터는 기다리지 않는다. 로고가 완성되고 잠깐 머문 뒤, 헤더 로고가 그려질 수 있으면 잇는다
  await Promise.all([waitForLogo(splash), logo.decode().catch(() => {})]);
  // 7초 안전장치가 먼저 걷어 낸 경우
  if (!splash.isConnected || !splashLogo) return;
  // 그사이 다른 화면으로 넘어갔으면 이을 헤더 로고가 없다. 옮기지 않고 걷어 낸다
  if (!logo.isConnected) {
    restoreThemeColor();
    removeSplash(splash);
    return;
  }

  window.scrollTo(0, 0);
  // 도착할 때 헤더 로고와 정확히 겹치도록 고정값 대신 실제 위치 · 크기를 잰다
  const from = splashLogo.getBoundingClientRect();
  const to = logo.getBoundingClientRect();
  splash.style.setProperty('--sp-dx', `${to.left - from.left}px`);
  splash.style.setProperty('--sp-dy', `${to.top - from.top}px`);
  splash.style.setProperty('--sp-sx', `${to.width / from.width}`);
  splash.style.setProperty('--sp-sy', `${to.height / from.height}`);
  root.style.setProperty('--sp-h', `${window.innerHeight}px`);
  root.classList.add('sp-go');
  restoreThemeColor();

  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  await wait(reduceMotion ? 0 : MOVE_MS);

  removeSplash(splash);
}

/** 홈 헤더가 그려지면 스플래시 로고를 헤더 로고 자리로 옮기며 홈으로 잇는다 */
export function useSplashHandoff(logoRef: RefObject<HTMLImageElement | null>) {
  useEffect(() => {
    const splash = document.getElementById('du-splash');
    const logo = logoRef.current;
    if (handedOff || !splash || !logo || !document.documentElement.classList.contains('sp-pre')) {
      return;
    }

    handedOff = true;
    void handOff(splash, logo);
  }, [logoRef]);
}
