import { useRef, useState } from 'react';

import chevronIcon from '@/assets/artwork-detail/chevron-process.svg';
import { OptimizedImage } from '@/components/common/OptimizedImage';

import { PROCESS_IMAGE_WIDTH, ProcessViewer } from './ProcessViewer';

const MAX_THUMBS = 3;

export function ProcessStrip({ imageUrls }: { imageUrls: string[] }) {
  const [isOpen, setIsOpen] = useState(false);
  const firstThumbRef = useRef<HTMLSpanElement>(null);

  return (
    <section className="mt-7 bg-primary-black py-3 desktop:mt-10 desktop:rounded-20 desktop:px-6">
      <h2>
        <button
          type="button"
          aria-haspopup="dialog"
          onClick={() => setIsOpen(true)}
          className="typography-body-xxl-semibold group flex min-h-14 w-full cursor-pointer items-center px-gutter py-1 text-left text-interactive-inverse transition-transform duration-fast ease-standard focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-focus-inverse active:scale-99 desktop:px-0"
        >
          작업과정
          <span aria-hidden className="mr-3 ml-auto flex">
            {imageUrls.slice(0, MAX_THUMBS).map((url, index) => (
              <span
                key={url}
                ref={index === 0 ? firstThumbRef : undefined}
                style={{ zIndex: MAX_THUMBS - index }}
                className="relative -ml-3.5 h-12 w-10 shrink-0 overflow-hidden rounded-8 border-2 border-bg-primary-black first:ml-0"
              >
                <OptimizedImage
                  src={url}
                  displayWidth={PROCESS_IMAGE_WIDTH}
                  alt=""
                  draggable={false}
                  className="size-full object-cover"
                />
              </span>
            ))}
          </span>
          <span
            aria-hidden
            className="grid size-8 shrink-0 place-items-center rounded-16 bg-[rgba(255,255,255,0.12)]"
          >
            <img
              src={chevronIcon}
              alt=""
              className="transition-transform duration-base ease-standard group-hover:translate-x-0.5"
            />
          </span>
        </button>
      </h2>

      <ProcessViewer
        open={isOpen}
        onClose={() => setIsOpen(false)}
        imageUrls={imageUrls}
        originRef={firstThumbRef}
      />
    </section>
  );
}
