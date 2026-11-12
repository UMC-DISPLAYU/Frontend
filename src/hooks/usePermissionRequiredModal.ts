import { createElement, useState } from 'react';

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

export function useArtistVerificationRequiredModal(
  description: string = DEFAULT_ARTIST_VERIFICATION_DESCRIPTION,
) {
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);

  const artistVerificationModal = isOpen
    ? createElement(ArtistVerificationModal, {
        description,
        onConfirm: () => {
          setIsOpen(false);
          navigate('/artist-verification');
        },
        onCancel: () => setIsOpen(false),
      })
    : null;

  return {
    artistVerificationModal,
    openArtistVerificationModal: () => setIsOpen(true),
  };
}
