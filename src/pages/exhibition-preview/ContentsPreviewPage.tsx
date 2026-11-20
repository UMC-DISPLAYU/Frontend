import { useParams } from 'react-router-dom';

import { useSwipeBack } from '@/hooks/useSwipeBack';

import { DisplayContentsPage } from '../display-detail/DisplayContentsPage';

import { usePreviewBack } from './usePreviewBack';

/* 전시 미리보기 소개 탭에서 연 전시 콘텐츠. 전시 팀원만 열 수 있다(라우트의 DisplayPermissionGuard view) */
export function ContentsPreviewPage() {
  const { displayId } = useParams<{ displayId: string }>();
  const goBack = usePreviewBack(`/exhibition/${displayId}/preview`);
  useSwipeBack(goBack);

  return <DisplayContentsPage previewDisplayId={displayId} onBack={goBack} />;
}
