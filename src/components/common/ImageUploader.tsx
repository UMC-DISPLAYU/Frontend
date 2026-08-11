import { useCallback, useRef } from 'react';

import { Image, X } from 'lucide-react';

import type { ImageUploadItem } from '@/hooks/useImageUpload';
import { cn } from '@/utils/cn';

const DEFAULT_MAX_IMAGES = 4;

interface ImageUploaderProps {
  images: ImageUploadItem[];
  initialImages?: string[];
  maxImages?: number;
  /* 비어 있는 타일에 표시할 문구입니다. 생략하면 "현재 개수/최대 개수"를 보여줍니다. */
  emptyLabel?: string;
  /* 한 번에 여러 장을 고를 수 있게 할지 여부입니다. */
  multiple?: boolean;
  /* 스크롤 양 끝에서 이미지가 컨테이너 edge에 붙지 않게 여백을 둡니다. */
  padded?: boolean;
  className?: string;
  onAddImages: (files: FileList | File[]) => void;
  onRemoveImage: (id: string) => void;
  onRemoveInitialImage?: (url: string) => void;
}

export function ImageUploader({
  images,
  initialImages = [],
  maxImages = DEFAULT_MAX_IMAGES,
  emptyLabel,
  multiple = true,
  padded = false,
  className,
  onAddImages,
  onRemoveImage,
  onRemoveInitialImage,
}: ImageUploaderProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const totalImages = images.length + initialImages.length;

  const handleImageClick = useCallback(() => {
    if (totalImages < maxImages) {
      fileInputRef.current?.click();
    }
  }, [totalImages, maxImages]);

  const handleImageChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const files = e.target.files;
      if (!files) return;

      onAddImages(files);

      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    },
    [onAddImages],
  );

  return (
    <div
      className={cn(
        'mt-2 flex w-full gap-2 overflow-x-auto pb-1 scrollbar-none',
        padded && 'px-5',
        className,
      )}
    >
      {initialImages.map((url, index) => (
        <div
          key={url}
          className="relative size-24 shrink-0 overflow-hidden rounded-xl bg-card outline outline-1 outline-offset-[-1px] outline-line"
        >
          <img src={url} alt={`이미지 ${index + 1}`} className="h-full w-full object-cover" />
          <button
            type="button"
            onClick={() => onRemoveInitialImage?.(url)}
            className="absolute right-1 top-1 flex size-6 items-center justify-center rounded-full bg-black/60 transition-colors hover:bg-black/80"
            aria-label={`이미지 ${index + 1} 삭제`}
          >
            <X size={12} className="text-white" />
          </button>
        </div>
      ))}

      {images.map((image, index) => {
        const imageNumber = initialImages.length + index + 1;

        return (
          <div
            key={image.id}
            className="relative size-24 shrink-0 overflow-hidden rounded-xl bg-card outline outline-1 outline-offset-[-1px] outline-line"
          >
            <img
              src={image.previewUrl}
              alt={`이미지 ${imageNumber}`}
              className="h-full w-full object-cover"
            />
            <button
              type="button"
              onClick={() => onRemoveImage(image.id)}
              className="absolute right-1 top-1 flex size-6 items-center justify-center rounded-full bg-black/60 transition-colors hover:bg-black/80"
              aria-label={`이미지 ${imageNumber} 삭제`}
            >
              <X size={12} className="text-white" />
            </button>
          </div>
        );
      })}

      {totalImages < maxImages && (
        <button
          type="button"
          onClick={handleImageClick}
          className="flex size-24 shrink-0 flex-col items-center justify-center gap-3 rounded-xl bg-card outline outline-1 outline-offset-[-1px] outline-line"
          aria-label={emptyLabel ?? '이미지 업로드'}
        >
          <div className="flex size-10 items-center justify-center rounded-full bg-page">
            <Image size={16} className="text-input-border" />
          </div>
          <span className="typo-body-xs-regular text-main">
            {emptyLabel ?? `${totalImages}/${maxImages}`}
          </span>
        </button>
      )}

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        multiple={multiple}
        onChange={handleImageChange}
        className="hidden"
        aria-label="이미지 파일 선택"
      />
    </div>
  );
}
