import { useParams } from 'react-router-dom';

import { ErrorView } from '@/components/common';
import { DisplayDetailSkeleton, DisplayDetailView } from '@/components/display-detail';
import { useDisplayDetail } from '@/hooks/queries/useDisplayDetail';
import { useFlowBack } from '@/hooks/useFlowBack';
import { getErrorMessage } from '@/utils/error';
import { parseDisplayId } from '@/utils/parseDisplayId';

export function DisplayDetailPage() {
  const flowBack = useFlowBack();
  const { id } = useParams<{ id: string }>();
  const displayId = parseDisplayId(id);
  const { data: display, isPending, error, refetch } = useDisplayDetail(displayId ?? 0);

  if (isPending && displayId !== null) return <DisplayDetailSkeleton />;

  if (error || !display || displayId === null) {
    return (
      <ErrorView
        message={
          error
            ? getErrorMessage(error, '정보를 불러오지 못했어요. 다시 시도해주세요.')
            : '전시 정보를 찾을 수 없어요'
        }
        onRetry={error ? () => void refetch() : () => flowBack()}
        retryLabel={error ? '다시 시도' : '뒤로가기'}
      />
    );
  }

  // 다른 전시로 옮겨 가면 펼친 소개 · 포스터 위치를 처음으로 돌린다
  return <DisplayDetailView key={displayId} display={display} onBack={() => flowBack()} />;
}
