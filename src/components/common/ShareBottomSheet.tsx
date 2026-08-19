import { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';

import { X } from 'lucide-react';

import kakaoShareIcon from '@/assets/comment/KakaoShareIcon.svg';
import urlCopyIcon from '@/assets/comment/UrlCopyIcon.svg';

declare global {
  interface Window {
    Kakao?: {
      isInitialized: () => boolean;
      init: (key: string) => void;
      Share: {
        sendDefault: (settings: {
          objectType: 'feed';
          content: {
            title: string;
            description?: string;
            imageUrl: string;
            link: { mobileWebUrl: string; webUrl: string };
          };
          buttons?: {
            title: string;
            link: { mobileWebUrl: string; webUrl: string };
          }[];
        }) => void;
      };
    };
  }
}

type ShareBottomSheetProps = {
  isOpen: boolean;
  onClose: () => void;
  /* 공유할 페이지 URL. 생략하면 현재 페이지 URL을 씁니다. */
  url?: string;
  title: string;
  description?: string;
  imageUrl?: string;
};

const FALLBACK_SHARE_IMAGE = `${window.location.origin}/icon.png`;
const KAKAO_SDK_URL = 'https://t1.kakaocdn.net/kakao_js_sdk/2.7.4/kakao.min.js';

let kakaoSdkPromise: Promise<void> | null = null;

/* 카카오톡 공유 버튼을 처음 누를 때만 SDK를 로드합니다. */
function loadKakaoSdk() {
  if (window.Kakao) return Promise.resolve();

  kakaoSdkPromise ??= new Promise<void>((resolve, reject) => {
    const script = document.createElement('script');
    script.src = KAKAO_SDK_URL;
    script.onload = () => resolve();
    script.onerror = () => {
      kakaoSdkPromise = null;
      reject(new Error('카카오 SDK 로드 실패'));
    };
    document.head.appendChild(script);
  });

  return kakaoSdkPromise;
}

function resolveShareImageUrl(imageUrl?: string) {
  if (!imageUrl) return FALLBACK_SHARE_IMAGE;

  try {
    return new URL(imageUrl, window.location.origin).href;
  } catch {
    return FALLBACK_SHARE_IMAGE;
  }
}

export function ShareBottomSheet({
  isOpen,
  onClose,
  url,
  title,
  description,
  imageUrl,
}: ShareBottomSheetProps) {
  const [copied, setCopied] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const previousFocusRef = useRef<HTMLElement | null>(null);
  const copiedTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (!isOpen) return;

    document.body.style.overflow = 'hidden';
    previousFocusRef.current = document.activeElement as HTMLElement;
    // 시트가 렌더된 다음 포커스를 옮기기 위해 requestAnimationFrame을 씁니다.
    requestAnimationFrame(() => {
      closeButtonRef.current?.focus();
    });

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.body.style.overflow = '';
      document.removeEventListener('keydown', handleKeyDown);
      previousFocusRef.current?.focus();
      // 시트가 닫히면 이전 세션의 복사/에러 피드백을 정리합니다.
      if (copiedTimeoutRef.current) clearTimeout(copiedTimeoutRef.current);
      setCopied(false);
      setErrorMessage(null);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const shareUrl = url ?? window.location.href;
  const shareImageUrl = resolveShareImageUrl(imageUrl);

  const handleKakaoShare = async () => {
    setErrorMessage(null);

    try {
      await loadKakaoSdk();

      const kakao = window.Kakao;
      if (!kakao) throw new Error('Kakao SDK unavailable');

      if (!kakao.isInitialized()) {
        kakao.init(import.meta.env.VITE_KAKAO_MAP_KEY);
      }

      kakao.Share.sendDefault({
        objectType: 'feed',
        content: {
          title,
          /* description 키가 존재하면 카카오 SDK가 문자열 타입을 강제해서,
           * 값이 없을 땐 undefined를 넣지 말고 키 자체를 빼야 합니다. */
          ...(description ? { description } : {}),
          imageUrl: shareImageUrl,
          link: { mobileWebUrl: shareUrl, webUrl: shareUrl },
        },
        buttons: [
          {
            title: '자세히 보기',
            link: { mobileWebUrl: shareUrl, webUrl: shareUrl },
          },
        ],
      });
      onClose();
    } catch (err) {
      // eslint-disable-next-line no-console
      console.error('Kakao share failed:', err);
      setErrorMessage('공유에 실패했어요');
    }
  };

  const handleCopyUrl = async () => {
    setErrorMessage(null);

    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      if (copiedTimeoutRef.current) clearTimeout(copiedTimeoutRef.current);
      copiedTimeoutRef.current = setTimeout(() => {
        setCopied(false);
      }, 1500);
    } catch {
      setErrorMessage('복사에 실패했어요');
    }
  };

  const sheet = (
    <div className="fixed inset-0 z-[100] flex items-end justify-center">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div
        role="dialog"
        aria-modal="true"
        aria-label="공유하기"
        className="relative flex h-[297px] w-full max-w-md flex-col rounded-t-xl bg-card px-5 pt-6 pb-[calc(env(safe-area-inset-bottom)+8px)] shadow-[0px_-8px_30px_0px_rgba(4,0,250,0.10)]"
      >
        <div className="flex items-center justify-between">
          <h2 className="text-[20px] leading-[130%] font-bold text-main">공유하기</h2>
          <button
            ref={closeButtonRef}
            type="button"
            onClick={onClose}
            aria-label="닫기"
            className="flex size-[26px] shrink-0 items-center justify-center cursor-pointer"
          >
            <X className="size-[26px] text-main" />
          </button>
        </div>

        <button
          type="button"
          onClick={handleKakaoShare}
          className="mt-[41px] inline-flex items-center gap-4 text-left cursor-pointer"
        >
          <img src={kakaoShareIcon} alt="" aria-hidden="true" className="size-[42px] shrink-0" />
          <span className="typo-body-md-bold text-main">카카오톡으로 공유</span>
        </button>

        <button
          type="button"
          onClick={handleCopyUrl}
          className="mt-5 inline-flex items-center gap-4 text-left cursor-pointer"
        >
          <img src={urlCopyIcon} alt="" aria-hidden="true" className="size-10 shrink-0" />
          <span className="typo-body-md-bold text-main">URL 복사</span>
        </button>

        <div aria-live="polite" className="mt-3 text-center typo-body-xs-regular">
          {errorMessage && <p className="text-error">{errorMessage}</p>}
          {!errorMessage && copied && <p className="text-faint">URL이 복사되었습니다</p>}
        </div>
      </div>
    </div>
  );

  return createPortal(sheet, document.body);
}
