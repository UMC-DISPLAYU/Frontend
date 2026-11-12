import { Navigate, useLocation } from 'react-router-dom';

/* OAuth 콜백이 `/?accessToken=`으로 돌아오는 경우가 있어 쿼리를 그대로 홈에 넘깁니다. */
export function RootRedirect() {
  const { search } = useLocation();

  return <Navigate to={{ pathname: '/home', search }} replace />;
}
