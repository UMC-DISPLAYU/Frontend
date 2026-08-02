import { useState } from 'react';

import { Bookmark, Pencil } from 'lucide-react';

import type { ExhibitionItem } from '@/types/mypage';
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
    <article className="shrink-0 w-full bg-neutral-50 rounded-2xl shadow-[8px_8px_18px_0px_rgba(67,0,209,0.04)] flex flex-col overflow-hidden font-['Pretendard']">
      <div className="px-4 py-3.5 flex justify-start items-start gap-3">
        <div className="w-24 h-32 rounded-xl overflow-hidden bg-neutral-200 shadow-[2px_4px_18px_0px_rgba(67,0,209,0.04)] shrink-0">
          <img className="w-full h-full object-cover" src={item.thumbnail} alt={item.title} />
        </div>

        <div className="flex-1 flex flex-col justify-start items-start min-w-0">
          <div className="self-stretch flex justify-between items-start gap-2">
            <div className={`px-2 py-0.5 rounded-sm shrink-0 ${statusBadgeClass(item.status)}`}>
              <span className="text-neutral-50 text-[10px] font-normal leading-3">
                {item.status}
              </span>
            </div>
            {!isArtistView && (
              <button
                type="button"
                aria-label="북마크 해제"
                className="shrink-0"
                onClick={() => onUnarchive?.(item)}
              >
                <Bookmark fill="#D70004" color="#D70004" className="size-4" />
              </button>
            )}
          </div>

          <div className="self-stretch pt-2.5">
            <div className="text-neutral-900 text-base font-bold leading-6 truncate">
              {item.title}
            </div>
          </div>
          <div className="self-stretch pt-2.5">
            <div className="text-neutral-800 text-xs font-normal leading-4 truncate">
              {item.org}
            </div>
            <div className="text-neutral-500 text-xs font-normal leading-4">{item.period}</div>
          </div>
          <div className="self-stretch pt-4">
            <div className="text-neutral-400 text-[10px] font-normal leading-3 truncate">
              {item.place}
            </div>
          </div>
        </div>
      </div>

      {!isArtistView && (
        <footer className="min-h-11 px-4 py-2 bg-gray-200 flex flex-col justify-center">
          {isEditingMemo ? (
            <div className="self-stretch flex flex-col gap-2">
              <textarea
                value={memoInput}
                onChange={(event) => setMemoInput(event.target.value)}
                placeholder="메모"
                className="min-h-10 w-full resize-none bg-transparent text-xs font-normal leading-4 text-neutral-500 outline-none placeholder:text-neutral-400"
                autoFocus
              />
              <div className="self-stretch flex justify-end gap-2">
                <button
                  type="button"
                  className="text-neutral-400 text-xs font-normal leading-4"
                  onClick={handleCancelMemo}
                >
                  취소
                </button>
                <button
                  type="button"
                  className="text-neutral-900 text-xs font-semibold leading-4"
                  onClick={handleSaveMemo}
                >
                  저장
                </button>
              </div>
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
              <button
                type="button"
                className="shrink-0 text-neutral-400 text-xs font-normal leading-5 underline"
                onClick={() => onDeleteMemo?.(item)}
              >
                삭제
              </button>
            </div>
          ) : (
            <button
              type="button"
              className="self-stretch flex items-center gap-1.5 text-left text-neutral-400 text-xs font-normal leading-5"
              onClick={handleStartMemoEdit}
            >
              <Pencil color="#99A1AF" className="size-3 shrink-0" />
              <span>메모</span>
            </button>
          )}
        </footer>
      )}
    </article>
  );
}
