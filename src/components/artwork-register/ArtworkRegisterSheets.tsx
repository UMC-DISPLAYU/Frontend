import { BottomSheet, Overlay } from '@/components/ui';
import { ARTWORK_REGISTER_AUTHOR_NAME_MAX_LENGTH } from '@/pages/artwork-register/artworkRegister.schema';

import {
  AuthorOption,
  CollaboratorTeamCard,
  DirectCollaboratorSheet,
  SheetOption,
} from './ArtworkRegisterControls';

type RegisterSheet =
  | 'otherAuthorMethod'
  | 'collaboratorMethod'
  | 'collaboratorTeam'
  | 'collaboratorDirect'
  | null;

interface ArtworkRegisterSheetsProps {
  isEditMode?: boolean;
  activeSheet: RegisterSheet;
  collaboratorOptions: AuthorOption[];
  directCollaboratorName: string;
  onClose: () => void;
  onOpenOtherTeamAuthor: () => void;
  onOpenOtherDirectAuthor: () => void;
  onOpenTeamCollaboratorSheet: () => void;
  onOpenDirectCollaboratorSheet: () => void;
  onAddTeamCollaborator: (person: AuthorOption) => void;
  onChangeDirectCollaboratorName: (value: string) => void;
  onSubmitDirectCollaborator: () => void;
}

function ArtworkRegisterSheets({
  isEditMode = false,
  activeSheet,
  collaboratorOptions,
  directCollaboratorName,
  onClose,
  onOpenOtherTeamAuthor,
  onOpenOtherDirectAuthor,
  onOpenTeamCollaboratorSheet,
  onOpenDirectCollaboratorSheet,
  onAddTeamCollaborator,
  onChangeDirectCollaboratorName,
  onSubmitDirectCollaborator,
}: ArtworkRegisterSheetsProps) {
  if (isEditMode) {
    const title =
      activeSheet === 'collaboratorTeam'
        ? '전시 팀원에서 선택'
        : activeSheet === 'collaboratorDirect'
          ? '공동 작업자 이름 입력'
          : '공동 작업자 추가';
    const description =
      activeSheet === 'collaboratorTeam'
        ? '작가 인증이 완료된 팀원만 공동 작업자로 추가할 수 있어요.'
        : activeSheet === 'collaboratorDirect'
          ? '관람자에게 표시할 작가명을 입력해주세요.'
          : '함께 작업한 작가 정보를 추가해주세요.';
    return (
      <Overlay
        open={activeSheet !== null}
        onClose={onClose}
        title={title}
        description={description}
        footer={
          activeSheet === 'collaboratorDirect' ? (
            <button
              type="button"
              disabled={!directCollaboratorName.trim()}
              onClick={onSubmitDirectCollaborator}
              className="typography-body-lg-semibold min-h-11 w-full rounded-12 bg-interactive-primary text-interactive-inverse transition duration-fast ease-standard hover:bg-interactive-primary-hover focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus active:scale-99 disabled:bg-disable disabled:text-disable"
            >
              추가
            </button>
          ) : undefined
        }
      >
        {activeSheet === 'collaboratorMethod' && (
          <div className="flex flex-col gap-3 pb-5">
            <button
              type="button"
              onClick={onOpenTeamCollaboratorSheet}
              className="rounded-12 border border-primary p-4 text-left transition duration-fast ease-standard hover:bg-secondary focus-visible:outline-2 focus-visible:outline-focus active:scale-99"
            >
              <span className="typography-body-lg-semibold block">전시 팀원에서 선택</span>
              <span className="typography-body-md-medium mt-1 block text-tertiary">
                작가 인증이 완료된 팀원의 작가명과 프로필을 불러와요.
              </span>
            </button>
            <button
              type="button"
              onClick={onOpenDirectCollaboratorSheet}
              className="rounded-12 border border-primary p-4 text-left transition duration-fast ease-standard hover:bg-secondary focus-visible:outline-2 focus-visible:outline-focus active:scale-99"
            >
              <span className="typography-body-lg-semibold block">직접 이름 입력</span>
              <span className="typography-body-md-medium mt-1 block text-tertiary">
                직접 입력한 작가는 프로필 연결과 Q&amp;A 담당자 지정이 불가능해요.
              </span>
            </button>
          </div>
        )}
        {activeSheet === 'collaboratorTeam' && (
          <div className="flex flex-col gap-2 pb-5">
            {collaboratorOptions.length === 0 && (
              <p className="typography-body-lg-medium py-8 text-center text-tertiary">
                아직 전시 팀원이 없어요.
              </p>
            )}
            {collaboratorOptions.map((person) => (
              <button
                key={person.id}
                type="button"
                disabled={!person.verified}
                onClick={() => onAddTeamCollaborator(person)}
                className="min-h-11 rounded-12 border border-primary p-3 text-left transition duration-fast ease-standard hover:bg-secondary focus-visible:outline-2 focus-visible:outline-focus active:scale-99 disabled:opacity-40"
              >
                <span className="typography-body-lg-semibold block">{person.name}</span>
                <span className="typography-body-md-medium text-tertiary">
                  {person.account}
                  {!person.verified && ' · 작가 인증 필요'}
                </span>
              </button>
            ))}
          </div>
        )}
        {activeSheet === 'collaboratorDirect' && (
          <>
            <label
              className="typography-body-lg-semibold block pb-2"
              htmlFor="edit-collaborator-name"
            >
              작가명
            </label>
            <input
              id="edit-collaborator-name"
              value={directCollaboratorName}
              onChange={(event) => onChangeDirectCollaboratorName(event.target.value)}
              maxLength={ARTWORK_REGISTER_AUTHOR_NAME_MAX_LENGTH}
              placeholder="작가명을 입력해주세요"
              className="typography-body-lg-medium min-h-11 w-full rounded-12 border border-primary bg-primary-white p-3 text-primary placeholder:text-tertiary focus-visible:outline-2 focus-visible:outline-focus"
            />
          </>
        )}
      </Overlay>
    );
  }

  return (
    <>
      <BottomSheet
        open={activeSheet === 'otherAuthorMethod'}
        onClose={onClose}
        title="작가 정보를 어떻게 입력할까요?"
        subtitle="대신 등록할 작품의 작가 정보를 선택해주세요."
      >
        <div className="flex flex-col gap-3 px-5 pb-12.5 pt-6">
          <SheetOption
            title="전시 팀원에서 선택"
            description="디유 계정이 있는 팀원의 작가명과 프로필을 불러와요."
            helper="작가 인증 완료 팀원만 선택할 수 있어요."
            onClick={onOpenOtherTeamAuthor}
          />
          <SheetOption
            title="직접 이름 입력"
            description="디유 계정이 없거나 전시 팀원이 아닌 작가의 이름을 직접 입력해요."
            helper="직접 입력한 작가는 프로필 연결과 Q&A 담당자 지정이 불가능해요."
            onClick={onOpenOtherDirectAuthor}
          />
        </div>
      </BottomSheet>

      <BottomSheet
        open={activeSheet === 'collaboratorMethod'}
        onClose={onClose}
        title="공동 작업자 추가"
        subtitle="함께 작업한 작가 정보를 추가해주세요."
      >
        <div className="flex flex-col gap-3 px-5 pb-12.5 pt-6">
          <SheetOption
            title="전시 팀원에서 선택"
            description="디유 계정이 있는 팀원의 작가명과 프로필을 불러와요."
            helper="작가 인증 완료 팀원만 선택할 수 있어요."
            onClick={onOpenTeamCollaboratorSheet}
          />
          <SheetOption
            title="직접 이름 입력"
            description="디유 계정이 없거나 전시 팀원이 아닌 작가의 이름을 직접 입력해요."
            helper="직접 입력한 작가는 프로필 연결과 Q&A 담당자 지정이 불가능해요."
            onClick={onOpenDirectCollaboratorSheet}
          />
        </div>
      </BottomSheet>

      <BottomSheet
        open={activeSheet === 'collaboratorTeam'}
        onClose={onClose}
        title="전시 팀원에서 선택"
        subtitle="작가 인증이 완료된 팀원만 공동 작업자로 추가할 수 있어요."
      >
        <div className="flex flex-col gap-2 px-5 pt-6">
          {collaboratorOptions.length === 0 && (
            <p className="typo-body-xs-regular py-8 text-center text-faint">
              아직 전시 팀원이 없어요.
            </p>
          )}
          {collaboratorOptions.map((person) => (
            <CollaboratorTeamCard
              key={person.id}
              name={person.name}
              account={person.account}
              verified={person.verified}
              onClick={() => onAddTeamCollaborator(person)}
            />
          ))}
        </div>
      </BottomSheet>

      <DirectCollaboratorSheet
        open={activeSheet === 'collaboratorDirect'}
        value={directCollaboratorName}
        onChange={onChangeDirectCollaboratorName}
        onClose={onClose}
        onSubmit={onSubmitDirectCollaborator}
      />
    </>
  );
}

export { ArtworkRegisterSheets };
export type { RegisterSheet };
