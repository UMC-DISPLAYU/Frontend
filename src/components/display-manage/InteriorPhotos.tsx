import { useRef, useState } from 'react';

import { ChevronLeft, X } from 'lucide-react';

import {
  useCreateContentImage,
  useDeleteContentImage,
  useReorderContentImages,
} from '@/hooks/queries/useContentImages';
import { useImageUpload } from '@/hooks/useImageUpload';

const MAX_PHOTOS = 20;

type Photo = {
  id: string | number;
  url: string;
  alt?: string;
};

type InteriorPhotosProps = {
  title?: string;
  displayId: number;
  categoryId: number;
  initialPhotos?: Photo[];
  onBack?: () => void;
  onPhotoCountChange?: (count: number) => void;
};

export function InteriorPhotos({
  title = '내부사진',
  displayId,
  categoryId,
  initialPhotos = [],
  onBack,
  onPhotoCountChange,
}: InteriorPhotosProps) {
  const [photos, setPhotos] = useState<Photo[]>(initialPhotos);
  const [isReorderMode, setIsReorderMode] = useState(false);
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const scope = { displayId, categoryId };
  const imageUpload = useImageUpload({ domain: 'display' });
  const createImage = useCreateContentImage(scope);
  const reorderImages = useReorderContentImages(scope);
  const deleteImage = useDeleteContentImage(scope);

  const isBusy = imageUpload.isUploading || createImage.isPending;

  const handleAddPhotos = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    const remainingSlots = MAX_PHOTOS - photos.length;
    const filesToAdd = Array.from(files).slice(0, remainingSlots);

    // Reset input (같은 파일을 다시 선택할 수 있도록 즉시 비웁니다)
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }

    if (filesToAdd.length === 0) return;

    // addImages가 반환한 항목을 그대로 업로드합니다.
    // uploadImages()는 내부 ref를 읽는데, ref는 리렌더 후에 갱신되어 이 시점에는 비어 있습니다.
    const added = imageUpload.addImages(filesToAdd);

    try {
      const uploadedUrls = await Promise.all(
        added.map((image) => imageUpload.uploadImage(image.file)),
      );
      const created = await Promise.all(
        uploadedUrls.map((imageUrl) => createImage.mutateAsync({ imageUrl })),
      );

      const newPhotos: Photo[] = created.map((res, index) => ({
        id: res.contentId,
        url: uploadedUrls[index],
        alt: added[index]?.file.name,
      }));

      setPhotos((prev) => {
        const updated = [...prev, ...newPhotos];
        onPhotoCountChange?.(updated.length);
        return updated;
      });
    } finally {
      imageUpload.clearImages();
    }
  };

  const handleRemove = (id: string | number) => {
    const previous = photos;
    const updated = previous.filter((p) => p.id !== id);

    setPhotos(updated);
    onPhotoCountChange?.(updated.length);

    deleteImage.mutate(Number(id), {
      onError: () => {
        // 삭제 실패 시 목록을 되돌립니다.
        setPhotos(previous);
        onPhotoCountChange?.(previous.length);
      },
    });
  };

  const handleReorder = () => {
    setIsReorderMode(!isReorderMode);
  };

  const handleDragStart = (index: number) => {
    setDraggedIndex(index);
  };

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    if (draggedIndex === null || draggedIndex === index) return;

    const newPhotos = [...photos];
    const draggedPhoto = newPhotos[draggedIndex];
    newPhotos.splice(draggedIndex, 1);
    newPhotos.splice(index, 0, draggedPhoto);

    setPhotos(newPhotos);
    setDraggedIndex(index);
  };

  const handleDragEnd = () => {
    setDraggedIndex(null);
    reorderImages.mutate(photos.map((photo) => Number(photo.id)));
  };
  return (
    <div className="min-h-dvh bg-page pb-11">
      {/* 헤더 */}
      <header className="flex h-14 items-center gap-3 px-5">
        <button
          type="button"
          onClick={onBack}
          aria-label="뒤로 가기"
          className="-ml-1 flex size-7 items-center justify-center text-main"
        >
          <ChevronLeft className="size-6" strokeWidth={2} />
        </button>
        <h1 className="typo-body-xl-bold text-main">{title}</h1>
      </header>

      {/* 안내 */}
      <div className="px-5 pt-2">
        <p className="typo-body-md-regular text-main">
          전시 공간과 현장 분위기를 담는 공유 앨범이에요.
        </p>
        <p className="typo-body-md-regular text-faint">
          사진 {photos.length} / {MAX_PHOTOS}
        </p>
      </div>

      {/* 액션 */}
      <div className="flex gap-2 px-5 pt-4">
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          multiple
          onChange={handleFileChange}
          className="hidden"
        />
        <button
          type="button"
          onClick={handleAddPhotos}
          disabled={photos.length >= MAX_PHOTOS || isBusy}
          className="typo-body-sm-bold flex h-11 flex-1 items-center justify-center rounded-xl bg-bt-black text-white disabled:opacity-40"
        >
          {isBusy ? '업로드 중' : '사진 추가'}
        </button>
        <button
          type="button"
          onClick={handleReorder}
          className={`typo-body-sm-bold h-11 shrink-0 rounded-xl px-4 ${
            isReorderMode ? 'bg-bt-black text-white' : 'bg-card text-sub700'
          }`}
        >
          {isReorderMode ? '완료' : '순서 편집'}
        </button>
      </div>

      {/* 그리드 */}
      {photos.length === 0 ? (
        <p className="typo-body-sm-regular px-5 pt-10 text-hint">
          아직 사진이 없어요. 사진 추가로 첫 장을 올려보세요.
        </p>
      ) : (
        <ul className="grid grid-cols-3 gap-3 px-5 pt-5">
          {photos.map((photo, index) => (
            <li
              key={photo.id}
              draggable={isReorderMode}
              onDragStart={() => handleDragStart(index)}
              onDragOver={(e) => handleDragOver(e, index)}
              onDragEnd={handleDragEnd}
              className={`relative aspect-[114/144] ${
                isReorderMode ? 'cursor-move' : ''
              } ${draggedIndex === index ? 'opacity-50' : ''}`}
            >
              <img
                src={photo.url}
                alt={photo.alt ?? `내부사진 ${index + 1}`}
                className="size-full rounded-xl object-cover"
              />

              {index === 0 && (
                <span className="typo-body-xs-regular absolute left-1.5 top-1.5 rounded-sm bg-dark px-1 py-0.5 text-white">
                  대표
                </span>
              )}

              {!isReorderMode && (
                <button
                  type="button"
                  onClick={() => handleRemove(photo.id)}
                  aria-label={`내부사진 ${index + 1} 삭제`}
                  className="absolute right-1.5 top-1.5 flex size-5 items-center justify-center rounded-full bg-black/50 text-white"
                >
                  <X className="size-2.5" strokeWidth={2.5} />
                </button>
              )}

              {isReorderMode && (
                <div className="absolute inset-0 flex items-center justify-center bg-black/30 rounded-xl">
                  <span className="typo-body-sm-bold text-white">{index + 1}</span>
                </div>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
