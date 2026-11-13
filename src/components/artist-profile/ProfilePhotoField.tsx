import { type ChangeEvent, useEffect, useRef, useState } from 'react';

import { OptimizedImage } from '@/components/common/OptimizedImage';

import { PencilIcon } from './ArtistProfileIcons';
import { PhotoCropDialog } from './PhotoCropDialog';

const ACCEPT = 'image/jpeg,image/png,image/webp';

type ProfilePhotoFieldProps = {
  /** 저장된 주소 또는 새로 고른 사진의 미리보기 주소. 없으면 null */
  src: string | null;
  disabled?: boolean;
  /** 틀에 맞게 잘라 낸 사진. 삭제하면 null */
  onChange: (file: File | null) => void;
};

/** 작가 사진(116×132). 사진이 있으면 눌렀을 때 사진 변경 · 삭제 메뉴, 없으면 바로 사진을 고른다 */
export function ProfilePhotoField({ src, disabled, onChange }: ProfilePhotoFieldProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const rootRef = useRef<HTMLDivElement>(null);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [pickedFile, setPickedFile] = useState<File | null>(null);

  useEffect(() => {
    if (!isMenuOpen) return;
    const closeOnOutside = (event: MouseEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) setIsMenuOpen(false);
    };
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setIsMenuOpen(false);
    };
    document.addEventListener('click', closeOnOutside, true);
    document.addEventListener('keydown', closeOnEscape);
    return () => {
      document.removeEventListener('click', closeOnOutside, true);
      document.removeEventListener('keydown', closeOnEscape);
    };
  }, [isMenuOpen]);

  const pick = () => inputRef.current?.click();

  const handleFile = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    // 같은 사진을 다시 골라도 change 가 일어나게 비운다
    event.target.value = '';
    if (file) setPickedFile(file);
  };

  return (
    <div className="relative mx-auto h-33 w-29" ref={rootRef}>
      {src ? (
        <button
          aria-expanded={isMenuOpen}
          aria-haspopup="menu"
          aria-label="프로필 사진 편집"
          className="group relative block size-full focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus"
          disabled={disabled}
          onClick={() => setIsMenuOpen((prev) => !prev)}
          type="button"
        >
          <span className="block size-full overflow-hidden bg-tertiary transition-transform duration-fast ease-standard group-active:scale-98">
            <OptimizedImage
              alt=""
              className="size-full object-cover"
              displayWidth={232}
              src={src}
            />
          </span>
          <span className="absolute right-2 bottom-2 grid size-8 place-items-center rounded-circle border border-primary bg-primary-white text-primary transition-transform duration-fast ease-standard group-active:scale-94">
            <PencilIcon height="16" width="16" />
          </span>
        </button>
      ) : (
        <button
          aria-label="프로필 사진 등록"
          className="typography-body-md-medium flex size-full flex-col items-center justify-center gap-1 rounded-12 border border-primary bg-primary-white text-secondary transition-transform duration-fast ease-standard focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus active:scale-98"
          disabled={disabled}
          onClick={pick}
          type="button"
        >
          <svg
            aria-hidden="true"
            className="text-primary"
            fill="none"
            height="24"
            stroke="currentColor"
            strokeLinecap="round"
            strokeWidth="2"
            viewBox="0 0 24 24"
            width="24"
          >
            <path d="M12 5v14M5 12h14" />
          </svg>
          사진 추가
        </button>
      )}

      {isMenuOpen && (
        <div
          className="absolute top-[calc(100%+8px)] right-0 z-30 w-41 animate-fade-in rounded-12 border border-primary bg-primary-white py-1.5 shadow-lg"
          role="menu"
        >
          <button
            className="typography-body-lg-medium block h-11 w-full px-4 text-left text-primary hover:bg-secondary focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-focus"
            onClick={() => {
              setIsMenuOpen(false);
              pick();
            }}
            role="menuitem"
            type="button"
          >
            사진 변경
          </button>
          {/* 다시 올릴 수 있어서 확인창 없이 바로 지운다 */}
          <button
            className="typography-body-lg-medium block h-11 w-full px-4 text-left text-error hover:bg-secondary focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-focus"
            onClick={() => {
              setIsMenuOpen(false);
              onChange(null);
            }}
            role="menuitem"
            type="button"
          >
            삭제
          </button>
        </div>
      )}

      <input accept={ACCEPT} className="hidden" onChange={handleFile} ref={inputRef} type="file" />

      <PhotoCropDialog
        file={pickedFile}
        onCancel={() => setPickedFile(null)}
        onDone={(file) => {
          setPickedFile(null);
          onChange(file);
        }}
      />
    </div>
  );
}
