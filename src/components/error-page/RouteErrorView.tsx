import { isRouteErrorResponse, useRouteError } from 'react-router-dom';

import { ErrorView } from '@/components/common/ErrorView';
import { isNotFoundError } from '@/utils/error';

import { NotFoundView } from './NotFoundView';

/** 라우트 errorElement. 없는 페이지 · 권한 없음은 404 화면, 그 밖의 오류(렌더 중 오류 · 페이지 파일 못 받음)는 새로고침 안내 */
export function RouteErrorView() {
  const error = useRouteError();

  if (
    (isRouteErrorResponse(error) && (error.status === 404 || error.status === 403)) ||
    isNotFoundError(error)
  ) {
    return <NotFoundView />;
  }

  return (
    <ErrorView
      message={'일시적인 문제가 생겼어요.\n새로고침해 주세요.'}
      retryLabel="새로고침"
      onRetry={() => window.location.reload()}
    />
  );
}
