import { useState } from 'react';

import { Bookmark, Pencil } from 'lucide-react';

import type { SavedArtworkItem } from '@/types/mypage';

interface ArtworkCardProps {
  item: SavedArtworkItem;
  isArtistView?: boolean;
  onUnarchive?: (item: SavedArtworkItem) => void;
  onSaveMemo?: (item: SavedArtworkItem, memo: string) => void;
  onDeleteMemo?: (item: SavedArtworkItem) => void;
}

export function ArtworkCard({
  item,
  isArtistView = false,
  onUnarchive,
  onSaveMemo,
  onDeleteMemo,
}: ArtworkCardProps) {
  const hasMemo = Boolean(item.memo);
  const [isEditingMemo, setIsEditingMemo] = useState(false);
  const [memoInput, setMemoInput] = useState(item.memo ?? '');

  const handleCancelMemo = () => {
    setMemoInput(item.memo ?? '');
    setIsEditingMemo(false);
  };

  const handleStartMemoEdit = () => {
    setMemoInput(item.memo ?? '');
    setIsEditingMemo(true);
  };

  const handleSaveMemo = () => {
    onSaveMemo?.(item, memoInput);
    setIsEditingMemo(false);
  };

  return (
    <article className="bg-card rounded-2xl shadow-[8px_8px_18px_0px_rgba(67,0,209,0.04)] flex flex-col overflow-hidden">
      <div className="p-1.5 pb-0">
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
              onClick={() => onUnarchive?.(item)}
            >
              <Bookmark fill="currentColor" className="size-4 text-bookmark" />
            </button>
          )}
        </div>
      </div>

      <div className="px-2.5 pt-2 pb-3 flex flex-col gap-1">
        <div className="typo-body-sm-bold text-main truncate">{item.title}</div>
        <div className="typo-body-xs-regular text-main truncate">{item.artist}</div>
      </div>

      {!isArtistView && (
        <footer className="min-h-10 px-2.5 py-2 bg-box200 flex flex-col justify-center">
          {isEditingMemo && (
            <div className="flex flex-col gap-2">
              <textarea
                value={memoInput}
                onChange={(event) => setMemoInput(event.target.value)}
                placeholder="메모"
                className="min-h-10 w-full resize-none bg-transparent typo-body-xs-regular text-hint outline-none placeholder:text-faint"
                autoFocus
              />
              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  className="typo-body-xs-regular text-faint"
                  onClick={handleCancelMemo}
                >
                  취소
                </button>
                <button
                  type="button"
                  className="typo-body-xs-semibold text-main"
                  onClick={handleSaveMemo}
                >
                  저장
                </button>
              </div>
            </div>
          )}
          {!isEditingMemo &&
            (hasMemo ? (
              <div className="self-stretch flex items-start gap-2">
                <button
                  type="button"
                  className="min-w-0 flex-1 text-left typo-body-xs-regular text-faint line-clamp-2"
                  onClick={handleStartMemoEdit}
                >
                  {item.memo}
                </button>
                <button
                  type="button"
                  className="shrink-0 typo-body-xs-regular text-faint underline"
                  onClick={() => onDeleteMemo?.(item)}
                >
                  삭제
                </button>
              </div>
            ) : (
              <button
                type="button"
                className="self-stretch flex items-center gap-1.5 text-left typo-body-xs-regular text-faint"
                onClick={handleStartMemoEdit}
              >
                <Pencil className="size-3 shrink-0 text-faint" />
                <span>메모</span>
              </button>
            ))}
        </footer>
      )}
    </article>
  );
}
