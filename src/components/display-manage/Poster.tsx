import { OptimizedImage } from '@/components/common/OptimizedImage';
import { FALLBACK_POSTER_IMAGE } from '@/constants';

export function Poster({
  src,
  w = 96,
  h = 128,
  radius = 12,
}: {
  src: string | null;
  w?: number;
  h?: number;
  radius?: number;
}) {
  const isFallback = !src;

  return (
    <OptimizedImage
      src={isFallback ? FALLBACK_POSTER_IMAGE : src}
      displayWidth={w}
      alt="poster"
      className={`shrink-0 shadow-[2px_4px_18px_rgba(6,3,45,0.06)] ${
        isFallback ? 'bg-box object-contain p-3' : 'object-cover'
      }`}
      style={{ width: w, height: h, borderRadius: radius }}
      onError={(event) => {
        event.currentTarget.src = FALLBACK_POSTER_IMAGE;
        event.currentTarget.classList.remove('object-cover');
        event.currentTarget.classList.add('bg-box', 'object-contain', 'p-3');
      }}
    />
  );
}
