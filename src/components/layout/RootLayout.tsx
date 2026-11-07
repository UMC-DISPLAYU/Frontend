import { useState } from 'react';

import { type Location, Outlet, ScrollRestoration } from 'react-router-dom';

import { Toaster } from '@/components/ui';
import { useOverlayHistoryCleanup } from '@/hooks/useOverlayHistory';
import { useVirtualKeyboardTracking } from '@/hooks/useVirtualKeyboard';

import { NavbarPresenceContext } from './navbarPresence';

// 탭에서 처음 연 페이지는 주소와 상관없이 key 가 항상 'default' 라서, 같은 탭에서 주소를 새로 입력하면
// 이전에 처음 열었던 페이지의 스크롤 위치가 엉뚱한 페이지에 복원된다. 그 경우만 경로로 구분한다
const getScrollRestorationKey = (location: Location) =>
  location.key === 'default' ? location.pathname : location.key;

/**
 * 모든 라우트를 감싸는 루트 레이아웃. 화면에 보이는 틀(냅바 · 푸터)은 Layout 이 맡고,
 * 여기에는 로그인 · 온보딩처럼 냅바가 없는 화면에서도 필요한 앱 전역 동작만 둔다.
 */
export function RootLayout() {
  const [isNavbarPresent, setIsNavbarPresent] = useState(false);

  // 닫힌 오버레이가 남긴 history 기록(새로고침 · 오버레이 안에서 이동 후 복귀)에 도착하면 되돌린다
  useOverlayHistoryCleanup();
  // 켜져 있는 동안 :root 의 --semantic-layout-keyboard-inset 이 키보드 높이로 갱신된다
  useVirtualKeyboardTracking();

  return (
    <NavbarPresenceContext.Provider value={setIsNavbarPresent}>
      {/* 새 페이지 이동은 최상단, 뒤로가기는 이전 위치 복원, preventScrollReset 이동은 스크롤 유지 */}
      <ScrollRestoration getKey={getScrollRestorationKey} />
      <Outlet />
      <Toaster hasNavbar={isNavbarPresent} />
    </NavbarPresenceContext.Provider>
  );
}
