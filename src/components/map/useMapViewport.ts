import { useSyncExternalStore } from 'react';

const DESKTOP_QUERY = '(min-width: 768px)';

const subscribe = (onChange: () => void) => {
  window.addEventListener('resize', onChange);
  return () => window.removeEventListener('resize', onChange);
};

/** 지도 화면은 시트·패널 위치를 픽셀로 계산하므로 창 크기와 데스크톱 여부를 함께 구독한다 */
export function useMapViewport() {
  const height = useSyncExternalStore(subscribe, () => window.innerHeight);
  const isDesktop = useSyncExternalStore(subscribe, () => window.matchMedia(DESKTOP_QUERY).matches);

  return { height, isDesktop };
}
