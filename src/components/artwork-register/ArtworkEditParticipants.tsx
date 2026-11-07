import EditAuthorPlaceholder from '@/assets/exhibition-work/EditAuthorPlaceholder.svg';
import EditCloseIcon from '@/assets/exhibition-work/EditCloseIcon.svg';
import EditPlusIcon from '@/assets/exhibition-work/EditPlusIcon.svg';

import type { RegisterPerson } from './ArtworkRegisterControls';

export function ArtworkEditAuthors({
  author,
  collaborators,
  onAdd,
  onRemove,
}: {
  author: RegisterPerson;
  collaborators: RegisterPerson[];
  onAdd: () => void;
  onRemove: (person: RegisterPerson) => void;
}) {
  return (
    <section className="flex flex-col gap-3" aria-label="작가">
      <div>
        <h2 className="typography-body-xl-semibold">작가</h2>
        <p className="typography-body-md-medium mt-1 text-tertiary">
          전시작은 관람자에게 작가명으로 표시돼요.
        </p>
      </div>
      <div className="overflow-hidden rounded-12 border border-primary">
        {[author, ...collaborators].map((person, index) => (
          <div key={person.id} className="flex items-center gap-3 p-4">
            <span className="flex size-11.5 shrink-0 items-end justify-center overflow-hidden rounded-circle bg-info-subtle">
              <img src={EditAuthorPlaceholder} alt="" className="h-9 w-8.5" />
            </span>
            <div className="min-w-0 flex-1">
              <p className="typography-body-lg-semibold break-words">{person.name}</p>
              <p className="typography-body-md-medium break-words text-tertiary">
                {person.account}
              </p>
            </div>
            {index > 0 && (
              <button
                type="button"
                aria-label={`${person.name} 공동 작업자 삭제`}
                onClick={() => onRemove(person)}
                className="flex size-11 shrink-0 items-center justify-center rounded-8 transition duration-fast ease-standard hover:bg-secondary focus-visible:outline-2 focus-visible:outline-focus active:scale-99"
              >
                <img src={EditCloseIcon} alt="" className="size-5" />
              </button>
            )}
          </div>
        ))}
        <button
          type="button"
          onClick={onAdd}
          className="typography-body-lg-medium flex min-h-11 w-full items-center justify-center gap-1.5 border-t border-primary px-3 py-3 text-secondary transition duration-fast ease-standard hover:bg-secondary focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-focus active:scale-99"
        >
          <img src={EditPlusIcon} alt="" className="size-4" />
          공동 작업자 <span className="text-tertiary">· 선택</span>
        </button>
      </div>
    </section>
  );
}

export function ArtworkEditQna({
  options,
  selectedIds,
  ownerId,
  onToggle,
}: {
  options: RegisterPerson[];
  selectedIds: string[];
  ownerId?: string;
  onToggle: (id: string) => void;
}) {
  return (
    <details className="rounded-12 border border-primary px-3">
      <summary className="typography-body-lg-semibold min-h-11 cursor-pointer py-3 focus-visible:outline-2 focus-visible:outline-focus">
        내부 Q&amp;A 담당자
      </summary>
      <p className="typography-body-md-medium mb-3 text-tertiary">
        작품 Q&amp;A에 답변할 담당자를 선택해주세요.
      </p>
      <div className="flex flex-col gap-2 pb-3">
        {options.map((person) => (
          <label
            key={person.id}
            className="typography-body-lg-medium flex min-h-11 cursor-pointer items-center gap-3 rounded-8 bg-secondary px-3 py-2"
          >
            <input
              type="checkbox"
              checked={selectedIds.includes(person.id)}
              disabled={person.id === ownerId}
              onChange={() => onToggle(person.id)}
              className="size-5 accent-current text-interactive-primary focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus"
            />
            <span className="min-w-0 break-words">
              {person.name}
              <span className="typography-body-md-medium ml-2 text-tertiary">{person.account}</span>
            </span>
          </label>
        ))}
        {options.length === 0 && (
          <p className="typography-body-md-medium text-tertiary">
            직접 입력한 작가는 Q&amp;A 담당자로 지정할 수 없어요.
          </p>
        )}
      </div>
    </details>
  );
}
