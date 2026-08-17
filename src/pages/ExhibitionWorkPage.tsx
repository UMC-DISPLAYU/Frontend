import { ChevronRight, Info, Plus, ShieldCheck } from 'lucide-react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';

import { ErrorView, LoadingView } from '@/components/common';
import { ArtworkCard } from '@/components/display-manage/ArtworkCard';
import { SectionTitle } from '@/components/display-manage/Common';
import { ContentRow } from '@/components/display-manage/ContentRow';
import { ExhibitionMeta } from '@/components/display-manage/ExhibitionMeta';
import { Poster } from '@/components/display-manage/Poster';
import { useHideFooter } from '@/components/layout';
import { ExhibitionHeader } from '@/components/ui';
import { useDisplayArtworks } from '@/hooks/queries/useDisplayArtworks';
import { useDisplayDetail } from '@/hooks/queries/useDisplayDetail';
import { useUserMe } from '@/hooks/queries/useUserProfile';
import { useFlowBack } from '@/hooks/useFlowBack';
import { useArtworkPolicy, useDisplayContentPolicy } from '@/hooks/usePolicy';
import { useUserStore } from '@/stores/useUserStore';
import type { WorkData } from '@/types/exhibition';
import type { ExhibitionItem } from '@/types/mypage';
import { cn } from '@/utils/cn';
import { hasPermission } from '@/utils/hasPermission';

type LocationState = {
  initialExhibition?: ExhibitionItem;
};

export function ExhibitionWorkPage() {
  useHideFooter();

  const { displayId } = useParams();
  const { state } = useLocation() as { state: LocationState | null };

  const navigate = useNavigate();
  const flowBack = useFlowBack();
  const userId = useUserStore((s) => s.userId);

  const exhibition = state?.initialExhibition;
  const { data: displayDetail, isPending, isError } = useDisplayDetail(Number(displayId));
  const { data: displayArtworks } = useDisplayArtworks(Number(displayId));
  const { data: userMe } = useUserMe();

  const isOwner =
    typeof displayDetail?.ownerUserId === 'number' && displayDetail.ownerUserId === userId;

  const myTeamMember = displayDetail?.teamMembers?.find((member) => member.userId === userId);
  const isTeamMember = !isOwner && Boolean(myTeamMember);
  const isArtistVerified = userMe?.isVerified ?? false;

  const displayContentPolicy = useDisplayContentPolicy(displayDetail);
  const canCreateCategory = hasPermission(displayContentPolicy, 'createCategory');
  const canEditCategory = hasPermission(displayContentPolicy, 'editCategory');
  const canDeleteCategory = hasPermission(displayContentPolicy, 'deleteCategory');
  const canDeleteContent = hasPermission(displayContentPolicy, 'deleteContent');
  const canReorder = hasPermission(displayContentPolicy, 'reorder');
  const canManageDisplayContent =
    canCreateCategory || canEditCategory || canDeleteCategory || canDeleteContent || canReorder;
  const artworkPolicy = useArtworkPolicy(displayDetail);
  const canCreateArtwork = hasPermission(artworkPolicy, 'create');

  const handleAddArtwork = () => {
    if (isOwner) {
      navigate(`/exhibition/${exItem.id}/artworks/add`);
    } else {
      navigate(`/exhibition/${exItem.id}/artworks/add/basic`);
    }
  };

  if (!exhibition && isPending) {
    return <LoadingView message="전시 정보를 불러오는 중..." />;
  }

  if (!exhibition && (isError || !displayDetail)) {
    return <ErrorView message="전시 정보를 찾을 수 없습니다." onRetry={() => flowBack()} />;
  }

  const exItem: ExhibitionItem = exhibition ?? {
    id: String(displayId),
    title: displayDetail!.title,
    status: displayDetail!.status,
    thumbnail: displayDetail!.images[0]?.imageUrl ?? '',
    place: displayDetail!.location.placeName,
    period: `${displayDetail!.period.startDate} - ${displayDetail!.period.endDate}`,
    org: displayDetail!.organization ?? displayDetail!.department ?? '',
  };

  const workData: WorkData = {
    contents:
      displayDetail?.contentCategories.map((cat) => ({
        id: String(cat.categoryId),
        title: cat.name,
        meta: cat.contents.length > 0 ? `${cat.contents.length}개 등록` : '0개',
        photos: cat.contents.map((content) => ({
          id: content.contentId,
          url: content.imageUrl,
        })),
      })) ?? [],
    artworks:
      displayArtworks?.artworks.map((artwork) => ({
        id: String(artwork.artworkId),
        title: artwork.artworkName,
        artist: artwork.artistName,
        image: artwork.artworkImageUrl || null,
      })) ?? [],
  };

  return (
    <div className="mx-auto min-h-dvh w-full max-w-md bg-page">
      <ExhibitionHeader title="전시 작업" onBack={() => flowBack()} />
      <main className="px-5">
        <div className="flex flex-col gap-5">
          <div
            className={cn(
              'flex gap-3 h-32 px-4 py-3.5 rounded-2xl items-start overflow-hidden',
              'bg-box100 shadow-[8px_8px_18px_rgba(6,3,45,0.04),inset_1px_1px_4px_rgba(1,8,21,0.20),inset_-2px_-2px_2px_rgba(252,252,252,0.90)]',
            )}
          >
            <Poster src={exItem.thumbnail} w={72} h={101} />
            <ExhibitionMeta ex={exItem} showBadge={false} />
          </div>

          {isTeamMember &&
            (isArtistVerified ? (
              <div className="flex w-full flex-col items-start rounded-xl bg-card p-4 outline outline-1 -outline-offset-1 outline-input-soft-border">
                <div className="flex w-full flex-col items-start gap-1">
                  <div className="flex w-full items-start gap-1">
                    <div className="typo-body-sm-bold flex-1 text-main">팀원으로 참여 중이에요</div>
                    <div className="flex flex-col items-center rounded-sm bg-[#DBEAFE] px-2.5 py-1">
                      <div className="typo-body-xs-regular text-center text-link">작가인증</div>
                    </div>
                  </div>
                  <div className="typo-body-xs-regular w-full text-hint">
                    전시 콘텐츠와 전시작을 등록할 수 있어요.
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex w-full flex-col items-start rounded-xl bg-card p-4 outline outline-1 -outline-offset-1 outline-input-soft-border">
                <div className="flex w-full flex-col items-start gap-3">
                  <div className="flex w-full flex-col items-start gap-1">
                    <div className="flex w-full items-start gap-1">
                      <div className="typo-body-sm-bold flex-1 text-main">
                        팀원으로 참여 중이에요
                      </div>
                    </div>
                    <div className="typo-body-xs-regular w-full text-hint">
                      전시 콘텐츠와 전시작을 등록할 수 있어요.
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => navigate('/artist-verification')}
                    className="flex w-full cursor-pointer items-center justify-between rounded-lg border-none bg-transparent px-3 py-2 outline outline-1 -outline-offset-1 outline-line-active"
                  >
                    <span className="flex items-center gap-1.5">
                      <ShieldCheck size={13} className="text-link" />
                      <span className="typo-body-xs-semibold text-link">
                        작품 등록 시 작가 인증 필요
                      </span>
                    </span>
                    <span className="flex items-center gap-0.5">
                      <span className="typo-body-xs-semibold text-link">인증하기</span>
                      <ChevronRight size={10} className="text-link" />
                    </span>
                  </button>
                </div>
              </div>
            ))}

          <div className="flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <SectionTitle>전시콘텐츠</SectionTitle>
              {canManageDisplayContent && (
                <button
                  onClick={() => navigate(`/exhibition/${exItem.id}/contents`)}
                  className="typo-body-xs-regular flex items-center gap-0.5 border-none bg-transparent text-hint cursor-pointer"
                >
                  관리하기 <ChevronRight size={13} />
                </button>
              )}
            </div>
            <div className="flex flex-col gap-2">
              {workData.contents.map((r) => (
                <ContentRow
                  key={r.id}
                  row={r}
                  onClick={() => navigate(`/exhibition/${exItem.id}/contents/${r.id}`)}
                />
              ))}
            </div>
          </div>

          <div className="flex flex-col">
            <div className="flex items-center justify-between">
              <div className="typo-body-sm-bold text-main">전시작</div>
              <button
                onClick={() => navigate(`/exhibition/${displayId}/artworks`)}
                className="typo-body-xs-regular flex items-center gap-0.5 border-none bg-transparent text-hint cursor-pointer"
              >
                관리하기 <ChevronRight size={13} />
              </button>
            </div>
            <div className="typo-body-xs-regular text-hint mt-1 mb-3">
              전시에 참여한 작품을 등록하고 작가 정보를 연결할 수 있어요.
            </div>

            <div
              className="-mx-5 flex gap-2 overflow-x-auto px-5 pb-1 scrollbar-none [&::-webkit-scrollbar]:hidden"
              style={{ scrollbarWidth: 'none' }}
            >
              {canCreateArtwork && (
                <button
                  type="button"
                  onClick={handleAddArtwork}
                  className="flex h-39.5 w-29.5 shrink-0 flex-col items-center justify-center gap-1.5 rounded-xl border-none bg-box200 cursor-pointer"
                >
                  <Plus size={20} className="text-hint" />
                  <span className="typo-body-xs-regular text-sub600">전시작 추가</span>
                </button>
              )}
              {workData.artworks.map((art) => (
                <ArtworkCard key={art.id} art={art} />
              ))}
            </div>
          </div>
        </div>

        <div className="mt-20 flex items-center gap-1.5 rounded-[10px] bg-card px-3 py-2.5">
          <Info size={13} className="text-hint" />
          <span className="typo-body-xs-regular text-hint">작품은 일부만 등록해도 괜찮아요.</span>
        </div>
      </main>
    </div>
  );
}
