import { useCallback, useEffect, useRef, useState } from 'react';

import { Image, Loader2 } from 'lucide-react';

import { AlertModal } from '@/components/ui';
import { useUploadImage } from '@/hooks/queries/useFile';
import { getErrorMessage } from '@/utils/error';

type UploadItem = {
  id: string;
  previewUrl: string;
  status: 'uploading' | 'done';
  uploadedUrl?: string;
};

type Props = {
  maxImages?: number;
  initialImageUrls?: string[];
  onUploadedUrlsChange?: (urls: string[]) => void;
  onUploadingChange?: (isUploading: boolean) => void;
};

export function ImageUploadPlaceholder({
  maxImages = 5,
  initialImageUrls,
  onUploadedUrlsChange,
  onUploadingChange,
}: Props) {
  const [items, setItems] = useState<UploadItem[]>(() =>
    (initialImageUrls ?? []).map((url) => ({
      id: crypto.randomUUID(),
      previewUrl: url,
      status: 'done',
      uploadedUrl: url,
    })),
  );
  const [showMaxWarning, setShowMaxWarning] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const itemsRef = useRef(items);
  const uploadImage = useUploadImage();

  useEffect(() => {
    itemsRef.current = items;
  }, [items]);

  useEffect(() => {
    return () => {
      itemsRef.current.forEach(({ previewUrl }) => URL.revokeObjectURL(previewUrl));
    };
  }, []);

  useEffect(() => {
    onUploadedUrlsChange?.(
      items.filter((item) => item.status === 'done').map((item) => item.uploadedUrl as string),
    );
  }, [items, onUploadedUrlsChange]);

  useEffect(() => {
    onUploadingChange?.(items.some((item) => item.status === 'uploading'));
  }, [items, onUploadingChange]);

  const handleUploadClick = useCallback(() => {
    if (items.length < maxImages) {
      fileInputRef.current?.click();
    }
  }, [items.length, maxImages]);

  const uploadFile = useCallback(
    async (id: string, file: File) => {
      try {
        const uploadedUrl = await uploadImage.mutateAsync({ file, domain: 'lounge' });
        setItems((prev) =>
          prev.map((item) => (item.id === id ? { ...item, status: 'done', uploadedUrl } : item)),
        );
      } catch (error) {
        const stillExists = itemsRef.current.some((item) => item.id === id);
        if (!stillExists) return;

        const message = getErrorMessage(error, '이미지 업로드에 실패했습니다.');
        setUploadError(message);
        setItems((prev) => {
          const target = prev.find((item) => item.id === id);
          if (target) URL.revokeObjectURL(target.previewUrl);
          return prev.filter((item) => item.id !== id);
        });
      }
    },
    [uploadImage],
  );

  const handleFileChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const files = e.target.files;
      if (!files) return;

      const remainingSlots = maxImages - items.length;
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

      setItems((prev) => [
        ...prev,
        ...newItems.map(({ id, previewUrl, status }) => ({ id, previewUrl, status })),
      ]);
      newItems.forEach((item) => uploadFile(item.id, item.file));

      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    },
    [items.length, maxImages, uploadFile],
  );

  const handleRemoveImage = useCallback((id: string) => {
    setItems((prev) => {
      const target = prev.find((item) => item.id === id);
      if (target) URL.revokeObjectURL(target.previewUrl);
      return prev.filter((item) => item.id !== id);
    });
  }, []);

  return (
    <div className="flex gap-2 overflow-x-auto scrollbar-none w-full pb-1">
      {items.map((item) => (
        <div
          key={item.id}
          className="relative size-25 shrink-0 bg-card rounded-xl outline outline-1 outline-offset-[-1px] outline-line overflow-hidden"
        >
          <img src={item.previewUrl} alt="업로드한 이미지" className="w-full h-full object-cover" />
          {item.status === 'uploading' && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/40">
              <Loader2 className="size-6 animate-spin text-white" aria-label="업로드 중" />
            </div>
          )}
          <button
            type="button"
            onClick={() => handleRemoveImage(item.id)}
            className="absolute top-1 right-1 size-6 bg-black/60 rounded-full flex items-center justify-center"
            aria-label="이미지 삭제"
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
          className="size-25 shrink-0 bg-card rounded-xl outline outline-1 outline-offset-[-1px] outline-line flex flex-col items-center justify-center gap-3"
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
      {uploadError && <AlertModal message={uploadError} onConfirm={() => setUploadError(null)} />}
    </div>
  );
}
