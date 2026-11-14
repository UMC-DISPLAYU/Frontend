import { useParams } from 'react-router-dom';

import { ArtworkDetailPage } from '../ArtworkDetailPage';

import { usePreviewBack } from './usePreviewBack';

/*
 * 전시작 관리에서 카드를 누르면 여는 작품 미리보기. 프로토타입에는 없어 전시 미리보기처럼
 * 공개 전 띠를 두고 저장 · 좋아요 · 방명록을 막는다. 전시 팀원만 열 수 있다(라우트의 DisplayPermissionGuard view)
 */
export function ArtworkPreviewPage() {
  const { displayId } = useParams<{ displayId: string }>();
  const goBack = usePreviewBack(`/exhibition/${displayId}/work`);

  return <ArtworkDetailPage previewDisplayId={Number(displayId)} onBack={goBack} />;
}
