import type { ReactNode } from 'react';

import { OptimizedImage } from '@/components/common/OptimizedImage';
import type { Work } from '@/types/artworkManage';

export function WorkCard({
  work,
  isMine = false,
  children,
}: {
  work: Work;
  isMine?: boolean;
  children?: ReactNode;
}) {
  return (
    <div className="group relative h-full rounded-12 bg-primary-black p-1.75 text-interactive-inverse">
      <div className="relative aspect-3/4 overflow-hidden rounded-12 bg-secondary">
        <OptimizedImage
          src={work.thumbnail}
          alt={work.title}
          displayWidth={260}
          skeleton
          frameClassName="h-full w-full"
          className="object-cover transition-transform duration-base ease-standard group-hover:scale-103"
        />
        {isMine && (
          <span className="typography-body-sm-medium absolute bottom-2 left-2 rounded-circle bg-primary-black/40 px-2 py-1">
            내 작품
          </span>
        )}
      </div>
      <div className="px-1.25 pt-2 pb-0.75">
        <p className="typography-body-lg-semibold truncate">{work.title}</p>
        <p className="typography-body-md-medium truncate">{work.artist}</p>
      </div>
      {children}
    </div>
  );
}
