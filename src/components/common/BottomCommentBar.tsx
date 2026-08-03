import { type ChangeEvent, type KeyboardEvent, useRef, useState } from 'react';

import { ImageIcon, SendHorizontal, X } from 'lucide-react';

import { useImageUpload } from '@/hooks/useImageUpload';
import { cn } from '@/utils/cn';

type Props = {
  placeholder?: string;
  /* 업로드가 끝난 이미지 URL과 함께 입력한 내용을 전달합니다. */
  onSubmit: (payload: { content: string; imageUrls: string[] }) => void;
  isSubmitting?: boolean;
  /* 이미지 업로드 도메인. 지정하지 않으면 이미지 첨부 없이 텍스트만 입력받습니다. */
  imageDomain?: string;
  maxImages?: number;
  className?: string;
};

export function BottomCommentBar({
  placeholder = '글을 입력하세요.',
  onSubmit,
  isSubmitting = false,
  imageDomain,
  maxImages = 3,
  className = '',
}: Props) {
  const [content, setContent] = useState('');
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
    if (!canSubmit) return;

    try {
      const imageUrls = images.length > 0 ? await uploadImages() : [];

      onSubmit({ content: content.trim(), imageUrls });
      setContent('');
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

  return (
    <div
      className={cn(
        'fixed bottom-0 left-1/2 z-50 w-full max-w-md -translate-x-1/2 bg-card px-5 pt-3 pb-[calc(env(safe-area-inset-bottom)+0.75rem)]',
        className,
      )}
    >
      {images.length > 0 && (
        <ul className="mb-2 flex gap-2">
          {images.map((image) => (
            <li key={image.id} className="relative">
              <img
                src={image.previewUrl}
                alt=""
                className="size-14 rounded-lg object-cover outline -outline-offset-1 outline-line-soft"
              />
              <button
                type="button"
                onClick={() => removeImage(image.id)}
                aria-label="이미지 삭제"
                className="absolute -top-1.5 -right-1.5 grid size-5 place-items-center rounded-full bg-main"
              >
                <X size={12} className="text-white" strokeWidth={2.5} />
              </button>
            </li>
          ))}
        </ul>
      )}

      <div className="flex h-12 items-center gap-2 rounded-xl bg-box200 pr-4 pl-5">
        <input
          value={content}
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
              className="shrink-0 cursor-pointer text-main disabled:text-faint"
            >
              <ImageIcon size={20} strokeWidth={1.5} />
            </button>
          </>
        )}
        <button
          type="button"
          onClick={submit}
          disabled={!canSubmit}
          aria-label="등록"
          className="shrink-0 cursor-pointer text-main disabled:text-faint"
        >
          <SendHorizontal size={20} strokeWidth={1.5} />
        </button>
      </div>
    </div>
  );
}
