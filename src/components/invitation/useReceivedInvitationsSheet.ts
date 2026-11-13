import { useCallback, useEffect, useState } from 'react';

import {
  clearReceivedInvitationsRequest,
  hasReceivedInvitationsRequest,
} from './receivedInvitationsRequest';

/** 마이의 받은 초대 시트 열림 상태. 초대 링크로 들어왔으면 열린 채로 시작한다 */
export function useReceivedInvitationsSheet() {
  const [isOpen, setIsOpen] = useState(hasReceivedInvitationsRequest);

  // 초기값을 읽은 뒤 지운다. StrictMode 가 초기값 함수를 두 번 불러도 같은 값을 읽도록 렌더 중에는 지우지 않는다
  useEffect(() => {
    clearReceivedInvitationsRequest();
  }, []);

  const open = useCallback(() => setIsOpen(true), []);
  const close = useCallback(() => setIsOpen(false), []);

  return { isOpen, open, close };
}
