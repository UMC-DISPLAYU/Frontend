import { useRef, useState } from 'react';

import { ChevronLeft, X } from 'lucide-react';

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
  displayId: _displayId,
  categoryId: _categoryId,
  initialPhotos = [],
  onBack,
  onPhotoCountChange,
}: InteriorPhotosProps) {
  const [photos, setPhotos] = useState<Photo[]>(initialPhotos);
  const [isReorderMode, setIsReorderMode] = useState(false);
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleAddPhotos = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    const remainingSlots = MAX_PHOTOS - photos.length;
    const filesToAdd = Array.from(files).slice(0, remainingSlots);

    const newPhotos: Photo[] = filesToAdd.map((file, index) => ({
      id: `${Date.now()}-${index}`,
      url: URL.createObjectURL(file),
      alt: file.name,
    }));

    const updatedPhotos = [...photos, ...newPhotos];
    setPhotos(updatedPhotos);
    onPhotoCountChange?.(updatedPhotos.length);

    // Reset input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }

    // TODO: API 호출로 이미지 업로드
    // await Promise.all(filesToAdd.map(file => uploadAndCreateContentImage(displayId, categoryId, file)));
  };

  const handleRemove = (id: string | number) => {
    setPhotos((prev) => {
      const photo = prev.find((p) => p.id === id);
      if (photo) {
        URL.revokeObjectURL(photo.url);
      }
      const updatedPhotos = prev.filter((p) => p.id !== id);
      onPhotoCountChange?.(updatedPhotos.length);
      return updatedPhotos;
    });

    // TODO: API 호출로 이미지 삭제
    // await deleteContentImage(displayId, categoryId, Number(id));
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

  const handleDragEnd = async () => {
    setDraggedIndex(null);

    // TODO: API 호출로 순서 저장
    // const contentOrders = photos.map((photo, index) => ({
    //   contentId: Number(photo.id),
    //   order: index,
    // }));
    // await reorderContentImages(displayId, categoryId, { contentOrders });
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
          disabled={photos.length >= MAX_PHOTOS}
          className="typo-body-sm-bold flex h-11 flex-1 items-center justify-center rounded-xl bg-bt-black text-white disabled:opacity-40"
        >
          사진 추가
        </button>
        <button
          type="button"
          onClick={handleReorder}
          className={`typo-body-sm-bold h-11 shrink-0 rounded-xl px-4 ${
            isReorderMode
              ? 'bg-bt-black text-white'
              : 'bg-card text-sub700'
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

