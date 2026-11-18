import { PageContainer } from '@/components/layout';
import { Skeleton, SkeletonText } from '@/components/ui';

import { ArtworkRegisterHeader } from './ArtworkRegisterHeader';

interface ArtworkRegisterSkeletonProps {
  title: string;
  withAuthor?: boolean;
  onBack: () => void;
}

/** 수정할 작품을 불러오는 동안 입력 화면과 같은 자리를 차지한다 */
export function ArtworkRegisterSkeleton({
  title,
  withAuthor = false,
  onBack,
}: ArtworkRegisterSkeletonProps) {
  return (
    <PageContainer variant="form" className="bg-primary-white">
      <ArtworkRegisterHeader title={title} onBack={onBack} />
      <div
        aria-busy="true"
        aria-label="작품 정보를 불러오는 중"
        className="flex flex-col gap-10 pt-5 pb-6"
      >
        {withAuthor && (
          <div className="flex flex-col gap-3">
            <div className="flex flex-col gap-1">
              <SkeletonText className="typography-body-xl-semibold w-10" />
              <SkeletonText className="typography-body-md-medium w-48" />
            </div>
            <Skeleton className="h-39 rounded-12" />
          </div>
        )}
        <div className="flex flex-col gap-6">
          <div className="flex flex-col gap-4">
            <SkeletonText className="typography-body-xl-semibold w-16" />
            <div className="flex flex-col gap-1">
              <SkeletonText className="typography-body-lg-semibold w-20" />
              <SkeletonText className="typography-body-md-medium w-40" />
              <SkeletonText className="typography-body-md-medium w-48" />
            </div>
            <div className="flex gap-2 overflow-hidden">
              <Skeleton className="h-45 w-36 shrink-0" />
              <Skeleton className="h-45 w-36 shrink-0" />
              <Skeleton className="h-45 w-36 shrink-0" />
            </div>
          </div>
          <div className="flex flex-col gap-1">
            <SkeletonText className="typography-body-lg-semibold w-14" />
            <Skeleton className="h-11.5" />
          </div>
          <Skeleton className="h-32 rounded-12" />
        </div>
      </div>
    </PageContainer>
  );
}
