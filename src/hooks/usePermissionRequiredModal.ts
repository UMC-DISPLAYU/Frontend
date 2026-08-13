import { createElement, useState } from 'react';

import { useNavigate } from 'react-router-dom';

import { ArtistVerificationModal, LoginConfirmModal } from '@/components/common';

/* 로그인 안내는 공용 LoginConfirmModal을 그대로 사용합니다. */
export function useLoginRequiredModal() {
  const [isOpen, setIsOpen] = useState(false);

  const loginModal = createElement(LoginConfirmModal, {
    isOpen,
    onClose: () => setIsOpen(false),
  });

  return {
    loginModal,
    openLoginModal: () => setIsOpen(true),
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
