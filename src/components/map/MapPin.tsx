import { OptimizedImage } from '@/components/common/OptimizedImage';
import { cn } from '@/utils/cn';

import type { MapExhibitionStatus } from './mapExhibition';

export type MapPinDetail = 'dot' | 'poster' | 'label';

interface MapPinProps {
  title: string;
  posterImageUrl: string;
  status: MapExhibitionStatus;
  statusLabel: string;
  detail: MapPinDetail;
  selected: boolean;
  onSelect: () => void;
}

/**
 * 크기가 0인 버튼의 원점이 지도 좌표(핀 끝)다. 그래서 카카오 오버레이 기준점과 상관없이
 * 아래 요소들을 원점 기준 고정 크기로 배치한다.
 */
export function MapPin({
  title,
  posterImageUrl,
  status,
  statusLabel,
  detail,
  selected,
  onSelect,
}: MapPinProps) {
  const isSoon = status === 'soon';
  const showDot = detail === 'dot' && !selected;

  return (
    <button
      type="button"
      aria-label={`${title} (${statusLabel})`}
      aria-pressed={selected}
      onClick={(event) => {
        event.stopPropagation();
        onSelect();
      }}
      className="group relative block size-0 p-0"
    >
      <span aria-hidden className="absolute -top-15 -left-5.5 h-17 w-11" />

      <span
        aria-hidden
        className={cn(
          'absolute -top-1.75 -left-1.75 size-3.5 rounded-circle transition-[opacity,scale] duration-200 ease-[cubic-bezier(.23,1,.32,1)]',
          isSoon
            ? 'bg-primary-white shadow-[inset_0_0_0_3.5px_#18181b,0_0_0_3px_#fff,0_1px_2px_rgba(0,0,0,.14),0_4px_10px_rgba(0,0,0,.16)]'
            : 'bg-interactive-primary shadow-[0_0_0_3px_#fff,0_1px_2px_rgba(0,0,0,.14),0_4px_10px_rgba(0,0,0,.16)]',
          showDot ? 'scale-100 opacity-100' : 'pointer-events-none scale-40 opacity-0',
        )}
      />

      <span
        aria-hidden
        className={cn(
          'absolute -top-13 -left-4.25 h-11.5 w-8.5 origin-[50%_52px] rounded-8 p-0.5 transition-[scale,translate,opacity,background-color,box-shadow] duration-300 ease-[cubic-bezier(.23,1,.32,1)]',
          'after:absolute after:-bottom-2.5 after:left-1/2 after:-ml-1.5 after:border-6 after:border-b-0 after:border-transparent after:transition-colors',
          selected
            ? 'scale-130 bg-primary-black shadow-[0_6px_16px_rgba(0,0,0,.3)] after:border-t-[#000]'
            : 'bg-primary-white shadow-[0_1px_2px_rgba(0,0,0,.14),0_4px_10px_rgba(0,0,0,.16)] after:border-t-interactive-inverse group-hover:-translate-y-0.5 group-hover:scale-107 group-active:scale-96',
          showDot && 'pointer-events-none scale-50 opacity-0',
        )}
      >
        <OptimizedImage
          src={posterImageUrl}
          displayWidth={30}
          alt=""
          draggable={false}
          className="size-full rounded-6 bg-[#797979] object-cover"
        />
        {!selected ? (
          <i
            className={cn(
              'absolute -top-1 -right-1 size-2.5 rounded-circle',
              isSoon
                ? 'bg-primary-white shadow-[inset_0_0_0_2.5px_#18181b,0_0_0_2px_#fff]'
                : 'bg-interactive-primary shadow-[0_0_0_2px_#fff]',
            )}
          />
        ) : null}
      </span>

      <span
        aria-hidden
        className={cn(
          'typography-body-md-semibold pointer-events-none absolute -top-23 left-0 inline-flex h-5.5 -translate-x-1/2 items-center rounded-circle bg-primary-white px-2.25 whitespace-nowrap text-primary tabular-nums shadow-[0_1px_2px_rgba(0,0,0,.2),0_2px_6px_rgba(0,0,0,.14)] transition-[opacity,translate] duration-200',
          selected ? 'translate-y-0 opacity-100' : 'translate-y-1 opacity-0',
        )}
      >
        {statusLabel}
      </span>

      <span
        aria-hidden
        className={cn(
          'typography-body-md-semibold pointer-events-none absolute -top-8.5 left-6 whitespace-nowrap text-primary transition-opacity duration-200 [text-shadow:0_0_3px_#fff,0_0_3px_#fff,0_0_3px_#fff,0_0_6px_#fff]',
          detail === 'label' && !selected ? 'opacity-100' : 'opacity-0',
        )}
      >
        {title}
      </span>
    </button>
  );
}

export function MyLocationMarker() {
  return (
    <span aria-hidden className="pointer-events-none relative block size-0">
      <span className="absolute -top-5.5 -left-5.5 size-11 rounded-circle bg-[rgba(24,24,27,.14)] motion-safe:animate-[ping_2.4s_cubic-bezier(.23,1,.32,1)_infinite]" />
      <span className="absolute -top-2.25 -left-2.25 size-4.5 rounded-circle border-3 border-interactive-inverse bg-interactive-primary shadow-[0_2px_6px_rgba(0,0,0,.3)]" />
    </span>
  );
}
