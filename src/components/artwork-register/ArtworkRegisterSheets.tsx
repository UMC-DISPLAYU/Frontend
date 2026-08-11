import { BottomSheet } from '@/components/ui';

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
