import { useCallback, useRef } from 'react';

import type { ImageUploadItem } from '@/hooks/useImageUpload';

interface ImageUploaderProps {
  images: ImageUploadItem[];
  maxImages?: number;
  onAddImages: (files: FileList | File[]) => void;
  onRemoveImage: (id: string) => void;
}

export function ImageUploader({
  images,
  maxImages = 4,
  onAddImages,
  onRemoveImage,
}: ImageUploaderProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImageClick = useCallback(() => {
    if (images.length < maxImages) {
      fileInputRef.current?.click();
    }
  }, [images.length, maxImages]);

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
    <div className="mt-2 flex gap-2 flex-wrap">
      {images.map((image, index) => (
        <div
          key={image.id}
          className="relative size-24 bg-card rounded-xl outline outline-1 outline-offset-[-1px] outline-line overflow-hidden"
        >
          <img
            src={image.previewUrl}
            alt={`업로드된 이미지 ${index + 1}`}
            className="w-full h-full object-cover"
          />
          <button
            type="button"
            onClick={() => onRemoveImage(image.id)}
            className="absolute top-1 right-1 size-6 bg-black/60 rounded-full flex items-center justify-center hover:bg-black/80 transition-colors"
            aria-label={`이미지 ${index + 1} 삭제`}
          >
            <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
              <path d="M2 2l8 8M10 2l-8 8" stroke="white" strokeWidth="1.5" strokeLinecap="round" />
            </svg>
          </button>
        </div>
      ))}
      {images.length < maxImages && (
        <button
          type="button"
          onClick={handleImageClick}
          className="size-24 bg-card rounded-xl outline outline-1 outline-offset-[-1px] outline-line flex flex-col items-center justify-center gap-3"
          aria-label="이미지 업로드"
        >
          <div className="size-10 bg-box rounded-full flex items-center justify-center">
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
              <rect
                x="2.25"
                y="2.25"
                width="11.5"
                height="11.5"
                rx="2"
                stroke="#d4d4d4"
                strokeWidth="1.5"
              />
              <path
                d="M4.5 10.5l2.5-2.5 2 2 2.5-2.5 1.5 1.5"
                stroke="#d4d4d4"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <circle cx="6" cy="6" r="1" stroke="#d4d4d4" strokeWidth="1.5" />
            </svg>
          </div>
          <span className="text-main typo-body-xs-regular">
            {images.length}/{maxImages}
          </span>
        </button>
      )}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        multiple
        onChange={handleImageChange}
        className="hidden"
        aria-label="이미지 파일 선택"
      />
    </div>
  );
}
