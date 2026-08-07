import { useCallback, useEffect, useRef, useState } from 'react';

import { Image, Loader2, SendHorizontal, X } from 'lucide-react';

import { AlertModal } from '@/components/ui';
import { useUploadImage } from '@/hooks/queries/useFile';
import { useLoginRequiredModal } from '@/hooks/usePermissionRequiredModal';
import { useLoungeCommentPolicy } from '@/hooks/usePolicy';
import { getErrorMessage } from '@/utils/error';
import { hasPermission } from '@/utils/hasPermission';

const MAX_IMAGES = 5;

type UploadItem = {
  id: string;
  previewUrl: string;
  status: 'uploading' | 'done';
  uploadedUrl?: string;
};

type ReplyTarget = {
  commentId: number;
  author: string;
};

type Props = {
  replyTarget: ReplyTarget | null;
  onCancelReply: () => void;
  onSubmitComment: (content: string, imageUrls: string[]) => Promise<unknown>;
  onSubmitReply: (commentId: number, content: string, imageUrls: string[]) => Promise<unknown>;
  imageUploadDomain: string;
};

export function CommentInputBar({
  replyTarget,
  onCancelReply,
  onSubmitComment,
  onSubmitReply,
  imageUploadDomain,
}: Props) {
  const { loginModal, openLoginModal } = useLoginRequiredModal();
  const loungeCommentPolicy = useLoungeCommentPolicy();
  const [text, setText] = useState('');
  const [images, setImages] = useState<UploadItem[]>([]);
  const [showMaxWarning, setShowMaxWarning] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const imagesRef = useRef(images);
  const uploadImage = useUploadImage();

  useEffect(() => {
    imagesRef.current = images;
  }, [images]);

  useEffect(() => {
    return () => {
      imagesRef.current.forEach(({ previewUrl }) => URL.revokeObjectURL(previewUrl));
    };
  }, []);

  const replyKey = replyTarget?.commentId ?? null;
  const [prevReplyKey, setPrevReplyKey] = useState(replyKey);
  if (replyKey !== prevReplyKey) {
    setPrevReplyKey(replyKey);
    setText('');
    setImages([]);
  }

  useEffect(() => {
    return () => {
      imagesRef.current.forEach(({ previewUrl }) => URL.revokeObjectURL(previewUrl));
    };
  }, [replyKey]);

  useEffect(() => {
    if (replyTarget) {
      inputRef.current?.focus();
    }
  }, [replyTarget]);

  const isUploading = images.some((item) => item.status === 'uploading');
  const canCreateComment = hasPermission(loungeCommentPolicy, 'create');

  const uploadFile = useCallback(
    async (id: string, file: File) => {
      try {
        const uploadedUrl = await uploadImage.mutateAsync({ file, domain: imageUploadDomain });
        setImages((prev) =>
          prev.map((item) => (item.id === id ? { ...item, status: 'done', uploadedUrl } : item)),
        );
      } catch (error) {
        const stillExists = imagesRef.current.some((item) => item.id === id);
        if (!stillExists) return;

        const message = getErrorMessage(error, '이미지 업로드에 실패했습니다.');
        setUploadError(message);
        setImages((prev) => {
          const target = prev.find((item) => item.id === id);
          if (target) URL.revokeObjectURL(target.previewUrl);
          return prev.filter((item) => item.id !== id);
        });
      }
    },
    [uploadImage, imageUploadDomain],
  );

  const handleFileChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const files = e.target.files;
      if (!files) return;

      const remainingSlots = MAX_IMAGES - imagesRef.current.length;
      const selectedFiles = Array.from(files);
      if (selectedFiles.length > remainingSlots) {
        setShowMaxWarning(true);
      }
      const filesToAdd = selectedFiles.slice(0, remainingSlots);

      const newItems = filesToAdd.map((file) => ({
        id: crypto.randomUUID(),
        file,
        previewUrl: URL.createObjectURL(file),
        status: 'uploading' as const,
      }));

      setImages((prev) => [
        ...prev,
        ...newItems.map(({ id, previewUrl, status }) => ({ id, previewUrl, status })),
      ]);
      newItems.forEach((item) => uploadFile(item.id, item.file));

      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    },
    [uploadFile],
  );

  const handleRemoveImage = useCallback((id: string) => {
    setImages((prev) => {
      const target = prev.find((item) => item.id === id);
      if (target) URL.revokeObjectURL(target.previewUrl);
      return prev.filter((item) => item.id !== id);
    });
  }, []);

  const handleSubmit = async (e?: React.FormEvent) => {
    e?.preventDefault();
    const trimmed = text.trim();
    if (!trimmed || isUploading || isSubmitting) return;
    if (!canCreateComment) {
      openLoginModal();
      return;
    }

    const imageUrls = images
      .filter((item) => item.status === 'done')
      .map((item) => item.uploadedUrl as string);

    setIsSubmitting(true);
    try {
      if (replyTarget) {
        await onSubmitReply(replyTarget.commentId, trimmed, imageUrls);
      } else {
        await onSubmitComment(trimmed, imageUrls);
      }
      setText('');
      imagesRef.current.forEach(({ previewUrl }) => URL.revokeObjectURL(previewUrl));
      setImages([]);
    } catch (error) {
      setSubmitError(getErrorMessage(error, '등록에 실패했습니다.'));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <div className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-md bg-page border-t border-line shadow-[0px_-4px_18px_0px_rgba(4,0,250,0.06)] z-50">
        {replyTarget && (
          <div className="flex items-center gap-2 pt-[10px] pl-5">
            <span className="text-[12px] leading-[140%] tracking-[-0.36px]">
              <span className="font-bold text-[#555]">{replyTarget.author}</span>
              <span className="font-normal text-[#555]">에게 답글 작성 중</span>
            </span>
            <button
              type="button"
              onClick={onCancelReply}
              className="text-center text-[11px] leading-[150%] tracking-[-0.3px] text-[#9D9D9D]"
            >
              취소
            </button>
          </div>
        )}

        <div className="px-5 py-4">
          <form
            onSubmit={handleSubmit}
            className={
              images.length > 0
                ? 'w-full p-3 bg-box200 rounded-xl flex flex-col items-start gap-2.5'
                : 'w-full h-11 px-3 bg-box200 rounded-xl flex items-center justify-between gap-2'
            }
          >
            {images.length > 0 && (
              <div className="w-full flex items-center gap-2 overflow-x-auto scrollbar-none">
                {images.map((item) => (
                  <div key={item.id} className="relative size-16 shrink-0">
                    <div className="size-16 rounded-lg overflow-hidden">
                      <img
                        src={item.previewUrl}
                        alt="첨부 이미지"
                        className="w-full h-full object-cover"
                      />
                      {item.status === 'uploading' && (
                        <div className="absolute inset-0 flex items-center justify-center rounded-lg bg-black/40">
                          <Loader2
                            className="size-4 animate-spin text-white"
                            aria-label="업로드 중"
                          />
                        </div>
                      )}
                    </div>
                    <button
                      type="button"
                      onClick={() => handleRemoveImage(item.id)}
                      className="absolute top-0.5 right-0.5 size-4 bg-black/60 rounded-full flex items-center justify-center"
                      aria-label="이미지 삭제"
                    >
                      <X size={10} className="text-white" />
                    </button>
                  </div>
                ))}
              </div>
            )}

            <div className="w-full h-11 flex items-center justify-between gap-2">
              <input
                ref={inputRef}
                type="text"
                value={text}
                onChange={(e) => setText(e.target.value)}
                placeholder={replyTarget ? `${replyTarget.author}에게 답글...` : '글을 입력하세요.'}
                className="flex-1 min-w-0 typo-body-sm-regular text-main placeholder:text-faint bg-transparent border-none outline-none"
              />

              <div className="flex items-center gap-2 shrink-0">
                <label className="cursor-pointer text-hint hover:text-main transition-colors">
                  <Image size={20} />
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={handleFileChange}
                    className="hidden"
                    aria-label="이미지 파일 선택"
                  />
                </label>

                <button
                  type="submit"
                  disabled={!text.trim() || isUploading || isSubmitting}
                  className="text-hint hover:text-main disabled:opacity-40 disabled:hover:text-hint cursor-pointer transition-colors"
                  aria-label="댓글 등록"
                >
                  <SendHorizontal size={20} />
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>

      {showMaxWarning && (
        <AlertModal
          message={`이미지는 최대 ${MAX_IMAGES}장까지 첨부할 수 있어요.`}
          onConfirm={() => setShowMaxWarning(false)}
        />
      )}
      {uploadError && <AlertModal message={uploadError} onConfirm={() => setUploadError(null)} />}
      {submitError && <AlertModal message={submitError} onConfirm={() => setSubmitError(null)} />}
      {loginModal}
    </>
  );
}
