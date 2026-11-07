import completeIcon from '@/assets/icons/VerifyCompleteIcon.svg';
import { PageContainer } from '@/components/layout';

import { ArtistVerifyBottomBar, ArtistVerifyBottomButton } from './ArtistVerifyBottomButton';

type ArtistVerifyCompleteProps = {
  onGoProfile: () => void;
  onDone: () => void;
};

export function ArtistVerifyComplete({ onGoProfile, onDone }: ArtistVerifyCompleteProps) {
  return (
    <PageContainer className="bg-primary-white" variant="form">
      <main className="flex flex-1 flex-col items-center justify-center gap-3 text-center">
        <img alt="" className="size-16" src={completeIcon} />
        <h1 className="typography-title-xs text-primary">작가 인증이 완료되었어요</h1>
        <p className="typography-body-lg-regular text-tertiary">
          전시 등록, 전시작 등록, 작가 프로필 관리가 가능해요!
        </p>
      </main>

      <ArtistVerifyBottomBar>
        <ArtistVerifyBottomButton onClick={onGoProfile}>작가 프로필 가기</ArtistVerifyBottomButton>
        <ArtistVerifyBottomButton onClick={onDone} variant="secondary">
          확인
        </ArtistVerifyBottomButton>
      </ArtistVerifyBottomBar>
    </PageContainer>
  );
}
