import { Bookmark, Pencil } from 'lucide-react';

import type { ExhibitionItem } from '@/types/mypage';
import { statusBadgeClass } from '@/utils/mypage';

interface ExhibitionCardProps {
  item: ExhibitionItem;
  isArtistView: boolean;
}

export function ExhibitionCard({ item, isArtistView }: ExhibitionCardProps) {
  const hasMemo = Boolean(item.memo);

  return (
    <article className="shrink-0 w-full bg-neutral-50 rounded-2xl shadow-[8px_8px_18px_0px_rgba(67,0,209,0.04)] flex flex-col overflow-hidden font-['Pretendard']">
      <div className="px-4 py-3.5 flex justify-start items-start gap-3">
        <div className="w-24 h-32 rounded-xl overflow-hidden bg-neutral-200 shadow-[2px_4px_18px_0px_rgba(67,0,209,0.04)] shrink-0">
          <img
            className="w-full h-full object-cover"
            src={item.thumbnail}
            alt={item.title}
          />
        </div>

        <div className="flex-1 flex flex-col justify-start items-start min-w-0">
          <div className="self-stretch flex justify-between items-start gap-2">
            <div
              className={`px-2 py-0.5 rounded-sm shrink-0 ${statusBadgeClass(item.status)}`}
            >
              <span className="text-neutral-50 text-[10px] font-normal leading-3">
                {item.status}
              </span>
            </div>
            {!isArtistView && (
              <button type="button" aria-label="북마크" className="shrink-0">
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
            <div className="text-neutral-500 text-xs font-normal leading-4">
              {item.period}
            </div>
          </div>
          <div className="self-stretch pt-4">
            <div className="text-neutral-400 text-[10px] font-normal leading-3 truncate">
              {item.place}
            </div>
          </div>
        </div>
      </div>

      {!isArtistView && (
        <footer className="px-4 py-2 bg-gray-200 flex flex-col justify-start items-start gap-1.5">
          <div className="self-stretch flex justify-between items-center">
            <div className="flex justify-start items-center gap-1.5">
              <Pencil color="#99A1AF" className="size-2.5 shrink-0" />
              <span className="text-neutral-400 text-xs font-semibold leading-4">
                내 메모
              </span>
            </div>
            {hasMemo && (
              <button
                type="button"
                className="text-neutral-400 text-xs font-normal underline leading-4 shrink-0"
              >
                확인
              </button>
            )}
          </div>

          {hasMemo ? (
            <p className="self-stretch text-neutral-400 text-xs font-normal leading-4 line-clamp-2">
              {item.memo}
            </p>
          ) : (
            <button
              type="button"
              className="self-stretch text-left text-stone-300 text-xs font-normal underline leading-4"
            >
              메모 작성하기
            </button>
          )}
        </footer>
      )}
    </article>
  );
}
