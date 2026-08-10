import { useRef, useState } from 'react';

import { useNavigate, useParams } from 'react-router-dom';

import { BottomFixedBar, ErrorView, LoadingView } from '@/components/common';
import { ImageUploadPlaceholder, PostWriteHeader } from '@/components/post-write';
import { AlertModal, RequiredLabel } from '@/components/ui';
import { isLoungeCategoryKey, LOUNGE_CATEGORY_API_VALUES } from '@/constants/loungeCategories';
import {
  useCreateLoungePost,
  useLoungePostDetail,
  useUpdateLoungePost,
} from '@/hooks/queries/useLounge';
import { getErrorMessage } from '@/utils/error';

const BASE_INPUT_CLASS =
  'px-3 py-2.5 bg-transparent border-b border-line typo-body-xs-regular text-main placeholder:text-faint leading-4 focus-visible:outline-2 focus-visible:outline-blue-500';

export function ExhibitionReviewWritePage() {
  const navigate = useNavigate();
  const { category, id } = useParams<{ category: string; id?: string }>();
  const isValidCategory = isLoungeCategoryKey(category);
  const isEditMode = Boolean(id);
  const postId = id ? Number(id) : NaN;

  const {
    data: existingPost,
    isPending: isExistingPostPending,
    isError: isExistingPostError,
  } = useLoungePostDetail(postId);

  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [imageUrls, setImageUrls] = useState<string[]>([]);
  const [isImagesUploading, setIsImagesUploading] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const [isPrefilled, setIsPrefilled] = useState(false);
  if (isEditMode && existingPost && !isPrefilled) {
    setIsPrefilled(true);
    setTitle(existingPost.title);
    setContent(existingPost.content);
    setImageUrls(existingPost.postImageUrls);
  }

  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const isSubmittingRef = useRef(false);

  const createLoungePost = useCreateLoungePost();
  const updateLoungePost = useUpdateLoungePost();
  const isSubmitting = createLoungePost.isPending || updateLoungePost.isPending;

  const handleContentChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setContent(e.target.value.slice(0, 1500));
    const el = textareaRef.current;
    if (el) {
      el.style.height = 'auto';
      el.style.height = `${el.scrollHeight}px`;
    }
  };

  const canSubmit =
    title.trim().length > 0 && content.trim().length > 0 && !isImagesUploading && !isSubmitting;

  const handleSubmit = async () => {
    if (isSubmittingRef.current) return;
    if (!isValidCategory) return;
    isSubmittingRef.current = true;
    setSubmitError(null);

    try {
      if (isEditMode) {
        await updateLoungePost.mutateAsync({
          postId,
          body: {
            title,
            content,
            category: LOUNGE_CATEGORY_API_VALUES[category],
            postImageUrls: imageUrls,
          },
        });
      } else {
        await createLoungePost.mutateAsync({
          title,
          content,
          category: LOUNGE_CATEGORY_API_VALUES[category],
          postImageUrls: imageUrls,
        });
      }

      setIsSubmitted(true);
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error(error);
      const message = getErrorMessage(error, '알 수 없는 오류가 발생했습니다.');
      setSubmitError(`${isEditMode ? '수정' : '등록'}에 실패했습니다. (${message})`);
    } finally {
      isSubmittingRef.current = false;
    }
  };

  if (!isValidCategory) {
    return (
      <ErrorView
        title="존재하지 않는 게시판입니다"
        message="요청하신 라운지 게시판을 찾을 수 없습니다."
        onRetry={() => navigate(-1)}
      />
    );
  }

  if (isEditMode && (!Number.isFinite(postId) || isExistingPostError)) {
    return (
      <ErrorView
        title="게시글을 찾을 수 없습니다"
        message="요청하신 게시글이 존재하지 않거나 삭제되었습니다."
        onRetry={() => navigate(-1)}
      />
    );
  }

  if (isEditMode && (isExistingPostPending || !isPrefilled)) {
    return <LoadingView />;
  }

  return (
    <div className="w-full max-w-md mx-auto bg-page relative flex min-h-dvh flex-col">
      <PostWriteHeader title={isEditMode ? '글 수정' : '글 작성'} className="px-5" />

      <main className="flex flex-col pl-[21px] pr-[19px] pb-bottom-bar-offset">
        <div className="mt-[31px] shrink-0 -ml-[21px] -mr-[19px] flex px-5">
          <ImageUploadPlaceholder
            initialImageUrls={isEditMode ? imageUrls : undefined}
            onUploadedUrlsChange={setImageUrls}
            onUploadingChange={setIsImagesUploading}
          />
        </div>

        <div className="mt-6 flex shrink-0 flex-col gap-3">
          <RequiredLabel required htmlFor="review-title">
            제목
          </RequiredLabel>
          <input
            id="review-title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="전시명을 입력해주세요"
            className={BASE_INPUT_CLASS}
          />
        </div>

        <div className="mt-5 flex flex-col gap-3">
          <RequiredLabel required htmlFor="review-content">
            내용
          </RequiredLabel>
          <div className="flex min-h-[412px] flex-col justify-between gap-2 border-b border-line px-3 py-2.5">
            <textarea
              id="review-content"
              ref={textareaRef}
              value={content}
              maxLength={1500}
              onChange={handleContentChange}
              placeholder="전시에 대해 소개해주세요"
              className="min-h-[120px] resize-none overflow-hidden bg-transparent typo-body-xs-regular text-main placeholder:text-faint leading-4 outline-hidden focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-500 rounded"
            />
            <div className="shrink-0 text-right text-faint typo-body-xs-regular leading-4">
              {content.length}/1500
            </div>
          </div>
        </div>

        {submitError && <p className="mt-3 typo-body-xs-regular text-red-500">{submitError}</p>}
      </main>

      <BottomFixedBar>
        <button
          type="button"
          disabled={!canSubmit}
          onClick={handleSubmit}
          className={`w-full rounded-xl py-3 typo-body-sm-bold leading-5 ${
            canSubmit ? 'bg-dark text-card' : 'bg-zinc-300 text-neutral-600'
          }`}
        >
          완료
        </button>
      </BottomFixedBar>

      {isSubmitted && (
        <AlertModal
          message={`정상적으로 게시글이 ${isEditMode ? '수정' : '작성'}되었습니다.`}
          onConfirm={() => navigate(-1)}
        />
      )}
    </div>
  );
}
