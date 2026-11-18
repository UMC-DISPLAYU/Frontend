import { Link, useParams } from 'react-router-dom';

import { ErrorView, LoadingView } from '@/components/common';
import { ExhibitionWorkLayout } from '@/components/exhibition-work';
import { useDisplayDetail } from '@/hooks/queries/useDisplayDetail';
import { useUserMe } from '@/hooks/queries/useUserProfile';
import { useFlowBack } from '@/hooks/useFlowBack';
import { useDisplayContentPolicy } from '@/hooks/usePolicy';
import { useReplaceSearchParams } from '@/hooks/useReplaceSearchParams';
import { hasPermission } from '@/utils/hasPermission';

import { ArtworksManagePage } from './ArtworksManagePage';
import { DisplayContentsManagePage } from './DisplayContentsManagePage';

export function ExhibitionWorkPage() {
  const { displayId } = useParams();
  const flowBack = useFlowBack();
  const [searchParams, replaceSearchParams] = useReplaceSearchParams();
  // 팀원들이 함께 작업하는 화면이라, 다른 탭 · 앱에 다녀오면 다른 팀원이 바꾼 내용을 다시 불러온다
  const {
    data: display,
    isPending,
    isError,
  } = useDisplayDetail(Number(displayId), {
    refetchOnWindowFocus: true,
  });
  const { data: userMe } = useUserMe();
  const canViewContents = hasPermission(useDisplayContentPolicy(display), 'view');
  const activeTab =
    canViewContents && searchParams.get('tab') === 'contents' ? 'contents' : 'artworks';

  if (isPending) return <LoadingView />;
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
      {canViewContents && (
        <div hidden={activeTab !== 'contents'}>
          <DisplayContentsManagePage embedded />
        </div>
      )}
    </ExhibitionWorkLayout>
  );
}
