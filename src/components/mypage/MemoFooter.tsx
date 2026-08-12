import { useState } from 'react';

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
    <footer className={cn('bg-box200 flex flex-col justify-center', className)}>
      {isEditingMemo ? (
        <div className="flex flex-col gap-1.5 self-stretch">
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
                  onMouseDown={(e) => {
                    e.preventDefault();
                    handleDeleteMemo();
                  }}
                >
                  삭제
                </button>
              )}
              <button
                type="button"
                className="typo-body-xs-regular text-faint underline underline-offset-2"
                onMouseDown={(e) => {
                  e.preventDefault();
                  handleSaveMemo();
                }}
              >
                확인
              </button>
            </div>
          </div>
          <textarea
            value={memoInput}
            onChange={(event) => setMemoInput(event.target.value)}
            onBlur={handleSaveMemo}
            placeholder=""
            className="w-full resize-none bg-transparent typo-body-xs-regular text-main outline-none"
            autoFocus
            rows={1}
          />
        </div>
      ) : hasMemo ? (
        <div className="flex items-start gap-2 self-stretch">
          <button
            type="button"
            className="min-w-0 flex-1 text-left typo-body-xs-regular text-faint line-clamp-2"
            onClick={handleStartMemoEdit}
          >
            {memo}
          </button>
          {canDeleteMemo && (
            <button
              type="button"
              className="shrink-0 typo-body-xs-regular text-faint underline"
              onClick={handleDeleteMemo}
            >
              삭제
            </button>
          )}
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
