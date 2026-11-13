import { Link } from 'react-router-dom';

import { OptimizedImage } from '@/components/common/OptimizedImage';
import { Skeleton } from '@/components/ui';
import { cn } from '@/utils/cn';

import { BookmarkIcon, ExternalLinkIcon, PencilIcon } from './ArtistProfileIcons';

const PHOTO_FRAME_CLASS = 'h-33 w-29 bg-secondary';
const ACTION_CLASS =
  'group grid size-11 shrink-0 place-items-center rounded-circle focus-visible:outline-2 focus-visible:outline-focus disabled:cursor-default';
const ACTION_DOT_CLASS =
  'grid size-9 place-items-center rounded-circle bg-secondary text-primary transition duration-fast ease-standard group-hover:bg-tertiary group-active:scale-94';

export type ArtistProfileLink = { name: string; label: string; href: string };

export type ArtistProfileAction =
  | { kind: 'edit'; to: string }
  | { kind: 'save'; isSaved: boolean; isPending: boolean; onToggle: () => void };

type ArtistProfileHeaderProps = {
  name: string;
  /** "학교 · 분야 · 분야" */
  subtitle: string;
  bio: string;
  photoUrl: string | null;
  links: ArtistProfileLink[];
  action: ArtistProfileAction;
};

export function ArtistProfileHeader({
  name,
  subtitle,
  bio,
  photoUrl,
  links,
  action,
}: ArtistProfileHeaderProps) {
  const photo = photoUrl ? (
    <OptimizedImage
      alt={`${name} 작가 사진`}
      displayWidth={232}
      frameClassName={PHOTO_FRAME_CLASS}
      skeleton
      src={photoUrl}
    />
  ) : null;

  return (
    <section
      aria-label="작가 정보"
      className={cn(
        'grid items-start gap-x-4 pt-6 desktop:flex desktop:flex-col desktop:items-stretch desktop:pt-0',
        photo ? 'grid-cols-[minmax(0,1fr)_116px]' : 'grid-cols-1',
      )}
    >
      <div className="col-start-1 row-start-1 min-w-0">
        <div className="flex items-center gap-1">
          {/* 이름은 최대 2줄, 넘으면 … (단어 중간에서 끊지 않는다) */}
          <h1 className="typography-title-md line-clamp-2 min-w-0 break-keep [overflow-wrap:anywhere] text-primary desktop:typography-title-xl">
            {name}
          </h1>
          {action.kind === 'edit' ? (
            <Link aria-label="프로필 수정" className={ACTION_CLASS} to={action.to}>
              <span className={ACTION_DOT_CLASS}>
                <PencilIcon />
              </span>
            </Link>
          ) : (
            <button
              aria-label="작가 저장"
              aria-pressed={action.isSaved}
              className={ACTION_CLASS}
              disabled={action.isPending}
              onClick={action.onToggle}
              type="button"
            >
              <span className={ACTION_DOT_CLASS}>
                <BookmarkIcon fill={action.isSaved ? 'currentColor' : 'none'} />
              </span>
            </button>
          )}
        </div>
        {subtitle && <p className="typography-body-lg-medium mt-1 text-secondary">{subtitle}</p>}
      </div>

      {photo && (
        <div className="col-start-2 row-span-2 row-start-1 desktop:order-first desktop:mb-5">
          {action.kind === 'edit' ? (
            <Link
              aria-label="프로필 사진 수정"
              className="block focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus"
              to={action.to}
            >
              {photo}
            </Link>
          ) : (
            photo
          )}
        </div>
      )}

      {bio && (
        <p className="typography-body-lg-regular col-start-1 row-start-2 mt-5 break-keep whitespace-pre-line text-primary desktop:typography-body-xl-regular">
          {bio}
        </p>
      )}

      {links.length > 0 && (
        <ul aria-label="작가 링크" className="col-span-full mt-5 border-t border-bg-tertiary">
          {links.map((link) => (
            <li className="border-b border-bg-tertiary" key={link.name}>
              <a
                className="group flex min-h-16 items-center gap-3 py-3 focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-focus"
                href={link.href}
                rel="noopener noreferrer"
                target="_blank"
              >
                <span className="grid min-w-0 flex-1 gap-0.5">
                  <b className="typography-body-lg-semibold text-primary">{link.name}</b>
                  <span className="typography-body-md-medium truncate text-tertiary">
                    {link.label}
                  </span>
                </span>
                <ExternalLinkIcon className="shrink-0 text-icon-primary transition-transform duration-base ease-standard group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                <span className="sr-only">(새 창)</span>
              </a>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}

export function ArtistProfileHeaderSkeleton() {
  return (
    <div
      aria-hidden="true"
      className="grid grid-cols-[minmax(0,1fr)_116px] gap-x-4 pt-6 desktop:flex desktop:flex-col desktop:pt-0"
    >
      <div>
        <Skeleton className="h-10 w-32 rounded-4" />
        <Skeleton className="mt-1 h-5 w-48 rounded-4" />
        <Skeleton className="mt-5 h-5 w-full rounded-4" />
        <Skeleton className="mt-1 h-5 w-2/3 rounded-4" />
      </div>
      <Skeleton className={cn(PHOTO_FRAME_CLASS, 'desktop:order-first desktop:mb-5')} />
    </div>
  );
}
