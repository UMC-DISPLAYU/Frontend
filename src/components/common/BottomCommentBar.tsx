import { type ChangeEvent, type KeyboardEvent, useRef, useState } from 'react';

import { Check, X } from 'lucide-react';

import galleryIcon from '@/assets/common/GalleryIcon.svg';
import sendIcon from '@/assets/common/SendIcon.svg';
import { LoginConfirmModal } from '@/components/common/LoginConfirmModal';
import { useImageUpload } from '@/hooks/useImageUpload';
import { useAuthStore } from '@/stores/authStore';
import { cn } from '@/utils/cn';
import { readImageDimensions } from '@/utils/image';

export type BottomCommentBarImage = { imageUrl: string; width: number; height: number };

type Props = {
  placeholder?: string;
  /* 업로드가 끝난 이미지와 함께 입력한 내용을 전달합니다. */
  onSubmit: (payload: {
    content: string;
    images: BottomCommentBarImage[];
    isPrivate: boolean;
  }) => void;
  isSubmitting?: boolean;
  /* 이미지 업로드 도메인. 지정하지 않으면 이미지 첨부 없이 텍스트만 입력받습니다. */
  imageDomain?: string;
  maxImages?: number;
  /* 답글 모드일 때 대상 작성자 닉네임. 넘기면 입력창 위에 안내 줄이 표시됩니다. */
  replyingTo?: string;
  onCancelReply?: () => void;
  /* 작품 방명록의 질문 탭처럼 비공개로 남길 수 있는 화면에서 사용합니다. */
  showPrivateOption?: boolean;
  className?: string;
};

export function BottomCommentBar({
  placeholder = '글을 입력하세요.',
  onSubmit,
  isSubmitting = false,
  imageDomain,
  maxImages = 3,
  replyingTo,
  onCancelReply,
  showPrivateOption = false,
  className = '',
}: Props) {
  const accessToken = useAuthStore((state) => state.accessToken);
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [content, setContent] = useState('');
  const [isPrivate, setIsPrivate] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { images, addImages, removeImage, clearImages, uploadImages, isUploading } = useImageUpload(
    {
      domain: imageDomain,
      maxImages,
    },
  );

  const isBusy = isSubmitting || isUploading;
  const canSubmit = (content.trim().length > 0 || images.length > 0) && !isBusy;

  const pickImages = (event: ChangeEvent<HTMLInputElement>) => {
    if (event.target.files?.length) addImages(event.target.files);
    // 같은 파일을 다시 선택할 수 있도록 값을 비웁니다.
    event.target.value = '';
  };

  const submit = async () => {
    if (!accessToken) {
      setIsLoginModalOpen(true);
      return;
    }

    if (!canSubmit) return;

    try {
      const dimensions =
        images.length > 0
          ? await Promise.all(images.map((image) => readImageDimensions(image.file)))
          : [];
      const imageUrls = images.length > 0 ? await uploadImages() : [];
      const submitImages: BottomCommentBarImage[] = imageUrls.map((imageUrl, index) => ({
        imageUrl,
        width: dimensions[index].width,
        height: dimensions[index].height,
      }));

      onSubmit({ content: content.trim(), images: submitImages, isPrivate });
      setContent('');
      setIsPrivate(false);
      clearImages();
    } catch {
      /* 업로드 실패 시 입력 내용을 유지합니다. */
    }
  };

  const handleKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key !== 'Enter' || event.nativeEvent.isComposing) return;
    event.preventDefault();
    submit();
  };

  const inputRow = (
    <>
      {showPrivateOption && (
        <button
          type="button"
          onClick={() => setIsPrivate((prev) => !prev)}
          aria-pressed={isPrivate}
          className="flex shrink-0 cursor-pointer items-center gap-1.5 text-hint hover:text-main"
        >
          <span
            className={cn(
              'flex size-4 items-center justify-center rounded border border-hint transition-colors',
              isPrivate && 'border-main bg-main text-white',
            )}
          >
            {isPrivate && <Check size={12} strokeWidth={3} />}
          </span>
          <span className="typo-body-xs-regular text-hint">비공개</span>
        </button>
      )}

      <input
        value={content}
        onFocus={(e) => {
          if (!accessToken) {
            e.target.blur();
            setIsLoginModalOpen(true);
          }
        }}
        onChange={(e) => setContent(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder={placeholder}
        className="typo-body-sm-regular min-w-0 flex-1 bg-transparent text-main outline-none placeholder:text-faint"
      />

      {imageDomain && (
        <>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            multiple
            onChange={pickImages}
            className="hidden"
          />
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            disabled={images.length >= maxImages || isBusy}
            aria-label="이미지 첨부"
            className="shrink-0 cursor-pointer"
          >
            <img src={galleryIcon} alt="" className="size-[22px] shrink-0" />
          </button>
        </>
      )}
      <button
        type="button"
        onClick={submit}
        disabled={!canSubmit}
        aria-label="등록"
        className="shrink-0 cursor-pointer"
      >
        <img src={sendIcon} alt="" className="size-[22px] shrink-0" />
      </button>
    </>
  );

  return (
    <div
      className={cn(
        'fixed bottom-0 left-1/2 z-50 w-full max-w-md -translate-x-1/2 bg-card px-5 pt-3 pb-[calc(env(safe-area-inset-bottom)+32px)] shadow-[0px_-4px_18px_0px_rgba(4,0,250,0.06)]',
        className,
      )}
    >
      <LoginConfirmModal isOpen={isLoginModalOpen} onClose={() => setIsLoginModalOpen(false)} />
      {replyingTo && (
        <div className="-mx-5 mb-3 flex items-center justify-between gap-2 border-b border-line-soft px-5 pb-3">
          <span className="typo-body-xs-regular truncate text-hint">
            {replyingTo}님에게 답글 남기는 중
          </span>
          <button
            type="button"
            onClick={onCancelReply}
            aria-label="답글 취소"
            className="shrink-0 cursor-pointer text-hint"
          >
            <X size={16} strokeWidth={1.5} />
          </button>
        </div>
      )}

      {images.length > 0 ? (
        <div className="flex flex-col items-start gap-2.5 rounded-xl bg-[#D7D7DF] p-3">
          <div className="flex w-full items-center gap-2">
            {images.map((image) => (
              <div key={image.id} className="relative size-16 shrink-0">
                <img src={image.previewUrl} alt="" className="size-16 rounded-lg object-cover" />
                <button
                  type="button"
                  onClick={() => removeImage(image.id)}
                  aria-label="이미지 삭제"
                  className="absolute -top-1.5 -right-1.5 grid size-5 place-items-center rounded-full bg-main"
                >
                  <X size={12} className="text-white" strokeWidth={2.5} />
                </button>
              </div>
            ))}
          </div>
          <div className="flex w-full items-center gap-2">{inputRow}</div>
        </div>
      ) : (
        <div className="flex items-center gap-2 rounded-xl bg-box200 p-3">{inputRow}</div>
      )}
    </div>
  );
}
