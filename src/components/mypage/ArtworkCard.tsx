import { useState } from 'react';

import { Bookmark, Pencil } from 'lucide-react';

import { useMemoPolicy } from '@/hooks/usePolicy';
import type { SavedArtworkItem } from '@/types/mypage';
import { hasPermission } from '@/utils/hasPermission';

interface ArtworkCardProps {
  item: SavedArtworkItem;
  isArtistView?: boolean;
  onUnarchive?: (item: SavedArtworkItem) => void;
  onSaveMemo?: (item: SavedArtworkItem, memo: string) => void;
  onDeleteMemo?: (item: SavedArtworkItem) => void;
  onOpen?: (item: SavedArtworkItem) => void;
}

export function ArtworkCard({
  item,
  isArtistView = false,
  onUnarchive,
  onSaveMemo,
  onDeleteMemo,
  onOpen,
}: ArtworkCardProps) {
  const hasMemo = Boolean(item.memo);
  const memoPolicy = useMemoPolicy(item.userId === undefined ? undefined : { userId: item.userId });
  const canViewMemo = hasPermission(memoPolicy, 'view');
  const canUpsertMemo = hasPermission(memoPolicy, 'upsert');
  const canDeleteMemo = hasPermission(memoPolicy, 'delete');
  const [isEditingMemo, setIsEditingMemo] = useState(false);
  const [memoInput, setMemoInput] = useState(item.memo ?? '');

  /* 카드 영역은 div라서 키보드로도 열 수 있도록 역할과 키 처리를 함께 부여합니다. */
  const openHandlers = onOpen
    ? {
        role: 'button' as const,
        tabIndex: 0,
        onClick: () => onOpen(item),
        onKeyDown: (event: React.KeyboardEvent) => {
          if (event.key !== 'Enter' && event.key !== ' ') return;

          event.preventDefault();
          onOpen(item);
        },
      }
    : {};

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
    <article className="bg-card rounded-2xl shadow-[8px_8px_18px_0px_rgba(67,0,209,0.04)] flex flex-col overflow-hidden">
      <div {...openHandlers} className={onOpen ? 'cursor-pointer px-1.5 py-2.5' : 'px-1.5 py-2.5'}>
        <div className="relative rounded-xl overflow-hidden">
          <div className="w-full h-44 bg-box200">
            {item.thumbnail && (
              <img className="w-full h-full object-cover" src={item.thumbnail} alt={item.title} />
            )}
          </div>
          {!isArtistView && (
            <button
              type="button"
              aria-label="북마크 해제"
              className="absolute bottom-2 right-2"
              onClick={(event) => {
                event.stopPropagation();
                onUnarchive?.(item);
              }}
            >
              <Bookmark fill="currentColor" className="size-4 text-bookmark" />
            </button>
          )}
        </div>
      </div>

      <div
        {...openHandlers}
        className={
          onOpen
            ? 'cursor-pointer px-2.5 pt-0 pb-3 flex flex-col gap-0.5'
            : 'px-2.5 pt-0 pb-3 flex flex-col gap-0.5'
        }
      >
        <div className="typo-body-sm-bold text-main truncate">{item.title}</div>
        <div className="typo-body-xs-regular text-main truncate">{item.artist}</div>
      </div>

      {!isArtistView && canViewMemo && (
        <footer className="px-2.5 py-2 bg-box200 flex flex-col justify-center">
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
                className="min-w-0 flex-1 text-left typo-body-xs-regular text-faint line-clamp-2"
                onClick={handleStartMemoEdit}
              >
                {item.memo}
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
