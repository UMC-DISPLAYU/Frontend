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
    <div className="mx-auto flex min-h-dvh w-full max-w-md flex-col bg-page">
      <ExhibitionHeader title={title} onBack={onBack} />
      <main className={cn('flex-1 overflow-y-auto px-5 pb-24', className)}>
        <div className="flex flex-col">{children}</div>
      </main>
      {bottomBar}
    </div>
  );
}
