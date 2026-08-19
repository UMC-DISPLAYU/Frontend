import { Bookmark } from 'lucide-react';

import { OptimizedImage } from '@/components/common/OptimizedImage';
import type { ExhibitionItem } from '@/types/mypage';
import { cn } from '@/utils/cn';
import { statusBadgeClass } from '@/utils/mypage';

import { MemoFooter } from './MemoFooter';

interface ExhibitionCardProps {
  item: ExhibitionItem;
  isArtistView: boolean;
  onUnarchive?: (item: ExhibitionItem) => void;
  onSaveMemo?: (item: ExhibitionItem, memo: string) => void;
  onDeleteMemo?: (item: ExhibitionItem) => void;
  onOpen?: (item: ExhibitionItem) => void;
}

export function ExhibitionCard({
  item,
  isArtistView,
  onUnarchive,
  onSaveMemo,
  onDeleteMemo,
  onOpen,
}: ExhibitionCardProps) {
  const openHandlers = onOpen
    ? {
        role: 'button' as const,
        tabIndex: 0,
        onClick: () => onOpen(item),
        onKeyDown: (event: React.KeyboardEvent) => {
          if (event.key !== 'Enter' && event.key !== ' ') return;
          if (event.target !== event.currentTarget) return;
          event.preventDefault();
          onOpen(item);
        },
      }
    : {};

  return (
    <article className="shrink-0 w-full bg-card rounded-2xl shadow-[8px_8px_18px_0px_rgba(67,0,209,0.04)] flex flex-col relative">
      <div
        {...openHandlers}
        className={cn(
          'px-4 py-3.5 flex justify-start items-start gap-3',
          onOpen && 'cursor-pointer',
        )}
      >
        <div className="w-24 h-32 rounded-xl overflow-hidden bg-box200 shadow-[2px_4px_18px_0px_rgba(67,0,209,0.04)] shrink-0">
          {item.thumbnail && (
            <OptimizedImage
              className="block w-full h-full object-cover"
              src={item.thumbnail}
              displayWidth={96}
              alt={item.title}
            />
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
                onClick={(event) => {
                  event.stopPropagation();
                  onUnarchive?.(item);
                }}
              >
                <Bookmark fill="currentColor" className="size-4 text-bookmark" />
              </button>
            )}
          </div>

          <div className="self-stretch pt-4">
            <div className="typo-body-md-bold text-main truncate">{item.title}</div>
          </div>
          <div className="self-stretch pt-2.5">
            <div className="typo-body-xs-regular text-gray-800 truncate">{item.org}</div>
            <div className="typo-body-xs-regular text-hint">{item.period}</div>
          </div>
          <div className="self-stretch pt-4">
            <div className="typo-body-xxs-regular text-faint truncate">{item.place}</div>
          </div>
        </div>
      </div>

      {!isArtistView && (
        <MemoFooter
          className="mt-auto px-4 py-2"
          memo={item.memo}
          userId={item.userId}
          onSave={(memo) => onSaveMemo?.(item, memo)}
          onDelete={() => onDeleteMemo?.(item)}
        />
      )}
    </article>
  );
}
