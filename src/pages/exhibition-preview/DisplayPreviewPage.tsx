import { Navigate, useLocation, useParams } from 'react-router-dom';

import { ErrorView } from '@/components/common';
import { DisplayDetailSkeleton, DisplayDetailView } from '@/components/display-detail';
import { NotFoundView } from '@/components/error-page';
import { useDisplayDetail } from '@/hooks/queries/useDisplayDetail';
import { useSkeleton } from '@/hooks/useSkeleton';
import { getErrorMessage, isNotFoundError } from '@/utils/error';
import { isPreviewDisplay } from '@/utils/isPreviewDisplay';
import { parseDisplayId } from '@/utils/parseDisplayId';

/*
 * 전시 작업의 "전시 미리보기". 전시 팀원만 열 수 있다(라우트의 DisplayPermissionGuard view).
 * 공개 전(준비 중 · 심사 중 · 반려) 전시만 미리보기로 보이고, 공개된 전시는 /display/:id 로 보낸다
 */
export function DisplayPreviewPage() {
  const { displayId: displayIdParam } = useParams<{ displayId: string }>();
  const displayId = parseDisplayId(displayIdParam);
  const { search } = useLocation();
  const { data: display, isPending, error, refetch } = useDisplayDetail(displayId ?? 0);
  const { showSkeleton } = useSkeleton(isPending && displayId !== null);

  if (showSkeleton) return <DisplayDetailSkeleton />;

  if (displayId === null || isNotFoundError(error)) return <NotFoundView />;

  if (!display) {
    return (
      <ErrorView
        message={getErrorMessage(error, '정보를 불러오지 못했어요. 다시 시도해주세요.')}
        onRetry={() => void refetch()}
      />
    );
  }

  // 공개된 전시는 미리보기 없이 일반 상세로 보낸다
  if (!isPreviewDisplay(display)) return <Navigate to={`/display/${displayId}${search}`} replace />;

  return <DisplayDetailView key={displayId} display={display} previewMode />;
}
