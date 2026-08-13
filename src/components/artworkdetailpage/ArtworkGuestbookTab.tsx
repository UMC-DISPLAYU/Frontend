import { useEffect, useRef, useState } from 'react';

import { Check, ChevronDown, ChevronUp, Lock, Plus, X } from 'lucide-react';

import type {
  ArtworkFeelingDto,
  DisplayDetailDto,
  GetArtworkDetailResponseDataDto,
} from '@/api/dto';
import { useImageUpload } from '@/hooks/useImageUpload';
import type { ArtworkGuestbookTab, GuestbookQuestion } from '@/types/exhibition';
import { cn } from '@/utils/cn';
import { formatRelativeTime } from '@/utils/date';
import { readImageDimensions } from '@/utils/image';

import { ArtworkFeelingCommentItem } from './ArtworkFeelingCommentItem';

const QUESTION_MAX_IMAGES = 5;

type ComposerImage = { imageUrl: string; width?: number; height?: number };

/* 스크롤 대신 박스 자체가 늘어나도록 내용에 맞춰 textarea 높이를 맞춥니다.
 * imagesLength도 함께 보고 있어야, 사진 추가/삭제로 min-height class가 바뀌는 순간에도
 * (텍스트를 입력하기 전이라도) 즉시 높이를 다시 계산합니다. */
function useAutoResizeTextarea(value: string, imagesLength: number) {
  const ref = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    el.style.height = 'auto';
    el.style.height = `${el.scrollHeight}px`;
  }, [value, imagesLength]);

  return ref;
}

/* 선택된 이미지 미리보기 줄. */
function ImagePreviewRow({
  images,
  onRemove,
  disabled = false,
}: {
  images: { id: string; previewUrl: string }[];
  onRemove: (id: string) => void;
  disabled?: boolean;
}) {
  if (images.length === 0) return null;

  return (
    <div className="flex w-full items-center gap-2 self-stretch overflow-x-auto pt-1.5 pr-1.5">
      {images.map((image) => (
        <div key={image.id} className="relative size-16 shrink-0 self-stretch">
          <img src={image.previewUrl} alt="" className="size-16 rounded-lg object-cover" />
          <button
            type="button"
            onClick={() => onRemove(image.id)}
            disabled={disabled}
            aria-label="이미지 삭제"
            className="absolute -top-1.5 -right-1.5 grid size-5 place-items-center rounded-full bg-main disabled:opacity-50"
          >
            <X size={12} className="text-white" strokeWidth={2.5} />
          </button>
        </div>
      ))}
    </div>
  );
}

/* 원래 있던 "사진추가" 텍스트 버튼과 똑같은 자리에 놓는, 숨은 파일 입력을 여는 버튼. */
function ImagePickButton({
  onPick,
  canAddMore,
  disabled,
}: {
  onPick: (files: FileList) => void;
  canAddMore: boolean;
  disabled: boolean;
}) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  return (
    <>
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        multiple
        onChange={(event) => {
          if (event.target.files?.length) onPick(event.target.files);
          event.target.value = '';
        }}
        className="hidden"
      />
      <button
        type="button"
        onClick={() => fileInputRef.current?.click()}
        disabled={!canAddMore || disabled}
        className="typo-body-sm-regular text-faint underline disabled:opacity-50"
      >
        사진추가
      </button>
    </>
  );
}

type Props = {
  feelings: ArtworkFeelingDto[];
  hasMoreFeelings?: boolean;
  onLoadMoreFeelings?: () => void;
  isLoadingMoreFeelings?: boolean;
  questions: GuestbookQuestion[];
  hasMoreQuestions?: boolean;
  onLoadMoreQuestions?: () => void;
  isLoadingMoreQuestions?: boolean;
  artworkId: number;
  myUserId?: number;
  artwork: GetArtworkDetailResponseDataDto;
  display: DisplayDetailDto;
  /* 상위 탭바(소개/방명록/질문)가 결정한 현재 섹션 */
  activeTab: ArtworkGuestbookTab;
  /* 하단 입력바가 답글 대상으로 잡고 있는 감상 id (댓글 하이라이트용) */
  activeReplyId?: string | null;
  onFeelingReplyClick?: (commentId: number, author: string, highlightId: string) => void;
  /* 작가가 답변할 질문 id */
  replyTargetQuestionId?: number | null;
  onQuestionReplyTargetChange?: (question: GuestbookQuestion | null) => void;
  onAddQuestionClick?: () => void;
  /* 새 질문 작성 카드가 열려 있는지 여부 */
  isComposingQuestion?: boolean;
  onCloseComposeQuestion?: () => void;
  onSubmitQuestion?: (payload: {
    content: string;
    isPrivate: boolean;
    images?: ComposerImage[];
  }) => Promise<void>;
  isSubmittingQuestion?: boolean;
  onDeleteQuestion?: (questionId: number) => void;
  onDeleteReply?: (questionId: number, questionReplyId: number) => void;
};

/* 방명록 질문 탭 카드 (일반인 시점 / 작가 시점 지원) */
function QuestionCard({
  question,
  artistName,
  myUserId,
  isReplyTarget = false,
  onReply,
  onSubmitReply,
  isSubmittingReply = false,
  onDelete,
  onDeleteReply,
}: {
  question: GuestbookQuestion;
  /* 답변 작성 카드에 표시되는 전시 대표 작가 이름 */
  artistName?: string;
  myUserId?: number;
  isReplyTarget?: boolean;
  onReply?: () => void;
  onSubmitReply?: (content: string, images: ComposerImage[]) => Promise<void>;
  isSubmittingReply?: boolean;
  onDelete?: () => void;
  onDeleteReply?: (questionReplyId: number) => void;
}) {
  const [showReplies, setShowReplies] = useState(false);
  const [replyContent, setReplyContent] = useState('');
  const {
    images: replyImages,
    addImages: addReplyImages,
    removeImage: removeReplyImage,
    clearImages: clearReplyImages,
    uploadImages: uploadReplyImages,
    canAddMore: canAddMoreReplyImages,
    isUploading: isUploadingReplyImages,
  } = useImageUpload({ domain: 'artwork-question-reply', maxImages: QUESTION_MAX_IMAGES });
  const replyTextareaRef = useAutoResizeTextarea(replyContent, replyImages.length);
  /* isUploading은 실제 업로드 요청이 시작된 뒤에야 true가 되어, 그 전(이미지 크기 읽는 동안)
   * 제출 버튼을 다시 누르면 중복 등록될 수 있습니다. 첫 await 전에 동기적으로 잠급니다. */
  const [isReplyPreparing, setIsReplyPreparing] = useState(false);
  const isReplyBusy = isSubmittingReply || isUploadingReplyImages || isReplyPreparing;
  /* 비공개 질문 열람 가능 여부는 서버가 계산해서 accessible로 내려줍니다. */
  const canView = question.accessible;

  /*
   * 답변할 질문이 없어졌으면(답변 등록 성공 등) 작성 중이던 입력값을 비웁니다.
   * effect 대신 렌더링 중 상태를 조정하는 방식(React 공식 권장 패턴)을 씁니다.
   */
  const [prevIsReplyTarget, setPrevIsReplyTarget] = useState(isReplyTarget);
  if (isReplyTarget !== prevIsReplyTarget) {
    setPrevIsReplyTarget(isReplyTarget);
    if (!isReplyTarget) {
      setReplyContent('');
      clearReplyImages();
    }
  }

  /* 이 질문에 답변을 작성 중인지 — 서버가 계산한 canReply(진짜 담당 작가) 기준입니다. */
  const isComposingReply = question.canReply && isReplyTarget && !question.reply;
  /* 본인이 쓴 질문은 답변이 달리기 전까지만 삭제할 수 있습니다. */
  const canDelete = question.isMyQuestion && !question.reply;
  /* 답변은 답변을 남긴 본인만 삭제할 수 있습니다. */
  const isMyReply = Boolean(myUserId) && question.reply?.userId === myUserId;

  const handleFooterClick = () => {
    if (question.canReply && !question.reply) {
      onReply?.();
      return;
    }
    setShowReplies((prev) => !prev);
  };

  const handleSubmitReply = async () => {
    const trimmed = replyContent.trim();
    if (!trimmed || isReplyBusy) return;
    setIsReplyPreparing(true);

    try {
      const files = replyImages
        .map((image) => image.file)
        .filter((file): file is File => Boolean(file));
      const dimensions =
        files.length > 0 ? await Promise.all(files.map((file) => readImageDimensions(file))) : [];
      const imageUrls = replyImages.length > 0 ? await uploadReplyImages() : [];
      const submitImages: ComposerImage[] = imageUrls.map((imageUrl, index) => ({
        imageUrl,
        width: dimensions[index]?.width,
        height: dimensions[index]?.height,
      }));

      await onSubmitReply?.(trimmed, submitImages);
      setReplyContent('');
      clearReplyImages();
    } catch {
      /* 등록 실패 시 작성 중이던 내용과 이미지를 유지합니다. */
    } finally {
      setIsReplyPreparing(false);
    }
  };

  return (
    <article className="w-full px-5 pb-3.5">
      <div className="w-full overflow-hidden rounded-[18px] bg-card shadow-[8px_8px_18px_0px_rgba(67,0,209,0.04)]">
        {!canView ? (
          <div className="flex flex-col items-start gap-1 px-4 py-3.5">
            <div className="flex h-[50px] items-center justify-between self-stretch">
              <div className="flex w-[280px] shrink-0 flex-col items-start gap-1">
                <span className="typo-body-md-bold text-main">비공개 질문입니다.</span>
                <span className="typo-body-xs-regular text-sub600">
                  {formatRelativeTime(question.createdAt)}
                </span>
              </div>
              <Lock size={16} className="text-main shrink-0" strokeWidth={3} />
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-start gap-1 px-4 py-3.5">
            <p className="w-full typo-body-md-regular text-main wrap-break-word whitespace-pre-line">
              {question.content}
            </p>
            {question.images && question.images.length > 0 && (
              <div className="flex w-full items-center gap-1.5 overflow-x-auto">
                {question.images.map((image, idx) => (
                  <img
                    key={idx}
                    src={image.imageUrl}
                    alt=""
                    className="size-16 shrink-0 rounded-lg object-cover"
                  />
                ))}
              </div>
            )}
            <div className="flex items-start gap-2">
              <span className="typo-body-xs-regular text-sub600">{question.user?.nickname}</span>
              <span className="typo-body-xs-regular text-sub600">
                {formatRelativeTime(question.createdAt)}
              </span>
              {!question.isPublic && (
                <span className="typo-body-xs-regular text-sub600">비공개</span>
              )}
            </div>
          </div>
        )}

        {isComposingReply ? (
          <div className="border-t border-box200">
            <button
              type="button"
              onClick={() => onReply?.()}
              disabled={isReplyBusy}
              className="flex h-[52px] w-full items-center justify-between gap-0.5 px-4 pt-4 pb-2 cursor-pointer disabled:opacity-50"
            >
              <span className="w-[271px] shrink-0 truncate text-left typo-body-xs-regular text-link">
                {artistName}
              </span>
              <span className="flex shrink-0 items-center gap-0.5">
                <span className="typo-body-xs-regular text-sub600 underline">답변대기</span>
                <ChevronDown size={13} className="shrink-0 text-sub600" />
              </span>
            </button>

            <div className="flex flex-col items-center gap-2 self-stretch px-4 pb-4">
              <div className="flex min-h-[105px] w-full flex-col items-start justify-between">
                <div className="flex w-full flex-col items-start gap-3.5 self-stretch">
                  <ImagePreviewRow
                    images={replyImages}
                    onRemove={removeReplyImage}
                    disabled={isReplyBusy}
                  />
                  <textarea
                    ref={replyTextareaRef}
                    value={replyContent}
                    onChange={(e) => setReplyContent(e.target.value.slice(0, QUESTION_MAX_LENGTH))}
                    placeholder="답변을 작성해주세요"
                    rows={1}
                    className={cn(
                      'typo-body-xs-regular w-full resize-none overflow-hidden bg-transparent text-main outline-none placeholder:text-faint',
                      /* 사진이 추가된 만큼 textarea 최소 높이를 줄여, 사진 추가 전후로 박스 전체 높이가 그대로 유지되게 합니다. */
                      replyImages.length > 0 ? 'min-h-[2px]' : 'min-h-[80px]',
                    )}
                  />
                </div>
                <div className="flex w-full items-center justify-between">
                  <ImagePickButton
                    onPick={addReplyImages}
                    canAddMore={canAddMoreReplyImages}
                    disabled={isReplyBusy}
                  />
                  <span className="typo-body-xs-regular text-faint">
                    {replyContent.length}/{QUESTION_MAX_LENGTH}
                  </span>
                </div>
              </div>
              <button
                type="button"
                onClick={handleSubmitReply}
                disabled={!replyContent.trim() || isReplyBusy}
                className="flex h-11 w-full items-center justify-center gap-2.5 rounded-[52px] bg-box100 disabled:opacity-50"
              >
                <span className="text-[18px] leading-[140%] tracking-[-0.45px] text-main">
                  확인
                </span>
              </button>
            </div>
          </div>
        ) : question.reply ? (
          canView ? (
            <button
              type="button"
              onClick={handleFooterClick}
              className="flex w-full items-center justify-between border-t border-box200 p-4 cursor-pointer"
            >
              {/* 답변완료 접힌 상태에서는 이름을 숨기고, 펼쳤을 때만 실제 답변자(작가 또는 QA 담당자) 이름을 보여줍니다. */}
              {showReplies ? (
                <span className="shrink-0 truncate text-left typo-body-xs-regular text-link">
                  {question.reply.nickname}
                </span>
              ) : (
                <span />
              )}
              <span className="flex shrink-0 items-center gap-0.5">
                <span className="typo-body-xs-regular text-sub600 underline">답변완료</span>
                {showReplies ? (
                  <ChevronUp size={13} className="shrink-0 text-sub600" />
                ) : (
                  <ChevronDown size={13} className="shrink-0 text-sub600" />
                )}
              </span>
            </button>
          ) : (
            <div className="flex w-full items-center justify-end border-t border-box200 p-4">
              <span className="typo-body-xs-regular text-sub600">답변완료</span>
            </div>
          )
        ) : (
          <div className="flex w-full items-center justify-between border-t border-box200 p-4">
            {canDelete ? (
              <button
                type="button"
                onClick={onDelete}
                className="typo-body-xs-regular text-error cursor-pointer"
              >
                삭제
              </button>
            ) : (
              <span />
            )}
            {question.canReply ? (
              <button
                type="button"
                onClick={handleFooterClick}
                className="flex items-center gap-0.5 cursor-pointer"
              >
                <span className="typo-body-xs-regular text-sub600 underline">답변대기</span>
                {showReplies ? (
                  <ChevronUp size={13} className="shrink-0 text-sub600" />
                ) : (
                  <ChevronDown size={13} className="shrink-0 text-sub600" />
                )}
              </button>
            ) : (
              <span className="typo-body-xs-regular text-sub600">답변대기</span>
            )}
          </div>
        )}

        {showReplies && !isComposingReply && (
          <div className="flex flex-col items-start gap-1 px-4 pb-3.5">
            {question.reply ? (
              <>
                <p className="typo-body-md-regular text-main wrap-break-word whitespace-pre-line">
                  {question.reply.content}
                </p>
                {question.reply.images && question.reply.images.length > 0 && (
                  <div className="flex w-full items-center gap-1.5 overflow-x-auto">
                    {question.reply.images.map((image, idx) => (
                      <img
                        key={idx}
                        src={image.imageUrl}
                        alt=""
                        className="size-16 shrink-0 rounded-lg object-cover"
                      />
                    ))}
                  </div>
                )}
                <div className="flex items-start gap-2">
                  {isMyReply && (
                    <button
                      type="button"
                      onClick={() => {
                        const replyId =
                          question.reply?.questionReplyId ?? question.reply?.queReplyId;
                        if (replyId != null) onDeleteReply?.(replyId);
                      }}
                      className="typo-body-xs-regular text-error cursor-pointer"
                    >
                      삭제
                    </button>
                  )}
                  <span className="typo-body-xs-regular text-sub600">
                    {formatRelativeTime(question.reply.createdAt)}
                  </span>
                </div>
              </>
            ) : (
              <p className="typo-body-xs-regular text-faint">등록된 답변이 없습니다.</p>
            )}
          </div>
        )}
      </div>
    </article>
  );
}

const QUESTION_MAX_LENGTH = 300;

function QuestionComposerCard({
  onClose,
  onSubmit,
  isSubmitting = false,
}: {
  onClose: () => void;
  onSubmit: (payload: {
    content: string;
    isPrivate: boolean;
    images: ComposerImage[];
  }) => Promise<void>;
  isSubmitting?: boolean;
}) {
  const [content, setContent] = useState('');
  const [isPrivate, setIsPrivate] = useState(false);
  const { images, addImages, removeImage, clearImages, uploadImages, canAddMore, isUploading } =
    useImageUpload({ domain: 'artwork-question', maxImages: QUESTION_MAX_IMAGES });
  const textareaRef = useAutoResizeTextarea(content, images.length);
  /* isUploading은 실제 업로드 요청이 시작된 뒤에야 true가 되어, 그 전(이미지 크기 읽는 동안)
   * 제출 버튼을 다시 누르면 중복 등록될 수 있습니다. 첫 await 전에 동기적으로 잠급니다. */
  const [isPreparing, setIsPreparing] = useState(false);
  const isBusy = isSubmitting || isUploading || isPreparing;

  const handleSubmit = async () => {
    const trimmed = content.trim();
    if (!trimmed || isBusy) return;
    setIsPreparing(true);

    try {
      const files = images.map((image) => image.file).filter((file): file is File => Boolean(file));
      const dimensions =
        files.length > 0 ? await Promise.all(files.map((file) => readImageDimensions(file))) : [];
      const imageUrls = images.length > 0 ? await uploadImages() : [];
      const submitImages: ComposerImage[] = imageUrls.map((imageUrl, index) => ({
        imageUrl,
        width: dimensions[index]?.width,
        height: dimensions[index]?.height,
      }));

      await onSubmit({ content: trimmed, isPrivate, images: submitImages });
      setContent('');
      setIsPrivate(false);
      clearImages();
    } catch {
      /* 등록 실패 시 작성 중이던 내용과 이미지를 유지합니다. */
    } finally {
      setIsPreparing(false);
    }
  };

  return (
    <article className="w-full px-5 pt-1 pb-3.5">
      <div className="flex w-full flex-col items-center gap-2 self-stretch rounded-[18px] bg-card px-4 py-3.5 shadow-[8px_8px_18px_0px_rgba(67,0,209,0.04)]">
        {/* 질문작성 / 닫기 */}
        <div className="flex items-center justify-between self-stretch">
          <span className="typo-body-sm-bold text-main">질문작성</span>
          <button
            type="button"
            onClick={onClose}
            disabled={isBusy}
            aria-label="닫기"
            className="cursor-pointer disabled:opacity-50"
          >
            <X size={20} strokeWidth={1.5} className="text-main" />
          </button>
        </div>

        <div className="flex min-h-[105px] w-full flex-col items-start justify-between">
          <div className="flex w-full flex-col items-start gap-1 self-stretch">
            <ImagePreviewRow images={images} onRemove={removeImage} disabled={isBusy} />
            <textarea
              ref={textareaRef}
              value={content}
              onChange={(e) => setContent(e.target.value.slice(0, QUESTION_MAX_LENGTH))}
              placeholder="질문을 작성해주세요"
              rows={1}
              className={cn(
                'typo-body-xs-regular w-full resize-none overflow-hidden bg-transparent text-main outline-none placeholder:text-faint',
                /* 사진이 추가된 만큼 textarea 최소 높이를 줄여, 사진 추가 전후로 박스 전체 높이가 그대로 유지되게 합니다. */
                images.length > 0 ? 'min-h-[12px]' : 'min-h-[80px]',
              )}
            />
          </div>
          <span className="typo-body-xs-regular w-full text-right text-faint">
            {content.length}/{QUESTION_MAX_LENGTH}
          </span>
        </div>

        <div className="flex items-start justify-between self-stretch">
          <button
            type="button"
            onClick={() => setIsPrivate((prev) => !prev)}
            aria-pressed={isPrivate}
            className="flex cursor-pointer items-center gap-1.5"
          >
            <span
              className={cn(
                'flex size-3 items-center justify-center rounded-[1px] border transition-colors',
                isPrivate ? 'border-main' : 'border-faint',
              )}
            >
              {isPrivate && <Check size={10} strokeWidth={3} className="text-main" />}
            </span>
            <span className={cn('typo-body-sm-regular', isPrivate ? 'text-main' : 'text-faint')}>
              비공개
            </span>
          </button>
          <ImagePickButton onPick={addImages} canAddMore={canAddMore} disabled={isBusy} />
        </div>

        <button
          type="button"
          onClick={handleSubmit}
          disabled={!content.trim() || isBusy}
          className="flex h-11 w-full items-center justify-center gap-2.5 rounded-[52px] bg-box100 disabled:opacity-50"
        >
          <span className="text-[18px] leading-[140%] tracking-[-0.45px] text-main">확인</span>
        </button>
      </div>
    </article>
  );
}

/* 방명록 탭(감상/질문) */
export function ArtworkGuestbookTab({
  feelings,
  hasMoreFeelings = false,
  onLoadMoreFeelings,
  isLoadingMoreFeelings = false,
  questions,
  hasMoreQuestions = false,
  onLoadMoreQuestions,
  isLoadingMoreQuestions = false,
  artworkId,
  myUserId,
  artwork,
  display,
  activeTab,
  activeReplyId,
  onFeelingReplyClick,
  replyTargetQuestionId,
  onQuestionReplyTargetChange,
  onAddQuestionClick,
  isComposingQuestion = false,
  onCloseComposeQuestion,
  onSubmitQuestion,
  isSubmittingQuestion = false,
  onDeleteQuestion,
  onDeleteReply,
}: Props) {
  const feelingsTriggerRef = useRef<HTMLDivElement | null>(null);

  // 감상 목록 무한 스크롤 감지
  useEffect(() => {
    const el = feelingsTriggerRef.current;
    if (!el || activeTab !== 'review') return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMoreFeelings && !isLoadingMoreFeelings) {
          onLoadMoreFeelings?.();
        }
      },
      { threshold: 0.1 },
    );
    observer.observe(el);

    return () => {
      observer.disconnect();
    };
  }, [activeTab, hasMoreFeelings, isLoadingMoreFeelings, onLoadMoreFeelings]);

  const questionsTriggerRef = useRef<HTMLDivElement | null>(null);

  // 질문 목록 무한 스크롤 감지
  useEffect(() => {
    const el = questionsTriggerRef.current;
    if (!el || activeTab !== 'question') return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMoreQuestions && !isLoadingMoreQuestions) {
          onLoadMoreQuestions?.();
        }
      },
      { threshold: 0.1 },
    );
    observer.observe(el);

    return () => {
      observer.disconnect();
    };
  }, [activeTab, hasMoreQuestions, isLoadingMoreQuestions, onLoadMoreQuestions]);

  return (
    <div className="min-h-150 pb-comment-bar-offset">
      {/* ── 감상 탭 ── */}
      {activeTab === 'review' && (
        <div className="px-5 pt-4">
          <div className="pb-4">
            <h2 className="typo-body-xl-bold text-main">감상 후기</h2>
          </div>
          <div className="flex flex-col">
            {feelings.map((feeling) => (
              <ArtworkFeelingCommentItem
                key={feeling.feelingId}
                artworkId={artworkId}
                feeling={feeling}
                display={display}
                myUserId={myUserId}
                activeReplyId={activeReplyId}
                onReplyClick={onFeelingReplyClick}
              />
            ))}
          </div>
          {feelings.length === 0 && (
            <p className="typo-body-sm-regular text-faint text-center py-10">
              아직 감상 후기가 없습니다.
            </p>
          )}
          {/* 무한 스크롤 감지 트리거 */}
          <div ref={feelingsTriggerRef} className="h-4" />
          {isLoadingMoreFeelings && (
            <div className="py-4 text-center text-sub600 typo-body-xs-regular animate-pulse">
              불러오는 중...
            </div>
          )}
        </div>
      )}

      {/* ── 질문 탭 ── */}
      {activeTab === 'question' && (
        <div className="pt-4">
          <div className="flex items-center justify-between px-5 pb-3">
            <h2 className="typo-body-xl-bold text-main">질문하기</h2>
            <div className="flex items-center gap-2">
              <button
                type="button"
                aria-label="질문 작성"
                onClick={onAddQuestionClick}
                className="mr-[15px] cursor-pointer"
              >
                <Plus size={17} strokeWidth={2} className="text-main" />
              </button>
            </div>
          </div>
          <div className="flex flex-col">
            {isComposingQuestion && (
              <QuestionComposerCard
                onClose={() => onCloseComposeQuestion?.()}
                onSubmit={async (payload) => {
                  await onSubmitQuestion?.(payload);
                }}
                isSubmitting={isSubmittingQuestion}
              />
            )}
            {questions.map((q) => (
              <QuestionCard
                key={q.questionId}
                question={q}
                artistName={artwork.artistName}
                myUserId={myUserId}
                isReplyTarget={replyTargetQuestionId === q.questionId}
                onReply={() =>
                  onQuestionReplyTargetChange?.(replyTargetQuestionId === q.questionId ? null : q)
                }
                onSubmitReply={async (content, images) => {
                  await onSubmitQuestion?.({ content, images, isPrivate: false });
                }}
                isSubmittingReply={isSubmittingQuestion}
                onDelete={() => onDeleteQuestion?.(q.questionId)}
                onDeleteReply={(questionReplyId) => onDeleteReply?.(q.questionId, questionReplyId)}
              />
            ))}
          </div>
          {questions.length === 0 && !isComposingQuestion && (
            <p className="typo-body-sm-regular text-faint text-center px-5 py-10">
              아직 질문이 없습니다.
            </p>
          )}
          {/* 무한 스크롤 감지 트리거 */}
          <div ref={questionsTriggerRef} className="h-4" />
          {isLoadingMoreQuestions && (
            <div className="py-4 text-center text-sub600 typo-body-xs-regular animate-pulse">
              불러오는 중...
            </div>
          )}
        </div>
      )}
    </div>
  );
}
