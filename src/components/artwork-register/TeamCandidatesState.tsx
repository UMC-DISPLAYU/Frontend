import { Skeleton, SkeletonList } from '@/components/ui';

import type { CandidatesStatus } from './proxyAuthor';

/** 팀원 목록을 불러오는 중 · 실패한 상태. 다 불러왔으면 아무것도 그리지 않는다(빈 목록 안내는 각 시트가 맡는다) */
export function TeamCandidatesState({
  status,
  onRetry,
}: {
  status: CandidatesStatus;
  onRetry?: () => void;
}) {
  if (status === 'pending') {
    return (
      <div aria-busy="true" aria-label="팀원 목록을 불러오는 중" className="mt-6">
        <SkeletonList count={2}>
          {() => (
            <div className="flex items-center gap-3 py-3">
              <Skeleton className="size-11.5 shrink-0 rounded-circle" />
              <div className="flex flex-1 flex-col gap-1">
                <Skeleton className="h-5 w-20 rounded-4" />
                <Skeleton className="h-4 w-14 rounded-4" />
              </div>
            </div>
          )}
        </SkeletonList>
      </div>
    );
  }

  if (status === 'error') {
    return (
      <div role="alert" className="flex flex-col items-center gap-3 py-7 text-center">
        <p className="typography-body-lg-semibold text-primary">팀원 목록을 불러오지 못했어요</p>
        {onRetry && (
          <button
            type="button"
            onClick={onRetry}
            className="typography-body-md-semibold min-h-11 rounded-12 bg-secondary px-4 text-primary transition duration-fast ease-standard hover:bg-tertiary focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus active:scale-99"
          >
            다시 시도
          </button>
        )}
      </div>
    );
  }

  return null;
}
