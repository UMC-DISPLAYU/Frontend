import { useRef } from 'react';

import { Bookmark, Calendar, MapPin } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';

import type { NearbyDisplay } from '@/hooks/useNearbyDisplays';

interface ExhibitionMapCardProps {
  exhibition: NearbyDisplay;
  selected?: boolean;
  onClick?: () => void;
  onToggleBookmark?: () => void;
}

export function ExhibitionMapCard({
  exhibition,
  onClick,
  onToggleBookmark,
}: ExhibitionMapCardProps) {
  const navigate = useNavigate();
  const clickTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const clickCountRef = useRef<number>(0);

  const handleCardClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    // 북마크 버튼 클릭은 무시
    if ((e.target as HTMLElement).closest('button')) {
      return;
    }

    e.preventDefault();

    clickCountRef.current++;

    if (clickCountRef.current === 1) {
      // 첫 번째 클릭: 300ms 대기
      clickTimeoutRef.current = setTimeout(() => {
        // 싱글클릭: 지도 핀 선택
        if (onClick) {
          onClick();
        }
        clickCountRef.current = 0;
      }, 300);
    } else if (clickCountRef.current === 2) {
      // 두 번째 클릭: 타이머 취소하고 페이지 이동
      if (clickTimeoutRef.current) {
        clearTimeout(clickTimeoutRef.current);
        clickTimeoutRef.current = null;
      }
      clickCountRef.current = 0;
      navigate(`/display/${exhibition.displayId}`);
    }
  };

  return (
    <Link
      to={`/display/${exhibition.displayId}`}
      onClick={handleCardClick}
      className="flex justify-between items-center w-full py-4.5 bg-white border-b border-line cursor-pointer"
    >
      <div className="flex gap-4.5 overflow-hidden">
        <div className="size-[84px] shrink-0 rounded-lg overflow-hidden bg-box">
          <img
            src={exhibition.posterImageUrl}
            alt={exhibition.title}
            className="size-full object-cover"
          />
        </div>

        <div className="flex flex-col gap-2 min-w-0">
          <h3 className="typo-body-base-bold text-main truncate">{exhibition.title}</h3>

          <div className="flex flex-col gap-1">
            <div className="flex items-center gap-1">
              <Calendar className="size-2.5 text-faint" strokeWidth={1.7} aria-hidden />
              <span className="typo-body-xs-regular text-hint">{exhibition.period}</span>
            </div>

            <div className="flex items-center gap-1">
              <MapPin className="size-2.5 text-faint" strokeWidth={1.7} aria-hidden />
              <span className="typo-body-xxs-regular text-faint">{exhibition.placeName}</span>
            </div>
          </div>
        </div>
      </div>

      <button
        type="button"
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          onToggleBookmark?.();
        }}
        className="shrink-0 focus:outline-none focus:ring-2 focus:ring-main focus:ring-offset-2"
      >
        <Bookmark className="size-4 text-faint" strokeWidth={1.2} aria-hidden />
      </button>
    </Link>
  );
}
