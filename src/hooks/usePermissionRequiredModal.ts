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
        title: '작가 인증이 필요해요',
        message: '전시와 작품을 등록하려면\n학교 이메일 인증이 필요해요.',
        confirmLabel: '학교 이메일로 인증하기',
        cancelLabel: '취소',
        layout: 'vertical',
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
