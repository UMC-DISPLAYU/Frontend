import { Bookmark } from 'lucide-react';

import { OptimizedImage } from '@/components/common/OptimizedImage';
import type { SavedArtworkItem } from '@/types/mypage';

import { MemoFooter } from './MemoFooter';

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
  /* 카드 영역은 div라서 키보드로도 열 수 있도록 역할과 키 처리를 함께 부여합니다. */
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
    <article className="bg-card rounded-2xl shadow-[8px_8px_18px_0px_rgba(67,0,209,0.04)] flex flex-col relative">
      <div {...openHandlers} className={onOpen ? 'cursor-pointer px-1.5 py-2.5' : 'px-1.5 py-2.5'}>
        <div className="relative rounded-xl overflow-hidden">
          <div className="w-full h-44 bg-box200">
            {item.thumbnail && (
              <OptimizedImage
                className="block w-full h-full object-cover"
                src={item.thumbnail}
                displayWidth={170}
                alt={item.title}
              />
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

      {!isArtistView && (
        <MemoFooter
          className="px-2.5 py-2"
          memo={item.memo}
          userId={item.userId}
          onSave={(memo) => onSaveMemo?.(item, memo)}
          onDelete={() => onDeleteMemo?.(item)}
        />
      )}
    </article>
  );
}
