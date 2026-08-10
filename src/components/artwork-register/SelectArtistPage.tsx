import { BottomButtonBar } from '@/components/common';
import { cn } from '@/utils/cn';

import { AuthorOption, AuthorSelectCard } from './ArtworkRegisterControls';
import { ArtworkRegisterLayout } from './ArtworkRegisterLayout';

interface SelectArtistPageProps {
  selectedProxyAuthorId: string | null;
  teamAuthorOptions: AuthorOption[];
  onBack: () => void;
  onChangeSelectedProxyAuthorId: (id: string) => void;
  onSubmit: () => void;
}

function SelectArtistPage({
  selectedProxyAuthorId,
  teamAuthorOptions,
  onBack,
  onChangeSelectedProxyAuthorId,
  onSubmit,
}: SelectArtistPageProps) {
  const selectedAuthor = teamAuthorOptions.find((author) => author.id === selectedProxyAuthorId);
  const canSubmit = Boolean(selectedAuthor?.verified);

  return (
    <ArtworkRegisterLayout
      title="작가 선택"
      onBack={onBack}
      bottomBar={
        <BottomButtonBar>
          <button
            type="button"
            onClick={onSubmit}
            disabled={!canSubmit}
            className={cn(
              'typo-body-sm-bold h-11 w-full rounded-xl',
              canSubmit ? 'bg-dark text-white' : 'bg-bt-gray text-faint',
            )}
          >
            다음
          </button>
        </BottomButtonBar>
      }
    >
      <section>
        <h2 className="typo-body-md-bold text-main">작품의 작가를 선택해주세요</h2>
        <p className="typo-body-xs-regular mt-1 text-hint">
          선택한 팀원의 전시 작가명으로 작품을 등록해요
        </p>
      </section>

      <div className="typo-body-xs-regular mt-4 rounded-[14px] bg-card px-4 py-3 text-hint">
        <p>작가 인증이 완료된 팀원만 선택할 수 있어요.</p>
        <p>인증이 필요한 팀원은 작품 작가로 연결할 수 없어요.</p>
      </div>

      <div className="mt-5 flex flex-col gap-3">
        {teamAuthorOptions.map((author) => (
          <AuthorSelectCard
            key={author.id}
            name={author.name}
            account={author.account}
            verified={author.verified}
            isMember={author.isMember}
            selected={selectedProxyAuthorId === author.id}
            onClick={() => onChangeSelectedProxyAuthorId(author.id)}
          />
        ))}
        {teamAuthorOptions.length === 0 && (
          <p className="typo-body-xs-regular py-8 text-center text-faint">
            아직 전시 팀원이 없어요.
          </p>
        )}
      </div>
    </ArtworkRegisterLayout>
  );
}

export { SelectArtistPage };
