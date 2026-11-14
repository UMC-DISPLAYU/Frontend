import { type ReactNode, useRef } from 'react';

import shareIcon from '@/assets/artwork-detail/share.svg';
import { useBottomObstruction } from '@/hooks/useVirtualKeyboard';
import { shareLink } from '@/utils/share';

type ShareProps = {
  shareTitle: string;
  disabled?: boolean;
};

/* 기기 기본 공유 창을 띄운다(프로토타입 share.js). 누를 때마다 새로 연다 */
function ShareButton({ shareTitle, disabled }: ShareProps) {
  return (
    <button
      type="button"
      aria-label="공유"
      onClick={() => void shareLink({ title: shareTitle })}
      disabled={disabled}
      title={disabled ? '공개 전에는 사용할 수 없어요' : undefined}
      className="grid size-11 shrink-0 cursor-pointer place-items-center rounded-12 border border-primary transition-colors duration-fast ease-standard hover:bg-secondary disabled:cursor-not-allowed disabled:opacity-45"
    >
      <img src={shareIcon} alt="" />
    </button>
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
  // 바 아래 여백은 ArtworkDetailShell 이 프로토타입 값(140)으로 둔다
  useBottomObstruction(barRef);

  return (
    <>
      <div
        ref={barRef}
        className="fixed inset-x-0 bottom-keyboard-inset z-40 flex gap-3 border-t border-[#f0f0f3] bg-primary-white px-5 pt-3 pb-[max(12px,env(safe-area-inset-bottom))] desktop:hidden"
      >
        <ShareButton {...share} />
        {saveButton}
      </div>
    </>
  );
}
