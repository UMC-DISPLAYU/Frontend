import { Link } from 'react-router-dom';

import { ChevronRightIcon } from './MyPageIcons';

type MyArtistCardProps = {
  to: string;
  artistName: string;
  /** "그래픽 · 브랜딩 · 작품 6 · 전시 2". 0 인 수치는 호출부에서 뺀다 */
  summary: string;
};

export function MyArtistCard({ to, artistName, summary }: MyArtistCardProps) {
  return (
    <Link
      aria-label="내 작가 프로필 보기"
      className="group flex items-center justify-between gap-4 rounded-20 bg-primary-black p-5 text-quaternary transition-transform duration-base ease-standard focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus active:scale-99"
      to={to}
    >
      <span className="grid min-w-0 gap-0.5">
        <span className="typography-body-xxl-semibold truncate">{artistName}</span>
        {summary && (
          <span className="typography-body-md-medium truncate text-zinc-400">{summary}</span>
        )}
      </span>
      <span className="typography-body-lg-semibold inline-flex shrink-0 items-center gap-0.5">
        작가 프로필
        <ChevronRightIcon className="size-5 transition-transform duration-base ease-standard group-hover:translate-x-0.75" />
      </span>
    </Link>
  );
}
