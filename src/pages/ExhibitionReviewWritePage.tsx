import { useRef, useState } from 'react';

import { useNavigate, useParams } from 'react-router-dom';

import { ErrorView } from '@/components/common';
import { FNB } from '@/components/layout';
import { ImageUploadPlaceholder, PostWriteHeader } from '@/components/post-write';
import { AlertModal, RequiredLabel } from '@/components/ui';
import { isLoungeCategoryKey, LOUNGE_CATEGORY_API_VALUES } from '@/constants/loungeCategories';
import { useCreateLoungePost } from '@/hooks/queries/useLounge';
import { getErrorMessage } from '@/utils/error';

const BASE_INPUT_CLASS =
  'px-3 py-2.5 bg-transparent border-b border-line typo-body-xs-regular text-main placeholder:text-faint leading-4 focus-visible:outline-2 focus-visible:outline-blue-500';

export function ExhibitionReviewWritePage() {
  const navigate = useNavigate();
  const { category } = useParams<{ category: string }>();
  const isValidCategory = isLoungeCategoryKey(category);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [imageUrls, setImageUrls] = useState<string[]>([]);
  const [isImagesUploading, setIsImagesUploading] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const isSubmittingRef = useRef(false);

  const createLoungePost = useCreateLoungePost();
  const isSubmitting = createLoungePost.isPending;

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
      await createLoungePost.mutateAsync({
        title,
        content,
        category: LOUNGE_CATEGORY_API_VALUES[category],
        postImageUrls: imageUrls,
      });

      setIsSubmitted(true);
    } catch (error) {
      console.error(error);
      const message = getErrorMessage(error, '알 수 없는 오류가 발생했습니다.');
      setSubmitError(`등록에 실패했습니다. (${message})`);
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

  return (
    <div className="w-full max-w-[402px] mx-auto bg-page relative flex min-h-dvh flex-col">
      <PostWriteHeader title="글 작성" className="px-5" />

      <main className="flex flex-col pl-[21px] pr-[19px] pb-28">
        <div className="mt-[31px] shrink-0 -ml-[21px] -mr-[19px] flex justify-center">
          <ImageUploadPlaceholder
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

        <div className="mt-[37px] -ml-[21px] -mr-[19px]">
          <FNB hasFixedBottomBar />
        </div>
      </main>

      <footer className="fixed bottom-0 left-0 right-0 z-40 w-full bg-neutral-50 border-t border-stone-300 shadow-[0px_-4px_18px_0px_rgba(4,0,250,0.06)]">
        <div className="max-w-[402px] mx-auto px-5 pt-4 pb-4">
          <button
            type="button"
            disabled={!canSubmit}
            onClick={handleSubmit}
            className={`w-full py-3 rounded-xl typo-body-sm-bold leading-5 ${
              canSubmit ? 'bg-dark text-card' : 'bg-zinc-300 text-neutral-600'
            }`}
          >
            완료
          </button>
        </div>
      </footer>

      {isSubmitted && (
        <AlertModal message="정상적으로 게시글이 작성되었습니다." onConfirm={() => navigate(-1)} />
      )}
    </div>
  );
}
