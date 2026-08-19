import { useRef, useState } from 'react';

import {
  closestCenter,
  DndContext,
  type DragEndEvent,
  KeyboardSensor,
  PointerSensor,
  TouchSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import {
  arrayMove,
  rectSortingStrategy,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { X } from 'lucide-react';
import { useParams } from 'react-router-dom';

import type { DisplayDetailDto } from '@/api/dto';
import { BottomFixedBar, ErrorView, LoadingView } from '@/components/common';
import { useHideFooter } from '@/components/layout';
import { AlertModal, ExhibitionHeader } from '@/components/ui';
import {
  DEFAULT_CONTENT_IMAGE_HEIGHT,
  DEFAULT_CONTENT_IMAGE_WIDTH,
  MAX_CONTENT_IMAGES,
} from '@/constants';
import {
  useCreateContentImage,
  useDeleteContentImage,
  useReorderContentImages,
} from '@/hooks/queries/useContentImages';
import { useDisplayDetail } from '@/hooks/queries/useDisplayDetail';
import { useFlowBack } from '@/hooks/useFlowBack';
import { useImageUpload } from '@/hooks/useImageUpload';
import { useDisplayContentPolicy } from '@/hooks/usePolicy';
import { hasPermission } from '@/utils/hasPermission';

type Photo = {
  id: string | number;
  url: string;
  alt?: string;
  userId?: number;
};

const getPhotoSortableId = (photo: Photo) => String(photo.id);

interface SortablePhotoItemProps {
  photo: Photo;
  index: number;
  isReorderMode: boolean;
  displayDetail: DisplayDetailDto;
  onRemove: (id: string | number) => void;
}

function SortablePhotoItem({
  photo,
  index,
  isReorderMode,
  displayDetail,
  onRemove,
}: SortablePhotoItemProps) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: getPhotoSortableId(photo),
    disabled: !isReorderMode,
  });

  const displayContentPolicy = useDisplayContentPolicy(displayDetail, photo);
  const canDeleteContent = hasPermission(displayContentPolicy, 'deleteContent');

  return (
    <li
      ref={setNodeRef}
      style={{
        transform: CSS.Transform.toString(transform),
        transition,
        touchAction: isReorderMode ? 'none' : undefined,
      }}
      {...(isReorderMode ? attributes : {})}
      {...(isReorderMode ? listeners : {})}
      className={`relative aspect-114/144 ${
        isReorderMode ? 'cursor-grab active:cursor-grabbing' : ''
      } ${isDragging ? 'z-10 opacity-70' : ''}`}
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

      {!isReorderMode && canDeleteContent && (
        <button
          type="button"
          onClick={() => onRemove(photo.id)}
          aria-label={`내부사진 ${index + 1} 삭제`}
          className="absolute right-1.5 top-1.5 flex size-5 items-center justify-center rounded-full bg-black/50 text-white"
        >
          <X className="size-2.5" strokeWidth={2.5} />
        </button>
      )}

      {isReorderMode && (
        <div className="absolute inset-0 flex items-center justify-center rounded-xl bg-black/30">
          <span className="typo-body-sm-bold text-white">{index + 1}</span>
        </div>
      )}
    </li>
  );
}

export function InteriorPhotosPage() {
  useHideFooter();

  const flowBack = useFlowBack();
  const { displayId: paramDisplayId, categoryId: paramCategoryId } = useParams();

  const displayId = Number(paramDisplayId ?? 0);
  const categoryId = Number(paramCategoryId ?? 0);

  const { data: displayDetail, isLoading, error } = useDisplayDetail(displayId);
  const displayContentPolicy = useDisplayContentPolicy(displayDetail);

  const canCreateContent = hasPermission(displayContentPolicy, 'createContent');
  const canDeleteContent = hasPermission(displayContentPolicy, 'deleteContent');
  const canReorder = hasPermission(displayContentPolicy, 'reorder');

  if (isLoading) {
    return <LoadingView message="내부 사진을 불러오는 중..." />;
  }

  if (error || !displayDetail) {
    return <ErrorView message="전시 정보를 찾을 수 없습니다." onRetry={() => flowBack()} />;
  }

  const category = displayDetail.contentCategories?.find((cat) => cat.categoryId === categoryId);

  if (!category) {
    return (
      <ErrorView message="해당 콘텐츠 카테고리를 찾을 수 없습니다." onRetry={() => flowBack()} />
    );
  }

  const initialPhotos =
    category.contents.map((content) => ({
      id: content.contentId,
      url: content.imageUrl,
      userId: content.userId,
    })) ?? [];

  return (
    <div className="mx-auto min-h-dvh w-full max-w-md bg-page">
      <InteriorPhotos
        key={categoryId}
        title={category.name}
        description={category.description ?? ''}
        displayId={displayId}
        categoryId={categoryId}
        initialPhotos={initialPhotos}
        canCreateContent={canCreateContent}
        canDeleteContent={canDeleteContent}
        canReorder={canReorder}
        onBack={() => flowBack()}
        displayDetail={displayDetail}
      />
    </div>
  );
}

interface InteriorPhotosProps {
  title: string;
  description: string;
  displayId: number;
  categoryId: number;
  initialPhotos: Photo[];
  canCreateContent: boolean;
  canDeleteContent: boolean;
  canReorder: boolean;
  onBack: () => void;
  displayDetail: DisplayDetailDto;
}

function InteriorPhotos({
  title,
  description,
  displayId,
  categoryId,
  initialPhotos,
  canCreateContent,
  canDeleteContent,
  canReorder,
  onBack,
  displayDetail,
}: InteriorPhotosProps) {
  const [photos, setPhotos] = useState<Photo[]>(initialPhotos);
  const [isReorderMode, setIsReorderMode] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const savedOrderRef = useRef<Photo[]>(initialPhotos);

  const scope = { displayId, categoryId };
  const imageUpload = useImageUpload({ domain: 'display' });
  const createImage = useCreateContentImage(scope);
  const reorderImages = useReorderContentImages(scope);
  const deleteImage = useDeleteContentImage(scope);

  const isBusy = imageUpload.isUploading || createImage.isPending;
  const isSavingOrder = reorderImages.isPending;
  const canShowActions = canCreateContent || canReorder;
  const shouldShowBottomBar = isReorderMode;
  const sortablePhotoIds = photos.map(getPhotoSortableId);
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 6,
      },
    }),
    useSensor(TouchSensor, {
      activationConstraint: {
        delay: 120,
        tolerance: 8,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  );

  const handleAddPhotos = () => {
    if (!canCreateContent) return;
    fileInputRef.current?.click();
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!canCreateContent) return;

    const files = e.target.files;
    if (!files) return;

    const remainingSlots = Math.max(MAX_CONTENT_IMAGES - photos.length, 0);
    const filesToAdd = Array.from(files).slice(0, remainingSlots);

    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }

    if (filesToAdd.length === 0) return;

    const added = imageUpload.addImages(filesToAdd);

    try {
      const uploadedUrls = await Promise.all(
        added.map((image) => {
          if (!image.file) {
            throw new Error('업로드할 이미지 파일이 없습니다.');
          }

          return imageUpload.uploadImage(image.file);
        }),
      );
      const created = await Promise.all(
        uploadedUrls.map((imageUrl) =>
          createImage.mutateAsync({
            imageUrl,
            width: DEFAULT_CONTENT_IMAGE_WIDTH,
            height: DEFAULT_CONTENT_IMAGE_HEIGHT,
          }),
        ),
      );

      const newPhotos: Photo[] = created.map((res, index) => ({
        id: res.contentId,
        url: uploadedUrls[index],
        alt: added[index]?.file.name,
      }));

      setPhotos((prev) => [...prev, ...newPhotos]);
    } catch {
      setUploadError('사진 업로드에 실패했어요. 잠시 후 다시 시도해주세요.');
    } finally {
      imageUpload.clearImages();
    }
  };

  const handleRemove = (id: string | number) => {
    if (!canDeleteContent) return;

    const previous = photos;
    const updated = previous.filter((p) => p.id !== id);

    setPhotos(updated);

    deleteImage.mutate(Number(id), {
      onError: () => {
        setPhotos(previous);
      },
    });
  };

  const handleReorder = () => {
    if (!canReorder || isSavingOrder) return;

    if (!isReorderMode) {
      savedOrderRef.current = photos;
      setIsReorderMode(true);
      return;
    }

    reorderImages.mutate(
      photos.map((photo) => Number(photo.id)),
      {
        onSuccess: () => {
          savedOrderRef.current = photos;
          setIsReorderMode(false);
        },
        onError: () => {
          setPhotos(savedOrderRef.current);
          setIsReorderMode(false);
          setUploadError('사진 순서 저장에 실패했어요. 잠시 후 다시 시도해주세요.');
        },
      },
    );
  };

  const handleDragEnd = ({ active, over }: DragEndEvent) => {
    if (!isReorderMode || !canReorder || !over || active.id === over.id) return;

    setPhotos((currentPhotos) => {
      const oldIndex = currentPhotos.findIndex(
        (photo) => getPhotoSortableId(photo) === String(active.id),
      );
      const newIndex = currentPhotos.findIndex(
        (photo) => getPhotoSortableId(photo) === String(over.id),
      );

      if (oldIndex < 0 || newIndex < 0) return currentPhotos;

      return arrayMove(currentPhotos, oldIndex, newIndex);
    });
  };

  return (
    <div className="bg-page">
      <ExhibitionHeader title={title} onBack={onBack} />

      <main className={shouldShowBottomBar ? 'pb-bottom-bar-offset' : undefined}>
        {/* 안내 */}
        <div className="px-5 flex flex-col gap-1">
          <p className="typo-body-md-regular text-main">{description}</p>
          <p className="typo-body-md-regular text-faint">
            사진 {photos.length} / {MAX_CONTENT_IMAGES}
          </p>
        </div>

        {/* 액션 */}
        {!isReorderMode && canShowActions && (
          <div className="mt-3.5 flex gap-2 px-5">
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              multiple
              onChange={handleFileChange}
              className="hidden"
            />
            {canCreateContent && (
              <button
                type="button"
                onClick={handleAddPhotos}
                disabled={photos.length >= MAX_CONTENT_IMAGES || isBusy}
                className="typo-body-sm-bold flex h-11 flex-1 items-center justify-center rounded-xl bg-bt-black text-white disabled:opacity-40"
              >
                {isBusy ? '업로드 중' : '사진 추가'}
              </button>
            )}
            {canReorder && (
              <button
                type="button"
                onClick={handleReorder}
                className="typo-body-sm-bold h-11 shrink-0 rounded-xl bg-card px-4 text-sub700"
              >
                순서 편집
              </button>
            )}
          </div>
        )}

        {/* 그리드 */}
        {photos.length === 0 ? (
          <p className="typo-body-sm-regular mt-6 px-5 text-hint">
            아직 사진이 없어요. 사진 추가로 첫 장을 올려보세요.
          </p>
        ) : (
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={handleDragEnd}
          >
            <SortableContext items={sortablePhotoIds} strategy={rectSortingStrategy}>
              <ul className="mt-6 grid grid-cols-3 gap-x-2.5 gap-y-3 px-5">
                {photos.map((photo, index) => (
                  <SortablePhotoItem
                    key={photo.id}
                    photo={photo}
                    index={index}
                    isReorderMode={isReorderMode}
                    displayDetail={displayDetail}
                    onRemove={handleRemove}
                  />
                ))}
              </ul>
            </SortableContext>
          </DndContext>
        )}
      </main>

      {shouldShowBottomBar && (
        <BottomFixedBar>
          <button
            type="button"
            onClick={handleReorder}
            disabled={isSavingOrder}
            className="typo-body-sm-bold h-11 w-full rounded-xl bg-bt-black text-white disabled:opacity-40"
          >
            {isSavingOrder ? '저장 중' : '편집 완료'}
          </button>
        </BottomFixedBar>
      )}
      {uploadError && <AlertModal message={uploadError} onConfirm={() => setUploadError(null)} />}
    </div>
  );
}
