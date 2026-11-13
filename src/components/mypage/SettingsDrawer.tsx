import { useEffect, useId, useRef } from 'react';
import { createPortal } from 'react-dom';

import { Link, useNavigate } from 'react-router-dom';

import Logo from '@/assets/home/Logo.svg';
import { useFocusTrap } from '@/hooks/useFocusTrap';
import { useOverlayHistory } from '@/hooks/useOverlayHistory';
import { usePresence } from '@/hooks/usePresence';
import { useScrollLock } from '@/hooks/useScrollLock';
import { cn } from '@/utils/cn';

import { ChevronRightIcon, CloseIcon } from './MyPageIcons';
import { ProfileAvatar } from './ProfileAvatar';

const FOOTER_LINK_CLASS =
  'relative rounded-4 after:absolute after:inset-x-0 after:-inset-y-3.5 transition-colors duration-fast ease-standard hover:text-primary focus-visible:outline-2 focus-visible:outline-focus';

type SettingsDrawerProps = {
  open: boolean;
  onClose: () => void;
  nickname: string;
  profileImageUrl?: string | null;
  isVerified: boolean;
  /** 인증 후 "OO대학교 인증 완료"에 쓴다. 없으면 "인증 완료"만 보인다 */
  schoolName?: string;
  onLogout: () => void;
  onWithdraw: () => void;
};

export function SettingsDrawer({
  open,
  onClose,
  nickname,
  profileImageUrl,
  isVerified,
  schoolName,
  onLogout,
  onWithdraw,
}: SettingsDrawerProps) {
  const navigate = useNavigate();
  const titleId = useId();
  const panelRef = useRef<HTMLElement>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);

  const { isMounted, isExiting, onAnimationEnd } = usePresence(open);
  const { requestClose, isTopmost } = useOverlayHistory(open, onClose);

  useScrollLock(open);
  useFocusTrap(panelRef, open, { initialFocusRef: closeButtonRef, isTopmost });

  useEffect(() => {
    if (!open) return;

    const onKeyDown = (event: KeyboardEvent) => {
      // 한글 조합 중 ESC 는 조합 취소이므로 닫지 않는다
      if (event.key !== 'Escape' || event.isComposing || !isTopmost()) return;
      event.preventDefault();
      requestClose();
    };

    document.addEventListener('keydown', onKeyDown);
    return () => document.removeEventListener('keydown', onKeyDown);
  }, [open, isTopmost, requestClose]);

  if (!isMounted) return null;

  // 오버레이가 쌓은 history 기록 위에 쌓이지 않게 다른 페이지로는 replace 로 이동한다
  const goTo = (path: string) => navigate(path, { replace: true });

  return createPortal(
    <div className={cn('fixed inset-0 z-70', isExiting && 'pointer-events-none')}>
      <div
        aria-hidden="true"
        className={cn(
          'absolute inset-0 touch-none bg-dim',
          isExiting ? 'animate-fade-out' : 'animate-fade-in',
        )}
        onClick={requestClose}
      />
      <section
        aria-labelledby={titleId}
        aria-modal="true"
        className={cn(
          'absolute inset-y-0 right-0 flex w-[min(322px,82vw)] flex-col rounded-l-20 bg-primary-white px-5 pt-[max(28px,env(safe-area-inset-top))] text-primary outline-none',
          isExiting ? 'animate-drawer-out' : 'animate-drawer-in',
        )}
        onAnimationEnd={onAnimationEnd}
        ref={panelRef}
        role="dialog"
        tabIndex={-1}
      >
        <h2 className="sr-only" id={titleId}>
          설정
        </h2>
        <button
          aria-label="닫기"
          className="absolute top-[max(12px,env(safe-area-inset-top))] right-3 z-1 grid size-10 place-items-center rounded-circle text-icon-primary transition duration-fast ease-standard hover:bg-secondary focus-visible:outline-2 focus-visible:outline-focus active:scale-99"
          onClick={requestClose}
          ref={closeButtonRef}
          type="button"
        >
          <CloseIcon />
        </button>

        {/* 로고가 드로어 폭 전체로 늘어나 닫기 버튼을 덮지 않게 글자 폭만큼만 누른다 */}
        <Link
          aria-label="Display U. 홈"
          className="self-start rounded-4 focus-visible:outline-2 focus-visible:outline-focus"
          replace
          to="/home"
        >
          <img alt="" height={28} src={Logo} width={124} />
        </Link>

        <button
          className="mt-6 flex w-full items-center gap-3 border-b border-bg-tertiary pb-5 text-left focus-visible:outline-2 focus-visible:outline-focus"
          onClick={() => goTo('/edit-basic-info')}
          type="button"
        >
          <ProfileAvatar size={40} src={profileImageUrl} />
          <span className="typography-body-xxl-semibold min-w-0 flex-1 truncate">{nickname}</span>
          <ChevronRightIcon className="size-5 shrink-0 text-icon-primary" />
        </button>

        {isVerified ? (
          <div className="flex min-h-14 items-center justify-between gap-3 py-3.5">
            <span className="typography-body-xl-medium">작가 인증</span>
            <small className="typography-body-md-medium max-w-42.5 text-right text-tertiary">
              {schoolName ? `${schoolName} 인증 완료` : '인증 완료'}
            </small>
          </div>
        ) : (
          <button
            className="flex min-h-14 w-full items-center justify-between gap-3 py-3.5 text-left focus-visible:outline-2 focus-visible:outline-focus"
            onClick={() => goTo('/artist-verification')}
            type="button"
          >
            <span>
              <b className="typography-body-xl-semibold block">작가 인증하기</b>
              <small className="typography-body-md-medium mt-0.5 block text-secondary">
                학교 이메일로 인증해요
              </small>
            </span>
            <ChevronRightIcon className="size-5 shrink-0 text-icon-primary" />
          </button>
        )}

        <div className="flex-1" />

        <div className="border-t border-bg-tertiary">
          <button
            className="typography-body-xl-medium block h-14 w-full text-left focus-visible:outline-2 focus-visible:outline-focus"
            onClick={onLogout}
            type="button"
          >
            로그아웃
          </button>
          <button
            className="typography-body-xl-medium block h-14 w-full text-left text-tertiary focus-visible:outline-2 focus-visible:outline-focus"
            onClick={onWithdraw}
            type="button"
          >
            회원 탈퇴
          </button>
        </div>

        <footer className="-mx-5 border-t border-bg-tertiary px-5 pt-4.5 pb-[max(20px,env(safe-area-inset-bottom))]">
          <nav
            aria-label="약관"
            className="typography-body-md-medium flex items-center gap-3 text-primary"
          >
            <Link className={FOOTER_LINK_CLASS} replace to="/policy">
              이용약관
            </Link>
            <span aria-hidden="true" className="h-2.5 border-l border-primary" />
            <Link className={FOOTER_LINK_CLASS} replace to="/policy">
              개인정보처리방침
            </Link>
          </nav>
          <small className="typography-body-sm-regular mt-2 block text-tertiary">
            © 2026 displayU. All rights reserved.
          </small>
        </footer>
      </section>
    </div>,
    document.body,
  );
}
