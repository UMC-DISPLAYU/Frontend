import { createContext, useContext, useEffect } from 'react';

type FooterContextType = {
  isNavbarHidden: boolean;
  setNavbarHidden: (hidden: boolean) => void;
  setNavbarActivePath: (path: string | null) => void;
};

export const FooterContext = createContext<FooterContextType | null>(null);

export function useFooterContext() {
  return useContext(FooterContext);
}

/**
 * 특정 페이지 컴포넌트에서 선택적으로 하단 Navbar를 숨기기 위해 호출하는 훅입니다.
 */
export function useHideNavbar() {
  const context = useContext(FooterContext);

  useEffect(() => {
    context?.setNavbarHidden(true);
    return () => {
      context?.setNavbarHidden(false);
    };
  }, [context]);
}

/**
 * 냅바가 없는 경로에서도 냅바를 띄우고, activePath 칸을 선택된 것으로 보여 줍니다.
 * 예: 내 작가 페이지 → 마이(/my)
 */
export function useShowNavbar(activePath: string, enabled = true) {
  const setNavbarActivePath = useContext(FooterContext)?.setNavbarActivePath;

  useEffect(() => {
    if (!enabled || !setNavbarActivePath) return;
    setNavbarActivePath(activePath);
    return () => setNavbarActivePath(null);
  }, [setNavbarActivePath, activePath, enabled]);
}
