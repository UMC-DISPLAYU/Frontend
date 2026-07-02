import { type ReactNode, useMemo, useState } from 'react';

import { DEFAULT_HEADER, type HeaderConfig, HeaderContext } from './headerContext';

type HeaderProviderProps = {
  children: ReactNode;
};

export function HeaderProvider({ children }: HeaderProviderProps) {
  const [header, setHeaderState] = useState<HeaderConfig>(DEFAULT_HEADER);

  const value = useMemo(
    () => ({
      header,
      resetHeader: () => setHeaderState(DEFAULT_HEADER),
      setHeader: setHeaderState,
    }),
    [header],
  );

  return <HeaderContext.Provider value={value}>{children}</HeaderContext.Provider>;
}
