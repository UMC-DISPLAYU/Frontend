import { useId } from 'react';

import { ProfileAvatar } from '@/components/common/ProfileAvatar';
import { cn } from '@/utils/cn';

import { FOCUS_CLASS, OPTIONAL_CLASS } from './artworkRegister.styles';
import type { ArtworkPerson } from './artworkRegister.types';
import { CloseIcon, PlusIcon } from './ArtworkRegisterIcons';

interface ArtworkAuthorSectionProps {
  author: ArtworkPerson;
  coAuthors: ArtworkPerson[];
  onAddCoAuthor: () => void;
  onRemoveCoAuthor: (key: string) => void;
}

function PersonText({ person }: { person: ArtworkPerson }) {
  return (
    <span className="min-w-0 flex-1">
      <b className="typography-body-lg-semibold block truncate text-primary">{person.name}</b>
      <small className="typography-body-md-medium block truncate text-secondary">
        {person.caption}
      </small>
    </span>
  );
}

export function ArtworkAuthorSection({
  author,
  coAuthors,
  onAddCoAuthor,
  onRemoveCoAuthor,
}: ArtworkAuthorSectionProps) {
  const headingId = useId();

  return (
    <section aria-labelledby={headingId} className="mt-5">
      <h2 id={headingId} className="typography-body-xl-semibold text-primary">
        작가
      </h2>
      <div className="mt-3 border-y border-bg-secondary">
        <div className="flex items-center gap-3 py-4">
          <ProfileAvatar />
          <PersonText person={author} />
        </div>
        {coAuthors.map((person) => (
          <div
            key={person.key}
            className="flex items-center gap-3 border-t border-bg-secondary py-4"
          >
            <ProfileAvatar />
            <PersonText person={person} />
            <button
              type="button"
              aria-label={`${person.name} 제외`}
              onClick={() => onRemoveCoAuthor(person.key)}
              className={cn(
                'relative -mr-1.5 grid size-8 shrink-0 place-items-center rounded-circle text-primary transition-colors duration-fast after:absolute after:-inset-1.5 hover:bg-secondary',
                FOCUS_CLASS,
              )}
            >
              <CloseIcon className="size-4.5" />
            </button>
          </div>
        ))}
        <button
          type="button"
          onClick={onAddCoAuthor}
          className="typography-body-lg-semibold flex w-full items-center gap-2 border-t border-bg-secondary py-4 text-left text-primary transition-colors duration-fast hover:bg-secondary focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-focus"
        >
          <PlusIcon className="size-5" />
          공동 작가 추가
          <span className={OPTIONAL_CLASS}>· 선택</span>
        </button>
      </div>
    </section>
  );
}
