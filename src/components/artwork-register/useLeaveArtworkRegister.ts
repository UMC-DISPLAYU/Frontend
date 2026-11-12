import { useCallback } from 'react';

import { useNavigate } from 'react-router-dom';

/**
 * 등록 · 수정 화면을 떠나 들어온 화면으로 돌아간다. 들어온 기록이 없으면(새로고침 · 직접 진입) fallback 으로 바꾼다.
 * 확인 모달이 열려 있으면 모달이 쌓은 기록까지 함께 빠져나가야 뒤로가기로 이 화면에 돌아오지 않는다.
 */
export function useLeaveArtworkRegister() {
  const navigate = useNavigate();

  return useCallback(
    (fallback: string, { overlayOpen = false }: { overlayOpen?: boolean } = {}) => {
      const historyIndex = window.history.state?.idx;
      const steps = overlayOpen ? 2 : 1;

      if (typeof historyIndex === 'number' && historyIndex >= steps) {
        navigate(-steps);
        return;
      }

      navigate(fallback, { replace: true });
    },
    [navigate],
  );
}
