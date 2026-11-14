import { useParams, useSearchParams } from 'react-router-dom';

import { ArtworkDetailPage } from '../ArtworkDetailPage';

import { usePreviewBack } from './usePreviewBack';

/*
 * 작품 미리보기. 프로토타입 work.html 미리보기처럼 공개 전 띠를 두고 저장 · 좋아요 · 방명록을 막는다.
 * 전시 미리보기에서 들어왔으면(from=ex) 전시 미리보기 작품 탭으로, 아니면 전시 작업으로 돌아간다(프로토타입 U-153).
 * 전시 팀원만 열 수 있다(라우트의 DisplayPermissionGuard view)
 */
export function ArtworkPreviewPage() {
  const { displayId } = useParams<{ displayId: string }>();
  const [searchParams] = useSearchParams();
  const goBack = usePreviewBack(
    searchParams.get('from') === 'ex'
      ? `/exhibition/${displayId}/preview?tab=works`
      : `/exhibition/${displayId}/work`,
  );

  return <ArtworkDetailPage previewDisplayId={Number(displayId)} onBack={goBack} />;
}
