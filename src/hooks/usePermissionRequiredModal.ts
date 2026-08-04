import { createElement, useState } from 'react';

import { useNavigate } from 'react-router-dom';

import { ConfirmModal } from '@/components/ui';

export function useLoginRequiredModal() {
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);

  const loginModal = isOpen
    ? createElement(ConfirmModal, {
        message: '로그인이 필요한 기능이에요.&#10;로그인하러 갈까요?',
        confirmLabel: '로그인하기',
        cancelLabel: '취소',
        onConfirm: () => {
          setIsOpen(false);
          navigate('/login');
        },
        onCancel: () => setIsOpen(false),
      })
    : null;

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
