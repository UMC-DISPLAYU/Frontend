import { BottomFixedBar } from '@/components/common';
import { useUserStore } from '@/stores/useUserStore';

import { ChoiceCard } from './ArtworkRegisterControls';
import { ArtworkRegisterLayout } from './ArtworkRegisterLayout';

interface AddArtworkPageProps {
  registerMode: 'own' | 'other';
  onBack: () => void;
  onChangeRegisterMode: (mode: 'own' | 'other') => void;
  onNext: () => void;
}

function AddArtworkPage({
  registerMode,
  onBack,
  onChangeRegisterMode,
  onNext,
}: AddArtworkPageProps) {
  const displayArtistName = useUserStore((s) => s.displayArtistName);
  const accountId = useUserStore((s) => s.accountId);

  return (
    <ArtworkRegisterLayout
      title="전시작 추가"
      onBack={onBack}
      bottomBar={
        <BottomFixedBar>
          <button
            type="button"
            onClick={onNext}
            className="typo-body-sm-bold h-11 w-full rounded-xl bg-dark text-white"
          >
            다음
          </button>
        </BottomFixedBar>
      }
    >
      <section className="mb-5">
        <h2 className="typo-body-md-bold text-main">이 작품은 누구의 작품인가요?</h2>
        <p className="typo-body-xs-regular mt-1 text-hint">
          작품의 작가와 실제 등록자를 구분하기 위해 먼저 등록 방식을 선택해주세요.
        </p>
      </section>
      <div className="flex flex-col gap-3">
        <ChoiceCard
          title="내 작품 등록하기"
          description="내 전시 작가명과 프로필을 기본으로 연결해요."
          helper={
            <span className="text-link">
              {displayArtistName}({accountId})
            </span>
          }
          selected={registerMode === 'own'}
          onClick={() => onChangeRegisterMode('own')}
        />
        <ChoiceCard
          title="다른 사람 작품 대신 등록하기"
          description="팀원의 작가명을 입력하고, 해당 팀원의 작품을 등록해요."
          helper={
            <span className="typo-body-xs-regular text-error">
              팀원의 디유 계정이 존재하지 않아도 대신 등록할 수 있어요.
            </span>
          }
          compact
          selected={registerMode === 'other'}
          onClick={() => onChangeRegisterMode('other')}
        />
      </div>
    </ArtworkRegisterLayout>
  );
}

export { AddArtworkPage };
