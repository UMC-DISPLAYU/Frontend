import { type ChangeEvent, type KeyboardEvent, useEffect, useRef, useState } from 'react';

import { Check, CirclePlus, CircleX, X } from 'lucide-react';

import drawingIcon from '@/assets/comment/DrawingIcon.svg';
import galleryIcon from '@/assets/comment/GalleryIcon.svg';
import sendIcon from '@/assets/comment/SendIcon.svg';
import { DrawingModal } from '@/components/common/DrawingModal';
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
  const [isAttachMenuOpen, setIsAttachMenuOpen] = useState(false);
  const [isDrawingOpen, setIsDrawingOpen] = useState(false);
  const [isDrawingSubmitting, setIsDrawingSubmitting] = useState(false);
  const [content, setContent] = useState('');
  const [isPrivate, setIsPrivate] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const attachMenuRef = useRef<HTMLDivElement>(null);
  const attachButtonRef = useRef<HTMLButtonElement>(null);

  const { images, addImages, removeImage, clearImages, uploadImages, uploadImage, isUploading } =
    useImageUpload({
      domain: imageDomain,
      maxImages,
    });

  const isBusy = isSubmitting || isUploading || isDrawingSubmitting;
  const canSubmit = (content.trim().length > 0 || images.length > 0) && !isBusy;

  /* 답글달기를 누르면 입력창에 바로 포커스를 줘서 이어서 타이핑할 수 있게 합니다. */
  useEffect(() => {
    if (replyingTo) {
      inputRef.current?.focus();
    }
  }, [replyingTo]);

  /* 팝오버 메뉴 외부 클릭 시 닫기 */
  useEffect(() => {
    if (!isAttachMenuOpen) return;

    const handlePointerDownOutside = (e: PointerEvent) => {
      const target = e.target as Node;
      if (
        attachMenuRef.current &&
        !attachMenuRef.current.contains(target) &&
        attachButtonRef.current &&
        !attachButtonRef.current.contains(target)
      ) {
        setIsAttachMenuOpen(false);
      }
    };

    document.addEventListener('pointerdown', handlePointerDownOutside);
    return () => {
      document.removeEventListener('pointerdown', handlePointerDownOutside);
    };
  }, [isAttachMenuOpen]);

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
      const files = images.map((image) => image.file).filter((file): file is File => Boolean(file));
      const dimensions =
        files.length > 0 ? await Promise.all(files.map((file) => readImageDimensions(file))) : [];
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

  /* 드로잉 캔버스에서 전송 버튼을 눌렀을 때 */
  const handleDrawingSubmit = async (file: File, dimensions: { width: number; height: number }) => {
    if (!accessToken) {
      setIsDrawingOpen(false);
      setIsLoginModalOpen(true);
      return;
    }

    if (!imageDomain) return;

    setIsDrawingSubmitting(true);
    try {
      const uploadedUrl = await uploadImage(file, { domain: imageDomain });
      const submitImages: BottomCommentBarImage[] = [
        {
          imageUrl: uploadedUrl,
          width: dimensions.width,
          height: dimensions.height,
        },
      ];

      onSubmit({ content: content.trim(), images: submitImages, isPrivate });
      setContent('');
      setIsPrivate(false);
      clearImages();
      setIsDrawingOpen(false);
    } catch {
      /* 업로드 실패 시 드로잉 모달 유지 */
    } finally {
      setIsDrawingSubmitting(false);
    }
  };

  const handleAttachButtonClick = () => {
    if (!accessToken) {
      setIsLoginModalOpen(true);
      return;
    }
    setIsAttachMenuOpen((prev) => !prev);
  };

  const handleSelectPhoto = () => {
    setIsAttachMenuOpen(false);
    fileInputRef.current?.click();
  };

  const handleSelectDrawing = () => {
    setIsAttachMenuOpen(false);
    if (!accessToken) {
      setIsLoginModalOpen(true);
      return;
    }
    setIsDrawingOpen(true);
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
        ref={inputRef}
        value={content}
        onFocus={(e) => {
          if (!accessToken) {
            e.target.blur();
            setIsLoginModalOpen(true);
            onCancelReply?.();
          }
        }}
        onChange={(e) => setContent(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder={placeholder}
        className="typo-body-sm-regular min-w-0 flex-1 bg-transparent text-main outline-none placeholder:text-faint"
      />

      {imageDomain && (
        <div className="relative shrink-0 flex items-center">
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            multiple
            onChange={pickImages}
            className="hidden"
          />

          {/* 사진 / 그리기 선택 팝오버 메뉴 */}
          {isAttachMenuOpen && (
            <div
              ref={attachMenuRef}
              className="absolute bottom-full right-0 mb-3 w-22 h-24 rounded-[20px] bg-white/85 backdrop-blur-[10px] shadow-[2px_8px_18px_0px_rgba(4,0,250,0.06),inset_-3px_-3px_3px_-2px_rgba(241,241,241,0.60),inset_4px_4px_3px_-2px_rgba(255,255,255,1.00)] border border-white/60 flex flex-col items-center justify-center gap-4 z-30 animate-in fade-in zoom-in-95 duration-150 select-none"
            >
              <button
                type="button"
                onClick={handleSelectPhoto}
                className="w-16 flex items-center justify-start gap-2 hover:opacity-75 active:scale-95 transition-all cursor-pointer whitespace-nowrap"
              >
                <img src={galleryIcon} alt="" className="size-5 shrink-0 object-contain" />
                <span className="typo-body-md-regular text-main whitespace-nowrap">사진</span>
              </button>

              <button
                type="button"
                onClick={handleSelectDrawing}
                className="w-16 flex items-center justify-start gap-2 hover:opacity-75 active:scale-95 transition-all cursor-pointer whitespace-nowrap"
              >
                <img src={drawingIcon} alt="" className="size-4 shrink-0 object-contain" />
                <span className="typo-body-md-regular text-main whitespace-nowrap">그리기</span>
              </button>
            </div>
          )}

          <button
            ref={attachButtonRef}
            type="button"
            onClick={handleAttachButtonClick}
            disabled={images.length >= maxImages || isBusy}
            aria-label="첨부 메뉴 열기"
            aria-expanded={isAttachMenuOpen}
            className="shrink-0 cursor-pointer"
          >
            {isAttachMenuOpen ? (
              <CircleX size={20} className="text-main shrink-0" strokeWidth={2.5} />
            ) : (
              <CirclePlus size={20} className="text-main shrink-0" strokeWidth={2.5} />
            )}
          </button>
        </div>
      )}
      <button
        type="button"
        onClick={submit}
        disabled={!canSubmit}
        aria-label="등록"
        className="shrink-0 cursor-pointer"
      >
        <img src={sendIcon} alt="" className="size-6 shrink-0" />
      </button>
    </>
  );

  return (
    <>
      <div
        className={cn(
          'fixed bottom-0 left-1/2 z-50 w-full max-w-md -translate-x-1/2 border-t border-line bg-card shadow-[0px_-2px_8px_0px_rgba(4,0,250,0.03)]',
          className,
        )}
      >
        <LoginConfirmModal isOpen={isLoginModalOpen} onClose={() => setIsLoginModalOpen(false)} />
        <div className="px-5 pt-4 pb-safe-bottom">
          {replyingTo && (
            <div className="-mx-5 mb-3 flex items-center gap-2 px-5 pb-2">
              <span className="typo-body-xs-regular text-hint">
                <span className="typo-body-xs-bold">{replyingTo}</span>에게 답글 작성 중
              </span>
              <button
                type="button"
                onClick={onCancelReply}
                aria-label="답글 취소"
                className="typo-body-xs-regular text-faint cursor-pointer"
              >
                취소
              </button>
            </div>
          )}

          {images.length > 0 ? (
            <div className="flex flex-col items-start gap-2.5 rounded-xl bg-[#D7D7DF] p-3">
              <div className="flex w-full items-center gap-2">
                {images.map((image) => (
                  <div key={image.id} className="relative size-16 shrink-0">
                    <img
                      src={image.previewUrl}
                      alt=""
                      className="size-16 rounded-lg object-cover"
                    />
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
      </div>

      {/* 손글씨 / 그림 그리기 모달 */}
      <DrawingModal
        isOpen={isDrawingOpen}
        onClose={() => setIsDrawingOpen(false)}
        onSubmit={handleDrawingSubmit}
        isSubmitting={isDrawingSubmitting}
      />
    </>
  );
}
