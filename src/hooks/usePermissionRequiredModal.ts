import { createElement, useCallback, useState } from 'react';

import { useNavigate } from 'react-router-dom';

// 공용 컴포넌트 barrel 을 거치면 BottomCommentBar → 이 훅 → barrel 순환 import 가 생겨 파일을 직접 가리킨다
import { ArtistVerificationModal } from '@/components/common/ArtistVerificationModal';
import { LoginConfirmModal } from '@/components/common/LoginConfirmModal';
import { useSocialLogin } from '@/hooks/useSocialLogin';

/*
 * 로그인이 필요한 동작에서 현재 화면 위에 로그인 안내를 띄운다.
 * redirectPath가 없으면 로그인 후 지금 보고 있는 화면으로 돌아온다.
 */
export function useLoginRequiredModal(redirectPath?: string) {
  const [isOpen, setIsOpen] = useState(false);
  const { startLogin, isPending, error, resetError } = useSocialLogin(redirectPath);

  const loginModal = createElement(LoginConfirmModal, {
    open: isOpen,
    onClose: () => setIsOpen(false),
    onLogin: (provider) => void startLogin(provider),
    isPending,
    error,
  });

  return {
    loginModal,
    openLoginModal: () => {
      resetError();
      setIsOpen(true);
    },
  };
}

const DEFAULT_ARTIST_VERIFICATION_DESCRIPTION = '작가 인증을 하면 이 기능을 이용할 수 있어요.';

type ArtistVerificationModalOptions = {
  /** 나중에 · 배경 탭 · ESC · 뒤로가기로 닫을 때. 들어갈 수 없는 화면(가드)에서 다른 곳으로 보낼 때 쓴다 */
  onCancel?: () => void;
};

export function useArtistVerificationRequiredModal(
  description: string = DEFAULT_ARTIST_VERIFICATION_DESCRIPTION,
  { onCancel }: ArtistVerificationModalOptions = {},
) {
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);

  const artistVerificationModal = createElement(ArtistVerificationModal, {
    open: isOpen,
    description,
    onConfirm: () => {
      // 오버레이가 쌓은 history 기록을 인증 화면으로 바꿔, 뒤로가기 때 모달 기록이 남지 않게 한다.
      // 닫기는 Overlay 가 기록이 바뀐 것을 보고 처리하므로 여기서 open 을 끄지 않는다(navigate(-1) 과 경쟁)
      void navigate('/artist-verification', { replace: true });
    },
    onCancel: () => {
      setIsOpen(false);
      onCancel?.();
    },
  });

  // PermissionGuard 가 effect 의존성으로 쓰므로 참조를 유지한다(닫은 뒤 다시 열리지 않게)
  const openArtistVerificationModal = useCallback(() => setIsOpen(true), []);

  return { artistVerificationModal, openArtistVerificationModal };
}
