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
    <article className="shrink-0 w-full bg-card rounded-2xl shadow-[8px_8px_18px_0px_rgba(67,0,209,0.04)] flex flex-col overflow-hidden">
      <div className="px-4 py-3.5 flex justify-start items-start gap-3">
        <div className="w-24 h-32 rounded-xl overflow-hidden bg-box shadow-[2px_4px_18px_0px_rgba(67,0,209,0.04)] shrink-0">
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
              <span className="text-white typo-body-xxs-regular">
                {item.status}
              </span>
            </div>
            {!isArtistView && (
            <button type="button" aria-label="북마크" className="shrink-0">
              <Bookmark className="size-4 text-error fill-error" />
            </button>
            )}
          </div>

          <div className="self-stretch pt-2.5">
            <div className="text-main typo-body-xl-bold leading-6 truncate">
              {item.title}
            </div>
          </div>
          <div className="self-stretch pt-2.5">
            <div className="text-main typo-body-xs-regular leading-4 truncate">
              {item.org}
            </div>
            <div className="text-sub typo-body-xs-regular leading-4">
              {item.period}
            </div>
          </div>
          <div className="self-stretch pt-4">
            <div className="text-hint typo-body-xxs-regular leading-3 truncate">
              {item.place}
            </div>
          </div>
        </div>
      </div>

      {!isArtistView && (
        <footer className="px-4 py-2 bg-box flex flex-col justify-start items-start gap-1.5">
          <div className="self-stretch flex justify-between items-center">
            <div className="flex justify-start items-center gap-1.5">
              <Pencil className="size-2.5 shrink-0 text-faint" />
              <span className="text-faint typo-body-xs-semibold leading-4">
                내 메모
              </span>
            </div>
            {hasMemo && (
              <button
                type="button"
                className="text-faint typo-body-xs-regular underline leading-4 shrink-0"
              >
                확인
              </button>
            )}
          </div>

          {hasMemo ? (
            <p className="self-stretch text-faint typo-body-xs-regular leading-4 line-clamp-2">
              {item.memo}
            </p>
          ) : (
            <button
              type="button"
              className="text-faint typo-body-xs-regular underline leading-4 shrink-0"
            >
              메모 작성하기
            </button>
          )}
        </footer>
      )}
    </article>
  );
}
