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
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm, useWatch } from 'react-hook-form';
import { useParams } from 'react-router-dom';

import type { DisplayDetailDto } from '@/api/dto';
import PhotoAddIcon from '@/assets/exhibition-work/photo-add.svg';
import PhotoDeleteIcon from '@/assets/exhibition-work/photo-delete.svg';
import PhotoNoticeIcon from '@/assets/exhibition-work/photo-notice.svg';
import PhotoNumberBackground from '@/assets/exhibition-work/photo-number.svg';
import { contentEditSchema, type ContentEditValues } from '@/components/artworks-manage';
import { BottomFixedBar, ErrorView } from '@/components/common';
import { OptimizedImage } from '@/components/common/OptimizedImage';
import { WorkHeader } from '@/components/exhibition-work';
import { PageContainer, useHideFooter } from '@/components/layout';
import { Skeleton, SkeletonList } from '@/components/ui';
import {
  DEFAULT_CONTENT_IMAGE_HEIGHT,
  DEFAULT_CONTENT_IMAGE_WIDTH,
  MAX_CONTENT_IMAGES,
} from '@/constants';
import { CONTENT_DESCRIPTION_MAX_LENGTH } from '@/constants/artworkManage';
import { useUpdateContentCategory } from '@/hooks/queries/useContentCategories';
import {
  useCreateContentImage,
  useDeleteContentImage,
  useReorderContentImages,
} from '@/hooks/queries/useContentImages';
import { useDisplayDetail } from '@/hooks/queries/useDisplayDetail';
import { useFlowBack } from '@/hooks/useFlowBack';
import { useImageUpload } from '@/hooks/useImageUpload';
import { useCurrentPolicyUser, useDisplayContentPolicy } from '@/hooks/usePolicy';
import { policies } from '@/policies/policies';
import { toast } from '@/stores/toastStore';
import { cn } from '@/utils/cn';
import { getErrorMessage } from '@/utils/error';
import { hasPermission } from '@/utils/hasPermission';
import { staggerStyle } from '@/utils/stagger';

type Photo = {
  id: string | number;
  url: string;
  alt?: string;
  userId?: number;
};

const getPhotoSortableId = (photo: Photo) => String(photo.id);
const SUPPORTED_PHOTO_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
const MAX_PHOTO_FILE_SIZE = 20 * 1024 * 1024;
const buttonClass =
  'cursor-pointer transition duration-fast ease-standard focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus active:scale-99 disabled:cursor-default disabled:bg-secondary disabled:text-disable';

interface SortablePhotoItemProps {
  photo: Photo;
  index: number;
  isEditing: boolean;
  canReorder: boolean;
  disabled: boolean;
  displayDetail: DisplayDetailDto;
  onRemove: (id: string | number) => void;
}

function SortablePhotoItem({
  photo,
  index,
  isEditing,
  canReorder,
  disabled,
  displayDetail,
  onRemove,
}: SortablePhotoItemProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    setActivatorNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: getPhotoSortableId(photo),
    disabled: !isEditing || !canReorder || disabled,
  });
  const displayContentPolicy = useDisplayContentPolicy(displayDetail, photo);
  const canDeleteContent = hasPermission(displayContentPolicy, 'deleteContent');

  return (
    <li
      ref={setNodeRef}
      style={{ transform: CSS.Transform.toString(transform), transition }}
      className={cn('relative aspect-square min-w-0', isDragging && 'z-10 opacity-70')}
    >
      <div className="animate-rise" style={staggerStyle(index)}>
        <OptimizedImage
          src={photo.url}
          alt={photo.alt ?? `섹션 사진 ${index + 1}`}
          displayWidth={208}
          skeleton
          frameClassName="aspect-square w-full rounded-12"
        />
      </div>
      {isEditing && (
        <>
          <button
            ref={setActivatorNodeRef}
            type="button"
            {...attributes}
            {...listeners}
            aria-label={`사진 ${index + 1} 순서 이동`}
            disabled={!canReorder || disabled}
            className={cn(
              buttonClass,
              'absolute -left-0.5 top-0 flex size-11 touch-none items-center justify-center rounded-12 text-interactive-inverse focus-visible:outline-focus-inverse disabled:bg-transparent disabled:text-interactive-inverse',
              canReorder && 'cursor-grab active:cursor-grabbing',
            )}
          >
            <img src={PhotoNumberBackground} alt="" className="translate-x-0.5" />
            <span className="typography-body-md-semibold absolute translate-x-0.5">
              {index + 1}
            </span>
          </button>
          {canDeleteContent && (
            <button
              type="button"
              disabled={disabled}
              onClick={() => onRemove(photo.id)}
              aria-label={`사진 ${index + 1} 삭제`}
              className={cn(
                buttonClass,
                'absolute -right-0.5 top-0 flex size-11 items-center justify-center rounded-12 hover:bg-dim focus-visible:outline-focus-inverse disabled:bg-transparent disabled:opacity-40',
              )}
            >
              <img src={PhotoDeleteIcon} alt="" className="-translate-x-0.5" />
            </button>
          )}
        </>
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
  const { data: displayDetail, isPending, error } = useDisplayDetail(displayId);
  const displayContentPolicy = useDisplayContentPolicy(displayDetail);

  if (isPending) {
    return (
      <PageContainer variant="form" className="bg-primary-white">
        <WorkHeader title="섹션 편집" onBack={flowBack} />
        <main aria-label="섹션을 불러오는 중" aria-busy="true" className="space-y-6 py-5">
          <Skeleton className="h-20 w-full rounded-12" />
          <Skeleton className="h-44 w-full rounded-12" />
          <div className="grid grid-cols-3 gap-2.5">
            <SkeletonList count={6}>
              {() => <Skeleton className="aspect-square rounded-12" />}
            </SkeletonList>
          </div>
        </main>
      </PageContainer>
    );
  }

  if (error || !displayDetail) {
    return <ErrorView message="전시 정보를 찾을 수 없습니다." onRetry={flowBack} />;
  }

  const category = displayDetail.contentCategories?.find((cat) => cat.categoryId === categoryId);
  if (!category) {
    return <ErrorView message="해당 섹션을 찾을 수 없습니다." onRetry={flowBack} />;
  }

  return (
    <InteriorPhotos
      key={categoryId}
      title={category.name}
      description={category.description ?? ''}
      displayId={displayId}
      categoryId={categoryId}
      initialPhotos={category.contents.map((content) => ({
        id: content.contentId,
        url: content.imageUrl,
        userId: content.userId,
      }))}
      canEditCategory={hasPermission(displayContentPolicy, 'editCategory')}
      canCreateContent={hasPermission(displayContentPolicy, 'createContent')}
      canReorder={hasPermission(displayContentPolicy, 'reorder')}
      onBack={flowBack}
      displayDetail={displayDetail}
    />
  );
}

interface InteriorPhotosProps {
  title: string;
  description: string;
  displayId: number;
  categoryId: number;
  initialPhotos: Photo[];
  canEditCategory: boolean;
  canCreateContent: boolean;
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
  canEditCategory,
  canCreateContent,
  canReorder,
  onBack,
  displayDetail,
}: InteriorPhotosProps) {
  const [photos, setPhotos] = useState<Photo[]>(initialPhotos);
  const [isEditingPhotos, setIsEditingPhotos] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);
  const [rejectedPhotoCount, setRejectedPhotoCount] = useState(0);
  const [isUploadingPhotos, setIsUploadingPhotos] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const savedOrderRef = useRef<Photo[]>(initialPhotos);
  const savingDetailsRef = useRef(false);
  const photoActionRef = useRef(false);
  const user = useCurrentPolicyUser();
  const scope = { displayId, categoryId };
  const imageUpload = useImageUpload({ domain: 'display' });
  const createImage = useCreateContentImage(scope);
  const reorderImages = useReorderContentImages(scope);
  const deleteImage = useDeleteContentImage(scope);
  const updateCategory = useUpdateContentCategory(displayId);
  const {
    register,
    handleSubmit,
    control,
    reset,
    setError,
    formState: { errors, isDirty, isSubmitting },
  } = useForm<ContentEditValues>({
    resolver: zodResolver(contentEditSchema),
    defaultValues: { title, description },
  });
  const currentDescription = useWatch({ control, name: 'description' }) ?? '';
  const isBusy = isUploadingPhotos || imageUpload.isUploading || createImage.isPending;
  const isSavingOrder = reorderImages.isPending;
  const isPhotoActionPending = isBusy || isSavingOrder || deleteImage.isPending;
  const policyUser = {
    id: user?.id ?? null,
    isArtistVerified: user?.isArtistVerified ?? false,
  };
  const canEditPhotos =
    canReorder ||
    photos.some((photo) => policies.displayContent.deleteContent(policyUser, displayDetail, photo));
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
    useSensor(TouchSensor, { activationConstraint: { delay: 120, tolerance: 8 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  );

  const saveDetails = async (values: ContentEditValues) => {
    if (!canEditCategory || savingDetailsRef.current) return;
    savingDetailsRef.current = true;
    try {
      await updateCategory.mutateAsync({
        categoryId,
        body: { name: values.title, description: values.description },
      });
      reset(values);
      toast('섹션 정보를 저장했어요');
    } catch (error) {
      setError('root', {
        message: getErrorMessage(error, '섹션 정보를 저장하지 못했어요. 다시 시도해주세요.'),
      });
    } finally {
      savingDetailsRef.current = false;
    }
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!canCreateContent || photoActionRef.current || isPhotoActionPending) return;
    const files = e.target.files;
    if (!files?.length) return;
    const validFiles = Array.from(files).filter(
      (file) => SUPPORTED_PHOTO_TYPES.includes(file.type) && file.size <= MAX_PHOTO_FILE_SIZE,
    );
    setRejectedPhotoCount(files.length - validFiles.length);
    setActionError(null);
    const remainingSlots = Math.max(MAX_CONTENT_IMAGES - photos.length, 0);
    const filesToAdd = validFiles.slice(0, remainingSlots);
    if (fileInputRef.current) fileInputRef.current.value = '';
    if (filesToAdd.length === 0) return;

    photoActionRef.current = true;
    setIsUploadingPhotos(true);
    try {
      const added = imageUpload.addImages(filesToAdd);
      const results = await Promise.allSettled(
        added.map(async (image): Promise<Photo> => {
          if (!image.file) throw new Error('업로드할 이미지 파일이 없습니다.');
          const imageUrl = await imageUpload.uploadImage(image.file);
          const created = await createImage.mutateAsync({
            imageUrl,
            width: DEFAULT_CONTENT_IMAGE_WIDTH,
            height: DEFAULT_CONTENT_IMAGE_HEIGHT,
          });
          return {
            id: created.contentId,
            url: imageUrl,
            alt: image.file.name,
            userId: user?.id ?? undefined,
          };
        }),
      );
      const newPhotos = results.flatMap((result) =>
        result.status === 'fulfilled' ? [result.value] : [],
      );
      setPhotos((previous) => [...previous, ...newPhotos]);
      const failures = results.filter((result) => result.status === 'rejected');
      if (failures.length > 0) {
        setActionError(
          `${failures.length}장은 올리지 못했어요\n${getErrorMessage(failures[0].reason, '사진 업로드에 실패했어요. 잠시 후 다시 시도해주세요.')}`,
        );
      }
    } catch (error) {
      setActionError(
        getErrorMessage(error, '사진 업로드에 실패했어요. 잠시 후 다시 시도해주세요.'),
      );
    } finally {
      imageUpload.clearImages();
      photoActionRef.current = false;
      setIsUploadingPhotos(false);
    }
  };

  const handleRemove = (id: string | number) => {
    if (photoActionRef.current || isPhotoActionPending) return;
    const targetPhoto = photos.find((photo) => photo.id === id);
    if (
      !targetPhoto ||
      !policies.displayContent.deleteContent(policyUser, displayDetail, targetPhoto)
    ) {
      return;
    }

    photoActionRef.current = true;
    setActionError(null);
    const previous = photos;
    setPhotos(previous.filter((photo) => photo.id !== id));
    deleteImage.mutate(Number(id), {
      onSuccess: () => {
        savedOrderRef.current = savedOrderRef.current.filter((photo) => photo.id !== id);
        photoActionRef.current = false;
      },
      onError: (error) => {
        setPhotos(previous);
        setActionError(getErrorMessage(error, '사진을 삭제하지 못했어요. 다시 시도해주세요.'));
        photoActionRef.current = false;
      },
    });
  };

  const handlePhotoEdit = () => {
    if (photoActionRef.current || isPhotoActionPending) return;
    if (!isEditingPhotos) {
      if (!canEditPhotos) return;
      savedOrderRef.current = photos;
      setIsEditingPhotos(true);
      return;
    }
    if (!canReorder || photos.length === 0) {
      setIsEditingPhotos(false);
      return;
    }

    photoActionRef.current = true;
    reorderImages.mutate(
      photos.map((photo) => Number(photo.id)),
      {
        onSuccess: () => {
          savedOrderRef.current = photos;
          setIsEditingPhotos(false);
          photoActionRef.current = false;
        },
        onError: (error) => {
          setPhotos(savedOrderRef.current);
          setIsEditingPhotos(false);
          setActionError(
            getErrorMessage(error, '사진 순서 저장에 실패했어요. 잠시 후 다시 시도해주세요.'),
          );
          photoActionRef.current = false;
        },
      },
    );
  };

  const handleDragEnd = ({ active, over }: DragEndEvent) => {
    if (!isEditingPhotos || !canReorder || photoActionRef.current || !over || active.id === over.id)
      return;
    setPhotos((currentPhotos) => {
      const oldIndex = currentPhotos.findIndex(
        (photo) => getPhotoSortableId(photo) === String(active.id),
      );
      const newIndex = currentPhotos.findIndex(
        (photo) => getPhotoSortableId(photo) === String(over.id),
      );
      return oldIndex < 0 || newIndex < 0
        ? currentPhotos
        : arrayMove(currentPhotos, oldIndex, newIndex);
    });
  };

  return (
    <PageContainer variant="form" className="bg-primary-white pb-10 text-primary">
      <WorkHeader title="섹션 편집" onBack={onBack} />
      <main className="pt-5">
        <form
          id="section-details"
          onSubmit={(event) => handleSubmit(saveDetails)(event)}
          className="space-y-6"
          noValidate
        >
          <div className="space-y-2">
            <label htmlFor="section-name" className="typography-body-lg-semibold">
              섹션 제목{' '}
              <span className="text-error" aria-hidden="true">
                *
              </span>
            </label>
            <input
              {...register('title')}
              id="section-name"
              readOnly={!canEditCategory || isSubmitting}
              required
              aria-invalid={Boolean(errors.title)}
              aria-describedby={errors.title ? 'section-name-error' : undefined}
              placeholder="섹션 제목을 입력해주세요"
              className="typography-body-xl-regular min-h-11 w-full border-b border-primary bg-transparent py-3 text-primary placeholder:text-tertiary focus-visible:outline-2 focus-visible:outline-focus"
            />
            {errors.title && (
              <p
                id="section-name-error"
                role="alert"
                className="typography-body-md-medium text-error"
              >
                {errors.title.message}
              </p>
            )}
          </div>
          <div className="space-y-2">
            <label htmlFor="section-description" className="typography-body-lg-semibold">
              섹션 설명 <span className="typography-body-md-medium text-tertiary">· 선택</span>
            </label>
            <textarea
              {...register('description')}
              id="section-description"
              readOnly={!canEditCategory || isSubmitting}
              maxLength={CONTENT_DESCRIPTION_MAX_LENGTH}
              rows={4}
              aria-invalid={Boolean(errors.description)}
              aria-describedby={
                errors.description ? 'section-description-error' : 'section-description-count'
              }
              placeholder="섹션 설명을 입력해주세요"
              className="typography-body-xl-regular block min-h-32 w-full resize-y rounded-12 border border-primary bg-transparent p-4 text-primary placeholder:text-tertiary focus-visible:outline-2 focus-visible:outline-focus"
            />
            <p
              id="section-description-count"
              className="typography-body-md-medium text-right text-tertiary"
            >
              {currentDescription.length} / {CONTENT_DESCRIPTION_MAX_LENGTH}
            </p>
            {errors.description && (
              <p
                id="section-description-error"
                role="alert"
                className="typography-body-md-medium text-error"
              >
                {errors.description.message}
              </p>
            )}
          </div>
          {errors.root && (
            <p role="alert" className="typography-body-lg-regular text-error">
              {errors.root.message}
            </p>
          )}
        </form>

        <section aria-label="섹션 사진" className="mt-3">
          <div
            className={cn(
              'flex min-h-11 items-center justify-between gap-2',
              isEditingPhotos ? 'mb-1' : 'mb-3',
            )}
          >
            {isEditingPhotos ? (
              <p className="typography-body-md-medium text-secondary">
                순서 변경과 삭제는 자동으로 저장돼요
              </p>
            ) : (
              <h2 className="typography-body-lg-semibold">
                사진 {photos.length}/{MAX_CONTENT_IMAGES}
              </h2>
            )}
            {(canEditPhotos || isEditingPhotos) && (photos.length > 0 || isEditingPhotos) && (
              <button
                type="button"
                disabled={isPhotoActionPending}
                onClick={handlePhotoEdit}
                className={cn(
                  buttonClass,
                  'typography-body-md-semibold -mr-2 min-h-11 min-w-11 shrink-0 rounded-8 px-2 hover:bg-secondary',
                  isEditingPhotos && 'typography-body-lg-semibold',
                )}
              >
                {isSavingOrder ? '저장 중' : isEditingPhotos ? '완료' : '편집'}
              </button>
            )}
          </div>
          <input
            ref={fileInputRef}
            type="file"
            accept={SUPPORTED_PHOTO_TYPES.join(',')}
            multiple
            onChange={handleFileChange}
            className="hidden"
            aria-label="섹션 사진 추가"
          />
          {(rejectedPhotoCount > 0 || actionError) && (
            <div
              role="alert"
              className="mb-3 flex items-start gap-3 rounded-12 bg-secondary py-4 pl-4 pr-5"
            >
              <img src={PhotoNoticeIcon} alt="" className="shrink-0" />
              <div className="typography-body-lg-regular min-w-0 whitespace-pre-line text-secondary">
                {rejectedPhotoCount > 0 && (
                  <p>
                    {rejectedPhotoCount}장은 올리지 못했어요
                    <br />
                    지원하지 않는 형식이거나 20MB를 넘는 파일이에요
                  </p>
                )}
                {actionError && <p>{actionError}</p>}
              </div>
            </div>
          )}
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={handleDragEnd}
          >
            <SortableContext items={photos.map(getPhotoSortableId)} strategy={rectSortingStrategy}>
              <ul className="grid grid-cols-3 gap-2.5">
                {!isEditingPhotos && canCreateContent && (
                  <li className="aspect-square">
                    <button
                      type="button"
                      onClick={() => {
                        if (canCreateContent && !isPhotoActionPending)
                          fileInputRef.current?.click();
                      }}
                      disabled={photos.length >= MAX_CONTENT_IMAGES || isPhotoActionPending}
                      className={cn(
                        buttonClass,
                        'typography-body-md-medium flex size-full flex-col items-center justify-center gap-1 rounded-12 border border-primary hover:bg-secondary',
                      )}
                    >
                      <img src={PhotoAddIcon} alt="" />
                      {isBusy ? '업로드 중' : '사진 추가'}
                    </button>
                  </li>
                )}
                {photos.map((photo, index) => (
                  <SortablePhotoItem
                    key={photo.id}
                    photo={photo}
                    index={index}
                    isEditing={isEditingPhotos}
                    canReorder={canReorder}
                    disabled={isPhotoActionPending}
                    displayDetail={displayDetail}
                    onRemove={handleRemove}
                  />
                ))}
              </ul>
            </SortableContext>
          </DndContext>
          {photos.length === 0 && !canCreateContent && (
            <p className="typography-body-lg-regular py-6 text-secondary">
              아직 등록된 사진이 없어요.
            </p>
          )}
        </section>
      </main>
      {canEditCategory && isDirty && (
        <BottomFixedBar container="form">
          <button
            form="section-details"
            type="submit"
            disabled={isSubmitting || updateCategory.isPending}
            className={cn(
              buttonClass,
              'typography-body-lg-semibold min-h-11 w-full rounded-12 bg-interactive-primary px-4 text-interactive-inverse hover:bg-interactive-primary-hover active:bg-interactive-primary-press',
            )}
          >
            {isSubmitting ? '저장 중' : '섹션 정보 저장'}
          </button>
        </BottomFixedBar>
      )}
    </PageContainer>
  );
}
