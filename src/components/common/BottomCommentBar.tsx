import { type ChangeEvent, type KeyboardEvent, useEffect, useRef, useState } from 'react';

import arrowUpIcon from '@/assets/comment/ArrowUpIcon.svg';
import closeIcon from '@/assets/comment/CloseIcon.svg';
import imageIcon from '@/assets/comment/ImageIcon.svg';
import pencilIcon from '@/assets/comment/PencilIcon.svg';
import { DrawingModal } from '@/components/common/DrawingModal';
import { useImageUpload } from '@/hooks/useImageUpload';
import { useLoginRequiredModal } from '@/hooks/usePermissionRequiredModal';
import { useBottomObstruction, useIsKeyboardOpen } from '@/hooks/useVirtualKeyboard';
import { useAuthStore } from '@/stores/authStore';
import { cn } from '@/utils/cn';
import { getErrorMessage } from '@/utils/error';
import { readImageDimensions } from '@/utils/image';

export type BottomCommentBarImage = { imageUrl: string; width: number; height: number };

type Props = {
  placeholder?: string;
  /* 저장 완료까지 기다립니다. 권한 확인 등으로 저장하지 않았다면 false를 반환합니다. */
  onSubmit: (payload: {
    content: string;
    images: BottomCommentBarImage[];
  }) => Promise<void | boolean>;
  isSubmitting?: boolean;
  /* 이미지 업로드 도메인. 지정하지 않으면 이미지 첨부 없이 텍스트만 입력받습니다. */
  imageDomain?: string;
  maxImages?: number;
  /* 답글 모드일 때 대상 작성자 닉네임. 넘기면 입력창 위에 안내 줄이 표시됩니다. */
  replyingTo?: string;
  onCancelReply?: () => void;
  /**
   * legacy(기본값): max-w-md 페이지용. 화면 아래 가운데에 고정된다
   * page: 반응형 페이지용. 900px 미만은 화면 전체 폭 하단 고정, 이상은 놓인 자리에 그대로 표시된다
   */
  placement?: 'legacy' | 'page';
  className?: string;
};

// 한 줄일 때 48px 입력칸을 채우는 높이(하단 여백 4 제외)와, 4줄까지 늘어나는 최대 높이
const TEXTAREA_MIN_HEIGHT = 44;
const TEXTAREA_MAX_HEIGHT = 114;

const TOOL_BUTTON_CLASS =
  'relative grid size-10 shrink-0 cursor-pointer place-items-center rounded-8 before:absolute before:-inset-0.5 transition duration-fast ease-standard hover:bg-tertiary active:scale-94 disabled:pointer-events-none disabled:opacity-40';

export function BottomCommentBar({
  placeholder = '글을 입력하세요.',
  onSubmit,
  isSubmitting = false,
  imageDomain,
  maxImages = 3,
  replyingTo,
  onCancelReply,
  placement = 'legacy',
  className = '',
}: Props) {
  const accessToken = useAuthStore((state) => state.accessToken);
  const { loginModal, openLoginModal } = useLoginRequiredModal();
  const [isDrawingOpen, setIsDrawingOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [submitError, setSubmitError] = useState('');
  const [content, setContent] = useState('');

  const fileInputRef = useRef<HTMLInputElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const submittingRef = useRef(false);
  const barRef = useRef<HTMLDivElement>(null);

  const barHeight = useBottomObstruction(barRef);
  const isKeyboardOpen = useIsKeyboardOpen();

  const { images, addImages, removeImage, clearImages, uploadImages, uploadImage, isUploading } =
    useImageUpload({
      domain: imageDomain,
      maxImages,
    });

  const isPagePlacement = placement === 'page';
  const isBusy = isSubmitting || isUploading || isSaving;
  const hasDraft = content.trim().length > 0 || images.length > 0;
  const canSubmit = hasDraft && !isBusy;

  /* 답글달기를 누르면 입력창에 바로 포커스를 줘서 이어서 타이핑할 수 있게 합니다. */
  useEffect(() => {
    if (replyingTo) {
      inputRef.current?.focus();
    }
  }, [replyingTo]);

  useEffect(() => {
    const textarea = inputRef.current;
    if (!textarea) return;
    textarea.style.height = '0';
    textarea.style.height = `${Math.min(
      Math.max(textarea.scrollHeight, TEXTAREA_MIN_HEIGHT),
      TEXTAREA_MAX_HEIGHT,
    )}px`;
  }, [content]);

  const pickImages = (event: ChangeEvent<HTMLInputElement>) => {
    if (!submittingRef.current && event.target.files?.length) addImages(event.target.files);
    // 같은 파일을 다시 선택할 수 있도록 값을 비웁니다.
    event.target.value = '';
  };

  const submit = async () => {
    if (!accessToken) {
      openLoginModal();
      return;
    }

    if (!canSubmit || submittingRef.current) return;
    submittingRef.current = true;
    setIsSaving(true);
    setSubmitError('');

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

      if ((await onSubmit({ content: content.trim(), images: submitImages })) === false) return;
      setContent('');
      clearImages();
    } catch (error) {
      setSubmitError(
        getErrorMessage(error, '등록하지 못했어요. 작성 내용을 확인하고 다시 시도해주세요.'),
      );
    } finally {
      submittingRef.current = false;
      setIsSaving(false);
    }
  };

  const handleKeyDown = (event: KeyboardEvent<HTMLTextAreaElement>) => {
    // 여러 줄 입력이라 Enter는 줄바꿈으로 두고, Ctrl·Cmd+Enter로 보낸다
    if (event.key !== 'Enter' || !(event.metaKey || event.ctrlKey)) return;
    if (event.nativeEvent.isComposing) return;
    event.preventDefault();
    void submit();
  };

  /* 그림은 글·사진과 섞지 않고 단독으로 바로 올립니다. */
  const handleDrawingSubmit = async (file: File, dimensions: { width: number; height: number }) => {
    if (!accessToken) {
      openLoginModal();
      return;
    }

    if (!imageDomain || isBusy || submittingRef.current) return;

    submittingRef.current = true;
    setIsSaving(true);
    setSubmitError('');
    try {
      const uploadedUrl = await uploadImage(file, { domain: imageDomain });
      const submitImages: BottomCommentBarImage[] = [
        {
          imageUrl: uploadedUrl,
          width: dimensions.width,
          height: dimensions.height,
        },
      ];

      if ((await onSubmit({ content: '', images: submitImages })) === false) return;
      clearImages();
      setIsDrawingOpen(false);
    } catch (error) {
      setSubmitError(getErrorMessage(error, '그림을 등록하지 못했어요. 다시 시도해주세요.'));
    } finally {
      submittingRef.current = false;
      setIsSaving(false);
    }
  };

  const handlePickPhoto = () => {
    if (!accessToken) {
      openLoginModal();
      return;
    }
    fileInputRef.current?.click();
  };

  const handleOpenDrawing = () => {
    if (!accessToken) {
      openLoginModal();
      return;
    }
    setIsDrawingOpen(true);
  };

  return (
    <>
      {isPagePlacement && (
        <div aria-hidden className="shrink-0 desktop:hidden" style={{ height: barHeight }} />
      )}
      <div
        ref={barRef}
        className={cn(
          'fixed bottom-keyboard-inset z-50 border-t border-bg-secondary bg-primary-white',
          isPagePlacement
            ? 'inset-x-0 desktop:static desktop:mt-3 desktop:border-0 desktop:bg-transparent'
            : 'left-1/2 w-full max-w-md -translate-x-1/2',
          className,
        )}
      >
        {loginModal}
        <div
          className={cn(
            'pt-4',
            // 키보드가 열리면 홈 인디케이터가 가려지므로 safe area 대신 기본 여백만 둔다
            isKeyboardOpen ? 'pb-4' : 'pb-safe-area-bottom',
            isPagePlacement ? 'px-gutter desktop:p-0' : 'px-5',
          )}
        >
          {replyingTo && (
            <div className="mb-3 flex items-center gap-2">
              <span className="typography-body-md-medium text-secondary">
                <span className="typography-body-md-semibold">{replyingTo}</span>에게 답글 작성 중
              </span>
              <button
                type="button"
                onClick={onCancelReply}
                disabled={isBusy}
                aria-label="답글 취소"
                className="typography-body-md-medium cursor-pointer text-tertiary"
              >
                취소
              </button>
            </div>
          )}

          <div className="flex flex-col overflow-hidden rounded-12 bg-secondary focus-within:outline-2 focus-within:outline-offset-1 focus-within:outline-focus">
            {images.length > 0 && (
              <div className="flex gap-2 px-3 pt-3">
                {images.map((image) => (
                  <div
                    key={image.id}
                    className="relative h-20 w-16 shrink-0 animate-fade-in overflow-hidden rounded-8"
                  >
                    <img src={image.previewUrl} alt="" className="size-full object-cover" />
                    <button
                      type="button"
                      onClick={() => removeImage(image.id)}
                      disabled={isBusy}
                      aria-label="이미지 삭제"
                      className="absolute top-1 right-1 grid size-5 cursor-pointer place-items-center rounded-circle bg-interactive-primary before:absolute before:-inset-3"
                    >
                      <img src={closeIcon} alt="" />
                    </button>
                  </div>
                ))}
              </div>
            )}

            <div className="flex items-end pr-1 pb-1 pl-4">
              <textarea
                ref={inputRef}
                rows={1}
                value={content}
                disabled={isBusy}
                aria-label="글 입력"
                onFocus={(event) => {
                  if (!accessToken) {
                    event.target.blur();
                    openLoginModal();
                    onCancelReply?.();
                  }
                }}
                onChange={(event) => setContent(event.target.value)}
                onKeyDown={handleKeyDown}
                placeholder={placeholder}
                className="typography-body-xl-regular min-w-0 flex-1 resize-none overflow-y-auto bg-transparent pt-3 pb-2 text-primary outline-none [scrollbar-width:none] placeholder:text-tertiary [&::-webkit-scrollbar]:hidden"
              />

              {imageDomain && (
                <div className="flex shrink-0">
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    multiple
                    disabled={isBusy}
                    onChange={pickImages}
                    className="hidden"
                  />
                  {/* 그림은 단독으로만 올리므로 글이나 사진이 있으면 연필을 숨긴다 */}
                  {!hasDraft && (
                    <button
                      type="button"
                      onClick={handleOpenDrawing}
                      disabled={isBusy}
                      aria-label="그림 그리기"
                      className={TOOL_BUTTON_CLASS}
                    >
                      <img src={pencilIcon} alt="" />
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={handlePickPhoto}
                    disabled={images.length >= maxImages || isBusy}
                    aria-label="사진 추가"
                    className={TOOL_BUTTON_CLASS}
                  >
                    <img src={imageIcon} alt="" />
                  </button>
                </div>
              )}

              {hasDraft && (
                <button
                  type="button"
                  onClick={submit}
                  disabled={!canSubmit}
                  aria-label="등록"
                  className="relative grid size-10 shrink-0 animate-fade-in cursor-pointer place-items-center before:absolute before:-inset-0.5 disabled:opacity-50"
                >
                  <span className="grid size-8 place-items-center rounded-circle bg-interactive-primary transition-transform duration-fast ease-standard active:scale-94">
                    <img src={arrowUpIcon} alt="" />
                  </span>
                </button>
              )}
            </div>
          </div>

          {submitError && !isDrawingOpen && (
            <p role="alert" className="typography-body-md-medium mt-2 text-error">
              {submitError}
            </p>
          )}
        </div>
      </div>

      {/* 그림 그리기 화면 */}
      <DrawingModal
        isOpen={isDrawingOpen}
        onClose={() => {
          if (!submittingRef.current) setIsDrawingOpen(false);
        }}
        onSubmit={handleDrawingSubmit}
        isSubmitting={isBusy}
        error={submitError}
      />
    </>
  );
}
