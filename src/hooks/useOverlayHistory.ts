import { useCallback, useEffect, useRef } from 'react';

import { useLocation, useNavigate, useNavigation } from 'react-router-dom';

import {
  createOverlayId,
  hasStaleOverlayEntry,
  overlayStack,
  readOverlayIds,
  withoutOverlayIds,
  withOverlayId,
} from '@/utils/overlayStack';

/**
 * pending: 같은 URL 로 push 를 요청했고 아직 그 기록에 도착하지 않음
 * active: 오버레이 기록에 도착함(뒤로가기로 닫을 수 있음)
 * closing: 닫으려고 navigate(-1) 을 보냈고 POP 을 기다리는 중
 */
type Phase = 'pending' | 'active' | 'closing';

interface Session {
  id: string;
  phase: Phase;
  entryKey: string | null;
}

// react-router 가 window.history.state 에 { usr, key, idx } 를 저장한다(읽기만 한다)
const readHistoryEntry = () => {
  const state: unknown = window.history.state;
  if (typeof state !== 'object' || state === null) return { key: undefined, idx: undefined };

  const { key, idx } = state as { key?: unknown; idx?: unknown };
  return {
    key: typeof key === 'string' ? key : undefined,
    idx: typeof idx === 'number' ? idx : undefined,
  };
};

/**
 * 오버레이를 뒤로가기로 닫을 수 있게 한다.
 *
 * 열릴 때 같은 URL 로 history 기록을 하나 push 하고(state 에 오버레이 id),
 * 뒤로가기로 그 id 가 사라지면 onClose 를 부른다.
 * 배경 탭 · ESC · 닫기 버튼은 반환한 requestClose 를 불러 그 기록을 navigate(-1) 로 되돌린다.
 * 부모가 open 을 false 로 바꿔 닫으면(저장 후 닫기 등) 남은 기록을 대신 되돌린다.
 */
export function useOverlayHistory(open: boolean, onClose: () => void) {
  const location = useLocation();
  const navigate = useNavigate();
  const navigation = useNavigation();

  const sessionRef = useRef<Session | null>(null);
  const onCloseRef = useRef(onClose);
  const openRef = useRef(open);
  const mountedRef = useRef(false);
  const locationRef = useRef(location);
  const navigationStateRef = useRef(navigation.state);

  useEffect(() => {
    onCloseRef.current = onClose;
    openRef.current = open;
    locationRef.current = location;
    navigationStateRef.current = navigation.state;
  });

  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
    };
  }, []);

  const endSession = useCallback((session: Session) => {
    overlayStack.remove(session.id);
    if (sessionRef.current === session) sessionRef.current = null;
  }, []);

  useEffect(() => {
    if (!open) return;

    if (!sessionRef.current) {
      const id = createOverlayId();
      const { pathname, search, hash, state } = locationRef.current;

      sessionRef.current = { id, phase: 'pending', entryKey: null };
      overlayStack.push(id);
      void navigate(
        { pathname, search, hash },
        {
          state: withOverlayId(state, id, overlayStack.has),
          // ScrollRestoration 이 같은 URL push 를 새 페이지로 보고 맨 위로 올리지 않게 한다
          preventScrollReset: true,
        },
      );
    }

    const session = sessionRef.current;

    return () => {
      // StrictMode 의 가짜 unmount 와 실제 닫힘(open false · 언마운트)을 구분하려고 한 틱 미룬다
      window.setTimeout(() => {
        if (mountedRef.current && openRef.current) return;
        if (sessionRef.current !== session) return;

        endSession(session);

        // 다른 페이지로 이동 중이거나 이미 다른 기록 위에 있으면 건드리지 않는다
        const isOnOwnEntry = readHistoryEntry().key === session.entryKey;
        if (session.phase === 'active' && isOnOwnEntry && navigationStateRef.current === 'idle') {
          void navigate(-1);
        }
      });
    };
  }, [open, navigate, endSession]);

  useEffect(() => {
    const session = sessionRef.current;
    if (!session) return;

    if (readOverlayIds(location.state).includes(session.id)) {
      if (session.phase === 'pending') {
        session.phase = 'active';
        session.entryKey = location.key;
      }
      return;
    }

    if (session.phase === 'pending') return;

    // 뒤로가기로 기록이 빠졌거나, 오버레이 안에서 다른 페이지로 이동했다
    endSession(session);
    onCloseRef.current();
  }, [location, endSession]);

  const requestClose = useCallback(() => {
    const session = sessionRef.current;

    if (!session) {
      onCloseRef.current();
      return;
    }

    if (session.phase === 'closing') return;

    if (session.phase === 'active' && readHistoryEntry().key === session.entryKey) {
      session.phase = 'closing';
      void navigate(-1);
      return;
    }

    endSession(session);
    onCloseRef.current();
  }, [navigate, endSession]);

  const isTopmost = useCallback(() => {
    const session = sessionRef.current;
    return session !== null && overlayStack.isTop(session.id);
  }, []);

  return { requestClose, isTopmost };
}

/**
 * 더 이상 열려 있지 않은 오버레이의 history 기록에 도착하면 한 번 더 되돌린다.
 * (오버레이 안에서 replace 없이 다른 페이지로 이동한 뒤 돌아온 경우, 새로고침으로 오버레이가 사라진 경우 등)
 * 라우터 안, 모든 페이지를 감싸는 곳(Layout)에 한 번만 둔다.
 */
export function useOverlayHistoryCleanup() {
  const location = useLocation();
  const navigate = useNavigate();
  const handledKeyRef = useRef<string | null>(null);

  useEffect(() => {
    // StrictMode 이중 effect 에서 두 번 되돌리지 않게 같은 기록은 한 번만 처리한다
    if (handledKeyRef.current === location.key) return;
    handledKeyRef.current = location.key;

    if (!hasStaleOverlayEntry(location.state, overlayStack.has)) return;

    const { idx } = readHistoryEntry();

    if (idx !== undefined && idx > 0) {
      void navigate(-1);
      return;
    }

    const { pathname, search, hash, state } = location;
    void navigate(
      { pathname, search, hash },
      { replace: true, state: withoutOverlayIds(state), preventScrollReset: true },
    );
  }, [location, navigate]);
}
