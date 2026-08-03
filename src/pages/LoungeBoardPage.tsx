import { useEffect, useRef } from 'react';

import { useNavigate, useParams } from 'react-router-dom';

import type { LoungePostSummaryDto } from '@/api/dto';
import { ErrorView, LoadingView } from '@/components/common';
import { LoungeBoardHeader, LoungeBoardPostCard } from '@/components/lounge-board';
import {
  isLoungeCategoryKey,
  LOUNGE_CATEGORIES,
  LOUNGE_CATEGORY_API_VALUES,
  type LoungeCategoryKey,
} from '@/constants/loungeCategories';
import { useLoungePosts } from '@/hooks/queries/useLounge';
import type { LoungeBoardPost } from '@/types/exhibition';
import { formatLoungeTime } from '@/utils/date';

const toBoardPost = (
  post: LoungePostSummaryDto,
  categoryKey: LoungeCategoryKey,
): LoungeBoardPost => ({
  id: String(post.loungePostId),
  category: categoryKey,
  title: post.title,
  description: post.content,
  author: post.writer.nickname,
  time: formatLoungeTime(post.createdAt),
  commentCount: post.commentCount,
  images: post.postImageUrls.length > 0 ? post.postImageUrls : undefined,
});

export const LoungeBoardPage = () => {
  const navigate = useNavigate();
  const { category } = useParams<{ category: string }>();
  const isValidCategory = isLoungeCategoryKey(category);
  const apiCategory = isValidCategory ? LOUNGE_CATEGORY_API_VALUES[category] : undefined;

  const { data, isPending, isError, hasNextPage, fetchNextPage, isFetchingNextPage } =
    useLoungePosts({ category: apiCategory }, { enabled: isValidCategory });

  const posts = isValidCategory
    ? (data?.pages.flatMap((page) => page.posts) ?? []).map((post) => toBoardPost(post, category))
    : [];

  const triggerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const el = triggerRef.current;
    if (!el || !isValidCategory) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasNextPage && !isFetchingNextPage) {
          fetchNextPage();
        }
      },
      { threshold: 0.1 },
    );
    observer.observe(el);

    return () => {
      observer.disconnect();
    };
  }, [isValidCategory, hasNextPage, isFetchingNextPage, fetchNextPage]);

  return (
    <div className="w-full max-w-[402px] mx-auto h-dvh bg-page flex flex-col">
      <LoungeBoardHeader
        title={isValidCategory ? LOUNGE_CATEGORIES[category] : '라운지'}
        category={isValidCategory ? category : undefined}
        className="pl-5 pr-[29px]"
      />

      <main className="flex-1 min-h-0 overflow-y-auto scrollbar-none px-5 pt-5 pb-10 flex flex-col">
        {!isValidCategory ? (
          <ErrorView
            fullScreen={false}
            title="존재하지 않는 게시판입니다"
            message="요청하신 라운지 게시판을 찾을 수 없습니다."
            onRetry={() => navigate(-1)}
            retryLabel="돌아가기"
          />
        ) : isPending ? (
          <LoadingView fullScreen={false} />
        ) : isError ? (
          <ErrorView
            fullScreen={false}
            title="게시글을 불러오지 못했습니다"
            message="잠시 후 다시 시도해주세요."
            onRetry={() => navigate(-1)}
            retryLabel="돌아가기"
          />
        ) : posts.length > 0 ? (
          <div className="flex flex-col gap-3.5">
            {posts.map((post) => (
              <LoungeBoardPostCard key={post.id} post={post} />
            ))}
            <div ref={triggerRef} className="h-4" />
            {isFetchingNextPage && <LoadingView fullScreen={false} message="불러오는 중..." />}
          </div>
        ) : (
          <ErrorView
            fullScreen={false}
            title="게시글이 없습니다"
            message="아직 등록된 게시글이 없어요."
            onRetry={() => navigate(-1)}
            retryLabel="돌아가기"
          />
        )}
      </main>
    </div>
  );
};
