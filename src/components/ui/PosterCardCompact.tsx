import { Link } from 'react-router-dom';

import { OptimizedImage } from '@/components/common/OptimizedImage';

import { CardMetaList } from './CardMetaList';

type PosterCardCompactProps = {
  to: string;
  imageUrl: string;
  title: string;
  subtitle?: string;
  period?: string;
  location?: string;
};

export function PosterCardCompact({
  to,
  imageUrl,
  title,
  subtitle,
  period,
  location,
}: PosterCardCompactProps) {
  return (
    <Link className="flex w-29.75 flex-col gap-1 p-1 no-underline" to={to}>
      <div className="flex h-34.75 items-center justify-center overflow-hidden rounded-12 bg-primary-white">
        <OptimizedImage
          alt={title}
          className="size-full object-contain"
          displayWidth={120}
          src={imageUrl}
        />
      </div>
      <div className="flex flex-col gap-1">
        <div className="flex flex-col">
          <p className="typography-body-lg-bold truncate text-primary">{title}</p>
          {subtitle ? (
            <p className="typography-body-md-medium truncate text-secondary">{subtitle}</p>
          ) : null}
        </div>
        <CardMetaList location={location} period={period} />
      </div>
    </Link>
  );
}
