import { createContext, useContext, useEffect } from 'react';

type SetNavbarPresent = (present: boolean) => void;

// RootLayout 이 제공한다. 냅바를 그리는 Layout 이 아래에서 위로 노출 여부를 알려 토스트 위치를 맞춘다
export const NavbarPresenceContext = createContext<SetNavbarPresent | null>(null);

/** 냅바가 실제로 그려지는지 RootLayout 에 알린다. 언마운트되면(Layout 밖 화면으로 이동) 없음으로 돌린다 */
export function useReportNavbarPresence(present: boolean) {
  const setNavbarPresent = useContext(NavbarPresenceContext);

  useEffect(() => {
    setNavbarPresent?.(present);
  }, [setNavbarPresent, present]);

  useEffect(() => {
    return () => setNavbarPresent?.(false);
  }, [setNavbarPresent]);
}
