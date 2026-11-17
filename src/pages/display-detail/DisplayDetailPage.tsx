import { Navigate, useLocation, useParams } from 'react-router-dom';

import { ErrorView } from '@/components/common';
import { DisplayDetailSkeleton, DisplayDetailView } from '@/components/display-detail';
import { NotFoundView } from '@/components/error-page';
import { useDisplayDetail } from '@/hooks/queries/useDisplayDetail';
import { useSkeleton } from '@/hooks/useSkeleton';
import { getErrorMessage, isNotFoundError } from '@/utils/error';
import { isPreviewDisplay } from '@/utils/isPreviewDisplay';
import { parseDisplayId } from '@/utils/parseDisplayId';

export function DisplayDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { search } = useLocation();
  const displayId = parseDisplayId(id);
  const { data: display, isPending, error, refetch } = useDisplayDetail(displayId ?? 0);
  const { showSkeleton } = useSkeleton(isPending && displayId !== null);

  if (showSkeleton) return <DisplayDetailSkeleton />;

  // 삭제 · 비공개 전환은 받아 둔 상세가 있어도 다시 불러오기에서 404 · 403 이 오므로 먼저 본다
  if (displayId === null || isNotFoundError(error)) return <NotFoundView />;

  // 다시 불러오기만 실패하면(좋아요 · 저장 뒤 등) 받아 둔 상세를 그대로 보여준다
  if (!display) {
    return (
      <ErrorView
        message={getErrorMessage(error, '정보를 불러오지 못했어요. 다시 시도해주세요.')}
        onRetry={() => void refetch()}
      />
    );
  }

  // 공개 전(준비 중 · 심사 중 · 반려) 전시는 미리보기 주소로 보낸다(전시 팀원만 열림)
  if (isPreviewDisplay(display)) {
    return <Navigate to={`/exhibition/${displayId}/preview${search}`} replace />;
  }

  // 다른 전시로 옮겨 가면 펼친 소개 · 포스터 위치를 처음으로 돌린다
  return <DisplayDetailView key={displayId} display={display} />;
}
