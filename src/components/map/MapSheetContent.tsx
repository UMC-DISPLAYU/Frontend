import { Link } from 'react-router-dom';

import { staggerStyle } from '@/utils/stagger';

import { MapExhibitionCard } from './MapExhibitionCard';
import type { MapExhibition } from './useMapExhibitions';

const toDetailPath = (id: number) => `/display/${id}`;

interface MapSelectedExhibitionProps {
  exhibition: MapExhibition;
  inViewCount: number;
  onShowAll: () => void;
}

export function MapSelectedExhibition({
  exhibition,
  inViewCount,
  onShowAll,
}: MapSelectedExhibitionProps) {
  return (
    <>
      <MapExhibitionCard
        title={exhibition.title}
        posterImageUrl={exhibition.posterImageUrl}
        organization={exhibition.organization}
        period={exhibition.period}
        location={exhibition.locationName}
        distance={exhibition.distance}
        showTitle={false}
        to={toDetailPath(exhibition.id)}
      />
      <Link
        to={toDetailPath(exhibition.id)}
        className="typography-body-lg-semibold grid h-11 place-items-center rounded-12 bg-primary-white text-[#000] transition-[scale] duration-fast ease-standard active:scale-98"
      >
        전시 보러가기
      </Link>
      <button
        type="button"
        onClick={onShowAll}
        className="typography-body-md-medium justify-self-center px-2 py-0.5 text-tertiary underline underline-offset-2"
      >
        이 지역 전시 {inViewCount}개 보기
      </button>
    </>
  );
}

interface MapExhibitionListProps {
  exhibitions: MapExhibition[];
  selectedId: number | null;
  onCardClick: (exhibition: MapExhibition) => void;
}

export function MapExhibitionList({
  exhibitions,
  selectedId,
  onCardClick,
}: MapExhibitionListProps) {
  if (exhibitions.length === 0) {
    return (
      <MapSheetMessage
        title="이 지역에 보여줄 전시가 없어요"
        description="지도를 옮기거나 필터를 바꿔 보세요"
      />
    );
  }

  return exhibitions.map((exhibition, index) => (
    <div key={exhibition.id} style={staggerStyle(index)} className="animate-rise">
      <MapExhibitionCard
        title={exhibition.title}
        posterImageUrl={exhibition.posterImageUrl}
        organization={exhibition.organization}
        period={exhibition.period}
        location={exhibition.locationName}
        distance={exhibition.distance}
        selected={exhibition.id === selectedId}
        onClick={() => onCardClick(exhibition)}
      />
    </div>
  ));
}

interface MapSheetMessageProps {
  title: string;
  description?: string;
  actionLabel?: string;
  onAction?: () => void;
}

export function MapSheetMessage({
  title,
  description,
  actionLabel,
  onAction,
}: MapSheetMessageProps) {
  return (
    <div className="grid justify-items-center gap-1 py-7 text-center">
      <p className="typography-body-lg-semibold text-tertiary">{title}</p>
      {description ? (
        <p className="typography-body-md-medium text-tertiary">{description}</p>
      ) : null}
      {actionLabel && onAction ? (
        <button
          type="button"
          onClick={onAction}
          className="typography-body-md-medium mt-2 px-2 py-0.5 text-interactive-inverse underline underline-offset-2"
        >
          {actionLabel}
        </button>
      ) : null}
    </div>
  );
}
