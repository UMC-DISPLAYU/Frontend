import { type RefObject, useEffect } from 'react';

// 스플래시 마크업 · 스타일 · 노출 판별은 index.html 에 있다. 값은 디자인 전달 문서(로딩 화면 SPEC 1-2 · 1-4)와 같다
const HOLD_MS = 150;
const MOVE_MS = 720;
const PIECES_FALLBACK_MS = 1180;

// StrictMode 의 이펙트 두 번 실행 · 홈 재진입에도 한 번만 잇는다
let handedOff = false;

const wait = (ms: number) => new Promise<void>((resolve) => window.setTimeout(resolve, ms));

const waitForPieces = (splash: HTMLElement) => {
  if (!('getAnimations' in splash)) return wait(PIECES_FALLBACK_MS - performance.now());
  return Promise.all(
    splash.getAnimations({ subtree: true }).map((animation) => animation.finished.catch(() => {})),
  );
};

async function handOff(splash: HTMLElement, logo: HTMLImageElement) {
  const root = document.documentElement;
  const splashLogo = splash.querySelector('.sp-logo');

  // 데이터는 기다리지 않는다. 조각이 다 자리 잡고 잠깐 머문 뒤, 헤더 로고가 그려질 수 있으면 잇는다
  await Promise.all([
    waitForPieces(splash).then(() => wait(HOLD_MS)),
    logo.decode().catch(() => {}),
  ]);
  // 7초 안전장치가 먼저 걷어 낸 경우
  if (!splash.isConnected || !splashLogo) return;

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

  const themeColor = document.querySelector<HTMLMetaElement>('meta[name="theme-color"]');
  const prevThemeColor = themeColor?.dataset.splashPrev;
  if (themeColor && prevThemeColor) themeColor.content = prevThemeColor;

  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  await wait(reduceMotion ? 0 : MOVE_MS);

  splash.remove();
  root.classList.remove('sp-pre', 'sp-go');
  root.style.removeProperty('--sp-h');
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
