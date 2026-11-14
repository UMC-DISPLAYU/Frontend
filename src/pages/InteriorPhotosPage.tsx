import { type PointerEvent as ReactPointerEvent, useEffect, useRef, useState } from 'react';

import { zodResolver } from '@hookform/resolvers/zod';
import { useForm, useWatch } from 'react-hook-form';
import { useParams } from 'react-router-dom';

import type { DisplayDetailDto } from '@/api/dto';
import {
  type ContentEditValues,
  moveItemByKey,
  SECTION_DESCRIPTION_MAX_LENGTH,
  SECTION_TITLE_MAX_LENGTH,
  sectionEditSchema,
  SectionFieldLabel,
  sectionInputClass,
  sectionTextareaClass,
  useLiveSort,
} from '@/components/artworks-manage';
import { ErrorView } from '@/components/common';
import { OptimizedImage } from '@/components/common/OptimizedImage';
import { WorkBar, WorkIcon } from '@/components/exhibition-work';
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

const SUPPORTED_PHOTO_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
const MAX_PHOTO_FILE_SIZE = 20 * 1024 * 1024;
const focusRing =
  'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#18181b]';
const TOOL_BUTTON = `inline-flex h-8 items-center pl-2 text-[12px] font-semibold disabled:cursor-default disabled:text-[#d4d4d8] ${focusRing}`;
/* 프로토타입 section.html `.page`: 폭 480 · 768px 이상 672, 위 여백 8(safe area) · 768px 이상 40, 모든 글자 자간 -0.03em */
const PAGE_CLASS =
  'max-w-120 pt-[max(8px,env(safe-area-inset-top))] text-[14px] leading-[1.4] font-medium text-[#18181b] tablet:max-w-168 tablet:pt-10 [&_*]:tracking-[-0.03em]';
/* 프로토타입 `.pgrid`: 3열 · 640px 이상 4열, 간격 10 */
const PHOTO_GRID = 'mt-1 grid grid-cols-3 gap-2.5 pb-8 min-[640px]:grid-cols-4';

interface SortablePhotoItemProps {
  photo: Photo;
  index: number;
  isEditing: boolean;
  canReorder: boolean;
  disabled: boolean;
  dragging: boolean;
  displayDetail: DisplayDetailDto;
  onRemove: (id: string | number) => void;
  onPointerDown: (event: ReactPointerEvent<HTMLElement>) => void;
  onMoveByKey: (key: string) => boolean;
}

/*
 * 프로토타입 section.html `.pgrid.edit .ph`: 편집 모드에서는 사진 칸 어디를 눌러도 끈다(삭제 버튼 제외).
 * 끄는 칸은 제자리에서 흐려지고(.ph.drag 투명도 .55) 다른 칸 위로 가면 바로 자리를 바꾼다
 */
function SortablePhotoItem({
  photo,
  index,
  isEditing,
  canReorder,
  disabled,
  dragging,
  displayDetail,
  onRemove,
  onPointerDown,
  onMoveByKey,
}: SortablePhotoItemProps) {
  const displayContentPolicy = useDisplayContentPolicy(displayDetail, photo);
  const canDeleteContent = hasPermission(displayContentPolicy, 'deleteContent');
  const canDrag = isEditing && canReorder && !disabled;

  return (
    <li
      data-sort-id={photo.id}
      tabIndex={canDrag ? 0 : undefined}
      aria-label={canDrag ? `사진 ${index + 1}, 방향키로 순서 이동` : undefined}
      onPointerDown={onPointerDown}
      onKeyDown={(event) => {
        if (canDrag && onMoveByKey(event.key)) event.preventDefault();
      }}
      className={cn(
        'relative aspect-3/4 min-w-0 overflow-hidden bg-[#f4f4f5] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#18181b]',
        isEditing && 'touch-none select-none',
        canDrag && 'cursor-grab active:cursor-grabbing',
        dragging && 'opacity-55',
      )}
    >
      <div className="h-full animate-rise" style={staggerStyle(index)}>
        <OptimizedImage
          src={photo.url}
          alt={photo.alt ?? `사진 ${index + 1}`}
          displayWidth={208}
          skeleton
          draggable={false}
          frameClassName="h-full w-full"
          className="object-cover"
        />
      </div>
      {isEditing && (
        <>
          <span
            aria-hidden="true"
            className="absolute top-1.5 left-1.5 grid size-6 place-items-center rounded-circle bg-[rgba(0,0,0,.55)] text-[10px] font-semibold text-[#fff] tabular-nums"
          >
            {index + 1}
          </span>
          {canDeleteContent && (
            <button
              type="button"
              data-sort-ignore
              disabled={disabled}
              onClick={() => onRemove(photo.id)}
              aria-label={`사진 ${index + 1} 삭제`}
              className="absolute top-1.5 right-1.5 grid size-7 place-items-center rounded-circle bg-[rgba(0,0,0,.55)] text-[#fff] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#fff] disabled:opacity-40"
            >
              <WorkIcon name="close" className="size-3.5" strokeWidth={2.2} />
            </button>
          )}
        </>
      )}
    </li>
  );
}

export function InteriorPhotosPage() {
  const flowBack = useFlowBack();
  const { displayId: paramDisplayId, categoryId: paramCategoryId } = useParams();
  const displayId = Number(paramDisplayId ?? 0);
  const categoryId = Number(paramCategoryId ?? 0);
  const { data: displayDetail, isPending, error } = useDisplayDetail(displayId);
  const displayContentPolicy = useDisplayContentPolicy(displayDetail);

  if (isPending) {
    return (
      <div className="min-h-dvh bg-[#fff]">
        <PageContainer variant="form" className={PAGE_CLASS}>
          <WorkBar title="섹션 편집" onBack={flowBack} />
          <main aria-label="섹션을 불러오는 중" aria-busy="true" className="space-y-6 pt-3">
            <Skeleton className="h-[71px] w-full rounded-4" />
            <Skeleton className="h-40 w-full rounded-12" />
            <div className={PHOTO_GRID}>
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
  const savingDetailsRef = useRef(false);
  const savedRef = useRef<ContentEditValues>({ title, description });
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
    control,
    reset,
    setError,
    setValue,
    formState: { errors },
  } = useForm<ContentEditValues>({
    resolver: zodResolver(sectionEditSchema),
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

  // 프로토타입 자동 저장: 제목 · 설명은 입력칸을 벗어나거나 화면을 나갈 때 저장한다
  const saveDetails = async (values: ContentEditValues) => {
    if (!canEditCategory) return;
    if (savingDetailsRef.current) {
      resaveRef.current = true;
      return;
    }
    if (
      values.title === savedRef.current.title &&
      values.description === savedRef.current.description
    )
      return;
    savingDetailsRef.current = true;
    try {
      await updateCategory.mutateAsync({
        categoryId,
        body: { name: values.title, description: values.description },
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
    const validFiles = Array.from(files).filter(
      (file) => SUPPORTED_PHOTO_TYPES.includes(file.type) && file.size <= MAX_PHOTO_FILE_SIZE,
    );
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
      <PageContainer variant="form" className={PAGE_CLASS}>
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
            <div className="mt-6">
              <SectionFieldLabel htmlFor="section-description" optional>
                섹션 설명
              </SectionFieldLabel>
              <textarea
                {...register('description')}
                onBlur={(event) => {
                  void register('description').onBlur(event);
                  void autoSave();
                }}
                id="section-description"
                readOnly={!canEditCategory}
                maxLength={SECTION_DESCRIPTION_MAX_LENGTH}
                aria-invalid={Boolean(errors.description)}
                aria-describedby={
                  errors.description ? 'section-description-error' : 'section-description-count'
                }
                placeholder="섹션 설명을 입력해주세요"
                className={`${sectionTextareaClass} h-32`}
              />
              <p
                id="section-description-count"
                className="mt-2 text-right text-[12px] font-medium text-[#71717b] tabular-nums"
              >
                {currentDescription.length} / {SECTION_DESCRIPTION_MAX_LENGTH}
              </p>
              {errors.description && (
                <p
                  id="section-description-error"
                  role="alert"
                  className="text-[12px] font-medium text-[#fb2c36]"
                >
                  {errors.description.message}
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
                <h2 className="text-[14px] font-semibold tabular-nums">
                  사진 {photos.length}/{MAX_CONTENT_IMAGES}
                </h2>
              )}
              {(canEditPhotos || isEditingPhotos) && (photos.length > 0 || isEditingPhotos) && (
                <button
                  type="button"
                  disabled={isPhotoActionPending}
                  onClick={handlePhotoEdit}
                  className={TOOL_BUTTON}
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
                className="mt-3 flex items-start gap-2.5 rounded-12 bg-[#f4f4f5] px-3.5 py-3"
              >
                <WorkIcon name="info" className="mt-px size-4.5 text-[#71717b]" />
                <div className="min-w-0 text-[12px] leading-[1.4] font-medium whitespace-pre-line text-[#3f3f47]">
                  {rejectedPhotoCount > 0 && (
                    <p>
                      <b className="block font-semibold text-[#18181b]">
                        {rejectedPhotoCount}장은 올리지 못했어요
                      </b>
                      지원하지 않는 형식이거나 20MB를 넘는 파일이에요
                    </p>
                  )}
                  {actionError && <p>{actionError}</p>}
                </div>
              </div>
            )}
            <ul className={PHOTO_GRID}>
              {!isEditingPhotos && canCreateContent && photos.length < MAX_CONTENT_IMAGES && (
                <li className="aspect-3/4">
                  <button
                    type="button"
                    onClick={() => {
                      if (canCreateContent && !isPhotoActionPending) fileInputRef.current?.click();
                    }}
                    disabled={isPhotoActionPending}
                    className={`grid size-full content-center justify-items-center gap-1.5 border border-[#d4d4d8] text-[12px] font-medium transition-colors duration-fast hover:bg-[#f4f4f5] disabled:cursor-default disabled:text-[#d4d4d8] ${focusRing}`}
                  >
                    <WorkIcon name="plus" className="size-6.5" strokeWidth={1.6} />
                    {isBusy ? '업로드 중' : '사진 추가'}
                  </button>
                </li>
              )}
              {sortedPhotos.map((photo, index) => (
                <SortablePhotoItem
                  key={photo.id}
                  photo={photo}
                  index={index}
                  isEditing={isEditingPhotos}
                  canReorder={canReorder}
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
