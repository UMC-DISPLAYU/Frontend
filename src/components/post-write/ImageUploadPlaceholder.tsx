import { useCallback, useEffect, useRef, useState } from 'react';

import { Image } from 'lucide-react';

import { AlertModal } from '@/components/ui';

type Props = {
  maxImages?: number;
  onFilesChange?: (files: File[]) => void;
};

export function ImageUploadPlaceholder({ maxImages = 5, onFilesChange }: Props) {
  const [items, setItems] = useState<{ file: File; url: string }[]>([]);
  const [showMaxWarning, setShowMaxWarning] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const itemsRef = useRef(items);

  useEffect(() => {
    itemsRef.current = items;
  }, [items]);

  useEffect(() => {
    return () => {
      itemsRef.current.forEach(({ url }) => URL.revokeObjectURL(url));
    };
  }, []);

  useEffect(() => {
    onFilesChange?.(items.map((item) => item.file));
  }, [items, onFilesChange]);

  const handleUploadClick = useCallback(() => {
    if (items.length < maxImages) {
      fileInputRef.current?.click();
    }
  }, [items.length, maxImages]);

  const handleFileChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const files = e.target.files;
      if (!files) return;

      const remainingSlots = maxImages - items.length;
      const selectedFiles = Array.from(files);
      if (selectedFiles.length > remainingSlots) {
        setShowMaxWarning(true);
      }
      const filesToAdd = selectedFiles
        .slice(0, remainingSlots)
        .map((file) => ({ file, url: URL.createObjectURL(file) }));

      setItems((prev) => [...prev, ...filesToAdd]);

      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    },
    [items.length, maxImages],
  );

  const handleRemoveImage = useCallback((index: number) => {
    setItems((prev) => {
      const next = [...prev];
      URL.revokeObjectURL(next[index].url);
      next.splice(index, 1);
      return next;
    });
  }, []);

  return (
    <div className="flex gap-2 flex-wrap">
      {items.map(({ url }, index) => (
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
      {items.length < maxImages && (
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
      {showMaxWarning && (
        <AlertModal
          message={`이미지는 최대 ${maxImages}장까지 첨부할 수 있어요.`}
          onConfirm={() => setShowMaxWarning(false)}
        />
      )}
    </div>
  );
}
