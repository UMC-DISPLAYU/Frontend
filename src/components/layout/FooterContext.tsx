import { createContext, useContext, useEffect } from 'react';

type FooterContextType = {
  isFooterHidden: boolean;
  setFooterHidden: (hidden: boolean) => void;
  isNavbarHidden: boolean;
  setNavbarHidden: (hidden: boolean) => void;
};

export const FooterContext = createContext<FooterContextType | null>(null);

export function useFooterContext() {
  return useContext(FooterContext);
}

/**
 * 특정 페이지 컴포넌트에서 선택적으로 Footer(FNB)를 숨기기 위해 호출하는 훅입니다.
 */
export function useHideFooter() {
  const context = useContext(FooterContext);

  useEffect(() => {
    context?.setFooterHidden(true);
    return () => {
      context?.setFooterHidden(false);
    };
  }, [context]);
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
