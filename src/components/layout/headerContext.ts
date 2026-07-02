import { createContext, type ReactNode, useContext } from 'react';

export type HeaderConfig = {
  title?: ReactNode;
  left?: ReactNode;
  right?: ReactNode;
};

export type HeaderContextValue = {
  header: HeaderConfig;
  resetHeader: () => void;
  setHeader: (header: HeaderConfig) => void;
};

export const HeaderContext = createContext<HeaderContextValue | null>(null);

export function useHeaderContext() {
  const context = useContext(HeaderContext);

  if (!context) {
    throw new Error('useHeaderContext must be used within HeaderProvider.');
  }

  return context;
}
