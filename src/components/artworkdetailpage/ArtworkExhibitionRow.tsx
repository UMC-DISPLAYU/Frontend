import { Link } from 'react-router-dom';

import chevronIcon from '@/assets/artwork-detail/chevron-exhibition.svg';
import { OptimizedImage } from '@/components/common/OptimizedImage';
import { cn } from '@/utils/cn';
import { EXHIBITION_STATE_LABEL, type ExhibitionState } from '@/utils/exhibitionState';

type Props = {
  displayId: string;
  title: string;
  organizer: string;
  posterUrl: string;
  state: ExhibitionState | null;
};

export function ArtworkExhibitionRow({ displayId, title, organizer, posterUrl, state }: Props) {
  return (
    <div className="pt-5">
      <Link
        to={`/display/${displayId}`}
        aria-label={`소속 전시 보기: ${title}`}
        className="group flex items-center gap-3 border-y border-bg-tertiary py-4"
      >
        <OptimizedImage
          src={posterUrl}
          displayWidth={80}
          alt=""
          skeleton
          frameClassName="aspect-402/568 w-10 shrink-0 bg-secondary"
        />
        <span className="flex min-w-0 flex-1 flex-col">
          {/* 프로토타입처럼 상태 줄이 본문 글자의 줄 높이를 갖는다(행 높이 92.8, 900px 이상 95.6) */}
          {state && (
            <span className="typography-body-lg-regular desktop:typography-body-xl-regular">
              <span className="inline-flex items-center gap-1.5">
                <span
                  aria-hidden
                  className={cn(
                    'size-2 rounded-circle',
                    state === 'ongoing' && 'bg-interactive-primary',
                    state === 'upcoming' && 'border-2 border-interactive-primary',
                    state === 'ended' && 'bg-current text-icon-disable',
                  )}
                />
                <span className="typography-body-md-medium text-tertiary">
                  {EXHIBITION_STATE_LABEL[state]}
                </span>
              </span>
            </span>
          )}
          <strong className="typography-body-xl-semibold truncate text-primary group-hover:underline group-hover:underline-offset-3">
            {title}
          </strong>
          {organizer && (
            <span className="typography-body-md-medium truncate text-tertiary">{organizer}</span>
          )}
        </span>
        <img
          src={chevronIcon}
          alt=""
          className="shrink-0 transition-transform duration-base ease-standard group-hover:translate-x-0.75"
        />
      </Link>
    </div>
  );
}
