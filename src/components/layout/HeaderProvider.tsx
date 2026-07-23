import { type ReactNode, useState } from 'react';

import { type HeaderConfig, HeaderContext } from './headerContext';

type HeaderProviderProps = {
  children: ReactNode;
};

export function HeaderProvider({ children }: HeaderProviderProps) {
  const [header, setHeaderState] = useState<HeaderConfig>({});

  const value = {
    header,
    resetHeader: () => setHeaderState({}),
    setHeader: setHeaderState,
  };

  return <HeaderContext.Provider value={value}>{children}</HeaderContext.Provider>;
}
