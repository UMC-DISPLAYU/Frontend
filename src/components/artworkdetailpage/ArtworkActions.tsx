import { type ReactNode, useRef, useState } from 'react';

import shareIcon from '@/assets/artwork-detail/share.svg';
import { ShareBottomSheet } from '@/components/common/ShareBottomSheet';
import { useBottomObstruction } from '@/hooks/useVirtualKeyboard';

type ShareProps = {
  shareTitle: string;
  shareImageUrl?: string;
  disabled?: boolean;
};

function ShareButton({ shareTitle, shareImageUrl, disabled }: ShareProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <button
        type="button"
        aria-label="공유"
        onClick={() => setIsOpen(true)}
        disabled={disabled}
        title={disabled ? '공개 전에는 사용할 수 없어요' : undefined}
        className="grid size-11 shrink-0 cursor-pointer place-items-center rounded-12 border border-primary transition-colors duration-fast ease-standard hover:bg-secondary disabled:cursor-not-allowed disabled:opacity-45"
      >
        <img src={shareIcon} alt="" />
      </button>
      <ShareBottomSheet
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        title={shareTitle}
        imageUrl={shareImageUrl}
      />
    </>
  );
}

type Props = ShareProps & { saveButton: ReactNode };

export function ArtworkInlineActions({ saveButton, ...share }: Props) {
  return (
    <>
      <div className="flex max-w-80 flex-1">{saveButton}</div>
      <ShareButton {...share} />
    </>
  );
}

export function ArtworkBottomBar({ saveButton, ...share }: Props) {
  const barRef = useRef<HTMLDivElement>(null);
  const barHeight = useBottomObstruction(barRef);

  return (
    <>
      <div aria-hidden className="desktop:hidden" style={{ height: barHeight }} />
      <div
        ref={barRef}
        className="fixed inset-x-0 bottom-keyboard-inset z-40 flex gap-3 border-t border-bg-secondary bg-primary-white px-gutter pt-3 pb-safe-area-bottom desktop:hidden"
      >
        <ShareButton {...share} />
        {saveButton}
      </div>
    </>
  );
}
