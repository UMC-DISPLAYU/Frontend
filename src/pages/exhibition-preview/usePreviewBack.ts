import { useCallback } from 'react';

import { useNavigate } from 'react-router-dom';

/*
 * 미리보기는 전시 작업에서 새 탭으로 열리기도 한다(프로토타입 전시 미리보기 target="_blank").
 * 돌아갈 기록이 없으면 홈 대신 전시 작업으로 보낸다
 */
export function usePreviewBack(fallbackPath: string) {
  const navigate = useNavigate();

  return useCallback(() => {
    const historyIndex = window.history.state?.idx;
    if (typeof historyIndex === 'number' && historyIndex > 0) navigate(-1);
    else navigate(fallbackPath, { replace: true });
  }, [fallbackPath, navigate]);
}
