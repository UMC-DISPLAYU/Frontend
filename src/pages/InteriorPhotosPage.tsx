import { type PointerEvent as ReactPointerEvent, useEffect, useRef, useState } from 'react';

import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { useParams } from 'react-router-dom';

import type { DisplayDetailDto } from '@/api/dto';
import {
  type ContentEditValues,
  isSectionPhotoFile,
  moveItemByKey,
  SECTION_PAGE_CLASS,
  SECTION_PHOTO_GRID,
  SECTION_PHOTO_TYPES,
  SECTION_TITLE_MAX_LENGTH,
  SECTION_TOOL_BUTTON,
  SectionAddPhotoButton,
  sectionEditSchema,
  SectionFieldLabel,
  sectionInputClass,
  SectionPhotoCount,
  SectionPhotoNote,
  SectionPhotoTile,
  useLiveSort,
} from '@/components/artworks-manage';
import { ErrorView } from '@/components/common';
import { WorkBar } from '@/components/exhibition-work';
import { PageContainer } from '@/components/layout';
import { Skeleton, SkeletonList } from '@/components/ui';
import {
  DEFAULT_CONTENT_IMAGE_HEIGHT,
  DEFAULT_CONTENT_IMAGE_WIDTH,
  MAX_CONTENT_IMAGES,
} from '@/constants';
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
import { useSkeleton } from '@/hooks/useSkeleton';
import { policies } from '@/policies/policies';
import { toast } from '@/stores/toastStore';
import { getErrorMessage } from '@/utils/error';
import { hasPermission } from '@/utils/hasPermission';

type Photo = {
  id: string | number;
  url: string;
  alt?: string;
  userId?: number;
};

interface SortablePhotoItemProps {
  photo: Photo;
  index: number;
  isEditing: boolean;
  canReorder: boolean;
  /* 마지막 한 장은 지울 수 없다(사진 1장 이상 필수, 프로토타입 11-15) */
  canRemoveAny: boolean;
  disabled: boolean;
  dragging: boolean;
  displayDetail: DisplayDetailDto;
  onRemove: (id: string | number) => void;
  onPointerDown: (event: ReactPointerEvent<HTMLElement>) => void;
  onMoveByKey: (key: string) => boolean;
}

function SortablePhotoItem({
  photo,
  index,
  isEditing,
  canReorder,
  canRemoveAny,
  disabled,
  dragging,
  displayDetail,
  onRemove,
  onPointerDown,
  onMoveByKey,
}: SortablePhotoItemProps) {
  const displayContentPolicy = useDisplayContentPolicy(displayDetail, photo);
  const canDeleteContent = hasPermission(displayContentPolicy, 'deleteContent');

  return (
    <SectionPhotoTile
      id={photo.id}
      src={photo.url}
      alt={photo.alt}
      index={index}
      editing={isEditing}
      canDrag={isEditing && canReorder && !disabled}
      canDelete={canDeleteContent && canRemoveAny}
      dragging={dragging}
      disabled={disabled}
      onPointerDown={onPointerDown}
      onMoveByKey={onMoveByKey}
      onRemove={() => onRemove(photo.id)}
    />
  );
}

export function InteriorPhotosPage() {
  const flowBack = useFlowBack();
  const { displayId: paramDisplayId, categoryId: paramCategoryId } = useParams();
  const displayId = Number(paramDisplayId ?? 0);
  const categoryId = Number(paramCategoryId ?? 0);
  const { data: displayDetail, isPending, error } = useDisplayDetail(displayId);
  const displayContentPolicy = useDisplayContentPolicy(displayDetail);
  const { showSkeleton } = useSkeleton(isPending);

  if (showSkeleton) {
    return (
      <div className="min-h-dvh bg-[#fff]">
        <PageContainer variant="form" className={SECTION_PAGE_CLASS}>
          <WorkBar title="섹션 편집" onBack={flowBack} />
          <main aria-label="섹션을 불러오는 중" aria-busy="true" className="space-y-6 pt-3">
            <Skeleton className="h-[71px] w-full rounded-4" />
            <Skeleton className="h-40 w-full rounded-12" />
            <div className={SECTION_PHOTO_GRID}>
              <SkeletonList count={6}>
                {() => <Skeleton className="aspect-3/4 rounded-0" />}
              </SkeletonList>
            </div>
          </main>
        </PageContainer>
      </div>
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
  const savingDetailsRef = useRef(false);
  const savedRef = useRef<ContentEditValues>({ title });
  // 저장 중에 다른 칸을 고치고 벗어나면 끝난 뒤 한 번 더 저장한다
  const resaveRef = useRef(false);
  const leaveSaveRef = useRef<() => void>(() => undefined);
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
    reset,
    setError,
    setValue,
    formState: { errors },
  } = useForm<ContentEditValues>({
    resolver: zodResolver(sectionEditSchema),
    defaultValues: { title },
  });
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

  // 프로토타입 자동 저장: 제목 · 설명은 입력칸을 벗어나거나 화면을 나갈 때 저장한다
  const saveDetails = async (values: ContentEditValues) => {
    if (!canEditCategory) return;
    if (savingDetailsRef.current) {
      resaveRef.current = true;
      return;
    }
    if (values.title === savedRef.current.title) return;
    savingDetailsRef.current = true;
    try {
      await updateCategory.mutateAsync({
        categoryId,
        body: { name: values.title },
      });
      savedRef.current = values;
      reset(values);
    } catch (error) {
      setError('root', {
        message: getErrorMessage(error, '섹션 정보를 저장하지 못했어요. 다시 시도해주세요.'),
      });
    } finally {
      savingDetailsRef.current = false;
      if (resaveRef.current) {
        resaveRef.current = false;
        void autoSave();
      }
    }
  };
  // 제목을 비운 채 벗어나면 직전 제목으로 되돌린다(프로토타입)
  const autoSave = () =>
    handleSubmit(saveDetails, (formErrors) => {
      if (formErrors.title) setValue('title', savedRef.current.title, { shouldValidate: true });
    })();
  // 브라우저 뒤로가기 · 냅바처럼 입력칸을 벗어나지 않고 화면을 나가도 저장한다(프로토타입 pagehide 저장)
  useEffect(() => {
    leaveSaveRef.current = () => void autoSave();
  });
  useEffect(() => () => leaveSaveRef.current(), []);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!canCreateContent || photoActionRef.current || isPhotoActionPending) return;
    const files = e.target.files;
    if (!files?.length) return;
    const validFiles = Array.from(files).filter(isSectionPhotoFile);
    setRejectedPhotoCount(files.length - validFiles.length);
    setActionError(null);
    const remainingSlots = Math.max(MAX_CONTENT_IMAGES - photos.length, 0);
    const filesToAdd = validFiles.slice(0, remainingSlots);
    if (validFiles.length > remainingSlots)
      toast(`사진은 최대 ${MAX_CONTENT_IMAGES}장까지 올릴 수 있어요`);
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
    // 사진은 1장 이상 필수라 마지막 한 장은 지우지 않는다(프로토타입 11-15)
    if (photoActionRef.current || isPhotoActionPending || photos.length < 2) return;
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
    // 한 장만 남으면 편집할 것이 없어 편집 모드를 닫는다
    if (previous.length - 1 < 2) setIsEditingPhotos(false);
    deleteImage.mutate(Number(id), {
      onSuccess: () => {
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
    if (!isEditingPhotos && !canEditPhotos) return;
    setIsEditingPhotos(!isEditingPhotos);
  };

  // 프로토타입: 손을 뗄 때 바뀐 순서를 바로 저장한다
  const handleReorder = (reordered: Photo[]) => {
    if (!isEditingPhotos || !canReorder || photoActionRef.current || isPhotoActionPending) return;
    const previous = photos;
    photoActionRef.current = true;
    setActionError(null);
    setPhotos(reordered);
    reorderImages.mutate(
      reordered.map((photo) => Number(photo.id)),
      {
        onSuccess: () => {
          photoActionRef.current = false;
        },
        onError: (error) => {
          setPhotos(previous);
          setActionError(
            getErrorMessage(error, '사진 순서 저장에 실패했어요. 잠시 후 다시 시도해주세요.'),
          );
          photoActionRef.current = false;
        },
      },
    );
  };

  const photoSort = useLiveSort({
    items: photos,
    disabled: !isEditingPhotos || !canReorder || isPhotoActionPending,
    onSort: handleReorder,
  });
  const sortedPhotos = photoSort.items;
  const draggingPhotoId = photoSort.draggingId;
  const startPhotoDrag = photoSort.startDrag;

  return (
    <div className="min-h-dvh bg-[#fff]">
      <PageContainer variant="form" className={SECTION_PAGE_CLASS}>
        <WorkBar title="섹션 편집" onBack={onBack} />
        <main className="flex-1">
          <form
            id="section-details"
            onSubmit={(event) => handleSubmit(saveDetails)(event)}
            noValidate
            autoComplete="off"
          >
            <div className="mt-3">
              <SectionFieldLabel htmlFor="section-name" required>
                섹션 제목
              </SectionFieldLabel>
              <input
                {...register('title')}
                onBlur={(event) => {
                  void register('title').onBlur(event);
                  void autoSave();
                }}
                id="section-name"
                readOnly={!canEditCategory}
                required
                maxLength={SECTION_TITLE_MAX_LENGTH}
                aria-invalid={Boolean(errors.title)}
                aria-describedby={errors.title ? 'section-name-error' : undefined}
                placeholder="섹션 제목을 입력해주세요"
                className={sectionInputClass}
              />
              {errors.title && (
                <p
                  id="section-name-error"
                  role="alert"
                  className="mt-1 text-[12px] font-medium text-[#fb2c36]"
                >
                  {errors.title.message}
                </p>
              )}
            </div>
            {errors.root && (
              <p role="alert" className="mt-2 text-[12px] font-medium text-[#fb2c36]">
                {errors.root.message}
              </p>
            )}
          </form>

          <section aria-label="섹션 사진">
            <div className="mt-3 flex h-11 items-center justify-between">
              {isEditingPhotos ? (
                <p className="text-[12px] font-medium text-[#3f3f47]">
                  순서 변경과 삭제는 자동으로 저장돼요
                </p>
              ) : (
                <SectionPhotoCount count={photos.length} max={MAX_CONTENT_IMAGES} />
              )}
              {/* 프로토타입 11-15: 한 장뿐이면 옮기거나 지울 것이 없어 편집을 두지 않는다 */}
              {(canEditPhotos || isEditingPhotos) && (photos.length > 1 || isEditingPhotos) && (
                <button
                  type="button"
                  disabled={isPhotoActionPending}
                  onClick={handlePhotoEdit}
                  className={SECTION_TOOL_BUTTON}
                >
                  {isSavingOrder ? '저장 중' : isEditingPhotos ? '완료' : '편집'}
                </button>
              )}
            </div>
            <input
              ref={fileInputRef}
              type="file"
              accept={SECTION_PHOTO_TYPES.join(',')}
              multiple
              onChange={handleFileChange}
              className="hidden"
              aria-label="섹션 사진 추가"
            />
            <SectionPhotoNote rejectedCount={rejectedPhotoCount} message={actionError} />
            <ul className={SECTION_PHOTO_GRID}>
              {!isEditingPhotos && canCreateContent && photos.length < MAX_CONTENT_IMAGES && (
                <SectionAddPhotoButton
                  busy={isBusy}
                  disabled={isPhotoActionPending}
                  onClick={() => {
                    if (canCreateContent && !isPhotoActionPending) fileInputRef.current?.click();
                  }}
                />
              )}
              {sortedPhotos.map((photo, index) => (
                <SortablePhotoItem
                  key={photo.id}
                  photo={photo}
                  index={index}
                  isEditing={isEditingPhotos}
                  canReorder={canReorder}
                  canRemoveAny={photos.length > 1}
                  disabled={isPhotoActionPending}
                  dragging={draggingPhotoId === photo.id}
                  displayDetail={displayDetail}
                  onRemove={handleRemove}
                  onPointerDown={(event) => startPhotoDrag(event, photo.id)}
                  onMoveByKey={(key) => {
                    const next = moveItemByKey(photos, photo.id, key);
                    if (next) handleReorder(next);
                    return Boolean(next);
                  }}
                />
              ))}
            </ul>
            {photos.length === 0 && !canCreateContent && (
              <p className="py-6 text-[14px] text-[#3f3f47]">아직 등록된 사진이 없어요</p>
            )}
          </section>
        </main>
      </PageContainer>
    </div>
  );
}
