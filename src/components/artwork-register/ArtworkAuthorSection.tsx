import { useId } from 'react';

import RemoveIcon from '@/assets/artwork-register/RemoveIcon.svg';
import PlusIcon from '@/assets/display-register/PlusIcon.svg';

import type { ArtworkPerson } from './artworkRegister.types';
import { AuthorAvatar } from './AuthorAvatar';

interface ArtworkAuthorSectionProps {
  author: ArtworkPerson;
  coAuthors: ArtworkPerson[];
  /** 다른 작가의 작품을 대신 등록할 때 실제 등록자(나)를 함께 보여준다 */
  registrantName?: string;
  onAddCoAuthor: () => void;
  onRemoveCoAuthor: (key: string) => void;
}

function PersonText({ person }: { person: ArtworkPerson }) {
  return (
    <span className="flex min-w-0 flex-1 flex-col gap-0.5">
      <span className="typography-body-lg-semibold truncate text-primary">{person.name}</span>
      <span className="typography-body-md-medium truncate text-secondary">{person.caption}</span>
    </span>
  );
}

export function ArtworkAuthorSection({
  author,
  coAuthors,
  registrantName,
  onAddCoAuthor,
  onRemoveCoAuthor,
}: ArtworkAuthorSectionProps) {
  const headingId = useId();

  return (
    <section aria-labelledby={headingId} className="flex flex-col gap-3">
      <div className="flex flex-col gap-1">
        <h2 id={headingId} className="typography-body-xl-semibold text-primary">
          작가
        </h2>
        <p className="typography-body-md-medium text-secondary">
          전시작은 관람자에게 작가명으로 표시돼요
        </p>
      </div>
      <div className="overflow-hidden rounded-12 border border-primary bg-primary-white">
        <div className="flex items-center gap-3 p-4">
          <AuthorAvatar />
          <PersonText person={author} />
        </div>
        {coAuthors.map((person) => (
          <div key={person.key} className="flex items-center gap-3 border-t border-primary p-4">
            <AuthorAvatar />
            <PersonText person={person} />
            <button
              type="button"
              aria-label={`${person.name} 제외`}
              onClick={() => onRemoveCoAuthor(person.key)}
              className="-m-3 flex size-11 shrink-0 items-center justify-center rounded-circle transition duration-fast ease-standard hover:bg-secondary focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus active:scale-99"
            >
              <img src={RemoveIcon} alt="" className="size-5" />
            </button>
          </div>
        ))}
        {registrantName && (
          <p className="typography-body-md-medium mt-1 px-4 text-secondary">
            등록자 · {registrantName} (나)
          </p>
        )}
        <button
          type="button"
          onClick={onAddCoAuthor}
          className="flex w-full items-center gap-2 border-t border-primary p-4 text-left transition duration-fast ease-standard hover:bg-secondary focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-focus"
        >
          <img src={PlusIcon} alt="" className="size-5" />
          <span className="typography-body-lg-semibold text-primary">공동 작가 추가</span>
          <span className="typography-body-md-medium text-secondary">· 선택</span>
        </button>
      </div>
    </section>
  );
}
