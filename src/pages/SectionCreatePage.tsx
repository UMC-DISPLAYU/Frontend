import { type ChangeEvent, useEffect, useRef, useState } from 'react';

import { zodResolver } from '@hookform/resolvers/zod';
import { useForm, useWatch } from 'react-hook-form';
import { Navigate, useNavigate, useParams } from 'react-router-dom';

import {
  contentEditSchema,
  type ContentEditValues,
  isSectionPhotoFile,
  MAX_DISPLAY_SECTIONS,
  moveItemByKey,
  SECTION_PAGE_CLASS,
  SECTION_PHOTO_GRID,
  SECTION_PHOTO_TYPES,
  SECTION_TITLE_MAX_LENGTH,
  SECTION_TOOL_BUTTON,
  SectionAddPhotoButton,
  SectionFieldLabel,
  sectionInputClass,
  SectionPhotoCount,
  SectionPhotoNote,
  SectionPhotoTile,
  useLiveSort,
} from '@/components/artworks-manage';
import { ErrorView, LoadingView } from '@/components/common';
import { WorkBar } from '@/components/exhibition-work';
import { PageContainer } from '@/components/layout';
import { Overlay } from '@/components/ui';
import { MAX_CONTENT_IMAGES } from '@/constants';
import { useCreateSectionWithPhotos } from '@/hooks/queries/useContentCategories';
import { useDisplayDetail } from '@/hooks/queries/useDisplayDetail';
import { useImageUpload } from '@/hooks/useImageUpload';
import { toast } from '@/stores/toastStore';
import { getErrorMessage } from '@/utils/error';

type DraftPhoto = { id: string; file: File; url: string };

/*
 * 프로토타입 section.html?new=1(11-15 U-151): 섹션 추가는 전체 화면이다.
 * 제목과 사진 1장 이상이 있어야 '추가하기'가 눌리고, 누르기 전에는 아무것도 저장하지 않는다
 */
export function SectionCreatePage() {
  const { displayId: displayIdParam } = useParams();
  const displayId = Number(displayIdParam ?? 0);
  const { data: display, isPending, isError, refetch } = useDisplayDetail(displayId);
  const backPath = `/exhibition/${displayId}/work?tab=contents`;

  if (isPending) return <LoadingView message="전시 정보를 불러오는 중..." />;
  if (isError || !display) {
    return <ErrorView message="전시 정보를 불러오지 못했어요." onRetry={() => void refetch()} />;
  }
  // 섹션은 5개까지(프로토타입: 5개면 이 화면 대신 전시 콘텐츠로)
  if ((display.contentCategories?.length ?? 0) >= MAX_DISPLAY_SECTIONS) {
    return <Navigate to={backPath} replace />;
  }

  return <SectionCreateForm displayId={displayId} backPath={backPath} />;
}

function SectionCreateForm({ displayId, backPath }: { displayId: number; backPath: string }) {
  const navigate = useNavigate();
  const createSection = useCreateSectionWithPhotos(displayId);
  const imageUpload = useImageUpload({ domain: 'display' });
  const fileInputRef = useRef<HTMLInputElement>(null);
  const nextIdRef = useRef(0);
  const photosRef = useRef<DraftPhoto[]>([]);
  const [photos, setPhotos] = useState<DraftPhoto[]>([]);
  const [editing, setEditing] = useState(false);
  const [rejectedCount, setRejectedCount] = useState(0);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [leaveOpen, setLeaveOpen] = useState(false);
  const {
    register,
    control,
    formState: { errors },
  } = useForm<ContentEditValues>({
    resolver: zodResolver(contentEditSchema),
    mode: 'onChange',
    defaultValues: { title: '' },
  });
  const title = useWatch({ control, name: 'title' }) ?? '';
  const ready = title.trim().length > 0 && photos.length > 0;
  const photoSort = useLiveSort({
    items: photos,
    disabled: !editing || submitting,
    onSort: setPhotos,
  });
  const sortedPhotos = photoSort.items;
  const draggingPhotoId = photoSort.draggingId;
  const startPhotoDrag = photoSort.startDrag;

  // 화면을 나가면 고른 사진의 미리보기 주소를 풀어 준다
  useEffect(() => {
    photosRef.current = photos;
  });
  useEffect(() => () => photosRef.current.forEach((photo) => URL.revokeObjectURL(photo.url)), []);

  // 돌아갈 기록이 없으면(주소로 바로 연 경우) 전시 콘텐츠로 보낸다
  const leave = () => {
    const historyIndex = window.history.state?.idx;
    if (typeof historyIndex === 'number' && historyIndex > 0) navigate(-1);
    else navigate(backPath, { replace: true });
  };

  // 프로토타입: 입력한 게 있으면 나갈지 묻는다(작품 · 전시 등록과 같은 모달)
  const handleBack = () => {
    if (title.trim() || photos.length > 0) setLeaveOpen(true);
    else leave();
  };

  const handleFiles = (event: ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files ?? []);
    event.target.value = '';
    if (files.length === 0) return;
    const valid = files.filter(isSectionPhotoFile);
    setRejectedCount(files.length - valid.length);
    setSubmitError(null);
    const slots = Math.max(MAX_CONTENT_IMAGES - photos.length, 0);
    if (valid.length > slots) toast(`사진은 최대 ${MAX_CONTENT_IMAGES}장까지 올릴 수 있어요`);
    const added = valid.slice(0, slots).map((file) => {
      nextIdRef.current += 1;
      return { id: `draft-${nextIdRef.current}`, file, url: URL.createObjectURL(file) };
    });
    if (added.length > 0) setPhotos((previous) => [...previous, ...added]);
  };

  // 사진은 1장 이상 필수라 마지막 한 장은 지우지 않는다. 한 장만 남으면 편집을 닫는다
  const handleRemove = (id: string) => {
    if (photos.length < 2) return;
    const target = photos.find((photo) => photo.id === id);
    if (target) URL.revokeObjectURL(target.url);
    const next = photos.filter((photo) => photo.id !== id);
    setPhotos(next);
    if (next.length < 2) setEditing(false);
  };

  const handleSubmit = async () => {
    if (!ready || submitting) return;
    setSubmitting(true);
    setSubmitError(null);
    try {
      const imageUrls = await Promise.all(
        photos.map((photo) => imageUpload.uploadImage(photo.file)),
      );
      const { categoryId, failedCount } = await createSection.mutateAsync({
        title: title.trim(),
        imageUrls,
      });
      if (failedCount > 0) {
        // 섹션은 만들어졌으니 섹션 편집에서 나머지 사진을 다시 올리게 한다
        toast(`사진 ${failedCount}장은 올리지 못했어요. 섹션 편집에서 다시 올려 주세요`);
        navigate(`/exhibition/${displayId}/contents/${categoryId}`, { replace: true });
        return;
      }
      toast('섹션을 추가했어요');
      leave();
    } catch (error) {
      setSubmitError(getErrorMessage(error, '섹션을 추가하지 못했어요. 다시 시도해주세요.'));
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-dvh bg-[#fff]">
      <PageContainer variant="form" className={SECTION_PAGE_CLASS}>
        <WorkBar title="섹션 추가" onBack={handleBack} />
        <main className="flex-1">
          <div className="mt-3">
            <SectionFieldLabel htmlFor="section-new-title" required>
              섹션 제목
            </SectionFieldLabel>
            <input
              {...register('title')}
              id="section-new-title"
              maxLength={SECTION_TITLE_MAX_LENGTH}
              placeholder="섹션 제목을 입력해주세요"
              autoComplete="off"
              aria-required="true"
              aria-invalid={Boolean(errors.title)}
              className={sectionInputClass}
            />
          </div>

          <section aria-label="섹션 사진">
            <div className="mt-3 flex h-11 items-center justify-between">
              {editing ? (
                <p className="text-[12px] font-medium text-[#3f3f47]">
                  순서 변경과 삭제는 자동으로 저장돼요
                </p>
              ) : (
                <SectionPhotoCount count={photos.length} max={MAX_CONTENT_IMAGES} />
              )}
              {(photos.length > 1 || editing) && (
                <button
                  type="button"
                  disabled={submitting}
                  onClick={() => setEditing((previous) => !previous)}
                  className={SECTION_TOOL_BUTTON}
                >
                  {editing ? '완료' : '편집'}
                </button>
              )}
            </div>
            <input
              ref={fileInputRef}
              type="file"
              accept={SECTION_PHOTO_TYPES.join(',')}
              multiple
              onChange={handleFiles}
              className="hidden"
              aria-label="섹션 사진 추가"
            />
            <SectionPhotoNote rejectedCount={rejectedCount} message={submitError} />
            <ul className={SECTION_PHOTO_GRID}>
              {!editing && photos.length < MAX_CONTENT_IMAGES && (
                <SectionAddPhotoButton
                  busy={false}
                  disabled={submitting}
                  onClick={() => fileInputRef.current?.click()}
                />
              )}
              {sortedPhotos.map((photo, index) => (
                <SectionPhotoTile
                  key={photo.id}
                  id={photo.id}
                  src={photo.url}
                  alt={photo.file.name}
                  index={index}
                  editing={editing}
                  canDrag={editing && !submitting}
                  canDelete={photos.length > 1}
                  dragging={draggingPhotoId === photo.id}
                  disabled={submitting}
                  onPointerDown={(event) => startPhotoDrag(event, photo.id)}
                  onMoveByKey={(key) => {
                    const next = moveItemByKey(photos, photo.id, key);
                    if (next) setPhotos(next);
                    return Boolean(next);
                  }}
                  onRemove={() => handleRemove(photo.id)}
                />
              ))}
            </ul>
          </section>
        </main>
        {/* 프로토타입 `.cta`: 화면 아래에 붙는 버튼(위 20 · 아래 16 + safe area, 위쪽은 흰색으로 흐려짐) */}
        <div className="sticky bottom-0 z-5 bg-[linear-gradient(to_bottom,rgba(255,255,255,0),#fff_28%)] pt-5 pb-[max(16px,env(safe-area-inset-bottom))]">
          <button
            type="button"
            disabled={!ready || submitting}
            onClick={() => void handleSubmit()}
            className="grid h-12 w-full place-items-center rounded-12 bg-[#18181b] text-[16px] font-semibold text-[#fff] transition duration-fast hover:bg-[#2f2f35] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#18181b] active:scale-99 disabled:cursor-default disabled:bg-[#f4f4f5] disabled:text-[#d4d4d8] disabled:active:scale-100"
          >
            {submitting ? '추가하는 중' : '추가하기'}
          </button>
        </div>
      </PageContainer>

      <Overlay
        open={leaveOpen}
        onClose={() => setLeaveOpen(false)}
        title="섹션 추가를 나갈까요?"
        role="alertdialog"
        size="sm"
        presentation="modal"
        className="max-w-80.5"
        showCloseButton={false}
        footer={
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => setLeaveOpen(false)}
              className="h-11 rounded-12 bg-[#f0f0f3] text-[14px] font-semibold tracking-[-0.03em] text-[#18181b] transition duration-fast hover:bg-[#e4e4e7] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#18181b] active:scale-98"
            >
              계속 작성
            </button>
            <button
              type="button"
              // 오버레이 안에서 다른 화면으로 갈 때는 replace 로 이동한다(오버레이가 쌓은 기록을 대체)
              onClick={() => navigate(backPath, { replace: true })}
              className="h-11 rounded-12 bg-[#18181b] text-[14px] font-semibold tracking-[-0.03em] text-[#fff] transition duration-fast hover:bg-[#2f2f35] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#18181b] active:scale-98"
            >
              나가기
            </button>
          </div>
        }
      >
        <p className="-mt-2 text-[14px] leading-[1.4] font-normal tracking-[-0.03em] text-[#71717b]">
          입력한 내용은 저장되지 않아요
        </p>
      </Overlay>
    </div>
  );
}
