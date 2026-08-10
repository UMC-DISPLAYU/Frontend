import { MapPin, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

import type { NearbyDisplay } from '@/hooks/useNearbyDisplays';

interface ExhibitionMapMarkerProps {
  title: string;
  onClick: () => void;
}

export function ExhibitionMapMarker({ title, onClick }: ExhibitionMapMarkerProps) {
  return (
    <button
      type="button"
      onClick={(e) => {
        e.stopPropagation();
        onClick();
      }}
      className="flex -translate-y-1 flex-col items-center focus:outline-none cursor-pointer"
    >
      <span className="flex items-center gap-1 rounded-[10px] bg-card px-2 py-1 shadow-[0px_1px_3px_0px_rgba(0,0,0,0.10)] outline outline-1 -outline-offset-1 outline-line-soft transition-transform hover:scale-105">
        <MapPin className="size-2.5 text-hint" aria-hidden />
        <span className="typo-body-xxs-regular whitespace-nowrap text-sub700">{title}</span>
      </span>
      <span className="mt-0.75 size-2 rounded-full bg-faint" />
    </button>
  );
}

interface ExhibitionMapSelectedOverlayProps {
  exhibition: NearbyDisplay;
  onClose: () => void;
}

export function ExhibitionMapSelectedOverlay({
  exhibition,
  onClose,
}: ExhibitionMapSelectedOverlayProps) {
  const navigate = useNavigate();

  const handleGoToDetail = (e: React.MouseEvent) => {
    e.stopPropagation();
    navigate(`/display/${exhibition.displayId}`);
  };

  return (
    <div
      onClick={handleGoToDetail}
      className="w-38 overflow-hidden rounded-xl bg-white shadow-xl transition-all border border-line-soft -translate-y-1 cursor-pointer"
    >
      {/* 1. 포스터 이미지 & 닫기 버튼 */}
      <div className="relative h-20 w-full bg-box200">
        {exhibition.posterImageUrl ? (
          <img
            src={exhibition.posterImageUrl}
            alt={exhibition.title}
            className="size-full object-cover"
          />
        ) : null}
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onClose();
          }}
          className="absolute top-1.5 right-1.5 flex size-5 items-center justify-center rounded-full bg-black/60 text-white transition-colors hover:bg-black/80 cursor-pointer z-10"
          aria-label="닫기"
        >
          <X size={12} strokeWidth={2.5} />
        </button>
      </div>

      {/* 2. 전시 정보 및 전시 상세보기 버튼 */}
      <div className="flex flex-col p-2">
        <h4 className="typo-body-xs-bold text-main truncate leading-tight">{exhibition.title}</h4>
        <p className="typo-body-xxs-regular text-sub700 truncate mt-0.5">
          {exhibition.locationName || exhibition.schoolDepartmentName}
        </p>

        <button
          type="button"
          onClick={handleGoToDetail}
          className="mt-2 flex h-7.5 w-full items-center justify-center rounded-lg bg-dark typo-body-xxs-bold text-white transition-all active:scale-[0.98] cursor-pointer"
        >
          전시 상세보기
        </button>
      </div>
    </div>
  );
}
