import { useLocation, useNavigate, useParams } from 'react-router-dom';

import { ErrorView, LoadingView } from '@/components/common';
import { WorkScreen } from '@/components/display-manage';
import { useHideFooter } from '@/components/layout';
import { useDisplayArtworks } from '@/hooks/queries/useDisplayArtworks';
import { useDisplayDetail } from '@/hooks/queries/useDisplayDetail';
import type { WorkData } from '@/types/exhibition';
import type { ExhibitionItem } from '@/types/mypage';

type LocationState = {
  initialExhibition?: ExhibitionItem;
};

export function ExhibitionWorkPage() {
  useHideFooter();

  const { displayId } = useParams();
  const { state } = useLocation() as { state: LocationState | null };
  const navigate = useNavigate();

  const exhibition = state?.initialExhibition;
  const { data: displayDetail, isPending, isError } = useDisplayDetail(Number(displayId));
  const { data: displayArtworks } = useDisplayArtworks(Number(displayId));

  if (!exhibition && isPending) {
    return <LoadingView message="전시 정보를 불러오는 중..." />;
  }

  if (!exhibition && (isError || !displayDetail)) {
    return <ErrorView message="전시 정보를 찾을 수 없습니다." onRetry={() => navigate(-1)} />;
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
    <div className="w-96 mx-auto h-dvh bg-page flex flex-col">
      <WorkScreen
        ex={exItem}
        work={workData}
        onBack={() => navigate(-1)}
        onManageArtworks={() => navigate(`/exhibition/${displayId}/artworks`)}
      />
    </div>
  );
}
