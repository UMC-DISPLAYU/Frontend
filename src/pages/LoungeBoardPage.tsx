import { useParams } from 'react-router-dom';

import { LoungeBoardHeader, LoungeBoardPostCard } from '@/components/lounge-board';
import { isLoungeCategoryKey, LOUNGE_CATEGORIES } from '@/constants/loungeCategories';
import { useLoungePosts } from '@/hooks/queries/useLounge';
import type { LoungeBoardPost } from '@/types/exhibition';

const formatDate = (date: string) => date.slice(0, 10).replace(/-/g, '.');

const mapPost = (
  post: NonNullable<ReturnType<typeof useLoungePosts>['data']>['posts'][number],
): LoungeBoardPost => ({
  id: String(post.loungePostId),
  category: isLoungeCategoryKey(post.category) ? post.category : 'DISPLAY_REVIEW',
  title: post.title,
  description: post.content,
  author: post.writer.nickname,
  time: formatDate(post.createdAt),
  commentCount: post.commentCount,
  images: post.postImageUrls,
});

export const LoungeBoardPage = () => {
  const { category } = useParams<{ category: string }>();
  const isValidCategory = isLoungeCategoryKey(category);
  const { data, isLoading } = useLoungePosts(isValidCategory ? { category } : {});
  const posts = data?.posts.map(mapPost) ?? [];

  return (
    <div className="w-full max-w-105 mx-auto h-dvh bg-page flex flex-col">
      <LoungeBoardHeader
        title={isValidCategory ? LOUNGE_CATEGORIES[category] : '라운지'}
        className="px-5"
      />

      <main className="flex-1 min-h-0 overflow-y-auto px-5 pt-5 pb-10">
        {isValidCategory ? (
          <div className="flex flex-col gap-3.5">
            {isLoading && <p className="typo-body-sm-regular text-hint">불러오는 중...</p>}
            {!isLoading &&
              posts.map((post) => <LoungeBoardPostCard key={post.id} post={post} />)}
          </div>
        ) : (
          <p className="typo-body-sm-regular text-hint">존재하지 않는 게시판입니다.</p>
        )}
      </main>
    </div>
  );
};
