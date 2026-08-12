import { useEffect, useRef, useState } from 'react';

import { Pencil } from 'lucide-react';

import { useMemoPolicy } from '@/hooks/usePolicy';
import { cn } from '@/utils/cn';
import { hasPermission } from '@/utils/hasPermission';

interface MemoFooterProps {
  memo?: string | null;
  userId?: number;
  className?: string;
  onSave?: (memo: string) => void;
  onDelete?: () => void;
}

export function MemoFooter({ memo, userId, className, onSave, onDelete }: MemoFooterProps) {
  const hasMemo = Boolean(memo);
  const memoPolicy = useMemoPolicy(userId === undefined ? undefined : { userId });
  const canViewMemo = hasPermission(memoPolicy, 'view');
  const canUpsertMemo = hasPermission(memoPolicy, 'upsert');
  const canDeleteMemo = hasPermission(memoPolicy, 'delete');

  const [isEditingMemo, setIsEditingMemo] = useState(false);
  const [memoInput, setMemoInput] = useState(memo ?? '');
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const resizeTextarea = () => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  };

  useEffect(() => {
    if (isEditingMemo) {
      resizeTextarea();
    }
  }, [isEditingMemo, memoInput]);

  if (!canViewMemo) return null;

  const handleStartMemoEdit = () => {
    if (!canUpsertMemo) return;
    setMemoInput(memo ?? '');
    setIsEditingMemo(true);
  };

  const handleSaveMemo = () => {
    if (!canUpsertMemo) return;

    const trimmedInput = memoInput.trim();
    const originalMemo = memo ?? '';

    if (trimmedInput === '') {
      if (hasMemo && canDeleteMemo) {
        onDelete?.();
      }
    } else if (trimmedInput !== originalMemo) {
      onSave?.(trimmedInput);
    }
    setIsEditingMemo(false);
  };

  const handleDeleteMemo = () => {
    if (!canDeleteMemo) return;
    onDelete?.();
    setIsEditingMemo(false);
  };

  return (
    <footer
      className={cn('bg-box200 flex flex-col justify-center relative rounded-b-2xl', className)}
    >
      {isEditingMemo ? (
        <>
          <div className="opacity-0 pointer-events-none flex items-center gap-1.5 self-stretch h-4">
            <Pencil className="size-3 shrink-0" />
            <span className="typo-body-xs-regular">메모</span>
          </div>

          <div
            className={cn(
              'absolute top-0 left-0 w-full z-10 bg-box200 flex flex-col gap-1.5 shadow-[0_8px_16px_rgba(0,0,0,0.1)] rounded-b-2xl',
              className,
            )}
          >
            <div className="flex items-center justify-between self-stretch">
              <div className="flex items-center gap-1.5 typo-body-xs-regular text-faint">
                <Pencil className="size-3 shrink-0" />
                <span>메모</span>
              </div>
              <div className="flex items-center gap-1.5">
                {hasMemo && canDeleteMemo && (
                  <button
                    type="button"
                    className="typo-body-xs-regular text-error underline underline-offset-2"
                    onMouseDown={(e) => e.preventDefault()}
                    onClick={handleDeleteMemo}
                  >
                    삭제
                  </button>
                )}
                <button
                  type="button"
                  className="typo-body-xs-regular text-faint underline underline-offset-2"
                  onMouseDown={(e) => e.preventDefault()}
                  onClick={handleSaveMemo}
                >
                  확인
                </button>
              </div>
            </div>
            <textarea
              ref={textareaRef}
              value={memoInput}
              onChange={(event) => setMemoInput(event.target.value)}
              onBlur={handleSaveMemo}
              placeholder=""
              className="w-full resize-none bg-transparent typo-body-xs-regular text-main outline-none overflow-y-hidden"
              autoFocus
              rows={1}
            />
          </div>
        </>
      ) : hasMemo ? (
        <div className="flex items-start gap-2 self-stretch">
          <button
            type="button"
            className="min-w-0 flex-1 text-left typo-body-xs-regular text-faint line-clamp-2"
            onClick={handleStartMemoEdit}
          >
            {memo}
          </button>
        </div>
      ) : canUpsertMemo ? (
        <button
          type="button"
          className="flex items-center gap-1.5 self-stretch text-left typo-body-xs-regular text-faint"
          onClick={handleStartMemoEdit}
        >
          <Pencil className="size-3 shrink-0 text-faint" />
          <span>메모</span>
        </button>
      ) : null}
    </footer>
  );
}
