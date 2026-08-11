import { type ReactNode } from 'react';

import { ExhibitionHeader } from '@/components/ui';
import { cn } from '@/utils/cn';

interface ArtworkRegisterLayoutProps {
  title: string;
  children: ReactNode;
  bottomBar?: ReactNode;
  hasFixedBottomBar?: boolean;
  className?: string;
  onBack?: () => void;
}

export function ArtworkRegisterLayout({
  title,
  children,
  bottomBar,
  hasFixedBottomBar = Boolean(bottomBar),
  className,
  onBack,
}: ArtworkRegisterLayoutProps) {
  return (
    <div className="mx-auto flex h-dvh w-full max-w-md flex-col overflow-hidden bg-page">
      <ExhibitionHeader title={title} onBack={onBack} />
      <main
        className={cn(
          'min-h-0 flex-1 overflow-y-auto px-5',
          hasFixedBottomBar && 'pb-bottom-bar-offset',
          className,
        )}
      >
        <div className="flex flex-col">{children}</div>
      </main>
      {bottomBar}
    </div>
  );
}
