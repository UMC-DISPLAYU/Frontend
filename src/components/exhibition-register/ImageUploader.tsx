import { useCallback, useEffect, useRef, useState } from 'react';

import { Image, X } from 'lucide-react';

interface ImageUploaderProps {
  maxImages?: number;
  onImagesChange?: (images: string[]) => void;
  placeholderText?: string;
}

export function ImageUploader({ maxImages = 4, onImagesChange, placeholderText }: ImageUploaderProps) {
  const [imageUrls, setImageUrls] = useState<string[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    return () => {
      imageUrls.forEach((url) => URL.revokeObjectURL(url));
    };
  }, [imageUrls]);

  const handleImageClick = useCallback(() => {
    if (imageUrls.length < maxImages) {
      fileInputRef.current?.click();
    }
  }, [imageUrls.length, maxImages]);

  const handleImageChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const files = e.target.files;
      if (!files) return;

      const remainingSlots = maxImages - imageUrls.length;
      const filesToAdd = Math.min(files.length, remainingSlots);
      const newUrls = Array.from({ length: filesToAdd }, (_, i) => URL.createObjectURL(files[i]));

      setImageUrls((prev) => {
        const updated = [...prev, ...newUrls];
        onImagesChange?.(updated);
        return updated;
      });

      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    },
    [imageUrls.length, maxImages, onImagesChange],
  );

  const handleRemoveImage = useCallback(
    (index: number) => {
      setImageUrls((prev) => {
        const newUrls = [...prev];
        URL.revokeObjectURL(newUrls[index]);
        newUrls.splice(index, 1);
        onImagesChange?.(newUrls);
        return newUrls;
      });
    },
    [onImagesChange],
  );

  return (
    <div className="mt-2 flex gap-2 flex-wrap">
      {imageUrls.map((url, index) => (
        <div
          key={index}
          className="relative size-24 bg-card rounded-xl outline outline-1 outline-offset-[-1px] outline-line overflow-hidden"
        >
          <img
            src={url}
            alt={`업로드된 이미지 ${index + 1}`}
            className="w-full h-full object-cover"
          />
          <button
            type="button"
            onClick={() => handleRemoveImage(index)}
            className="absolute top-1 right-1 size-6 bg-black/60 rounded-full flex items-center justify-center hover:bg-black/80 transition-colors"
            aria-label={`이미지 ${index + 1} 삭제`}
          >
            <X size={12} className="text-white" />
          </button>
        </div>
      ))}
      {imageUrls.length < maxImages && (
        <button
          type="button"
          onClick={handleImageClick}
          className="size-24 bg-card rounded-xl outline outline-1 outline-offset-[-1px] outline-line flex flex-col items-center justify-center gap-3"
          aria-label="이미지 업로드"
        >
          <div className="size-10 bg-page rounded-full flex items-center justify-center">
            <Image size={16} className="text-input-border" />
          </div>
          <span className="text-main typo-body-xs-regular">
            {placeholderText || `${imageUrls.length}/${maxImages}`}
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
