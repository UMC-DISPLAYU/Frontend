import { useParams } from 'react-router-dom';

import { ErrorView } from '@/components/common';
import { DisplayDetailSkeleton, DisplayDetailView } from '@/components/display-detail';
import { useDisplayDetail } from '@/hooks/queries/useDisplayDetail';
import { getErrorMessage } from '@/utils/error';
import { parseDisplayId } from '@/utils/parseDisplayId';

import { usePreviewBack } from './usePreviewBack';

/* 전시 작업의 "전시 미리보기". 전시 팀원만 열 수 있다(라우트의 DisplayPermissionGuard view) */
export function DisplayPreviewPage() {
  const { displayId: displayIdParam } = useParams<{ displayId: string }>();
  const displayId = parseDisplayId(displayIdParam);
  const goBack = usePreviewBack(`/exhibition/${displayIdParam}/work`);
  const { data: display, isPending, error, refetch } = useDisplayDetail(displayId ?? 0);

  if (isPending && displayId !== null) return <DisplayDetailSkeleton />;

  if (!display || displayId === null) {
    return (
      <ErrorView
        message={
          error
            ? getErrorMessage(error, '정보를 불러오지 못했어요. 다시 시도해주세요.')
            : '전시 정보를 찾을 수 없어요'
        }
        onRetry={error ? () => void refetch() : goBack}
        retryLabel={error ? '다시 시도' : '뒤로가기'}
      />
    );
  }

  return <DisplayDetailView key={displayId} display={display} onBack={goBack} previewMode />;
}
