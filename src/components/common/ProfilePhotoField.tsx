import { type ChangeEvent, type ReactNode, useEffect, useRef, useState } from 'react';

import { OptimizedImage } from '@/components/common/OptimizedImage';
import { cn } from '@/utils/cn';

import { PhotoCropDialog, type PhotoShape } from './PhotoCropDialog';

const ACCEPT = 'image/jpeg,image/png,image/webp';

type ProfilePhotoFieldProps = {
  /** 원: 기본 프로필(80), 사각형: 작가 사진(116×132) */
  shape: PhotoShape;
  /** 저장된 주소 또는 새로 고른 사진의 미리보기 주소. 없으면 null */
  src: string | null;
  /** 원 모양에서 사진이 없을 때 보일 기본 프로필 */
  placeholder?: ReactNode;
  disabled?: boolean;
  /** 틀에 맞게 잘라 낸 사진. 삭제하면 null */
  onChange: (file: File | null) => void;
};

function PencilIcon() {
  return (
    <svg
      aria-hidden="true"
      fill="none"
      height="16"
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="2"
      viewBox="0 0 24 24"
      width="16"
    >
      <path d="m4 20 1-4L16.5 4.5a2 2 0 0 1 3 3L8 19z" />
      <path d="m14.5 6.5 3 3" />
    </svg>
  );
}

/** 프로필 사진. 사진이 있으면 눌렀을 때 사진 변경 · 삭제 메뉴, 없으면 바로 사진을 고른다 */
export function ProfilePhotoField({
  shape,
  src,
  placeholder,
  disabled,
  onChange,
}: ProfilePhotoFieldProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const rootRef = useRef<HTMLDivElement>(null);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [pickedFile, setPickedFile] = useState<File | null>(null);
  const isCircle = shape === 'circle';

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

  const badge = (
    <span
      className={cn(
        'absolute grid size-8 place-items-center rounded-circle border border-primary bg-primary-white text-primary transition-transform duration-fast ease-standard group-active:scale-94',
        isCircle ? '-right-1 -bottom-1' : 'right-2 bottom-2',
      )}
    >
      <PencilIcon />
    </span>
  );

  return (
    <div className={cn('relative mx-auto', isCircle ? 'size-20' : 'h-33 w-29')} ref={rootRef}>
      {src || isCircle ? (
        <button
          aria-expanded={src ? isMenuOpen : undefined}
          aria-haspopup={src ? 'menu' : undefined}
          aria-label={src ? '프로필 사진 편집' : '프로필 사진 등록'}
          className={cn(
            'group relative block size-full focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus',
            isCircle && 'rounded-circle',
          )}
          disabled={disabled}
          onClick={src ? () => setIsMenuOpen((prev) => !prev) : pick}
          type="button"
        >
          <span
            className={cn(
              'block size-full overflow-hidden bg-tertiary transition-transform duration-fast ease-standard group-active:scale-98',
              isCircle && 'rounded-circle',
            )}
          >
            {src ? (
              <OptimizedImage
                alt=""
                className="size-full object-cover"
                displayWidth={isCircle ? 160 : 232}
                src={src}
              />
            ) : (
              placeholder
            )}
          </span>
          {badge}
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
        shape={shape}
      />
    </div>
  );
}
