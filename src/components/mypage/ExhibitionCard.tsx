import { useState } from 'react';

import { Bookmark, Pencil } from 'lucide-react';

import { useMemoPolicy } from '@/hooks/usePolicy';
import type { ExhibitionItem } from '@/types/mypage';
import { cn } from '@/utils/cn';
import { hasPermission } from '@/utils/hasPermission';
import { statusBadgeClass } from '@/utils/mypage';

interface ExhibitionCardProps {
  item: ExhibitionItem;
  isArtistView: boolean;
  onUnarchive?: (item: ExhibitionItem) => void;
  onSaveMemo?: (item: ExhibitionItem, memo: string) => void;
  onDeleteMemo?: (item: ExhibitionItem) => void;
}

export function ExhibitionCard({
  item,
  isArtistView,
  onUnarchive,
  onSaveMemo,
  onDeleteMemo,
}: ExhibitionCardProps) {
  const hasMemo = Boolean(item.memo);
  const memoPolicy = useMemoPolicy(item.userId === undefined ? undefined : { userId: item.userId });
  const canViewMemo = hasPermission(memoPolicy, 'view');
  const canUpsertMemo = hasPermission(memoPolicy, 'upsert');
  const canDeleteMemo = hasPermission(memoPolicy, 'delete');
  const [isEditingMemo, setIsEditingMemo] = useState(false);
  const [memoInput, setMemoInput] = useState(item.memo ?? '');

  const handleCancelMemo = () => {
    setMemoInput(item.memo ?? '');
    setIsEditingMemo(false);
  };

  const handleStartMemoEdit = () => {
    if (!canUpsertMemo) return;

    setMemoInput(item.memo ?? '');
    setIsEditingMemo(true);
  };

  const handleSaveMemo = () => {
    if (!canUpsertMemo) return;

    const trimmedInput = memoInput.trim();
    const originalMemo = item.memo ?? '';

    if (trimmedInput === '') {
      if (hasMemo && canDeleteMemo) {
        onDeleteMemo?.(item);
      }
    } else if (trimmedInput !== originalMemo) {
      onSaveMemo?.(item, trimmedInput);
    }
    setIsEditingMemo(false);
  };

  const handleDeleteMemo = () => {
    if (!canDeleteMemo) return;

    onDeleteMemo?.(item);
  };

  return (
    <article className="shrink-0 w-full bg-card rounded-2xl shadow-[8px_8px_18px_0px_rgba(67,0,209,0.04)] flex flex-col overflow-hidden">
      <div className="px-4 py-3.5 flex justify-start items-start gap-3">
        <div className="w-24 h-32 rounded-xl overflow-hidden bg-box200 shadow-[2px_4px_18px_0px_rgba(67,0,209,0.04)] shrink-0">
          {item.thumbnail && (
            <img className="w-full h-full object-cover" src={item.thumbnail} alt={item.title} />
          )}
        </div>

        <div className="flex-1 flex flex-col justify-start items-start min-w-0">
          <div className="self-stretch flex justify-between items-start gap-2">
            <div
              className={cn(
                'inline-flex items-center justify-center px-2 py-0.5 rounded-sm shrink-0',
                statusBadgeClass(item.status),
              )}
            >
              <span className="typo-body-xxs-regular text-bt-black">{item.status}</span>
            </div>
            {!isArtistView && (
              <button
                type="button"
                aria-label="북마크 해제"
                className="shrink-0"
                onClick={() => onUnarchive?.(item)}
              >
                <Bookmark fill="currentColor" className="size-4 text-bookmark" />
              </button>
            )}
          </div>

          <div className="self-stretch pt-2.5">
            <div className="typo-body-xl-bold text-main truncate">{item.title}</div>
          </div>
          <div className="self-stretch pt-2.5">
            <div className="typo-body-xs-regular text-sub700 truncate">{item.org}</div>
            <div className="typo-body-xs-regular text-hint">{item.period}</div>
          </div>
          <div className="self-stretch pt-4">
            <div className="typo-body-xxs-regular text-faint truncate">{item.place}</div>
          </div>
        </div>
      </div>

      {!isArtistView && canViewMemo && (
        <footer className="px-4 py-2 bg-box200 flex flex-col justify-center">
          {isEditingMemo ? (
            <div className="self-stretch flex flex-col gap-[6px]">
              <div className="self-stretch flex items-center justify-between">
                <div className="flex items-center gap-1.5 text-faint typo-body-xs-regular">
                  <Pencil className="size-3 shrink-0" />
                  <span>메모</span>
                </div>
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
            <div className="self-stretch flex items-start gap-2">
              <button
                type="button"
                className="min-w-0 flex-1 text-left text-neutral-400 text-xs font-normal leading-5 line-clamp-2"
                onClick={handleStartMemoEdit}
              >
                {item.memo}
              </button>
              {canDeleteMemo && (
                <button
                  type="button"
                  className="shrink-0 text-neutral-400 text-xs font-normal leading-5 underline"
                  onClick={handleDeleteMemo}
                >
                  삭제
                </button>
              )}
            </div>
          ) : canUpsertMemo ? (
            <button
              type="button"
              className="self-stretch flex items-center gap-1.5 text-left typo-body-xs-regular text-faint"
              onClick={handleStartMemoEdit}
            >
              <Pencil className="size-3 shrink-0 text-faint" />
              <span>메모</span>
            </button>
          ) : null}
        </footer>
      )}
    </article>
  );
}
