import { PageContainer } from '@/components/layout';
import { Skeleton } from '@/components/ui';

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
      <main
        aria-busy="true"
        aria-label="작품 정보를 불러오는 중"
        className="flex flex-col gap-10 pt-5 pb-6"
      >
        {withAuthor && (
          <div className="flex flex-col gap-3">
            <Skeleton className="h-11 w-48 rounded-4" />
            <Skeleton className="h-39 rounded-12" />
          </div>
        )}
        <div className="flex flex-col gap-6">
          <div className="flex flex-col gap-4">
            <Skeleton className="h-5.5 w-16 rounded-4" />
            <Skeleton className="h-14 w-56 rounded-4" />
            <div className="flex gap-2">
              <Skeleton className="h-30 w-24" />
              <Skeleton className="h-30 w-24" />
              <Skeleton className="h-30 w-24" />
            </div>
          </div>
          <Skeleton className="h-17 rounded-4" />
          <Skeleton className="h-32 rounded-12" />
        </div>
      </main>
    </PageContainer>
  );
}
