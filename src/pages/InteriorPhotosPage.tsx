import { useNavigate, useParams } from 'react-router-dom';

import { ErrorView, LoadingView } from '@/components/common';
import { InteriorPhotos } from '@/components/display-manage/InteriorPhotos';
import { useHideFooter } from '@/components/layout';
import { useDisplayDetail } from '@/hooks/queries/useDisplayDetail';
import { useDisplayContentPolicy } from '@/hooks/usePolicy';
import { hasPermission } from '@/utils/hasPermission';

export function InteriorPhotosPage() {
  useHideFooter();
  const navigate = useNavigate();
  const { displayId: paramDisplayId, categoryId: paramCategoryId } = useParams();

  const displayId = Number(paramDisplayId ?? 0);
  const categoryId = Number(paramCategoryId ?? 0);

  const { data: displayDetail, isLoading, error } = useDisplayDetail(displayId);
  const displayContentPolicy = useDisplayContentPolicy(displayDetail);

  const canCreateContent = hasPermission(displayContentPolicy, 'createContent');
  const canDeleteContent = hasPermission(displayContentPolicy, 'deleteContent');
  const canReorder = hasPermission(displayContentPolicy, 'reorder');

  if (isLoading) {
    return <LoadingView message="내부 사진을 불러오는 중..." />;
  }

  if (error || !displayDetail) {
    return <ErrorView message="전시 정보를 찾을 수 없습니다." onRetry={() => navigate(-1)} />;
  }

  const category = displayDetail.contentCategories?.find((cat) => cat.categoryId === categoryId);

  if (!category) {
    return (
      <ErrorView message="해당 콘텐츠 카테고리를 찾을 수 없습니다." onRetry={() => navigate(-1)} />
    );
  }

  const initialPhotos =
    category.contents.map((content) => ({
      id: content.contentId,
      url: content.imageUrl,
    })) ?? [];

  return (
    <div className="w-96 mx-auto h-dvh bg-page flex flex-col">
      <InteriorPhotos
        title={category.name}
        displayId={displayId}
        categoryId={categoryId}
        initialPhotos={initialPhotos}
        canCreateContent={canCreateContent}
        canDeleteContent={canDeleteContent}
        canReorder={canReorder}
        onBack={() => navigate(-1)}
      />
    </div>
  );
}
