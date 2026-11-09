import { type ReactNode, useRef, useState } from 'react';

import { Bookmark, Share2 } from 'lucide-react';

import { ShareBottomSheet } from '@/components/common/ShareBottomSheet';
import { useArchiveExhibition, useUnarchiveExhibition } from '@/hooks/queries/useArchive';
import { useLoginRequiredModal } from '@/hooks/usePermissionRequiredModal';
import { useArchivePolicy } from '@/hooks/usePolicy';
import { useBottomObstruction } from '@/hooks/useVirtualKeyboard';
import { toast } from '@/stores/toastStore';
import { cn } from '@/utils/cn';
import { hasPermission } from '@/utils/hasPermission';

type SaveProps = {
  displayId: number;
  saved: boolean;
  disabled?: boolean;
  className?: string;
};

export function DisplaySaveButton({ displayId, saved, disabled = false, className }: SaveProps) {
  const archive = useArchiveExhibition();
  const unarchive = useUnarchiveExhibition();
  const { loginModal, openLoginModal } = useLoginRequiredModal();
  const archivePolicy = useArchivePolicy();
  const isPending = archive.isPending || unarchive.isPending;

  const toggleSave = () => {
    if (isPending) return;
    if (!hasPermission(archivePolicy, saved ? 'delete' : 'create')) {
      openLoginModal();
      return;
    }

    if (saved) unarchive.mutate(displayId, { onSuccess: () => toast('저장을 취소했어요') });
    else
      archive.mutate(displayId, {
        onSuccess: () => toast('보관함에 저장했어요', { action: { label: '보기', to: '/my' } }),
      });
  };

  return (
    <>
      <button
        type="button"
        aria-pressed={saved}
        onClick={toggleSave}
        disabled={disabled || isPending}
        title={disabled ? '공개 전에는 사용할 수 없어요' : undefined}
        className={cn(
          'typography-body-lg-semibold flex h-11 min-w-0 flex-1 cursor-pointer items-center justify-center gap-1.5 rounded-12 transition duration-fast ease-standard active:scale-98 disabled:cursor-not-allowed disabled:opacity-45',
          saved
            ? 'bg-tertiary text-primary'
            : 'bg-interactive-primary text-bg-primary-white hover:bg-interactive-primary-hover',
          className,
        )}
      >
        <Bookmark
          aria-hidden="true"
          size={16}
          strokeWidth={1.7}
          fill={saved ? 'currentColor' : 'none'}
        />
        {saved ? '저장됨' : '전시 저장'}
      </button>
      {loginModal}
    </>
  );
}

type ShareProps = {
  shareTitle: string;
  shareDescription?: string;
  shareImageUrl?: string;
  disabled?: boolean;
};

function ShareButton({ shareTitle, shareDescription, shareImageUrl, disabled }: ShareProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <button
        type="button"
        aria-label="공유"
        onClick={() => setIsOpen(true)}
        disabled={disabled}
        title={disabled ? '공개 전에는 사용할 수 없어요' : undefined}
        className="grid size-11 shrink-0 cursor-pointer place-items-center rounded-12 border border-primary text-icon-primary transition-colors duration-fast ease-standard hover:bg-tertiary disabled:cursor-not-allowed disabled:opacity-45"
      >
        <Share2 aria-hidden="true" size={20} strokeWidth={1.7} />
      </button>
      <ShareBottomSheet
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        title={shareTitle}
        description={shareDescription}
        imageUrl={shareImageUrl}
      />
    </>
  );
}

type ActionsProps = ShareProps & { saveButton: ReactNode };

/* 900px 이상: 전시 정보 아래에 저장 · 공유 */
export function DisplayInlineActions({ saveButton, ...share }: ActionsProps) {
  return (
    <div className="hidden gap-2 desktop:flex">
      <div className="flex max-w-80 flex-1">{saveButton}</div>
      <ShareButton {...share} />
    </div>
  );
}

/* 900px 미만: 화면 아래 고정 바. 저장은 여기 한 곳에만 둔다 */
export function DisplayBottomBar({ saveButton, ...share }: ActionsProps) {
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
