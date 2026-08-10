import { type ReactNode } from 'react';

import { ExhibitionHeader } from '@/components/ui';
import { cn } from '@/utils/cn';

interface ArtworkRegisterLayoutProps {
  title: string;
  children: ReactNode;
  bottomBar?: ReactNode;
  className?: string;
  onBack?: () => void;
}

export function ArtworkRegisterLayout({
  title,
  children,
  bottomBar,
  className,
  onBack,
}: ArtworkRegisterLayoutProps) {
  return (
    <div className="mx-auto min-h-dvh w-full max-w-md bg-page">
      <ExhibitionHeader title={title} onBack={onBack} />
      <main className={cn('px-5', bottomBar && 'pb-bottom-bar-offset', className)}>
        <div className="flex flex-col">{children}</div>
      </main>
      {bottomBar}
    </div>
  );
}
