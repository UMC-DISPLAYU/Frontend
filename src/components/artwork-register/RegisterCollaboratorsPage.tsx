import { Plus } from 'lucide-react';

import { BottomButtonBar } from '@/components/common';
import { ExhibitionCard } from '@/components/exhibition-manage';

import { PersonCard, RegisterPerson } from './ArtworkRegisterControls';
import { ArtworkRegisterLayout } from './ArtworkRegisterLayout';

interface RegisterDisplayAuthor extends RegisterPerson {
  tag?: string;
}

interface RegisterCollaboratorsPageProps {
  isEditMode: boolean;
  exhibition: {
    title: string;
    org: string;
    period: string;
    place: string;
    thumbnail?: string;
  };
  displayAuthor: RegisterDisplayAuthor;
  collaborators: RegisterPerson[];
  qnaAssigneeOptions: RegisterPerson[];
  selectedQnaAssigneeIds: string[];
  submitError: string | null;
  isSubmitting: boolean;
  onBack: () => void;
  onOpenCollaboratorMethod: () => void;
  onRemoveCollaborator: (person: RegisterPerson) => void;
  onToggleQnaAssignee: (id: string) => void;
  onSubmit: () => void;
}

function RegisterCollaboratorsPage({
  isEditMode,
  exhibition,
  displayAuthor,
  collaborators,
  qnaAssigneeOptions,
  selectedQnaAssigneeIds,
  submitError,
  isSubmitting,
  onBack,
  onOpenCollaboratorMethod,
  onRemoveCollaborator,
  onToggleQnaAssignee,
  onSubmit,
}: RegisterCollaboratorsPageProps) {
  return (
    <ArtworkRegisterLayout
      title={isEditMode ? '작품 정보 수정' : '전시작 등록'}
      onBack={onBack}
      bottomBar={
        <BottomButtonBar>
          {submitError && (
            <p className="typo-body-xs-regular mb-2 text-center text-error">{submitError}</p>
          )}
          <button
            type="button"
            onClick={onSubmit}
            disabled={isSubmitting}
            className="typo-body-sm-bold h-11 w-full rounded-xl bg-dark text-white disabled:opacity-40"
          >
            {isSubmitting ? '등록 중' : '완료'}
          </button>
        </BottomButtonBar>
      }
    >
      <div className="pt-6">
        <ExhibitionCard {...exhibition} />
      </div>

      <section className="mt-5">
        <h2 className="typo-body-sm-bold text-main">작가정보</h2>
        <p className="typo-body-xs-regular mt-1 text-hint">
          전시작은 관람자에게 작가명으로 표시돼요.
        </p>
        <div className="mt-3">
          <PersonCard
            name={displayAuthor.name}
            account={displayAuthor.account}
            tag={displayAuthor.tag}
          />
        </div>
      </section>

      <section className="mt-5">
        <h2 className="typo-body-sm-bold text-main">공동 작업자</h2>
        <p className="typo-body-xs-regular mt-1 text-hint">
          함께 작업한 작가가 있다면 추가해주세요.
        </p>
        {collaborators.length > 0 && (
          <div className="mt-3 flex flex-col gap-3">
            {collaborators.map((person) => (
              <PersonCard
                key={person.id}
                name={person.name}
                account={person.account}
                removable
                onRemove={() => onRemoveCollaborator(person)}
              />
            ))}
          </div>
        )}
        {collaborators.length === 0 && (
          <p className="typo-body-md-regular mt-6 text-faint">추가된 공동 작업자가 없어요.</p>
        )}
        <button
          type="button"
          onClick={onOpenCollaboratorMethod}
          className="typo-body-xs-regular mt-5 flex h-10.25 items-center gap-1.5 rounded-[14px] bg-card px-4 text-main"
        >
          <Plus className="size-3.5" strokeWidth={2} />
          공동 작업자 추가
        </button>
      </section>

      <section className="mt-5">
        <h2 className="typo-body-sm-bold text-main">내부 Q&amp;A 담당자</h2>
        <p className="typo-body-xs-regular mt-1 text-hint">
          작품 Q&amp;A에 답변할 담당자를 선택해주세요.
        </p>
        <div className="mt-3 flex flex-col gap-3">
          {qnaAssigneeOptions.map((person) => (
            <PersonCard
              key={person.id}
              name={person.name}
              account={person.account}
              tag={person.tag}
              selected={selectedQnaAssigneeIds.includes(person.id)}
              onClick={() => onToggleQnaAssignee(person.id)}
            />
          ))}
          {qnaAssigneeOptions.length === 0 && (
            <p className="typo-body-xs-regular rounded-[14px] bg-card px-4 py-3 text-hint">
              직접 입력한 작가는 Q&amp;A 담당자로 지정할 수 없어요.
            </p>
          )}
        </div>
      </section>
    </ArtworkRegisterLayout>
  );
}

export { RegisterCollaboratorsPage };
