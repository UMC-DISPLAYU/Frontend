import { Link, useParams } from 'react-router-dom';

import { ErrorView, LoadingView } from '@/components/common';
import { ExhibitionWorkLayout } from '@/components/exhibition-work';
import { useHideFooter } from '@/components/layout';
import { useDisplayDetail } from '@/hooks/queries/useDisplayDetail';
import { useUserMe } from '@/hooks/queries/useUserProfile';
import { useFlowBack } from '@/hooks/useFlowBack';
import { useReplaceSearchParams } from '@/hooks/useReplaceSearchParams';

import { ArtworksManagePage } from './ArtworksManagePage';
import { DisplayContentsManagePage } from './DisplayContentsManagePage';

export function ExhibitionWorkPage() {
  useHideFooter();
  const { displayId } = useParams();
  const flowBack = useFlowBack();
  const [searchParams, replaceSearchParams] = useReplaceSearchParams();
  const activeTab = searchParams.get('tab') === 'contents' ? 'contents' : 'artworks';
  const { data: display, isPending, isError } = useDisplayDetail(Number(displayId));
  const { data: userMe } = useUserMe();

  if (isPending) return <LoadingView message="전시 정보를 불러오는 중..." />;
  if (isError || !display)
    return <ErrorView message="전시 정보를 찾을 수 없습니다." onRetry={flowBack} />;

  const needsVerification =
    userMe &&
    !userMe.isVerified &&
    display.ownerUserId !== userMe.id &&
    display.teamMembers.some((member) => member.userId === userMe.id);

  return (
    <ExhibitionWorkLayout
      display={display}
      activeTab={activeTab}
      onTabChange={(tab) =>
        replaceSearchParams((previous) => {
          const next = new URLSearchParams(previous);
          next.set('tab', tab);
          return next;
        })
      }
    >
      {needsVerification && (
        <Link
          to="/artist-verification"
          className="typography-body-lg-medium my-3 flex min-h-11 items-center justify-between gap-2 rounded-12 bg-info-subtle px-3 py-2 text-info focus-visible:outline-2 focus-visible:outline-focus"
        >
          <span>작품 등록 시 작가 인증이 필요해요</span>
          <span className="shrink-0">인증하기</span>
        </Link>
      )}
      <div hidden={activeTab !== 'artworks'}>
        <ArtworksManagePage embedded />
      </div>
      <div hidden={activeTab !== 'contents'}>
        <DisplayContentsManagePage embedded />
      </div>
    </ExhibitionWorkLayout>
  );
}
