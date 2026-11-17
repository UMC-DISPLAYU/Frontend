import { useParams } from 'react-router-dom';

import { ArtworkDetailPage } from '../ArtworkDetailPage';

/*
 * 작품 미리보기. 프로토타입 work.html 미리보기처럼 공개 전 띠를 두고 저장 · 좋아요 · 방명록을 막는다.
 * 뒤로가기 버튼은 두지 않고 브라우저 뒤로가기에 맡긴다(프로토타입 U-149).
 * 전시 팀원만 열 수 있다(라우트의 DisplayPermissionGuard view)
 */
export function ArtworkPreviewPage() {
  const { displayId } = useParams<{ displayId: string }>();

  return <ArtworkDetailPage previewDisplayId={Number(displayId)} />;
}
