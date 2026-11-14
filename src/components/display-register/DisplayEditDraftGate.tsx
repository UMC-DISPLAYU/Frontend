import { type ReactNode, useEffect, useState } from 'react';

import { useNavigationType, useParams } from 'react-router-dom';

import { ErrorView } from '@/components/common';
import { PageContainer } from '@/components/layout';
import { Skeleton } from '@/components/ui';
import { useDisplayDetail } from '@/hooks/queries/useDisplayDetail';
import { useExhibitionRegisterDraft } from '@/hooks/useExhibitionRegisterDraft';

import { toEditDraft } from './displayEditDraft';

/**
 * 수정 화면은 등록 화면과 같은 폼을 쓰고, 폼은 처음 그릴 때 draft 를 기본값으로 읽는다.
 * 그래서 전시 상세를 draft 에 채운 뒤에만 폼을 그린다. 1/2 ↔ 2/2 를 오가는 동안에는 다시 채우지 않는다.
 *
 * draft 는 전시 관리 화면들과 같은 곳에 있어서, 저장하지 않고 나갔다가 다시 들어오면 고치던 값이 남는다.
 * 그래서 refreshOnEnter(1/2)로 새로 들어온 경우(뒤로가기가 아닌 이동)에는 최신 상세로 다시 채운다
 */
export function DisplayEditDraftGate({
  refreshOnEnter = false,
  children,
}: {
  refreshOnEnter?: boolean;
  children: ReactNode;
}) {
  const displayId = Number(useParams().displayId);
  const navigationType = useNavigationType();
  const { draft, updateDraft } = useExhibitionRegisterDraft();
  const { data: detail, isFetching, isError, refetch } = useDisplayDetail(displayId);
  const [sessionId] = useState(() =>
    refreshOnEnter && navigationType === 'PUSH' ? `${Date.now()}-${Math.random()}` : null,
  );
  // 주소의 전시 번호만 바뀌어 다시 마운트되지 않은 경우에도 다른 전시 값을 쓰지 않도록 id 를 함께 본다
  const isReady =
    draft.editDisplayId === displayId && (!sessionId || draft.editSessionId === sessionId);

  useEffect(() => {
    if (!detail || isReady || (sessionId && isFetching)) return;

    updateDraft({ ...toEditDraft(detail), editSessionId: sessionId ?? draft.editSessionId });
  }, [detail, draft.editSessionId, isFetching, isReady, sessionId, updateDraft]);

  if (isReady) return children;

  return (
    <PageContainer variant="form" className="bg-primary-white">
      {isError ? (
        <ErrorView
          fullScreen={false}
          message="전시 정보를 불러오지 못했어요."
          onRetry={() => void refetch()}
        />
      ) : (
        <div aria-busy="true" className="flex flex-col gap-6 pt-16">
          <Skeleton className="h-1 w-full rounded-circle" />
          <Skeleton className="h-26.25 w-21" />
          <Skeleton className="h-12 w-full rounded-8" />
          <Skeleton className="h-32 w-full rounded-12" />
        </div>
      )}
    </PageContainer>
  );
}
