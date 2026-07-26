import { useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';

import type { NearbyDisplay } from '../../hooks/useNearbyDisplays';

interface ExhibitionMapCardProps {
  exhibition: NearbyDisplay;
  selected?: boolean;
  onClick?: () => void;
  onToggleBookmark?: () => void;
}

/**
 * 지도 탭 하단에 쌓이는 가로형 카드.
 * 선택된 카드(지도 핀과 동기화)는 outline 으로 강조.
 * 색/타이포는 전부 디자인 토큰만 사용.
 *
 * 클릭 동작:
 * - 싱글클릭: 지도 핀 선택
 * - 더블클릭: 상세 페이지 이동
 */
export function ExhibitionMapCard({
  exhibition,
  selected = false,
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
      className={`flex w-full cursor-pointer items-start gap-3 rounded-2xl p-3.5 text-left no-underline shadow-[8px_8px_18px_0px_rgba(67,0,209,0.04),inset_1px_1px_4px_0px_rgba(1,8,21,0.20),inset_-2px_-2px_2px_0px_rgba(255,255,255,0.90)] ${
        selected ? 'bg-box outline outline-1 -outline-offset-1 outline-line' : 'bg-box100'
      }`}
    >
      <img
        src={exhibition.posterImageUrl}
        alt=""
        className="h-32 w-24 shrink-0 rounded-xl bg-box200 object-cover"
      />

      <div className="flex flex-1 flex-col gap-4">
        <span className="w-fit rounded-sm bg-box200 px-2 py-0.5">
          <span className="typo-body-xxs-regular text-main">{exhibition.status}</span>
        </span>

        <div className="flex flex-col gap-2.5">
          <h3 className="typo-body-md-bold text-main">{exhibition.title}</h3>

          <div className="flex flex-col gap-4">
            <div className="flex flex-col">
              <span className="typo-body-xs-regular text-sub700">
                {exhibition.hostName}
              </span>
              <span className="typo-body-xs-regular text-hint">{exhibition.period}</span>
            </div>

            <div className="flex items-center gap-1">
              <LocationIcon />
              <span className="typo-body-xxs-regular text-faint">
                {exhibition.placeName}
              </span>
            </div>
          </div>
        </div>
      </div>

      <button
        type="button"
        aria-label={exhibition.isBookmarked ? '북마크 해제' : '북마크'}
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          onToggleBookmark?.();
        }}
        className="shrink-0 focus:outline-none focus:ring-2 focus:ring-main focus:ring-offset-2"
      >
        <BookmarkIcon filled={exhibition.isBookmarked} />
      </button>
    </Link>
  );
}

function LocationIcon() {
  return (
    <svg width="10" height="10" viewBox="0 0 10 10" fill="none" aria-hidden>
      <path
        d="M5 1.25c1.5 0 2.5 1.1 2.5 2.4C7.5 5.4 5 8.3 5 8.3S2.5 5.4 2.5 3.65C2.5 2.35 3.5 1.25 5 1.25Z"
        stroke="currentColor"
        strokeWidth="0.83"
        className="text-faint"
      />
      <circle
        cx="5"
        cy="3.75"
        r="0.9"
        stroke="currentColor"
        strokeWidth="0.83"
        className="text-faint"
      />
    </svg>
  );
}

function BookmarkIcon({ filled }: { filled: boolean }) {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden>
      <path
        d="M4 2.5h8a.5.5 0 0 1 .5.5v10.5L8 11.2l-4.5 2.3V3a.5.5 0 0 1 .5-.5Z"
        className={filled ? 'fill-main stroke-main' : 'stroke-faint'}
        strokeWidth="1.2"
        strokeLinejoin="round"
      />
    </svg>
  );
}
