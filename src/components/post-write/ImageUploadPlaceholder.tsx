import { useCallback, useEffect, useRef, useState } from 'react';

import { Image } from 'lucide-react';

type Props = {
  maxImages?: number;
};

export function ImageUploadPlaceholder({ maxImages = 4 }: Props) {
  const [imageUrls, setImageUrls] = useState<string[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    return () => {
      imageUrls.forEach((url) => URL.revokeObjectURL(url));
    };
  }, [imageUrls]);

  const handleUploadClick = useCallback(() => {
    if (imageUrls.length < maxImages) {
      fileInputRef.current?.click();
    }
  }, [imageUrls.length, maxImages]);

  const handleFileChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const files = e.target.files;
      if (!files) return;

      const remainingSlots = maxImages - imageUrls.length;
      const filesToAdd = Math.min(files.length, remainingSlots);
      const newUrls = Array.from({ length: filesToAdd }, (_, i) => URL.createObjectURL(files[i]));

      setImageUrls((prev) => [...prev, ...newUrls]);

      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    },
    [imageUrls.length, maxImages],
  );

  const handleRemoveImage = useCallback((index: number) => {
    setImageUrls((prev) => {
      const newUrls = [...prev];
      URL.revokeObjectURL(newUrls[index]);
      newUrls.splice(index, 1);
      return newUrls;
    });
  }, []);

  return (
    <div className="flex gap-2 flex-wrap">
      {imageUrls.map((url, index) => (
        <div
          key={index}
          className="relative size-24 bg-neutral-50 rounded-xl outline outline-1 outline-offset-[-1px] outline-stone-300 overflow-hidden"
        >
          <img
            src={url}
            alt={`업로드된 이미지 ${index + 1}`}
            className="w-full h-full object-cover"
          />
          <button
            type="button"
            onClick={() => handleRemoveImage(index)}
            className="absolute top-1 right-1 size-6 bg-black/60 rounded-full flex items-center justify-center"
            aria-label={`이미지 ${index + 1} 삭제`}
          >
            <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
              <path d="M2 2l8 8M10 2l-8 8" stroke="white" strokeWidth="1.5" strokeLinecap="round" />
            </svg>
          </button>
        </div>
      ))}
      {imageUrls.length < maxImages && (
        <button
          type="button"
          onClick={handleUploadClick}
          className="size-24 bg-neutral-50 rounded-xl outline outline-1 outline-offset-[-1px] outline-stone-300 flex flex-col items-center justify-center gap-3"
          aria-label="이미지 업로드"
        >
          <div className="size-10 bg-gray-100 rounded-full flex items-center justify-center">
            <Image className="size-4 text-neutral-300" strokeWidth={1.5} />
          </div>
          <span className="text-main typo-body-xs-regular">이미지 업로드</span>
        </button>
      )}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        multiple
        onChange={handleFileChange}
        className="hidden"
        aria-label="이미지 파일 선택"
      />
    </div>
  );
}
