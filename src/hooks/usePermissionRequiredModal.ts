import { createElement, useState } from 'react';

import { useNavigate } from 'react-router-dom';

import { LoginConfirmModal } from '@/components/common';
import { ConfirmModal } from '@/components/ui';

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

export function useArtistVerificationRequiredModal() {
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);

  const artistVerificationModal = isOpen
    ? createElement(ConfirmModal, {
        message: '전시를 등록하려면 작가 인증이 필요해요.&#10;학교 메일로 인증할까요?',
        confirmLabel: '학교 메일로 인증하기',
        cancelLabel: '취소',
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
